import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ReasoningEffort } from 'openai/resources/shared';
import { EnvService } from '@cfg/schema/env.service';
import type {
  AIProvider,
  StreamResponseParams,
  StreamResponseResult,
} from '../interfaces';
import { OPENAI_CHAT_TITLE_MODEL, CHAT_TITLE_PROMPT } from '../consts';
import {
  calculateImageGenerationTokens,
  createToolParamsIfEnabled,
  transformMessagesToOpenAIFormat,
  transformNewMessageToOpenAIFormat,
} from '../helpers';

@Injectable()
export class OpenAIService implements AIProvider {
  readonly providerName = 'openai';
  private readonly logger = new Logger(OpenAIService.name);
  private readonly client: OpenAI;

  constructor(private readonly envService: EnvService) {
    this.client = new OpenAI({
      apiKey: this.envService.openaiApiKey,
    });
  }

  async streamResponse(
    params: StreamResponseParams,
    onDelta: (delta: string) => void,
  ): Promise<StreamResponseResult> {
    const {
      previousMessages,
      newMessage,
      model,
      temperature,
      supportsTemperature,
      fileKey,
      isImageGeneration,
      isWebSearch,
      systemPrompt,
      isReasoning,
      reasoningLevel,
    } = params;
    const transformedMessages = transformMessagesToOpenAIFormat(
      previousMessages,
      this.envService.cdnDomain,
    );
    transformedMessages.push(
      ...transformNewMessageToOpenAIFormat(
        newMessage,
        this.envService.cdnDomain,
        previousMessages.at(-1),
        fileKey,
      ),
    );
    const tools = createToolParamsIfEnabled(isWebSearch, isImageGeneration);
    try {
      const stream = this.client.responses.stream({
        model: model,
        input: transformedMessages,
        instructions: systemPrompt,
        ...(supportsTemperature && { temperature: temperature }),
        tools: tools,

        ...(isReasoning && {
          reasoning: { effort: (reasoningLevel as ReasoningEffort) || 'low' },
        }),
      });

      let finalResponse;
      for await (const event of stream) {
        if (event.type === 'response.output_text.delta') {
          onDelta(event.delta);
        } else if (event.type === 'response.completed') {
          finalResponse = event.response;
        } else if (event.type === 'response.incomplete') {
          this.logger.warn(
            'Response incomplete:',
            event.response.incomplete_details,
          );
          finalResponse = event.response;
        } else if (event.type === 'response.failed') {
          this.logger.error('Response failed:', event.response.error);
          finalResponse = event.response;
        }
      }

      const response = finalResponse || (await stream.finalResponse());

      let imageBase64: string | null = null;
      let imageTokens = 0;
      if (isImageGeneration) {
        const imageData = response.output
          .filter((out) => out.type === 'image_generation_call')
          .map((out) => out.result);
        imageBase64 = imageData[0];
        // Calculate tokens for image generation if tool was used
        const imageGenTool = tools.find(
          (tool) => tool.type === 'image_generation',
        );
        if (imageGenTool)
          imageTokens = calculateImageGenerationTokens(imageGenTool);
      }

      return {
        content: response.output_text,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0 + imageTokens,
        imageKey: imageBase64 ?? undefined,
      };
    } catch (error) {
      this.logger.error('Error streaming response from OpenAI', error);
      throw error;
    }
  }

  async generateTitle(
    userMessage: string,
    assistantResponse: string,
  ): Promise<string> {
    try {
      const response = await this.client.responses.create({
        model: OPENAI_CHAT_TITLE_MODEL,
        input: CHAT_TITLE_PROMPT(userMessage, assistantResponse),
        max_output_tokens: 30,
      });

      return response.output_text.trim();
    } catch (error) {
      this.logger.error('Error generating chat title', error);
      return 'New Chat';
    }
  }
}

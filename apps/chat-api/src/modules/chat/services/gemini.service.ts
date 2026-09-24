import { Injectable, Logger } from '@nestjs/common';
import {
  GenerateContentConfig,
  GoogleGenAI,
  ThinkingLevel,
  ToolListUnion,
} from '@google/genai';
import {
  AIProvider,
  StreamResponseParams,
  StreamResponseResult,
} from '../interfaces';
import { EnvService } from '@cfg/schema/env.service';
import {
  fetchImageAsBase64,
  messagesTransformerForGemini,
  newMessageTransformerForGemini,
  setSystemMessageGemini,
} from '../helpers';
import { CHAT_TITLE_PROMPT } from '../consts';
import { GEMINI_CHAT_TITLE_MODEL } from '../consts/ai-title.const';

@Injectable()
export class GeminiService implements AIProvider {
  private readonly logger = new Logger(GeminiService.name);
  providerName: string = 'google';
  private readonly client: GoogleGenAI;

  constructor(private readonly envService: EnvService) {
    this.client = new GoogleGenAI({
      apiKey: this.envService.geminiApiKey,
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
      reasoningLevel,
    } = params;
    const transformedMessages = await messagesTransformerForGemini(
      previousMessages,
      this.envService.cdnDomain,
    );

    const image = fileKey
      ? await fetchImageAsBase64(`${this.envService.cdnDomain}${fileKey}`)
      : undefined;

    transformedMessages.push(newMessageTransformerForGemini(newMessage, image));
    let fullText = '';
    let inputTokens = 0;
    let outputTokens = 0;

    this.logger.debug('Transformed Messages:', transformedMessages);

    const tools: ToolListUnion = [];
    if (isWebSearch) {
      tools.push({ googleSearch: {} });
    }

    const configObject: GenerateContentConfig = {
      tools,
      thinkingConfig: {

        thinkingLevel: reasoningLevel
          ? (reasoningLevel.toUpperCase() as ThinkingLevel)
          : ('HIGH' as ThinkingLevel),
      },
    };

    this.logger.debug('Config Object:', configObject);

    if (supportsTemperature) configObject.temperature = temperature;

    const res = await this.client.models.generateContentStream({
      model: isImageGeneration ? 'gemini-2.5-flash-image' : model,
      contents: [setSystemMessageGemini(systemPrompt), ...transformedMessages],
      config: configObject,
    });

    let imageBase64: string | null = null;
    for await (const chunk of res) {
      const text = chunk.text || '';
      if (isImageGeneration && chunk.data) {
        imageBase64 = chunk.data;
      }

      fullText += text;
      onDelta(text);
      if (chunk.usageMetadata) {
        inputTokens = chunk.usageMetadata.promptTokenCount || 0;
        outputTokens = chunk.usageMetadata.candidatesTokenCount || 0;
      }
    }

    return {
      content: fullText,
      inputTokens,
      outputTokens,
      imageKey: imageBase64 ?? undefined,
    };
  }

  async generateTitle(
    userMessage: string,
    assistantResponse: string,
  ): Promise<string> {
    const res = await this.client.models.generateContent({
      model: GEMINI_CHAT_TITLE_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: CHAT_TITLE_PROMPT(userMessage, assistantResponse),
            },
          ],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 20,
      },
    });
    return res.text!.trim();
  }
}

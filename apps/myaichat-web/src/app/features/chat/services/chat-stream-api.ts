import { Injectable } from '@angular/core';
import { SseBaseService } from '@core/services';
import { ChatStreamEvent, SendMessageReqModel } from '@chat/models';

@Injectable({
  providedIn: 'root',
})
export class ChatStreamApi extends SseBaseService {
  sendMessage(req: SendMessageReqModel) {
    const formData = new FormData();
    formData.append('message', req.message);
    formData.append('modelId', req.modelId);
    formData.append('modelDeveloper', req.modelDeveloper);
    formData.append('maxTokens', req.maxTokens.toString());
    formData.append('temperature', req.temperature.toString());
    formData.append('isImageGeneration', req.isImageGeneration.toString());
    formData.append('isWebSearch', req.isWebSearch.toString());
    if (req.promptId) {
      formData.append('promptId', req.promptId);
    }

    if (req.chatId) {
      formData.append('chatId', req.chatId);
    }

    if (req.file) {
      formData.append('file', req.file, req.file.name);
    }

    return this.ssePost<ChatStreamEvent>('/chat/send-message', formData);
  }
}

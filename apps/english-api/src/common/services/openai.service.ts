import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import {
  compareInstructions,
  CompareSchema,
  getComparePrompt,
  getPrompt,
  openAICompareFormat,
  openAITranslationFormat,
  translationInstructions,
  TranslationSchema,
} from '../utils';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  get client() {
    return this.openai;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MozaikAgent, MozaikRequest } from '@mozaik-ai/core';
import { z } from 'zod';
import OpenAI from 'openai';

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

@Injectable()
export class AgentService {
  private readonly openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate structured response using Mozaik + Zod schema
   */
  async generateStructuredResponse<T extends z.ZodRawShape>(
    messages: Message[],
    task: string,
    structuredOutput: z.ZodObject<T>,
    model: string = 'gpt-5-mini',
  ): Promise<z.infer<z.ZodObject<T>>> {
    const request: MozaikRequest = {
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      task,
      model: model as MozaikRequest['model'],
      structuredOutput,
    };

    const agent = new MozaikAgent(request);
    const response = await agent.act();
    return response.data;
  }

  /**
   * Generate plain text response using Mozaik
   */
  async generateResponse(
    messages: Message[],
    task: string,
    model: string = 'gpt-5-mini',
  ): Promise<string> {
    const request: MozaikRequest = {
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      task,
      model: model as MozaikRequest['model'],
    };

    const agent = new MozaikAgent(request);
    const response = await agent.act();
    return response.data || 'No response generated';
  }

  /**
   * Stream response via OpenAI directly (for SSE endpoints)
   */
  async *streamResponse(
    messages: Message[],
    task: string,
  ): AsyncGenerator<string, void, unknown> {
    const formattedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    formattedMessages.push({ role: 'user', content: task });

    const stream = await this.openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: formattedMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}

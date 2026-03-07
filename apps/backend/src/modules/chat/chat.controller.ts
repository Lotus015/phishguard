import { Controller, Post, Get, Body, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post(':sessionId')
  async chat(
    @Param('sessionId') sessionId: string,
    @Body() body: { message: string },
    @Res() res: Response,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const chunk of this.chatService.streamDebrief(sessionId, body.message)) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ type: 'done', data: '' })}\n\n`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stream error';
      res.write(`data: ${JSON.stringify({ type: 'error', data: message })}\n\n`);
    }
    res.end();
  }

  @Get(':sessionId')
  async getHistory(@Param('sessionId') sessionId: string) {
    return this.chatService.getChatHistory(sessionId);
  }
}

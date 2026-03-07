import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { InboxService } from './inbox.service';
import type { CampaignConfig } from '@phishguard/shared';

@Controller('inbox')
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @Post('generate')
  async generateCampaign(@Body() config: CampaignConfig) {
    return this.inboxService.generateCampaign(config);
  }

  @Get(':sessionId')
  async getInbox(@Param('sessionId') sessionId: string) {
    return this.inboxService.getInbox(sessionId);
  }
}

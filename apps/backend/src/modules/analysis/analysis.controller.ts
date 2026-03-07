import { Controller, Post, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import type { AnalysisSubmission, AnalysisResult } from '@phishguard/shared';

@Controller('analysis')
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @Post('submit')
  async submit(@Body() body: AnalysisSubmission): Promise<AnalysisResult> {
    return this.analysisService.submitAnalysis(body);
  }
}

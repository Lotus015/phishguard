import { Controller, Get, Param } from '@nestjs/common';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(private exerciseService: ExerciseService) {}

  @Get('sites/:sessionId')
  async getSiteStatus(
    @Param('sessionId') sessionId: string,
  ): Promise<Record<string, string | null>> {
    return this.exerciseService.getPhishingSiteStatus(sessionId);
  }
}

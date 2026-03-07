import { Controller, Post, Body } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import type { AnalysisResult } from '@phishguard/shared';

@Controller('exercise')
export class ExerciseController {
  constructor(private exerciseService: ExerciseService) {}

  @Post('generate')
  async generate(@Body() body: AnalysisResult): Promise<{ appUrl: string }> {
    return this.exerciseService.generateExercise(body);
  }
}

import { Controller, Get, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { Question } from './session.config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('session')
  getHello(): string {
    return this.appService.createSession();
  }

  @Get('configure/:id/:quantity')
  configureSession(@Param() params: { id: string, quantity: number }): string {
    const { id, quantity } = params;
    return this.appService.configureSession(id, quantity);
  }

  @Get('question/:id')
  nextQuestion(@Param() params: { id: string }): Question {
    const { id } = params;
    return this.appService.nextQuestion(id);
  }
}

import { Controller, Get, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { SessionConfig, QuestionToOut } from './session.config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('session')
  getHello(): SessionConfig {
    const id = this.appService.createSession()
    return { id };
  }

  @Get('configure/:id/:quantity')
  configureSession(@Param() params: { id: string, quantity: number }): SessionConfig {
    const { id, quantity } = params;
    return this.appService.configureSession(id, quantity);
  }

  @Get('question/:id')
  nextQuestion(@Param() params: { id: string }): QuestionToOut {
    const { id } = params;
    return this.appService.nextQuestion(id);
  }
}

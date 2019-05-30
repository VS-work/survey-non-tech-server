import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { SessionConfig, QuestionToOut, Answered, TestResult } from './session.config';

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

  @Post('answer/:id')
  getAnswer(@Param() params: { id: string }, @Body() data: Answered) {
    const { id } = params;
    this.appService.answer(id, data);
  }

  @Get('finish/:id')
  getTotal(@Param() params: { id: string }): TestResult {
    const { id } = params;
    return this.appService.getTotal(id);
  }
}

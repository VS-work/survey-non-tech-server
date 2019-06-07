import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { SessionConfig, Question, Answered, TestResult } from './session.config';

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
  nextQuestion(@Param() params: { id: string }): Question {
    const { id } = params;
    return this.appService.nextQuestion(id);
  }

  @Post('answer/:id')
  getAnswer(@Param() params: { id: string }, @Body() data: Answered) {
    const { id } = params;
    this.appService.answer(id, data);
  }

  @Post('finish/:id')
  async getTotal(@Param() params: { id: string }, @Body() user: any): Promise<TestResult> {
    const { id } = params;
    return await this.appService.getTotal(id, user);
  }

  @Get('abandon/:id')
  abandon(@Param() params: { id: string }): { id: string } {
    const { id } = params;

    return { id: this.appService.abandon(id) };
  }

  @Get('passed-sessions/:userId')
  async getPassedSessions(@Param() params: { userId: string }): Promise<string[]> {
    const { userId } = params;

    return await this.appService.getPassedSessions(userId);
  }

  @Get('passed-sessions/:userId/:label')
  async getPassedSession(@Param() params: { userId: string, label: string }): Promise<TestResult> {
    const { userId, label } = params;

    return await this.appService.getPassedSession(userId, label);
  }
}

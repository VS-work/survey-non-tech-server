import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { flatten, cloneDeep } from 'lodash';
import { SessionConfig, Question, QuestionToOut, Answered } from './session.config';

function getRandom(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

@Injectable()
export class AppService {
  sessions: { [s: string]: SessionConfig } = {};
  data: Question[];

  constructor() {
    this.data = flatten([
      require('./data/css.json'),
      require('./data/db-misc.json'),
      require('./data/git.json'),
      require('./data/html.json'),
      require('./data/http.json'),
      require('./data/network.json'),
      require('./data/prog.json')
    ]);
    // console.log(JSON.stringify(this.data, null, 2));
  }

  createSession(): string {
    const id = v4();
    this.sessions[id] = { id };
    return id;
  }

  configureSession(id: string, quantity: number): SessionConfig {
    const session = this.sessions[id];

    if (!session) {
      throw Error(`Session ${id} does not exist!`);
    }

    if (!session.properties) {
      session.properties = {
        quantity: 0,
        question: 0,
        passed: []
      };
    }

    session.properties.quantity = quantity;
    return session;
  }

  nextQuestion(id: string): QuestionToOut {
    const session = this.getSession(id);
    let question;

    do {
      const order = getRandom(0, this.data.length - 1);
      question = this.data[order];
    } while (this.doesQuestionAnswered(session, question) && !this.isAnsweredFull(session));

    const questionToOut = {
      question: question.question,
      answers: question.answers.map(option => option.answer),
      config: cloneDeep(question.config)
    };

    return questionToOut;
  }

  answer(id: string, data: Answered) {
    this.getSession(id).properties.passed.push(data);
  }

  private getSession(id: string): SessionConfig {
    const session = this.sessions[id];

    if (!session) {
      throw Error(`Session ${id} does not exist!`);
    }

    if (!session.properties) {
      throw Error(`Session ${id} does not fully configured!`);
    }

    return session;
  }

  private doesQuestionAnswered(session: SessionConfig, question: Question): boolean {
    for (const answeredQuestion of session.properties.passed) {
      if (answeredQuestion.origin.question === question.question) {
        return true;
      }
    }

    return false;
  }

  private isAnsweredFull(session: SessionConfig): boolean {
    return session.properties.passed.length >= this.data.length;
  }
}

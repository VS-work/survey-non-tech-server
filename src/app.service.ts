import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { flatten } from 'lodash';
import { SessionConfig, Question } from './session.config';

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
  }

  createSession(): string {
    const id = v4();
    this.sessions[id] = { id };
    return id;
  }

  configureSession(id: string, quantity: number): string {
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
    return 'ok';
  }

  nextQuestion(id: string): Question {
    const session = this.sessions[id];

    if (!session) {
      throw Error(`Session ${id} does not exist!`);
    }

    if (!session.properties) {
      throw Error(`Session ${id} does not fully configured!`);
    }

    const order = getRandom(0, this.data.length);
    const question = this.data[order];

    console.log(order, question);

    session.properties.passed.push(question.question);

    return question;
  }
}

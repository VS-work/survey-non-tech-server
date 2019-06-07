import { promisify } from 'util';
import { existsSync, mkdirSync, writeFile as _writeFile, readdir as _readdir } from 'fs';
import { resolve } from 'path';
import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { flatten, cloneDeep, isArray, includes, isEmpty, keys } from 'lodash';
import { SessionConfig, Question, Answered, TestResult, Answer } from './session.config';

const writeFile = promisify(_writeFile);
const readdir = promisify(_readdir);

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
    this.checkData();
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

  abandon(id: string): string {
    const session = this.getSession(id);

    if (session) {
      this.sessions[id] = null;
    }

    return id;
  }

  nextQuestion(id: string): Question {
    const session = this.getSession(id);
    let question;

    do {
      const order = getRandom(0, this.data.length - 1);
      question = this.data[order];

      // console.log(order, this.data[order]);
    } while (this.doesQuestionAnswered(session, question) && !this.isAnsweredFull(session));

    const questionToOut = {
      question: question.question,
      answers: question.answers.map(option => {
        const out: Answer = { answer: option.answer };

        if (option.last === true) {
          out.last = option.last;
        }

        return out;
      }),
      config: cloneDeep(question.config)
    };

    return questionToOut;
  }

  answer(id: string, data: Answered) {
    this.getSession(id).properties.passed.push(data);
  }

  async getTotal(id: string, user: { id: number }): Promise<TestResult> {
    const resultByTags = {};
    let right = 0;
    let all = 0;
    let rightComplex = 0;
    let allComplex = 0;
    let rightSimple = 0;
    let allSimple = 0;

    for (const questionDesc of this.getSession(id).properties.passed) {
      const origin = this.getQuestionByLabel(questionDesc.origin.question);

      for (const tag of origin.tags) {
        if (!resultByTags[tag]) {
          resultByTags[tag] = {
            right: 0,
            wrong: 0,
            rightPercent: 0,
            wrongPercent: 0,
          };
        }
      }

      const isAnswerRight = this.isAnswerCorrect(questionDesc.origin.question, questionDesc.result);

      if (isAnswerRight) {
        for (const tag of origin.tags) {
          resultByTags[tag].right++;
        }
        right++;
      } else {
        for (const tag of origin.tags) {
          resultByTags[tag].wrong++;
        }
      }
      all++;

      if (questionDesc.origin.config.complex === true) {
        if (isAnswerRight) {
          rightComplex++;
        }
        allComplex++;
      }

      if (questionDesc.origin.config.complex === false) {
        if (isAnswerRight) {
          rightSimple++;
        }
        allSimple++;
      }
    }

    const total = Math.round((right / all) * 100);
    const complexPercent = Math.round((rightComplex / allComplex) * 100);
    const simplePercent = Math.round((rightSimple / allSimple) * 100);

    for (const tag of keys(resultByTags)) {
      const count = resultByTags[tag].right + resultByTags[tag].wrong;
      resultByTags[tag].rightPercent = Math.round((resultByTags[tag].right / count) * 100);
      resultByTags[tag].wrongPercent = Math.round((resultByTags[tag].wrong / count) * 100);
    }


    const resultDir = resolve('result', `${user.id}`);
    if (!existsSync(resultDir)) {
      mkdirSync(resultDir);
    }
    const summary = { total, resultByTags, complexPercent, simplePercent };
    const content = JSON.stringify({ details: this.getSession(id).properties.passed, summary }, null, 2);
    const resultFile = resolve(resultDir, `${new Date().toISOString()}.json`);

    await writeFile(resultFile, content);

    return summary;
  }

  async getPassedSessions(userId: string): Promise<string[]> {
    const files = await readdir(resolve('result', userId));

    return files.map(file => file.replace('.json', ''));
  }

  async getPassedSession(userId: string, label: string): Promise<TestResult> {
    return null;
  }

  private getQuestionByLabel(label: string): Question {
    const origin = this.data.find(item => item.question === label);

    if (!origin) {
      throw Error(`Origin is not found for '${label}'`);
    }

    return origin;
  }

  private isAnswerCorrect(question: string, _userOptions: string | string[]): boolean {
    const origin = this.getQuestionByLabel(question);
    const userOptions = !isArray(_userOptions) ? [_userOptions] : _userOptions;

    if (isEmpty(userOptions)) {
      return false;
    }

    let correctAttemptCount = 0;

    for (const originOption of origin.answers) {
      if (originOption.correct === true && includes(userOptions, originOption.answer)) {
        correctAttemptCount++;
      }
    }

    return correctAttemptCount === userOptions.length;
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

  private checkData() {
    let prevQuestion;
    for (const question of this.data) {
      if (isEmpty(question.answers) || !question.question) {
        console.log('wrong question');
        console.log(JSON.stringify(question, null, 2));
        console.log('prev question');
        console.log(JSON.stringify(prevQuestion, null, 2));
      }
      prevQuestion = question;
    }
    console.log(`Total questions: ${this.data.length}`);
  }
}

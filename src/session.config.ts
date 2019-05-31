export interface QuestionConfig {
  type: string;
  shuffle?: boolean;
  complex?: boolean;
  slow?: boolean;
}

export interface Answer {
  answer: string;
  correct?: boolean;
  last?: boolean
}

export interface Answered {
  origin: Question;
  result: string | string[];
}

export interface Question {
  question: string;
  answers: Answer[];
  tags?: string[];
  config: QuestionConfig;
}

export interface SessionConfig {
  id: string;
  properties?: {
    quantity: number;
    question: number;
    passed: Answered[];
  }
}

export interface TestResult {
  total: number;
  complexPercent: number;
  simplePercent: number;
  resultByTags: {
    [s: string]: {
      right: number,
      wrong: number,
      rightPercent: number,
      wrongPercent: number
    }
  };
}

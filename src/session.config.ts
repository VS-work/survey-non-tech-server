export interface QuestionConfig {
  type: string;
  shuffle?: boolean;
  lastCustomOption?: string
}

export interface Answer {
  answer: string;
  correct?: boolean;
}

export interface Question {
  question: string;
  answers: Answer[];
  tags: string[];
  config: QuestionConfig;
}

export interface QuestionToOut {
  question: string;
  answers: string[];
  config: QuestionConfig;
}

export interface SessionProperties {
  quantity: number;
  question: number;
  passed: string[];
}

export interface SessionConfig {
  id: string;
  properties?: SessionProperties;
}

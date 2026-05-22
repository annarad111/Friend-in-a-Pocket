export type TestQuestionDef = {
  id: string;
  text: string;
  placeholder: string;
};

export type TestDef = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  duration: string;
  questions: TestQuestionDef[];
};

export type TestResponse = {
  questionId: string;
  question: string;
  answer: string;
};

export type CompletedTest = {
  id: string;
  type: string;
  title: string;
  responses: TestResponse[];
  interpretation: string;
  completedAt: string;
};

export type PersonalityProfile = {
  content: string;
  reflectionQuestion: string;
  generatedAt: string;
  entryCount: number;
};

export type BirthData = {
  date: string;
  time?: string;
  location?: string;
};

export type BirthChart = {
  sunSign: string;
  moonSign?: string;
  ascendant?: string;
  interpretation: string;
  generatedAt: string;
};

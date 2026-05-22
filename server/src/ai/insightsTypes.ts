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

export type JournalEntrySnippet = {
  title: string;
  promptQuestion: string;
  body: string;
  oneWord: string;
  tinyWin: string;
  mood: string;
  sealedAt: string;
};

export type InterpretTestRequest = {
  testType: string;
  responses: TestResponse[];
};

export type PersonalityProfileRequest = {
  entries: JournalEntrySnippet[];
  completedTests: { title: string; interpretation: string }[];
  profile?: { friendName: string; favoriteAnimal: string; favoriteColor: string; favoriteInstrument: string } | null;
};

export type BirthChartRequest = {
  date: string;
  time?: string;
  location?: string;
};

export type BirthChartResult = {
  sunSign: string;
  moonSign?: string;
  ascendant?: string;
  interpretation: string;
};

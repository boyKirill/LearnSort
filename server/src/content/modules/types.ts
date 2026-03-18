export type SeedQuestionType =
  | 'SINGLE_CHOICE'
  | 'NEXT_STEP'
  | 'COMPARED_ELEMENTS'
  | 'PROPERTY'
  | 'COMPLEXITY'
  | 'PIVOT'
  | 'SORTED_SEGMENT';

export interface SeedQuestion {
  text: string;
  explanation: string;
  type: SeedQuestionType;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

export interface SeedModule {
  slug: string;
  title: string;
  description: string;
  theory: string;
  pseudocode: string;
  complexity: {
    best: string;
    average: string;
    worst: string;
    memory: string;
  };
  propertiesJson: {
    stability: string;
    inPlace: string;
    adaptivity: string;
    controlFlow: string;
  };
  advantages: string[];
  disadvantages: string[];
  usageNotes: string[];
  questions: SeedQuestion[];
}

export function options(
  correct: string,
  incorrect: string[],
): Array<{ text: string; isCorrect: boolean }> {
  return [
    { text: correct, isCorrect: true },
    ...incorrect.map((text) => ({ text, isCorrect: false })),
  ];
}

export type LastSyllableSource = 'override' | 'rule' | 'fallback';

export type SyllableMode = 'gameplay' | 'orthographic';

export type SyllableEngineOptions = {
  mode?: SyllableMode;
  wordExists?: (word: string) => boolean;
};

export type LastSyllableResult = {
  original: string;
  normalized: string;
  prefix: string;
  last: string;
  parts: string[];
  ruleId: string;
  source: LastSyllableSource;
};

export type SyllableRule = {
  id: string;
  description: string;
  match: (word: string) => boolean;
  apply: (word: string, options?: SyllableEngineOptions) => string[];
};

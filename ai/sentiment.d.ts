export type SentimentModel = {
  schema_version: number;
  preprocessing: string;
  algorithm?: string;
  status?: string;
  labels: string[];
  aliases: Record<string, string>;
  vocabulary: Record<string, number>;
  idf: number[];
  weights: number[][];
  bias: number[];
  [key: string]: unknown;
};

export type SentimentPrediction =
  | {
      label: 'negatif' | 'netral' | 'positif';
      status: 'predicted';
      scores: number[];
      scoreType: 'decision_margin' | 'log_score';
      experimental: boolean;
    }
  | {
      label: null;
      status: 'empty_input' | 'unknown_vocabulary';
      scores: null;
      scoreType: 'none';
      experimental: true;
    };

export function createSentimentClassifier(
  model: SentimentModel,
): (text: string) => SentimentPrediction;

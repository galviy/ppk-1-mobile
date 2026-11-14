import model from '../../ai/model-edom.json';
import { createSentimentClassifier } from '../../ai/sentiment';

import type { ReasonSentiment } from '@/data/izin-types';

type Classifier = ReturnType<typeof createSentimentClassifier>;

// Dibuat SATU KALI di level modul (FR-03.7), bukan di dalam komponen.
function buildClassifier(): Classifier | null {
  try {
    return createSentimentClassifier(model);
  } catch {
    return null;
  }
}

const classifier = buildClassifier();

export function isSentimentModelReady(): boolean {
  return classifier !== null;
}

const BASE = { source: 'model-edom', experimental: true } as const;

/**
 * Analisis sentimen lokal (tanpa jaringan). Tidak pernah melempar error:
 * kegagalan dikembalikan sebagai { label: null, status }.
 * Hasil hanya informasi pendukung, tidak menentukan keputusan izin.
 */
export function analyzeReason(text: string): ReasonSentiment {
  const input = text.trim();
  if (!input) return { ...BASE, label: null, status: 'empty_input' };
  if (!classifier) return { ...BASE, label: null, status: 'error' };

  try {
    const prediction = classifier(input);
    if (prediction.label === null) {
      return {
        ...BASE,
        label: null,
        status: prediction.status === 'empty_input' ? 'empty_input' : 'unknown_vocabulary',
      };
    }
    return { ...BASE, label: prediction.label, status: 'predicted' };
  } catch {
    return { ...BASE, label: null, status: 'error' };
  }
}

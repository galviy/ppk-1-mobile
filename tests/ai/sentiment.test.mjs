import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import sentiment from '../../ai/sentiment.js';

const read = (url) => readFileSync(new URL(url, import.meta.url), 'utf8');
const model = JSON.parse(read('../../ai/model-edom.json'));
const classify = sentiment.createSentimentClassifier(model);

const LABELS = ['negatif', 'netral', 'positif'];

describe('FR-04.19 model EDOM lokal', () => {
  it('memuat model dari folder ai/ dengan skema yang didukung', () => {
    assert.equal(model.schema_version, 1);
    assert.deepEqual(model.labels, LABELS);
    assert.ok(Object.keys(model.vocabulary).length > 0);
    assert.equal(model.weights.length, LABELS.length);
  });

  it('membuat classifier dari createSentimentClassifier(model)', () => {
    assert.equal(typeof classify, 'function');
  });
});

describe('FR-04.20 klasifikasi sentimen', () => {
  it('mengembalikan label valid untuk alasan izin', () => {
    const hasil = classify('sakit demam tidak bisa hadir');
    assert.equal(hasil.status, 'predicted');
    assert.ok(LABELS.includes(hasil.label));
    assert.equal(hasil.scoreType, 'decision_margin');
  });

  it('menangani input kosong tanpa melempar error', () => {
    const hasil = classify('   ');
    assert.equal(hasil.status, 'empty_input');
    assert.equal(hasil.label, null);
  });

  it('menangani kata di luar kosakata model', () => {
    const hasil = classify('zzzz qqqq xxxx');
    assert.equal(hasil.status, 'unknown_vocabulary');
    assert.equal(hasil.label, null);
  });
});

describe('FR-04.21 analisis tanpa API eksternal', () => {
  it('implementasi classifier dan service tidak memanggil jaringan', () => {
    for (const sumber of [read('../../ai/sentiment.js'), read('../../src/services/sentiment-service.ts')]) {
      assert.equal(/\bfetch\s*\(/.test(sumber), false);
      assert.equal(/\bXMLHttpRequest\b/.test(sumber), false);
      assert.equal(/https?:\/\//.test(sumber), false);
    }
  });

  it('classifier dapat berjalan berulang tanpa state jaringan', () => {
    const a = classify('sakit demam');
    const b = classify('sakit demam');
    assert.deepEqual(a, b);
  });
});

// Quiz scoring and progress. Scoring runs on the device; the only thing kept is the visitor's
// own answers in localStorage (optional, every access wrapped so a blocked storage never breaks
// the quiz). Nothing is sent anywhere.
import { initToggletips } from './sources.js';

export function scoreAnswer(question, optionIndex) {
  const opts = (question && question.options) || [];
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= opts.length) {
    throw new RangeError(`answer ${optionIndex} is not one of ${opts.length} options`);
  }
  const o = opts[optionIndex];
  return { correct: o.correct === true, explanation: o.explanation, fact_ids: [...(o.fact_ids || [])] };
}

const KEY = slug => `voa-quiz-${slug}`;

export function readProgress(store, slug) {
  try {
    const v = JSON.parse(store.getItem(KEY(slug)) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function writeProgress(store, slug, answers) {
  try { store.setItem(KEY(slug), JSON.stringify(answers)); } catch { /* storage blocked: keep going without it */ }
}

function storage() {
  try { return window.localStorage; } catch { return null; }
}

// DOM: each question is a <fieldset data-question> with radio inputs and a Check button; each
// option's explanation is prerendered (with its source chips) in [data-explanation="<index>"].
export function mountQuiz(root, { slug, questions }) {
  const store = storage();
  const answers = readProgress(store, slug);
  const byId = new Map(questions.map(q => [q.id, q]));
  for (const fs of root.querySelectorAll('[data-question]')) {
    const q = byId.get(fs.dataset.question);
    if (!q) continue;
    const result = fs.querySelector('[data-result]');
    const verdict = fs.querySelector('[data-verdict]');
    const show = (i, focus) => {
      const r = scoreAnswer(q, i);
      const correctIndex = q.options.findIndex(o => o.correct);
      for (const ex of fs.querySelectorAll('[data-explanation]')) {
        const k = Number(ex.dataset.explanation);
        ex.hidden = !(k === i || (!r.correct && k === correctIndex));
      }
      verdict.textContent = r.correct ? 'Correct.' : `Not this one. The answer is: ${q.options[correctIndex].text}.`;
      result.hidden = false;
      initToggletips(result);
      if (focus) verdict.focus();
    };
    fs.querySelector('[data-check]').addEventListener('click', () => {
      const picked = fs.querySelector('input[type="radio"]:checked');
      const hint = fs.querySelector('[data-hint]');
      if (!picked) { hint.hidden = false; return; }
      hint.hidden = true;
      const i = Number(picked.value);
      show(i, true);
      answers[q.id] = i;
      if (store) writeProgress(store, slug, answers);
    });
    const saved = answers[q.id];
    if (Number.isInteger(saved) && saved >= 0 && saved < q.options.length) {
      const input = fs.querySelector(`input[value="${saved}"]`);
      if (input) { input.checked = true; show(saved, false); }
    }
  }
  const reset = root.querySelector('[data-reset]');
  if (reset) reset.addEventListener('click', () => {
    if (store) writeProgress(store, slug, {});
    for (const fs of root.querySelectorAll('[data-question]')) {
      for (const input of fs.querySelectorAll('input[type="radio"]')) input.checked = false;
      fs.querySelector('[data-result]').hidden = true;
    }
    for (const k of Object.keys(answers)) delete answers[k];
  });
}

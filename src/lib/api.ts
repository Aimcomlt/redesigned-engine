import type { TSimulateInput } from '../shared/validation';
import type { TCandidatesInput } from '../shared/validation'

const json = (input: any) =>
  JSON.stringify(input, (_, v) =>
    typeof v === 'bigint' ? v.toString() : v
  );

export async function fetchCandidates(input: TCandidatesInput) {
  const res = await fetch('/api/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json(input),
  });

  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    } catch {
      throw new Error(res.statusText);
    }
  }

  try {
    return await res.json();
  } catch {
    throw new Error('Malformed JSON response');
  }
}

export async function simulate(input: TSimulateInput) {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json(input),
  });

  if (!res.ok) {
    try {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    } catch {
      throw new Error(res.statusText);
    }
  }

  try {
    return await res.json();
  } catch {
    throw new Error('Malformed JSON response');
  }
}

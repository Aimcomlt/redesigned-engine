import { TCandidatesInput, TSimulateInput } from '../shared/validation';

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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }
  return data;
}

export async function simulate(input: TSimulateInput) {
  const res = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: json(input),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }
  return data;
}

import { useMutation } from '@tanstack/react-query';
import type { Candidate } from './CandidateTable';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { simulate as simulateApi } from '../lib/api';

export default function SimulatorPanel({ candidate }: { candidate: Candidate }) {
  const { slippageBps, gasCeiling, minProfitUsd, enabled } = useSelector(
    (state: RootState) => state.execution
  );
  const stringifyBigInts = (obj: any) =>
    JSON.parse(
      JSON.stringify(obj, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
    );

  const simulate = useMutation({
    mutationFn: async () => {
      try {
        return await simulateApi({
          candidate: stringifyBigInts(candidate),
          params: {},
        } as any);
      } catch (err) {
        throw err;
      }
    },
  });

  const execute = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            { candidate: stringifyBigInts(candidate), params: {} },
            (_, v) => (typeof v === 'bigint' ? v.toString() : v)
          ),
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
      } catch (err) {
        throw err;
      }
    },
  });

  const warnings: string[] = [];
  if (candidate.profitUsd < minProfitUsd) {
    warnings.push('Profit below minimum threshold');
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-700">
        Slippage: {slippageBps} bps | Gas ceiling: {gasCeiling} | Min profit: $
        {minProfitUsd}
      </div>
      {warnings.length > 0 && (
        <div className="text-yellow-700 text-sm">{warnings.join(', ')}</div>
      )}
      <button
        onClick={() => simulate.mutate()}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Simulate
      </button>
      <button
        onClick={() => execute.mutate()}
        disabled={!enabled || warnings.length > 0}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Execute
      </button>
      {simulate.error && (
        <div className="error">{String(simulate.error)}</div>
      )}
      {execute.error && <div className="error">{String(execute.error)}</div>}
      {simulate.data && (
        <pre className="bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(simulate.data, null, 2)}
        </pre>
      )}
    </div>
  );
}

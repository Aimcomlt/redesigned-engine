import { useMutation } from '@tanstack/react-query';
import type { Candidate } from './CandidateTable';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function SimulatorPanel({ candidate }: { candidate: Candidate }) {
  const { slippageBps, gasCeiling, minProfitUsd, enabled } = useSelector(
    (state: RootState) => state.execution
  );
  const simulate = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, params: {} }),
      });
      return res.json();
    },
  });

  const execute = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, params: {} }),
      });
      return res.json();
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
      {simulate.data && (
        <pre className="bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(simulate.data, null, 2)}
        </pre>
      )}
    </div>
  );
}

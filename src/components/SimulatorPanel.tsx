import { useMutation } from '@tanstack/react-query';
import type { Candidate } from './CandidateTable';

export default function SimulatorPanel({ candidate }: { candidate: Candidate }) {
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

  return (
    <div className="space-y-2">
      <button
        onClick={() => simulate.mutate()}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Simulate
      </button>
      {simulate.data && (
        <pre className="bg-gray-100 p-2 rounded overflow-auto">
          {JSON.stringify(simulate.data, null, 2)}
        </pre>
      )}
    </div>
  );
}

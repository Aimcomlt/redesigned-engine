import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export default function ExecutionToggle() {
  const [enabled, setEnabled] = useState(false);
  const exec = useMutation({
    mutationFn: async (next: boolean) => {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });
      return res.json();
    },
  });

  return (
    <button
      onClick={() => {
        const next = !enabled;
        setEnabled(next);
        exec.mutate(next);
      }}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      {enabled ? 'Stop' : 'Start'}
    </button>
  );
}

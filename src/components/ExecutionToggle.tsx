import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useExecutionStore } from '../store/useExecutionStore';

export default function ExecutionToggle() {
  const enabled = useExecutionStore((s) => s.enabled);
  const setEnabled = useExecutionStore((s) => s.setEnabled);
  const [confirm, setConfirm] = useState('');

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

  if (enabled) {
    return (
      <button
        onClick={() => {
          setEnabled(false);
          exec.mutate(false);
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Disable Execution
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <input
        type="text"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Type ENABLE"
        className="border p-1 rounded text-black"
      />
      <button
        onClick={() => {
          setEnabled(true);
          exec.mutate(true);
          setConfirm('');
        }}
        disabled={confirm !== 'ENABLE'}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Enable Execution
      </button>
    </div>
  );
}

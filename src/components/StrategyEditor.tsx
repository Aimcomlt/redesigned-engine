import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function StrategyEditor() {
  const [text, setText] = useState('');
  const enabled = useSelector((state: RootState) => state.execution.enabled);
  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: text }),
      });
      return res.json();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-2"
    >
      <textarea
        className="w-full border p-2 rounded"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={!enabled}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Save
      </button>
      {save.data && <div className="text-sm text-gray-500">Saved</div>}
    </form>
  );
}

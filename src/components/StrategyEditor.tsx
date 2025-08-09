import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export default function StrategyEditor() {
  const [text, setText] = useState('');
  const enabled = useSelector((state: RootState) => state.execution.enabled);
  const save = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strategy: text }),
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
      {save.error && <div className="error">{String(save.error)}</div>}
      {save.data && <div className="text-sm text-gray-500">Saved</div>}
    </form>
  );
}

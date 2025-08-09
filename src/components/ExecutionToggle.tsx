import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { setEnabled as setEnabledAction } from '../store/executionSlice';

export default function ExecutionToggle() {
  const enabled = useSelector((state: RootState) => state.execution.enabled);
  const dispatch = useDispatch<AppDispatch>();
  const [confirm, setConfirm] = useState('');

  const exec = useMutation({
    mutationFn: async (next: boolean) => {
      try {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: next }),
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

  if (enabled) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => {
            dispatch(setEnabledAction(false));
            exec.mutate(false);
          }}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Disable Execution
        </button>
        {exec.error && <div className="error">{String(exec.error)}</div>}
      </div>
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
      <div className="space-y-2">
        <button
          onClick={() => {
            dispatch(setEnabledAction(true));
            exec.mutate(true);
            setConfirm('');
          }}
          disabled={confirm !== 'ENABLE'}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Enable Execution
        </button>
        {exec.error && <div className="error">{String(exec.error)}</div>}
      </div>
    </div>
  );
}

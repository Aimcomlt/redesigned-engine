import { useEffect, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';

type StreamEvent =
  | { type: 'log'; data: string }
  | { type: 'candidate'; data: any };

export default function LogStream() {
  const [events, setEvents] = useState<StreamEvent[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    void fetchEventSource('/api/stream', {
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}` },
      onmessage(ev) {
        const data = JSON.parse(ev.data);
        if (ev.event === 'log') {
          setEvents((l) => [...l, { type: 'log', data }]);
        }
        if (ev.event === 'candidate') {
          setEvents((l) => [...l, { type: 'candidate', data }]);
        }
      },
    });
    return () => ctrl.abort();
  }, []);

  return (
    <div className="bg-black text-green-400 p-4 font-mono h-96 overflow-y-auto">
      {events.map((e, i) => (
        <div key={i}>
          {e.type === 'log' ? e.data : JSON.stringify(e.data)}
        </div>
      ))}
    </div>
  );
}

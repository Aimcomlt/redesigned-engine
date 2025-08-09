import { useEffect, useState } from 'react';

type StreamEvent =
  | { type: 'log'; data: string }
  | { type: 'candidate'; data: any };

export default function LogStream() {
  const [events, setEvents] = useState<StreamEvent[]>([]);

  useEffect(() => {
    const es = new EventSource('/api/stream');
    es.addEventListener('log', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setEvents((l) => [...l, { type: 'log', data }]);
    });
    es.addEventListener('candidate', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setEvents((l) => [...l, { type: 'candidate', data }]);
    });
    return () => es.close();
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

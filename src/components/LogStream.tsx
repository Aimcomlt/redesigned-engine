import { useEffect, useState } from 'react';

export default function LogStream() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const es = new EventSource('/api/stream');
    es.onmessage = (e) => {
      setLogs((l) => [...l, e.data]);
    };
    return () => es.close();
  }, []);

  return (
    <div className="bg-black text-green-400 p-4 font-mono h-96 overflow-y-auto">
      {logs.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
}

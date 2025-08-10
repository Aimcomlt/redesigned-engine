import { useEffect } from "react";
import { fetchEventSource } from '@microsoft/fetch-event-source';

interface Params {
  onCandidate?: (c: any) => void;
  onLog?: (m: any) => void;
}

export function useEventStream({ onCandidate, onLog }: Params) {
  useEffect(() => {
    const ctrl = new AbortController();
    void fetchEventSource('/api/stream', {
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}` },
      onmessage(ev) {
        if (ev.event === 'candidate' && onCandidate) {
          onCandidate(JSON.parse(ev.data));
        }
        if (ev.event === 'log' && onLog) {
          onLog(JSON.parse(ev.data));
        }
      },
    });
    return () => ctrl.abort();
  }, []);
}

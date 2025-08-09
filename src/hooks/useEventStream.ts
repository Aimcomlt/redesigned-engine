import { useEffect } from "react";

interface Params {
  onCandidate?: (c: any) => void;
  onLog?: (m: any) => void;
}

export function useEventStream({ onCandidate, onLog }: Params) {
  useEffect(() => {
    const es = new EventSource("/api/stream");
    if (onCandidate) {
      es.addEventListener("candidate", (e) =>
        onCandidate(JSON.parse((e as MessageEvent).data))
      );
    }
    if (onLog) {
      es.addEventListener("log", (e) =>
        onLog(JSON.parse((e as MessageEvent).data))
      );
    }
    return () => es.close();
  }, []);
}

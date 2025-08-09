import { useState } from "react";
import CandidateTable from "../components/CandidateTable";
import { useEventStream } from "../hooks/useEventStream";

export default function Dashboard() {
  const [rows, setRows] = useState<any[]>([]);

  useEventStream({
    onCandidate: (c) => setRows((r) => [c, ...r].slice(0, 100)),
    onLog: (m) => console.debug("log", m),
  });

  return (
    <div>
      <h2>Live Candidates</h2>
      <CandidateTable rows={rows} />
    </div>
  );
}

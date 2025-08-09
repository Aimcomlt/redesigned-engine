import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import CandidateTable, { Candidate } from '../components/CandidateTable';
import SimulatorPanel from '../components/SimulatorPanel';

export default function Simulator() {
  const { data } = useQuery({
    queryKey: ['candidates'],
    queryFn: async () => {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      return res.json();
    },
  });

  const [selected, setSelected] = useState<Candidate | null>(null);
  const candidates = data?.candidates ?? [];

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      <CandidateTable candidates={candidates} onSelect={setSelected} />
      {selected && <SimulatorPanel candidate={selected} />}
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import CandidateTable, { Candidate } from '../components/CandidateTable';
import SimulatorPanel from '../components/SimulatorPanel';
import { fetchCandidates } from '../lib/api';

export default function Simulator() {
  const { data, error } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => fetchCandidates({} as any),
  });

  const [selected, setSelected] = useState<Candidate | null>(null);
  const candidates = data?.candidates ?? [];

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      {error && <div className="error">{String(error)}</div>}
      <CandidateTable candidates={candidates} onSelect={setSelected} />
      {selected && <SimulatorPanel candidate={selected} />}
    </div>
  );
}

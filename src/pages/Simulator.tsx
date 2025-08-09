import { useQuery } from '@tanstack/react-query';
import CandidateTable from '../components/CandidateTable';
import { fetchCandidates } from '../lib/api';

export default function Simulator() {
  const { data, error } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => fetchCandidates({} as any),
  });

  const candidates = data?.candidates ?? [];

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      {error && <div className="error">{String(error)}</div>}
      <CandidateTable rows={candidates} />
    </div>
  );
}

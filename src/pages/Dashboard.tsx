import { useQuery } from '@tanstack/react-query';
import StatCard from '../components/StatCard';
import { fetchCandidates } from '../lib/api';

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => fetchCandidates({} as any),
  });

  const count = data?.candidates?.length ?? 0;

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Candidates" value={count} />
    </div>
  );
}

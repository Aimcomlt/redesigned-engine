import { useQuery } from '@tanstack/react-query';
import PoolQuoteCard from '../components/PoolQuoteCard';
import { fetchCandidates } from '../lib/api';

export default function Pools() {
  const { data } = useQuery({
    queryKey: ['pools'],
    queryFn: () => fetchCandidates({} as any),
  });

  const quotes = data?.candidates ?? [];

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      {quotes.map((q: any) => (
        <PoolQuoteCard key={q.id} quote={{ pool: q.id, price: q.profitUsd }} />
      ))}
    </div>
  );
}

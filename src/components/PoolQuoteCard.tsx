interface PoolQuote {
  pool: string;
  price: number;
}

export default function PoolQuoteCard({ quote }: { quote: PoolQuote }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-sm text-gray-500">{quote.pool}</div>
      <div className="text-2xl font-bold">{quote.price}</div>
    </div>
  );
}

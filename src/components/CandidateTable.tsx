export interface Candidate {
  id: string;
  profitUsd: number;
  [key: string]: any;
}

interface CandidateTableProps {
  candidates: Candidate[];
  onSelect: (c: Candidate) => void;
}

export default function CandidateTable({ candidates, onSelect }: CandidateTableProps) {
  return (
    <table className="min-w-full text-left border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">ID</th>
          <th className="p-2">Profit (USD)</th>
        </tr>
      </thead>
      <tbody>
        {candidates.map((c) => (
          <tr
            key={c.id}
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelect(c)}
          >
            <td className="p-2">{c.id}</td>
            <td className="p-2">{c.profitUsd}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

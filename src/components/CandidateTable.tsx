export interface Candidate {
  id?: string;
  profitUsd?: number;
  [key: string]: any;
}

interface CandidateTableProps {
  rows?: Candidate[];
}

export default function CandidateTable({ rows = [] }: CandidateTableProps) {
  if (!rows.length) return <p>No candidates yet.</p>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Buy</th>
          <th>Sell</th>
          <th>In</th>
          <th>Out</th>
          <th>Gas USD</th>
          <th>Profit USD</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c, i) => (
          <tr key={i}>
            <td>{c.buy}</td>
            <td>{c.sell}</td>
            <td>{c.amountIn}</td>
            <td>{c.expectedOut}</td>
            <td>{Number(c.gasUsd).toFixed?.(2) ?? c.gasUsd}</td>
            <td>
              <b>{Number(c.profitUsd).toFixed?.(2) ?? c.profitUsd}</b>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

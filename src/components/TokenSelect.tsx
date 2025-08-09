interface TokenSelectProps {
  value: string;
  onChange: (v: string) => void;
}

export default function TokenSelect({ value, onChange }: TokenSelectProps) {
  return (
    <select
      className="border p-2 rounded w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="ETH">ETH</option>
      <option value="DAI">DAI</option>
      <option value="USDC">USDC</option>
    </select>
  );
}

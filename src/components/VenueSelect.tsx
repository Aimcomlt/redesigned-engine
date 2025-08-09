interface VenueSelectProps {
  value: string;
  onChange: (v: string) => void;
}

export default function VenueSelect({ value, onChange }: VenueSelectProps) {
  return (
    <select
      className="border p-2 rounded w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="uniswap">Uniswap</option>
      <option value="sushiswap">Sushiswap</option>
    </select>
  );
}

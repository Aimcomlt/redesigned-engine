interface AmountInputProps {
  value: number;
  onChange: (v: number) => void;
}

export default function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <input
      type="number"
      className="border p-2 rounded w-full"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

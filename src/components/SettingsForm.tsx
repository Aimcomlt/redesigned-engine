import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import TokenSelect from './TokenSelect';
import VenueSelect from './VenueSelect';
import AmountInput from './AmountInput';
import { fetchCandidates } from '../lib/api';

export default function SettingsForm() {
  const [token0, setToken0] = useState('ETH');
  const [token1, setToken1] = useState('DAI');
  const [venue, setVenue] = useState('uniswap');
  const [amount, setAmount] = useState(0);

  const save = useMutation({
    mutationFn: () =>
      fetchCandidates({ token0, token1, venue, amount } as any),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm mb-1">Token 0</label>
        <TokenSelect value={token0} onChange={setToken0} />
      </div>
      <div>
        <label className="block text-sm mb-1">Token 1</label>
        <TokenSelect value={token1} onChange={setToken1} />
      </div>
      <div>
        <label className="block text-sm mb-1">Venue</label>
        <VenueSelect value={venue} onChange={setVenue} />
      </div>
      <div>
        <label className="block text-sm mb-1">Amount</label>
        <AmountInput value={amount} onChange={setAmount} />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Save
      </button>
      {save.data && <div className="text-sm text-gray-500">Saved</div>}
    </form>
  );
}

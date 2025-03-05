import { useState } from 'react';

interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  symbol: string;
  placeholder: string;
}

export default function CurrencyInput({
                                        label,
                                        value,
                                        onChange,
                                        symbol,
                                        placeholder
                                      }: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir solo números, un punto decimal, y evitar múltiples puntos
    const regex = /^[0-9]*\.?[0-9]*$/;
    if (value === '' || regex.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-white mb-1">
        {label}
      </label>
      <div
        className={`
          flex items-center overflow-hidden rounded-xl border bg-emerald-950/30
          ${isFocused
          ? 'border-green-500 shadow-sm shadow-green-500/20'
          : 'border-emerald-700'}
        `}
      >
        <div className="py-3 pl-4 pr-2 text-gray-300">
          {symbol}
        </div>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent py-3 pr-4 outline-none text-white text-right"
          autoComplete="off"
          inputMode="decimal"
        />
      </div>
    </div>
  );
}

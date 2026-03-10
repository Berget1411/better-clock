import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@open-learn/ui/components/select";

export const CURRENCIES = [
  { code: "USD", label: "USD – US Dollar" },
  { code: "EUR", label: "EUR – Euro" },
  { code: "GBP", label: "GBP – British Pound" },
  { code: "SEK", label: "SEK – Swedish Krona" },
  { code: "NOK", label: "NOK – Norwegian Krone" },
  { code: "DKK", label: "DKK – Danish Krone" },
  { code: "CHF", label: "CHF – Swiss Franc" },
  { code: "CAD", label: "CAD – Canadian Dollar" },
  { code: "AUD", label: "AUD – Australian Dollar" },
  { code: "JPY", label: "JPY – Japanese Yen" },
] as const;

interface CurrencySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CurrencySelect({ value, onChange, className }: CurrencySelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

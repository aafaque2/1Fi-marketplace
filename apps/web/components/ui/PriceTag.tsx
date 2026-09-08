interface PriceTagProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  suffix?: string;
}

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const sizeStyles: Record<NonNullable<PriceTagProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function PriceTag({ amount, size = 'md', suffix }: PriceTagProps) {
  return (
    <span className={`font-semibold text-neutral-900 ${sizeStyles[size]}`}>
      {formatter.format(amount)}
      {suffix && <span className="font-normal text-neutral-500">{suffix}</span>}
    </span>
  );
}

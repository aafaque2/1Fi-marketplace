interface BadgeProps {
  label: string;
  tone?: 'brand' | 'neutral' | 'success';
}

const toneStyles: Record<NonNullable<BadgeProps['tone']>, string> = {
  brand: 'bg-brand-100 text-brand-800',
  neutral: 'bg-neutral-100 text-neutral-700',
  success: 'bg-green-100 text-green-800',
};

export function Badge({ label, tone = 'brand' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneStyles[tone]}`}
    >
      {label}
    </span>
  );
}

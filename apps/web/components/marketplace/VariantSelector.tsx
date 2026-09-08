'use client';

import type { ProductVariant } from '@1fi/shared';
import { Chip } from '../ui/Chip';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (variantId: string) => void;
}

export function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <Chip
          key={variant.id}
          label={variant.label}
          selected={variant.id === selectedId}
          disabled={!variant.inStock}
          onClick={() => onSelect(variant.id)}
        />
      ))}
    </div>
  );
}

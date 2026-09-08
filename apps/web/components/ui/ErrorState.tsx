'use client';

import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <p className="text-sm text-neutral-700">{message}</p>
      <Button variant="primary" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

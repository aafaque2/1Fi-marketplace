import { EmptyState } from '@/components/ui/EmptyState';

export default function TopBrandsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Top Brands</h1>
      <EmptyState
        title="Coming soon"
        description="We're curating the top electronics brands. Check back shortly."
      />
    </main>
  );
}

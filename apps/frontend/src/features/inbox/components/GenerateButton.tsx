import { Plus } from 'lucide-react';

export function GenerateButton(): React.JSX.Element {
  return (
    <button
      className="fixed bottom-8 right-8 flex items-center gap-3 rounded-2xl bg-[#c2e7ff] px-6 py-3.5 text-sm font-medium text-neutral-700 shadow-lg transition-all hover:shadow-xl"
    >
      <Plus className="h-5 w-5" />
      Generate Campaign
    </button>
  );
}

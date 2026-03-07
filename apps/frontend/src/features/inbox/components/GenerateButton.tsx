import { Plus } from 'lucide-react';

export function GenerateButton(): React.JSX.Element {
  return (
    <button
      className="fixed bottom-6 right-6 flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90"
    >
      <Plus className="h-5 w-5" />
      Generate Campaign
    </button>
  );
}

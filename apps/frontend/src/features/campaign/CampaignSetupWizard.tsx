import { useState } from 'react';
import { X, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CampaignConfig, PhishingType, Difficulty } from '@phishguard/shared';

const phishingTypes: { value: PhishingType; label: string; description: string }[] = [
  { value: 'spear_phishing', label: 'Spear Phishing', description: 'Targeted emails with personal details' },
  { value: 'bec', label: 'Business Email Compromise', description: 'CEO fraud, wire transfer requests' },
  { value: 'credential_harvest', label: 'Credential Harvest', description: 'Fake login pages, password resets' },
  { value: 'brand_impersonation', label: 'Brand Impersonation', description: 'Fake emails from known brands' },
  { value: 'invoice_fraud', label: 'Invoice Fraud', description: 'Fake invoices and payment requests' },
  { value: 'mixed', label: 'Mixed Campaign', description: 'Random mix of all phishing types' },
];

const difficulties: { value: Difficulty; label: string; description: string; color: string }[] = [
  { value: 'easy', label: 'Easy', description: 'Obvious red flags, perfect for beginners', color: 'border-green-300 bg-green-50 text-green-700' },
  { value: 'medium', label: 'Medium', description: 'Subtle indicators, requires careful analysis', color: 'border-amber-300 bg-amber-50 text-amber-700' },
  { value: 'hard', label: 'Hard', description: 'Near-perfect impersonation, very challenging', color: 'border-red-300 bg-red-50 text-red-700' },
];

interface CampaignSetupWizardProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (config: CampaignConfig) => void;
  loading: boolean;
}

export function CampaignSetupWizard({ open, onClose, onGenerate, loading }: CampaignSetupWizardProps): React.JSX.Element | null {
  const [phishingType, setPhishingType] = useState<PhishingType>('mixed');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [emailCount, setEmailCount] = useState(8);
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');

  if (!open) return null;

  const handleGenerate = (): void => {
    onGenerate({
      phishingType,
      difficulty,
      emailCount,
      targetRole: targetRole || undefined,
      industry: industry || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#1a73e8]" />
            <h2 className="text-lg font-medium text-neutral-900">Generate Campaign</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          {/* Phishing Type */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-neutral-700">Phishing Type</label>
            <div className="grid grid-cols-2 gap-2">
              {phishingTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setPhishingType(type.value)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-all',
                    phishingType === type.value
                      ? 'border-[#1a73e8] bg-[#e8f0fe] ring-1 ring-[#1a73e8]'
                      : 'border-neutral-200 hover:border-neutral-300',
                  )}
                >
                  <div className="text-sm font-medium text-neutral-900">{type.label}</div>
                  <div className="mt-0.5 text-xs text-neutral-500">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-neutral-700">Difficulty</label>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2.5 text-center transition-all',
                    difficulty === d.value
                      ? d.color + ' ring-1'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
                  )}
                >
                  <div className="text-sm font-medium">{d.label}</div>
                  <div className="mt-0.5 text-xs opacity-75">{d.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Email Count */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Number of Emails: <span className="font-bold text-[#1a73e8]">{emailCount}</span>
            </label>
            <input
              type="range"
              min={4}
              max={12}
              value={emailCount}
              onChange={(e) => setEmailCount(Number(e.target.value))}
              className="w-full accent-[#1a73e8]"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>4</span>
              <span>12</span>
            </div>
          </div>

          {/* Optional: Target Role */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Target Role <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Engineer, Finance Manager"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
            />
          </div>

          {/* Optional: Industry */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Industry <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Healthcare, FinTech, E-commerce"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#1a73e8] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1557b0] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Campaign'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

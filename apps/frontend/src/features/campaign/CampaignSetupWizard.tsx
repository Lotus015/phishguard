import { useState } from 'react';
import { X, Shield, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
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

const TOTAL_STEPS = 3;

interface CampaignSetupWizardProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (config: CampaignConfig) => void;
  loading: boolean;
}

export function CampaignSetupWizard({ open, onClose, onGenerate, loading }: CampaignSetupWizardProps): React.JSX.Element | null {
  const [step, setStep] = useState(1);
  const [phishingType, setPhishingType] = useState<PhishingType>('mixed');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [emailCount, setEmailCount] = useState(8);
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');

  if (!open) return null;

  const handleClose = (): void => {
    setStep(1);
    onClose();
  };

  const handleGenerate = (): void => {
    onGenerate({
      phishingType,
      difficulty,
      emailCount,
      targetRole: targetRole || undefined,
      industry: industry || undefined,
    });
  };

  const handleNext = (): void => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = (): void => {
    if (step > 1) setStep((s) => s - 1);
  };

  const stepTitles = ['Phishing Type', 'Difficulty & Count', 'Details'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#1a73e8]" />
            <h2 className="text-base font-medium text-neutral-900 sm:text-lg">Generate Campaign</h2>
          </div>
          <button onClick={handleClose} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 px-5 pt-4 sm:px-6">
          {stepTitles.map((title, i) => (
            <div key={title} className="flex flex-1 flex-col items-center gap-1">
              <div
                className={cn(
                  'h-1 w-full rounded-full transition-colors',
                  i + 1 <= step ? 'bg-[#1a73e8]' : 'bg-neutral-200',
                )}
              />
              <span className={cn(
                'text-[10px] sm:text-xs',
                i + 1 === step ? 'font-medium text-[#1a73e8]' : 'text-neutral-400',
              )}>
                {title}
              </span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          {/* Step 1: Phishing Type */}
          {step === 1 && (
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">Select phishing type</label>
              <div className="grid grid-cols-2 gap-2">
                {phishingTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setPhishingType(type.value)}
                    className={cn(
                      'rounded-lg border p-2.5 text-left transition-all sm:p-3',
                      phishingType === type.value
                        ? 'border-[#1a73e8] bg-[#e8f0fe] ring-1 ring-[#1a73e8]'
                        : 'border-neutral-200 hover:border-neutral-300',
                    )}
                  >
                    <div className="text-xs font-medium text-neutral-900 sm:text-sm">{type.label}</div>
                    <div className="mt-0.5 text-[10px] leading-tight text-neutral-500 sm:text-xs">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Difficulty + Email Count */}
          {step === 2 && (
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">Difficulty</label>
              <div className="flex gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficulty(d.value)}
                    className={cn(
                      'flex-1 rounded-lg border px-2 py-2.5 text-center transition-all sm:px-3',
                      difficulty === d.value
                        ? d.color + ' ring-1'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
                    )}
                  >
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="mt-0.5 hidden text-xs opacity-75 sm:block">{d.description}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6">
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
            </div>
          )}

          {/* Step 3: Optional details */}
          {step === 3 && (
            <div>
              <p className="mb-4 text-sm text-neutral-500">
                These are optional — skip if you want a general campaign.
              </p>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Target Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Finance Manager"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-[#1a73e8] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Industry
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
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3 sm:px-6 sm:py-4">
          <div>
            {step > 1 ? (
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <button
                onClick={handleClose}
                disabled={loading}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
              >
                Cancel
              </button>
            )}
          </div>
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1557b0] disabled:opacity-50 sm:px-5"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : step < TOTAL_STEPS ? (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
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

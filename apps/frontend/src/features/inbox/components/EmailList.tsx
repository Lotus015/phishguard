import { useInbox } from '../context/InboxContext';
import { EmailRow } from './EmailRow';

export function EmailList(): React.JSX.Element {
  const { emails } = useInbox();

  if (emails.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-neutral-400">
        <p className="text-lg">No emails yet</p>
        <p className="mt-1 text-sm">Click "Generate Campaign" to get started</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {emails.map((email) => (
        <EmailRow key={email.id} email={email} />
      ))}
    </div>
  );
}

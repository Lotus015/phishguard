import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import { EmailList } from './EmailList';
import { EmailViewer } from './EmailViewer';
import { GenerateButton } from './GenerateButton';
import { useInbox } from '../context/InboxContext';

export function InboxLayout(): React.JSX.Element {
  const { selectedEmailId } = useInbox();

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Toolbar />

        <div className="flex flex-1 overflow-hidden">
          {/* Email list — hide on mobile when viewing email */}
          <div className={`w-full border-r border-border md:w-96 ${selectedEmailId ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
            <EmailList />
          </div>

          {/* Email viewer */}
          {selectedEmailId ? (
            <EmailViewer />
          ) : (
            <div className="hidden flex-1 items-center justify-center text-neutral-300 md:flex">
              <p className="text-lg">Select an email to read</p>
            </div>
          )}
        </div>
      </div>

      <GenerateButton />
    </div>
  );
}

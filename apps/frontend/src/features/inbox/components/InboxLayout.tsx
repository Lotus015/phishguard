import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import { CategoryTabs } from './CategoryTabs';
import { EmailList } from './EmailList';
import { EmailViewer } from './EmailViewer';
import { GenerateButton } from './GenerateButton';
import { useInbox } from '../context/InboxContext';

export function InboxLayout(): React.JSX.Element {
  const { selectedEmailId } = useInbox();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Top header */}
      <Header
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} />

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-tl-2xl bg-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]">
          {selectedEmailId ? (
            /* Email viewer - full width */
            <EmailViewer />
          ) : (
            /* Inbox list */
            <>
              <Toolbar />
              <CategoryTabs />
              <EmailList />
            </>
          )}
        </div>
      </div>

      {!selectedEmailId && <GenerateButton />}
    </div>
  );
}

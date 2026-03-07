import { InboxProvider } from './features/inbox/context/InboxContext';
import { InboxLayout } from './features/inbox/components/InboxLayout';

export default function App() {
  return (
    <InboxProvider>
      <InboxLayout />
    </InboxProvider>
  )
}

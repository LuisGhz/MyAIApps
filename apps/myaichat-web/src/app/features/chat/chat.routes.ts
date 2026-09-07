import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { ChatPage } from './pages/chat-page/chat-page';

const chatMatcher = (segments: UrlSegment[]): UrlMatchResult | null => {
  // Matches:
  // - `/`                -> no params
  // - `/chat/:id`        -> params: { id }
  if (segments.length === 0) return { consumed: [] };
  if (segments.length === 2 && segments[0].path === 'chat') {
    return {
      consumed: segments,
      posParams: {
        id: segments[1],
      },
    };
  }
  return null;
};

export const CHAT_ROUTES: Routes = [
  {
    matcher: chatMatcher,
    component: ChatPage,
    title: 'Start a new conversation',
  },
];

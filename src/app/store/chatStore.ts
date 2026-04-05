import { create } from 'zustand';

export interface ChatSession {
  id: string; // conversationId
  minimized: boolean;
}

interface ChatState {
  activeChats: ChatSession[];
  openChat: (id: string) => void;
  closeChat: (id: string) => void;
  toggleMinimize: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeChats: [],
  openChat: (id) =>
    set((state) => {
      // If already open, just make sure it is not minimized
      const existing = state.activeChats.find((chat) => chat.id === id);
      if (existing) {
        return {
          activeChats: state.activeChats.map((c) =>
            c.id === id ? { ...c, minimized: false } : c
          ),
        };
      }
      
      // Limit to max 3 open chats on screen to avoid clutter
      const newChats = [...state.activeChats, { id, minimized: false }];
      if (newChats.length > 3) {
        newChats.shift(); // Remove the oldest chat
      }
      return { activeChats: newChats };
    }),
  closeChat: (id) =>
    set((state) => ({
      activeChats: state.activeChats.filter((chat) => chat.id !== id),
    })),
  toggleMinimize: (id) =>
    set((state) => ({
      activeChats: state.activeChats.map((chat) =>
        chat.id === id ? { ...chat, minimized: !chat.minimized } : chat
      ),
    })),
}));

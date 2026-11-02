import { create } from "zustand";

export interface AppMessage {
  id: string;
  partnerName: string;
  location: string;
  productId: string;
  productName: string;
  pathway: string;
  messageText: string;
  sender: string;
  timestamp: string;
  status: "Sent" | "Delivered" | "Read";
  unread: boolean;
}

interface MessageState {
  messages: AppMessage[];
  sendMessage: (msg: Omit<AppMessage, "id" | "timestamp" | "status" | "unread">) => AppMessage;
  markAllRead: () => void;
  loadMessages: () => void;
}

const DEFAULT_MESSAGES: AppMessage[] = [
  {
    id: "MSG-8921",
    partnerName: "ScreenFix Pro",
    location: "Adyar, Chennai",
    productId: "default",
    productName: "Apple MacBook Pro 14 (M1 Pro)",
    pathway: "Repair & Resale",
    messageText: "Order intake confirmed for OEM Liquid Retina XDR screen replacement. Technician bench assigned.",
    sender: "ScreenFix Pro Support",
    timestamp: "10 mins ago",
    status: "Delivered",
    unread: false,
  },
];

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: DEFAULT_MESSAGES,

  sendMessage: (msgData) => {
    const newMsg: AppMessage = {
      ...msgData,
      id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: "Just now",
      status: "Delivered",
      unread: true,
    };

    const updated = [newMsg, ...get().messages];
    if (typeof window !== "undefined") {
      localStorage.setItem("relife_in_app_messages", JSON.stringify(updated));
    }
    set({ messages: updated });
    return newMsg;
  },

  markAllRead: () => {
    const updated = get().messages.map((m) => ({ ...m, unread: false }));
    if (typeof window !== "undefined") {
      localStorage.setItem("relife_in_app_messages", JSON.stringify(updated));
    }
    set({ messages: updated });
  },

  loadMessages: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("relife_in_app_messages");
      if (stored) {
        try {
          set({ messages: JSON.parse(stored) });
        } catch {}
      }
    }
  },
}));

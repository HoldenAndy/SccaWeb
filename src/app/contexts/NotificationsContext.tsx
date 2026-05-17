import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

export type NotifKind = "info" | "warning" | "critical" | "success";

export interface Notification {
  id: string;
  kind: NotifKind;
  title: string;
  body?: string;
  href?: string;
  createdAt: number;
  read: boolean;
}

interface NotificationsCtx {
  items: Notification[];
  unread: number;
  push: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<NotificationsCtx | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);

  const push: NotificationsCtx["push"] = useCallback((n) => {
    setItems((prev) => [
      { ...n, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: Date.now(), read: false },
      ...prev,
    ].slice(0, 50));
  }, []);

  const markRead: NotificationsCtx["markRead"] = useCallback((id) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead: NotificationsCtx["markAllRead"] = useCallback(() => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss: NotificationsCtx["dismiss"] = useCallback((id) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clear: NotificationsCtx["clear"] = useCallback(() => setItems([]), []);

  const unread = useMemo(() => items.filter((n) => !n.read).length, [items]);

  return (
    <Ctx.Provider value={{ items, unread, push, markRead, markAllRead, dismiss, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useNotifications(): NotificationsCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useNotifications must be used within NotificationsProvider");
  return v;
}

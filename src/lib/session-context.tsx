"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { GeneratedImage } from "@/lib/types";

interface SessionContextValue {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  clearSession: () => void;
  loadedImages: GeneratedImage[];
  setLoadedImages: (images: GeneratedImage[]) => void;
}

const SessionContext = createContext<SessionContextValue>({
  sessionId: null,
  setSessionId: () => {},
  clearSession: () => {},
  loadedImages: [],
  setLoadedImages: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionIdState] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<GeneratedImage[]>([]);

  const setSessionId = useCallback((id: string | null) => {
    setSessionIdState(id);
  }, []);

  const clearSession = useCallback(() => {
    setSessionIdState(null);
    setLoadedImages([]);
  }, []);

  return (
    <SessionContext.Provider
      value={{ sessionId, setSessionId, clearSession, loadedImages, setLoadedImages }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

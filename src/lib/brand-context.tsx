"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { BrandConfig } from "./types";

const STORAGE_KEY = "product-studio-brand";

interface BrandContextValue {
  brand: BrandConfig | null;
  setBrand: (config: BrandConfig | null) => void;
  clearBrand: () => void;
  isLoaded: boolean;
}

const BrandContext = createContext<BrandContextValue>({
  brand: null,
  setBrand: () => {},
  clearBrand: () => {},
  isLoaded: false,
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brand, setBrandState] = useState<BrandConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setBrandState(JSON.parse(stored));
      }
    } catch {
      // corrupted data, ignore
    }
    setIsLoaded(true);
  }, []);

  const setBrand = useCallback((config: BrandConfig | null) => {
    setBrandState(config);
    if (config) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const clearBrand = useCallback(() => {
    setBrandState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <BrandContext.Provider value={{ brand, setBrand, clearBrand, isLoaded }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}

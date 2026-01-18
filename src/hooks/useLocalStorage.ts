'use client';

import { useState, useEffect, useCallback } from 'react';
import { safeJsonParse } from '@/lib/utils';
import { Book } from '@/types';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage after mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(safeJsonParse(item, initialValue));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsInitialized(true);
  }, [key, initialValue]);

  // Update localStorage when value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [isInitialized ? storedValue : initialValue, setValue, removeValue];
}

// Specialized hook for storing book drafts
export function useBookDraft() {
  return useLocalStorage<{
    childName?: string;
    childAge?: number;
    theme?: string;
    illustrationStyle?: string;
    transcriptContent?: string;
  }>('book-draft', {});
}

// Hook for storing recent books
export function useRecentBooks() {
  return useLocalStorage<
    Array<{
      id: string;
      childName: string;
      createdAt: string;
      thumbnailUrl?: string;
    }>
  >('recent-books', []);
}

// Hook for storing the currently generated book (for preview page)
export function useGeneratedBook() {
  return useLocalStorage<Book | null>('generated-book', null);
}

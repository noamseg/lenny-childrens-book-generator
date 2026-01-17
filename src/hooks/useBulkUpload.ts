'use client';

import { useState, useCallback, useRef } from 'react';
import {
  BulkUploadItem,
  SSEEvent,
  ImportItem,
  ImportResult,
} from '@/types/bulk-upload';

export type BulkUploadPhase = 'upload' | 'analyzing' | 'review' | 'importing' | 'complete';

interface AnalysisProgress {
  current: number;
  total: number;
  currentFileName: string;
}

interface UseBulkUploadReturn {
  // State
  items: BulkUploadItem[];
  phase: BulkUploadPhase;
  progress: AnalysisProgress | null;
  importResult: ImportResult | null;
  error: string | null;

  // Actions
  addFiles: (files: File[]) => Promise<void>;
  removeItem: (id: string) => void;
  clearItems: () => void;
  startAnalysis: () => Promise<void>;
  cancelAnalysis: () => void;
  updateItem: (id: string, updates: Partial<BulkUploadItem>) => void;
  importSelected: (selectedIds: string[]) => Promise<void>;
  reset: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useBulkUpload(): UseBulkUploadReturn {
  const [items, setItems] = useState<BulkUploadItem[]>([]);
  const [phase, setPhase] = useState<BulkUploadPhase>('upload');
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Add files from file input
  const addFiles = useCallback(async (files: File[]) => {
    const newItems: BulkUploadItem[] = [];

    for (const file of files) {
      if (!file.name.endsWith('.txt')) {
        console.warn(`Skipping non-txt file: ${file.name}`);
        continue;
      }

      try {
        const content = await file.text();
        newItems.push({
          id: generateId(),
          fileName: file.name,
          status: 'pending',
          transcriptContent: content,
          analysis: null,
          error: null,
          matchedGuestId: null,
          createNewGuest: false,
        });
      } catch (err) {
        console.error(`Error reading file ${file.name}:`, err);
      }
    }

    setItems(prev => [...prev, ...newItems]);
  }, []);

  // Remove item from list
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Clear all items
  const clearItems = useCallback(() => {
    setItems([]);
    setPhase('upload');
    setProgress(null);
    setError(null);
  }, []);

  // Update a specific item
  const updateItem = useCallback((id: string, updates: Partial<BulkUploadItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  // Start AI analysis
  const startAnalysis = useCallback(async () => {
    if (items.length === 0) {
      setError('No files to analyze');
      return;
    }

    setPhase('analyzing');
    setProgress({ current: 0, total: items.length, currentFileName: '' });
    setError(null);

    // Mark all items as pending
    setItems(prev => prev.map(item => ({
      ...item,
      status: 'pending' as const,
      analysis: null,
      error: null,
    })));

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/admin/bulk-upload/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            fileName: item.fileName,
            content: item.transcriptContent,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis request failed');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Process SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: SSEEvent = JSON.parse(line.slice(6));

              switch (event.type) {
                case 'progress':
                  setProgress({
                    current: event.current,
                    total: event.total,
                    currentFileName: event.fileName,
                  });
                  setItems(prev => prev.map(item =>
                    item.fileName === event.fileName
                      ? { ...item, status: 'analyzing' as const }
                      : item
                  ));
                  break;

                case 'item_complete':
                  setItems(prev => prev.map(item =>
                    item.id === event.itemId
                      ? {
                          ...item,
                          status: 'completed' as const,
                          analysis: event.analysis,
                          matchedGuestId: event.matchedGuestId,
                          createNewGuest: !event.matchedGuestId && !!event.analysis.guestName,
                        }
                      : item
                  ));
                  break;

                case 'item_error':
                  setItems(prev => prev.map(item =>
                    item.id === event.itemId
                      ? {
                          ...item,
                          status: 'error' as const,
                          error: event.error,
                        }
                      : item
                  ));
                  break;

                case 'all_complete':
                  setProgress(null);
                  setPhase('review');
                  break;
              }
            } catch (parseError) {
              console.error('Error parsing SSE event:', parseError);
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Analysis cancelled');
      } else {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      }
      setPhase('upload');
    } finally {
      abortControllerRef.current = null;
    }
  }, [items]);

  // Cancel ongoing analysis
  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Import selected items
  const importSelected = useCallback(async (selectedIds: string[]) => {
    const selectedItems = items.filter(
      item => selectedIds.includes(item.id) &&
      item.status === 'completed' &&
      item.analysis
    );

    if (selectedItems.length === 0) {
      setError('No valid items to import');
      return;
    }

    setPhase('importing');
    setError(null);

    try {
      const importItems: ImportItem[] = selectedItems.map(item => ({
        id: item.id,
        episodeNumber: item.analysis!.episodeNumber || 0,
        title: item.analysis!.title,
        description: item.analysis!.description,
        publishDate: new Date().toISOString().split('T')[0],
        duration: item.analysis!.estimatedDuration,
        guestId: item.matchedGuestId,
        createNewGuest: item.createNewGuest,
        newGuestData: item.createNewGuest && item.analysis!.guestName ? {
          name: item.analysis!.guestName,
          title: item.analysis!.guestTitle || '',
          company: item.analysis!.guestCompany || '',
        } : undefined,
        featuredQuote: item.analysis!.featuredQuote,
        quoteTimestamp: item.analysis!.quoteTimestamp || '',
        topics: item.analysis!.topics,
        transcriptContent: item.transcriptContent,
      }));

      const response = await fetch('/api/admin/bulk-upload/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: importItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const result: ImportResult = await response.json();
      setImportResult(result);

      // Mark imported items
      setItems(prev => prev.map(item => {
        if (selectedIds.includes(item.id) && !result.errors.find(e => e.id === item.id)) {
          return { ...item, status: 'imported' as const };
        }
        return item;
      }));

      setPhase('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setPhase('review');
    }
  }, [items]);

  // Reset to start over
  const reset = useCallback(() => {
    setItems([]);
    setPhase('upload');
    setProgress(null);
    setImportResult(null);
    setError(null);
  }, []);

  return {
    items,
    phase,
    progress,
    importResult,
    error,
    addFiles,
    removeItem,
    clearItems,
    startAnalysis,
    cancelAnalysis,
    updateItem,
    importSelected,
    reset,
  };
}

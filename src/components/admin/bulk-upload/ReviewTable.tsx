'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Button } from '@/components/ui';
import { BulkUploadItem, TranscriptAnalysisResult } from '@/types/bulk-upload';
import { LennyGuest, LENNY_TOPICS } from '@/types/lenny';

interface ReviewTableProps {
  items: BulkUploadItem[];
  onUpdateItem: (id: string, updates: Partial<BulkUploadItem>) => void;
  onImportSelected: (selectedIds: string[]) => void;
  onBack: () => void;
}

export default function ReviewTable({
  items,
  onUpdateItem,
  onImportSelected,
  onBack,
}: ReviewTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [guests, setGuests] = useState<LennyGuest[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Fetch existing guests for matching
  useEffect(() => {
    fetch('/api/admin/guests')
      .then(res => res.json())
      .then(data => setGuests(data))
      .catch(err => console.error('Error fetching guests:', err));
  }, []);

  // Filter to only show completed items
  const completedItems = useMemo(
    () => items.filter(i => i.status === 'completed' && i.analysis),
    [items]
  );

  const errorItems = useMemo(
    () => items.filter(i => i.status === 'error'),
    [items]
  );

  // Auto-select all completed items on mount
  useEffect(() => {
    setSelectedIds(new Set(completedItems.map(i => i.id)));
  }, [completedItems]);

  const handleSelectAll = () => {
    if (selectedIds.size === completedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(completedItems.map(i => i.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleUpdateAnalysis = (
    itemId: string,
    field: keyof TranscriptAnalysisResult,
    value: unknown
  ) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.analysis) return;

    onUpdateItem(itemId, {
      analysis: {
        ...item.analysis,
        [field]: value,
      },
    });
  };

  const handleGuestChange = (itemId: string, guestId: string | null, createNew: boolean) => {
    onUpdateItem(itemId, {
      matchedGuestId: guestId,
      createNewGuest: createNew,
    });
  };

  const handleImport = () => {
    onImportSelected(Array.from(selectedIds));
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Review & Edit</h2>
          <p className="text-gray-600">
            {completedItems.length} items ready, {errorItems.length} errors
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIds.size === 0}
          >
            Import {selectedIds.size} Episode{selectedIds.size === 1 ? '' : 's'}
          </Button>
        </div>
      </div>

      {/* Error Items */}
      {errorItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <h3 className="font-medium text-red-700 mb-2">
            {errorItems.length} item{errorItems.length === 1 ? '' : 's'} failed analysis
          </h3>
          <div className="space-y-1">
            {errorItems.map(item => (
              <div key={item.id} className="text-sm text-red-600">
                {item.fileName}: {item.error}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Review Table */}
      {completedItems.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === completedItems.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Ep #</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Topics</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Duration</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Confidence</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {completedItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`${
                      selectedIds.has(item.id) ? 'bg-primary-50' : 'hover:bg-gray-50'
                    } ${editingItem === item.id ? 'bg-yellow-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {editingItem === item.id ? (
                        <input
                          type="number"
                          value={item.analysis?.episodeNumber || ''}
                          onChange={(e) => handleUpdateAnalysis(item.id, 'episodeNumber', parseInt(e.target.value) || null)}
                          className="w-16 px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <span className="font-medium">
                          {item.analysis?.episodeNumber || '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {editingItem === item.id ? (
                        <input
                          type="text"
                          value={item.analysis?.title || ''}
                          onChange={(e) => handleUpdateAnalysis(item.id, 'title', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      ) : (
                        <div>
                          <p className="font-medium text-gray-900 truncate">
                            {item.analysis?.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {item.fileName}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingItem === item.id ? (
                        <select
                          value={item.matchedGuestId || (item.createNewGuest ? 'new' : '')}
                          onChange={(e) => {
                            if (e.target.value === 'new') {
                              handleGuestChange(item.id, null, true);
                            } else if (e.target.value === '') {
                              handleGuestChange(item.id, null, false);
                            } else {
                              handleGuestChange(item.id, e.target.value, false);
                            }
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="">Select guest...</option>
                          {guests.map(guest => (
                            <option key={guest.id} value={guest.id}>
                              {guest.name} ({guest.company})
                            </option>
                          ))}
                          {item.analysis?.guestName && (
                            <option value="new">
                              + Create: {item.analysis.guestName}
                            </option>
                          )}
                        </select>
                      ) : (
                        <div>
                          {item.matchedGuestId ? (
                            <span className="text-gray-900">
                              {guests.find(g => g.id === item.matchedGuestId)?.name || 'Matched'}
                            </span>
                          ) : item.createNewGuest ? (
                            <span className="text-green-600">
                              + {item.analysis?.guestName}
                            </span>
                          ) : item.analysis?.guestName ? (
                            <span className="text-yellow-600">
                              {item.analysis.guestName} (unassigned)
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingItem === item.id ? (
                        <div className="flex flex-wrap gap-1">
                          {LENNY_TOPICS.map(topic => (
                            <label key={topic} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={item.analysis?.topics.includes(topic)}
                                onChange={(e) => {
                                  const topics = item.analysis?.topics || [];
                                  const newTopics = e.target.checked
                                    ? [...topics, topic]
                                    : topics.filter(t => t !== topic);
                                  handleUpdateAnalysis(item.id, 'topics', newTopics);
                                }}
                                className="rounded border-gray-300 text-primary-600 mr-1"
                              />
                              <span className="text-xs">{topic}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {item.analysis?.topics.slice(0, 3).map(topic => (
                            <span
                              key={topic}
                              className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full"
                            >
                              {topic}
                            </span>
                          ))}
                          {(item.analysis?.topics.length || 0) > 3 && (
                            <span className="text-xs text-gray-400">
                              +{(item.analysis?.topics.length || 0) - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.analysis?.estimatedDuration}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.analysis?.confidence === 'high' ? 'bg-green-100 text-green-700' :
                        item.analysis?.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.analysis?.confidence}
                      </span>
                      {item.analysis?.warnings && item.analysis.warnings.length > 0 && (
                        <span className="ml-1 text-yellow-500" title={item.analysis.warnings.join(', ')}>
                          ⚠️
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingItem(editingItem === item.id ? null : item.id)}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        {editingItem === item.id ? 'Done' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

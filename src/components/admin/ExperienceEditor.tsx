"use client";

import { useEffect, useState, useMemo } from 'react';
import { usePortfolioStore, ExperienceEntry } from '@/store/usePortfolioStore';

// Generate month/year options
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i + 5); // 5 years future to 25 years past

function parseMonthYear(dateStr: string): { month: string; year: string } | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(' ');
  if (parts.length === 2) {
    return { month: parts[0], year: parts[1] };
  }
  return null;
}

function formatMonthYear(month: string, year: string): string {
  return `${month} ${year}`;
}

function newExperience(): ExperienceEntry {
  return {
    id: Math.random().toString(36).slice(2),
    organization: '',
    role: '',
    startDate: '',
    endDate: '',
    location: '',
    description: '',
    link: '',
    logoFile: '',
  };
}

export default function ExperienceEditor() {
  const storeItems = usePortfolioStore((s) => s.experienceEntries);
  const setItems = usePortfolioStore((s) => s.setExperienceEntries);
  const theme = usePortfolioStore((s) => s.theme);
  const [items, setLocalItems] = useState<ExperienceEntry[]>(storeItems || []);
  
  const lightMode = theme === 'light';

  useEffect(() => {
    setLocalItems(storeItems || []);
  }, [storeItems]);

  // Sort items by start date (most recent first)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const getDate = (entry: ExperienceEntry) => {
        if (!entry.startDate) return new Date(0);
        const date = new Date(entry.startDate + ' 01');
        return isNaN(date.getTime()) ? new Date(0) : date;
      };
      return getDate(b).getTime() - getDate(a).getTime();
    });
  }, [items]);

  const updateItem = (id: string, updates: Partial<ExperienceEntry>) => {
    const next = items.map((it) => (it.id === id ? { ...it, ...updates } : it));
    setLocalItems(next);
    setItems(next);
  };

  const addItem = () => {
    const next = [...items, newExperience()];
    setLocalItems(next);
    setItems(next);
  };

  const removeItem = (id: string) => {
    const next = items.filter((it) => it.id !== id);
    setLocalItems(next);
    setItems(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-semibold ${lightMode ? 'text-gray-900' : 'text-white'}`}>Experience</h2>
        <button onClick={addItem} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Add Entry</button>
      </div>

      {items.length === 0 && (
        <p className={`text-sm ${lightMode ? 'text-gray-500' : 'text-gray-400'}`}>No experience entries yet. Click "Add Entry" to create one.</p>
      )}

      <div className="space-y-4">
        {sortedItems.map((item) => {
          const startParsed = parseMonthYear(item.startDate || '');
          const endParsed = parseMonthYear(item.endDate || '');
          const isPresent = !item.endDate || item.endDate.toLowerCase() === 'present';
          
          return (
            <div key={item.id} className={`rounded border p-4 space-y-3 ${lightMode ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Logo upload and preview */}
              <div>
                <label className={`block text-sm font-medium ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>Logo</label>
                <div className="mt-1 flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-lg overflow-hidden border flex items-center justify-center ${lightMode ? 'border-gray-300 bg-white' : 'border-gray-600 bg-gray-900'}`}>
                    {item.logoFile ? (
                      <img src={item.logoFile} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No logo</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataUrl = reader.result as string;
                        updateItem(item.id, { logoFile: dataUrl, logoUrl: undefined });
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>Organization</label>
                <input
                  className={`mt-1 w-full rounded border px-3 py-2 ${lightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-900 border-gray-700 text-white'}`}
                  value={item.organization}
                  onChange={(e) => updateItem(item.id, { organization: e.target.value })}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>Role</label>
                <input
                  className={`mt-1 w-full rounded border px-3 py-2 ${lightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-900 border-gray-700 text-white'}`}
                  value={item.role}
                  onChange={(e) => updateItem(item.id, { role: e.target.value })}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>Start Date</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <select
                    className={`w-full rounded border px-3 py-2 ${lightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-900 border-gray-700 text-white'}`}
                    value={startParsed?.month || ''}
                    onChange={(e) => {
                      const year = startParsed?.year || currentYear.toString();
                      updateItem(item.id, { startDate: e.target.value ? formatMonthYear(e.target.value, year) : '' });
                    }}
                  >
                    <option value="">Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select
                    className={`w-full rounded border px-3 py-2 ${lightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-900 border-gray-700 text-white'}`}
                    value={startParsed?.year || ''}
                    onChange={(e) => {
                      const month = startParsed?.month || 'January';
                      updateItem(item.id, { startDate: e.target.value ? formatMonthYear(month, e.target.value) : '' });
                    }}
                  >
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>End Date</label>
                <div className="mt-1 space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPresent}
                      onChange={(e) => {
                        updateItem(item.id, { endDate: e.target.checked ? 'Present' : '' });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">Currently working here</span>
                  </label>
                  {!isPresent && (
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className={`w-full rounded border px-3 py-2 ${lightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-900 border-gray-700 text-white'}`}
                        value={endParsed?.month || ''}
                        onChange={(e) => {
                          const year = endParsed?.year || currentYear.toString();
                          updateItem(item.id, { endDate: e.target.value ? formatMonthYear(e.target.value, year) : '' });
                        }}
                      >
                        <option value="">Month</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <select
                        className={`w-full rounded border px-3 py-2 ${lightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-900 border-gray-700 text-white'}`}
                        value={endParsed?.year || ''}
                        onChange={(e) => {
                          const month = endParsed?.month || 'January';
                          updateItem(item.id, { endDate: e.target.value ? formatMonthYear(month, e.target.value) : '' });
                        }}
                      >
                        <option value="">Year</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>Location</label>
                <input
                  className={`mt-1 w-full rounded border px-3 py-2 ${lightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-900 border-gray-700 text-white'}`}
                  value={item.location || ''}
                  onChange={(e) => updateItem(item.id, { location: e.target.value })}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>Link</label>
                <input
                  className={`mt-1 w-full rounded border px-3 py-2 ${lightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-900 border-gray-700 text-white'}`}
                  placeholder="https://..."
                  value={item.link || ''}
                  onChange={(e) => updateItem(item.id, { link: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${lightMode ? 'text-gray-700' : 'text-gray-300'}`}>Description</label>
              <textarea
                className={`mt-1 w-full rounded border px-3 py-2 resize-y ${lightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-gray-900 border-gray-700 text-white'}`}
                rows={3}
                value={item.description || ''}
                onChange={(e) => updateItem(item.id, { description: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <button onClick={() => removeItem(item.id)} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Remove</button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

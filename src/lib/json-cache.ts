// Simple raw JSON cache used across pages for pre-filling inputs
// We store the raw text so even invalid JSON can be restored.

const RAW_CACHE_KEY = 'json-swiss-cached-raw';
const ZUSTAND_PERSIST_KEY = 'json-swiss-storage';

export function setCachedRawJson(value: string): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(RAW_CACHE_KEY, value ?? '');
  } catch {
    // ignore storage errors
  }
}

export function getCachedRawJson(): string {
  try {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(RAW_CACHE_KEY) || '';
  } catch {
    return '';
  }
}

function getPersistedJsonFromStore(): string {
  try {
    if (typeof window === 'undefined') return '';
    const raw = localStorage.getItem(ZUSTAND_PERSIST_KEY);
    if (!raw) return '';
    const parsed = JSON.parse(raw);
    const jsonData = parsed?.state?.jsonData;
    if (jsonData === null || jsonData === undefined) return '';
    return JSON.stringify(jsonData, null, 2);
  } catch {
    return '';
  }
}

// Prefer raw cache; otherwise fall back to persisted Zustand jsonData
export function getInitialCachedJson(): string {
  const raw = getCachedRawJson();
  if (raw && raw.trim()) return raw;
  return getPersistedJsonFromStore();
}

export function clearCachedJson(): void {
  try {
    if (typeof window === 'undefined') return;
    // Remove raw cached text
    localStorage.removeItem(RAW_CACHE_KEY);

    // Also clear persisted Zustand jsonData so other pages don't rehydrate it
    const raw = localStorage.getItem(ZUSTAND_PERSIST_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.state) {
          // Reset only the relevant fields to avoid nuking other preferences
          parsed.state.jsonData = null;
          if (typeof parsed.state.sidebarEditorContent === 'string') {
            parsed.state.sidebarEditorContent = '';
          }
          localStorage.setItem(ZUSTAND_PERSIST_KEY, JSON.stringify(parsed));
        }
      } catch {
        // If parsing fails, remove the whole persisted entry as a safe fallback
        localStorage.removeItem(ZUSTAND_PERSIST_KEY);
      }
    }
  } catch {
    // ignore
  }
}

import { BoringData, SieveData, createEmptyBoring, createEmptySieve } from '../types';

interface SavedFile<T> {
  app: 'boring-log-app';
  kind: 'boring' | 'sieve';
  version: 1;
  savedAt: string;
  data: T;
}

function download(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function saveBoringFile(data: BoringData) {
  const file: SavedFile<BoringData> = {
    app: 'boring-log-app',
    kind: 'boring',
    version: 1,
    savedAt: new Date().toISOString(),
    data,
  };
  download(`${data.boringId || 'boring-log'}.boring.json`, JSON.stringify(file, null, 2));
}

export function saveSieveFile(data: SieveData) {
  const file: SavedFile<SieveData> = {
    app: 'boring-log-app',
    kind: 'sieve',
    version: 1,
    savedAt: new Date().toISOString(),
    data,
  };
  download(`${data.sampleId || 'sieve-analysis'}.sieve.json`, JSON.stringify(file, null, 2));
}

function pickFile(): Promise<string | null> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
}

export async function loadBoringFile(): Promise<BoringData | null> {
  const text = await pickFile();
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed?.app === 'boring-log-app' && parsed.kind === 'boring' && parsed.data) {
      // Merge over an empty record so files from older versions keep sane defaults
      return { ...createEmptyBoring(), ...parsed.data };
    }
    alert('Not a valid boring log file.');
  } catch {
    alert('Could not read file — invalid format.');
  }
  return null;
}

export async function loadSieveFile(): Promise<SieveData | null> {
  const text = await pickFile();
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed?.app === 'boring-log-app' && parsed.kind === 'sieve' && parsed.data) {
      return { ...createEmptySieve(), ...parsed.data };
    }
    alert('Not a valid sieve analysis file.');
  } catch {
    alert('Could not read file — invalid format.');
  }
  return null;
}

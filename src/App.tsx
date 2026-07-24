import { useState, useEffect } from 'react';
import BoringForm from './components/BoringForm';
import SieveForm from './components/SieveForm';
import { BoringData, SieveData, createEmptyBoring, createEmptySieve } from './types';
import './App.css';

type Tab = 'soil' | 'core' | 'sieve';

const STORAGE_KEY_BORING = 'boring-log-data';
const STORAGE_KEY_SIEVE = 'sieve-log-data';

function loadFromStorage<T>(key: string, fallback: () => T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return fallback();
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('soil');
  const [boringData, setBoringData] = useState<BoringData>(() => loadFromStorage(STORAGE_KEY_BORING, createEmptyBoring));
  const [sieveData, setSieveData] = useState<SieveData>(() => loadFromStorage(STORAGE_KEY_SIEVE, createEmptySieve));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BORING, JSON.stringify(boringData));
  }, [boringData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SIEVE, JSON.stringify(sieveData));
  }, [sieveData]);

  const handleBoringChange = (newData: BoringData) => {
    setBoringData(newData);
  };

  const handleSieveChange = (newData: SieveData) => {
    setSieveData(newData);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'soil' || tab === 'core') {
      setBoringData(prev => ({ ...prev, boringType: tab === 'core' ? 'core' : 'soil' }));
    }
  };

  const handleClearData = () => {
    if (confirm('Clear all form data? This cannot be undone.')) {
      if (activeTab === 'sieve') {
        setSieveData(createEmptySieve());
      } else {
        setBoringData(createEmptyBoring());
      }
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>KYTC Boring Log Generator</h1>
        <p className="subtitle">Geotechnical Boring Log & Sieve Analysis PDF Generator</p>
      </header>

      <nav className="tab-nav">
        <button
          className={`tab-btn ${activeTab === 'soil' ? 'active' : ''}`}
          onClick={() => handleTabChange('soil')}
        >
          Soil Boring Log (Fig 3-5)
        </button>
        <button
          className={`tab-btn ${activeTab === 'core' ? 'active' : ''}`}
          onClick={() => handleTabChange('core')}
        >
          Core Boring Log (Fig 3-7)
        </button>
        <button
          className={`tab-btn ${activeTab === 'sieve' ? 'active' : ''}`}
          onClick={() => handleTabChange('sieve')}
        >
          Sieve Analysis (Fig 10-12)
        </button>
        <button className="tab-btn clear-btn" onClick={handleClearData}>
          Clear Data
        </button>
      </nav>

      <main className="app-main">
        {(activeTab === 'soil' || activeTab === 'core') && (
          <BoringForm data={boringData} onChange={handleBoringChange} />
        )}
        {activeTab === 'sieve' && (
          <SieveForm data={sieveData} onChange={handleSieveChange} />
        )}
      </main>

      <footer className="app-footer">
        <p>KYTC gINT Guidance Manual Format &bull; All data stored locally in your browser</p>
      </footer>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { TEMPLATES } from './data/templates.js';
import JobSetup from './components/JobSetup.jsx';
import Scope from './components/Scope.jsx';
import Costs from './components/Costs.jsx';
import Output from './components/Output.jsx';

const STORAGE_KEY = 'kolega-scope-job';
const TABS = [
  { id: 'setup', label: 'Setup' },
  { id: 'scope', label: 'Scope' },
  { id: 'costs', label: 'Costs' },
  { id: 'output', label: 'Output' },
];

let _idCounter = 9000;
function makeId() {
  return `item-${Date.now()}-${_idCounter++}`;
}

function cloneTemplateItems(templateId) {
  const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  // Deep clone with fresh IDs
  return template.items.map(it => ({ ...it, id: makeId() }));
}

function newJob(templateId = TEMPLATES[0].id) {
  return {
    id: `job-${Date.now()}`,
    name: '',
    date: new Date().toISOString().slice(0, 10),
    type: templateId,
    client: '',
    location: '',
    notes: '',
    items: cloneTemplateItems(templateId),
    costs: {
      labourRate: 85,
      marginPct: 20,
      riskPct: 5,
      plantHire: 0,
      consumables: 0,
      travel: 0,
    },
  };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export default function App() {
  const [job, setJob] = useState(() => loadFromStorage() || newJob());
  const [activeTab, setActiveTab] = useState('setup');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved'
  const debounceRef = useRef(null);

  // Auto-save with debounce
  useEffect(() => {
    setSaveStatus('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(job));
        setSaveStatus('saved');
      } catch {
        setSaveStatus('saved'); // silently fail
      }
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [job]);

  const handleUpdate = useCallback((updatedJob) => {
    setJob(updatedJob);
  }, []);

  function handleResetItems(templateId) {
    setJob(prev => ({
      ...prev,
      type: templateId,
      items: cloneTemplateItems(templateId),
    }));
  }

  function handleNewJob() {
    if (window.confirm('Start a new job? This will clear the current job. Unsaved changes will be lost.')) {
      setJob(newJob());
      setActiveTab('setup');
    }
  }

  // Colours
  const primary = '#1B3A5C';
  const blue = '#2E6DA4';
  const bg = '#EEF3F8';
  const border = '#D8E4EF';

  const headerStyle = {
    background: primary,
    color: 'white',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    height: '52px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(27,58,92,0.18)',
  };

  const logoStyle = {
    fontFamily: "'DM Mono', 'Courier New', monospace",
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'white',
    flexShrink: 0,
  };

  const jobNameStyle = {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.65)',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const saveIndicatorStyle = {
    fontSize: '11px',
    color: saveStatus === 'saving' ? '#FFD166' : 'rgba(255,255,255,0.5)',
    fontFamily: "'DM Mono', 'Courier New', monospace",
    flexShrink: 0,
    transition: 'color 0.3s',
  };

  const newJobBtnStyle = {
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '6px',
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0,
    cursor: 'pointer',
  };

  const tabBarStyle = {
    display: 'flex',
    background: 'white',
    borderBottom: `2px solid ${border}`,
    padding: '0 16px',
    gap: '0',
    overflowX: 'auto',
  };

  const tabStyle = (active) => ({
    padding: '12px 20px',
    fontSize: '13px',
    fontWeight: active ? '700' : '500',
    color: active ? blue : '#7A8A99',
    background: 'none',
    border: 'none',
    borderBottom: active ? `2px solid ${blue}` : '2px solid transparent',
    marginBottom: '-2px',
    cursor: 'pointer',
    transition: 'color 0.15s',
    whiteSpace: 'nowrap',
    letterSpacing: active ? '0.02em' : '0',
  });

  return (
    <div style={{ minHeight: '100vh', background: bg }}>
      {/* Header */}
      <header className="no-print" style={headerStyle}>
        <div style={logoStyle}>Kolega Scope Tool</div>
        {job.name && (
          <div style={jobNameStyle}>— {job.name}</div>
        )}
        <div style={saveIndicatorStyle}>
          {saveStatus === 'saving' ? '● saving…' : '✓ saved'}
        </div>
        <button onClick={handleNewJob} style={newJobBtnStyle}>+ New Job</button>
      </header>

      {/* Tab bar */}
      <nav className="no-print" style={tabBarStyle}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            style={tabStyle(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main>
        {activeTab === 'setup' && (
          <JobSetup
            job={job}
            onUpdate={handleUpdate}
            onResetItems={handleResetItems}
          />
        )}
        {activeTab === 'scope' && (
          <Scope
            job={job}
            onUpdate={handleUpdate}
          />
        )}
        {activeTab === 'costs' && (
          <Costs
            job={job}
            onUpdate={handleUpdate}
          />
        )}
        {activeTab === 'output' && (
          <Output
            job={job}
          />
        )}
      </main>
    </div>
  );
}

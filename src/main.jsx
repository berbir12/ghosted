import React, { useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import './styles.css';

import { initialCompanies, sampleApplications } from './data/companies';
import { ReceiptRenderer } from './components/ReceiptRenderer';
import { Tracker } from './components/Tracker';
import { CompanyIndex } from './components/CompanyIndex';
import { LossAudit } from './components/LossAudit';
import { EmailGenerator } from './components/EmailGenerator';
import {
  ReceiptIcon,
  TrackerIcon,
  BuildingIcon,
  CalculatorIcon,
  MailIcon,
  DownloadIcon,
  ShareIcon,
  CopyIcon,
  CheckIcon,
  FlameIcon
} from './components/Icons';

const today = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date()).toUpperCase();
const transaction = Math.floor(100000 + Math.random() * 900000);
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

const outcomes = {
  ghosted: { label: 'Ghosted', stamp: 'GHOSTED', closing: 'ERR:404 — NOTHING FOUND' },
  rejected: { label: 'Rejected after final round', stamp: 'REJECTED', closing: 'FINAL ROUND — NO SALE' },
  closed: { label: 'Position suddenly closed', stamp: 'ROLE CLOSED', closing: 'POSITION NO LONGER AVAILABLE' },
  reposted: { label: 'Role reposted', stamp: 'REPOSTED', closing: 'SAME ROLE — BRAND NEW LISTING' },
  pending: { label: 'Still “circling back”', stamp: 'PENDING', closing: 'STATUS: STILL CIRCLING' },
};

const itemPresets = [
  'Take-home assignment',
  'Portfolio presentation',
  'Reference checks',
  'Rescheduled interview',
  'Follow-up emails',
  'Culture fit round'
];

function Stepper({ label, value, onChange, min = 0, max = 999 }) {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="stepper-field">
      <span className="field-label" id={`${id}-label`}>{label}</span>
      <div className="stepper" role="group" aria-labelledby={`${id}-label`}>
        <button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <output aria-live="polite">{value}</output>
        <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  );
}

function App() {
  // Navigation tab: 'receipt' | 'tracker' | 'companies' | 'audit' | 'email'
  const [activeTab, setActiveTab] = useState('receipt');

  // Application tracker persistence in localStorage
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem('ghosted_apps_v2');
      return saved ? JSON.parse(saved) : sampleApplications;
    } catch {
      return sampleApplications;
    }
  });

  // Companies directory persistence in localStorage
  const [companies, setCompanies] = useState(() => {
    try {
      const saved = localStorage.getItem('ghosted_companies_v2');
      return saved ? JSON.parse(saved) : initialCompanies;
    } catch {
      return initialCompanies;
    }
  });

  // Candidate default target salary
  const [defaultSalary, setDefaultSalary] = useState(() => {
    try {
      const saved = localStorage.getItem('ghosted_salary');
      return saved ? Number(saved) : 110000;
    } catch {
      return 110000;
    }
  });

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem('ghosted_apps_v2', JSON.stringify(applications));
    } catch (e) {
      console.error(e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem('ghosted_companies_v2', JSON.stringify(companies));
    } catch (e) {
      console.error(e);
    }
  }, [companies]);

  useEffect(() => {
    try {
      localStorage.setItem('ghosted_salary', String(defaultSalary));
    } catch (e) {
      console.error(e);
    }
  }, [defaultSalary]);

  // Receipt Lab Form State
  const [receiptTemplate, setReceiptTemplate] = useState('thermal'); // 'thermal' | 'invoice' | 'ticket'
  const [company, setCompany] = useState('Northstar Labs');
  const [role, setRole] = useState('Product Designer');
  const [rounds, setRounds] = useState(4);
  const [silence, setSilence] = useState(47);
  const [vent, setVent] = useState('Calendar invites were the only feedback I received.');
  const [outcome, setOutcome] = useState('ghosted');
  const [hours, setHours] = useState(18);
  const [salary, setSalary] = useState(110000);
  const [travel, setTravel] = useState(0);
  const [childcare, setChildcare] = useState(0);
  const [unpaid, setUnpaid] = useState(0);
  const [items, setItems] = useState([]);
  const [hideCompany, setHideCompany] = useState(false);
  const [hideRole, setHideRole] = useState(false);
  const [hideDate, setHideDate] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState('');
  const [emailPrefill, setEmailPrefill] = useState(null);
  const receiptRef = useRef(null);

  // Calculations for Single Receipt
  const directCosts = Number(travel || 0) + Number(childcare || 0) + Number(unpaid || 0) + items.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const estimatedCost = (Number(salary || 0) / 2080) * Number(hours || 0) + directCosts;
  const visibleCompany = hideCompany ? 'a company that values communication' : (company || 'this company');
  const caption = `${rounds} interview${rounds === 1 ? '' : 's'}, ${Number(hours || 0).toFixed(1)} hours, ${silence} days of silence, and ${money(estimatedCost)} in estimated time and costs. ${outcomes[outcome]?.label || 'Ghosted'} by ${visibleCompany}. Here’s the receipt.`;
  const altText = `A satirical receipt from The Hiring Process for ${hideCompany ? 'an unnamed company' : company || 'a company'}${hideRole ? '' : ` and the ${role || 'unnamed'} role`}. It lists ${rounds} interview rounds, ${silence} days of silence, ${Number(hours || 0).toFixed(1)} hours spent, and estimated loss of ${money(estimatedCost)}.`;

  const receiptData = {
    company,
    role,
    rounds,
    silence,
    vent,
    outcome,
    items,
    hours,
    estimatedCost,
    hideCompany,
    hideRole,
    hideDate,
    date: today,
    transaction
  };

  const addItem = () => {
    if (items.length >= 3) return;
    setItems([...items, { id: `item-${Date.now()}`, name: itemPresets[items.length] || 'Additional charge', cost: 0 }]);
  };

  const updateItem = (id, key, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const copyText = async (text, type) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    window.setTimeout(() => setCopied(''), 1600);
  };

  const printReceipt = () => {
    setPrinting(false);
    setHasPrinted(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setPrinting(true);
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#f43f5e', '#fbbf24', '#38bdf8']
          });
        } catch {
          // ignore if canvas-confetti is not loaded
        }
      });
    });
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        style: { margin: '0', transform: 'none' }
      });
      const link = document.createElement('a');
      link.download = `ghosted-${(company || 'receipt').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert('Could not export image directly. Please take a screenshot!');
    } finally {
      setDownloading(false);
    }
  };

  // Cross-component handlers
  const handleSelectAppForReceipt = (app) => {
    const now = new Date().getTime();
    const last = new Date(app.lastContactDate || app.appliedDate).getTime();
    const days = Math.floor(Math.max(0, now - last) / (1000 * 60 * 60 * 24));

    setCompany(app.company);
    setRole(app.role);
    setRounds(app.rounds || 1);
    setSilence(days);
    setVent(app.vent || app.notes || '');
    setHours(app.hours || 8);
    setSalary(app.salary || defaultSalary);
    setOutcome(app.status === 'ghosted' ? 'ghosted' : app.status === 'rejected' ? 'rejected' : 'pending');
    setActiveTab('receipt');
    printReceipt();
  };

  const handleSelectAppForEmail = (app) => {
    const now = new Date().getTime();
    const last = new Date(app.lastContactDate || app.appliedDate).getTime();
    const days = Math.floor(Math.max(0, now - last) / (1000 * 60 * 60 * 24));

    setEmailPrefill({
      company: app.company,
      role: app.role,
      rounds: app.rounds || 2,
      hours: app.hours || 8,
      daysSilent: days
    });
    setActiveTab('email');
  };

  const handleSelectCompanyForReceipt = (companyName) => {
    setCompany(companyName);
    setRole('Candidate');
    setRounds(3);
    setSilence(30);
    setOutcome('ghosted');
    setActiveTab('receipt');
    printReceipt();
  };

  return (
    <div className="app-root">
      {/* Universal Top Navigation Header */}
      <header className="global-navbar">
        <div className="nav-container">
          <div className="brand-logo-group" onClick={() => setActiveTab('receipt')}>
            <div className="brand-icon">👻</div>
            <div className="brand-text">
              <span className="brand-title">GHOSTED</span>
              <span className="brand-subtitle">THE HIRING RECEIPT PROTOCOL</span>
            </div>
          </div>

          <nav className="nav-tabs">
            <button
              className={`nav-tab-btn ${activeTab === 'receipt' ? 'active' : ''}`}
              onClick={() => setActiveTab('receipt')}
            >
              <ReceiptIcon size={16} />
              <span>Receipt Lab</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
              onClick={() => setActiveTab('tracker')}
            >
              <TrackerIcon size={16} />
              <span>Job Tracker</span>
              <span className="nav-counter">{applications.length}</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'companies' ? 'active' : ''}`}
              onClick={() => setActiveTab('companies')}
            >
              <BuildingIcon size={16} />
              <span>Ghosting Index</span>
              <span className="nav-badge-live">LIVE</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <CalculatorIcon size={16} />
              <span>Labor & Loss Audit</span>
            </button>

            <button
              className={`nav-tab-btn ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              <MailIcon size={16} />
              <span>Follow-Up & Closure</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Tab Views */}
      <main className="main-content-viewport">
        {/* TAB 1: RECEIPT LAB */}
        {activeTab === 'receipt' && (
          <div className="app-shell">
            <section className="form-panel">
              <div className="eyebrow">
                <span className="status-dot" /> NOW SERVING: THE OVERQUALIFIED
              </div>
              <h1>
                Turn ghosting into<br />
                <em>proof of purchase.</em>
              </h1>
              <p className="lede">
                Itemize the hiring process. Print the receipt.<br />
                Let the public record show what candidate time actually cost.
              </p>

              {/* Template Switcher */}
              <div className="template-style-picker">
                <span className="field-label">RECEIPT TEMPLATE:</span>
                <div className="picker-buttons">
                  <button
                    type="button"
                    className={receiptTemplate === 'thermal' ? 'active' : ''}
                    onClick={() => setReceiptTemplate('thermal')}
                  >
                    🧾 Crinkled Thermal
                  </button>
                  <button
                    type="button"
                    className={receiptTemplate === 'invoice' ? 'active' : ''}
                    onClick={() => setReceiptTemplate('invoice')}
                  >
                    📑 Consulting Invoice
                  </button>
                  <button
                    type="button"
                    className={receiptTemplate === 'ticket' ? 'active' : ''}
                    onClick={() => setReceiptTemplate('ticket')}
                  >
                    ✈️ Boarding Pass
                  </button>
                </div>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  printReceipt();
                }}
              >
                <div className="field-grid">
                  <label>
                    <span className="field-label">Company you applied to</span>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      maxLength="38"
                      placeholder="e.g. Acme Corp"
                    />
                  </label>
                  <label>
                    <span className="field-label">Role</span>
                    <input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      maxLength="38"
                      placeholder="e.g. Senior Designer"
                    />
                  </label>
                </div>

                <label>
                  <span className="field-label">What happened?</span>
                  <select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
                    {Object.entries(outcomes).map(([value, item]) => (
                      <option value={value} key={value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="stepper-row">
                  <Stepper label="Interview rounds" value={rounds} onChange={setRounds} max={20} />
                  <Stepper label="Days of silence" value={silence} onChange={setSilence} max={365} />
                </div>

                <label>
                  <span className="field-label">
                    Your one-line vent <small>OPTIONAL</small>
                  </span>
                  <input
                    value={vent}
                    onChange={(e) => setVent(e.target.value)}
                    maxLength="74"
                    placeholder="Keep it brief. Keep it billable."
                  />
                  <span className="character-count">{vent.length} / 74</span>
                </label>

                <details className="receipt-options">
                  <summary>
                    ADD REAL COSTS + HOURLY VALUE <span>OPTIONAL</span>
                  </summary>
                  <div className="details-body">
                    <div className="cost-grid">
                      <label>
                        <span className="field-label">Hours spent</span>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={hours}
                          onChange={(e) => setHours(e.target.value)}
                        />
                      </label>
                      <label>
                        <span className="field-label">Annual salary estimate</span>
                        <span className="money-input">
                          <i>$</i>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                          />
                        </span>
                      </label>
                      <label>
                        <span className="field-label">Travel</span>
                        <span className="money-input">
                          <i>$</i>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={travel}
                            onChange={(e) => setTravel(e.target.value)}
                          />
                        </span>
                      </label>
                      <label>
                        <span className="field-label">Childcare</span>
                        <span className="money-input">
                          <i>$</i>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={childcare}
                            onChange={(e) => setChildcare(e.target.value)}
                          />
                        </span>
                      </label>
                      <label>
                        <span className="field-label">Unpaid work</span>
                        <span className="money-input">
                          <i>$</i>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={unpaid}
                            onChange={(e) => setUnpaid(e.target.value)}
                          />
                        </span>
                      </label>
                    </div>

                    <div className="custom-items">
                      <div className="option-heading">
                        <span>CUSTOM CHARGES & TAKE-HOMES</span>
                        <span>{items.length}/3</span>
                      </div>
                      {items.map((item) => (
                        <div className="custom-item" key={item.id}>
                          <select
                            aria-label="Line item"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          >
                            {itemPresets.map((preset) => (
                              <option key={preset}>{preset}</option>
                            ))}
                          </select>
                          <span className="money-input">
                            <i>$</i>
                            <input
                              aria-label={`${item.name} cost`}
                              type="number"
                              min="0"
                              value={item.cost}
                              onChange={(e) => updateItem(item.id, 'cost', e.target.value)}
                            />
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => setItems(items.filter(({ id }) => id !== item.id))}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        className="add-item"
                        type="button"
                        onClick={addItem}
                        disabled={items.length >= 3}
                      >
                        + ADD A CUSTOM CHARGE
                      </button>
                    </div>

                    <fieldset className="privacy-controls">
                      <legend>PRIVACY ON EXPORT</legend>
                      {[
                        [hideCompany, setHideCompany, 'Hide company'],
                        [hideRole, setHideRole, 'Hide role'],
                        [hideDate, setHideDate, 'Hide date']
                      ].map(([checked, setter, label]) => (
                        <label key={label}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setter(e.target.checked)}
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </fieldset>
                    <p className="estimate-note">
                      Estimate = salary ÷ 2,080 work hours × time spent, plus direct uncompensated expenses.
                    </p>
                  </div>
                </details>

                <button className="print-button" type="submit">
                  <span>PRINT MY RECEIPT</span>
                  <span aria-hidden="true">→</span>
                </button>
              </form>
              <p className="privacy">NO SIGN-UP · 100% PRIVATE LOCAL STORAGE · JUST RECEIPTS</p>
            </section>

            <section className="preview-panel">
              <div className="preview-heading">
                <span>LIVE PREVIEW</span>
                <span>{receiptTemplate.toUpperCase()} · STYLED</span>
              </div>

              <ReceiptRenderer
                data={receiptData}
                receiptRef={receiptRef}
                printing={printing}
                template={receiptTemplate}
              />

              <button
                className="download-button"
                type="button"
                onClick={downloadReceipt}
                disabled={downloading}
              >
                <DownloadIcon size={18} />
                {downloading ? 'PREPARING PNG…' : 'DOWNLOAD HIGH-RES PNG'}
              </button>
              <p className="export-note">HIGH RESOLUTION · READY FOR THE TIMELINE & LINKEDIN</p>

              {hasPrinted && (
                <section className="share-panel" aria-label="Share your receipt">
                  <div className="option-heading">
                    <span>POST THE RECEIPT</span>
                    <span>READY</span>
                  </div>
                  <label>
                    <span className="field-label">Caption</span>
                    <textarea readOnly value={caption} />
                  </label>
                  <div className="share-actions">
                    <button type="button" onClick={() => copyText(caption, 'caption')}>
                      {copied === 'caption' ? 'COPIED' : 'COPY CAPTION'}
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      SHARE ON X ↗
                    </a>
                  </div>
                  <label>
                    <span className="field-label">Image alt text</span>
                    <textarea readOnly value={altText} />
                  </label>
                  <button
                    className="copy-alt"
                    type="button"
                    onClick={() => copyText(altText, 'alt')}
                  >
                    {copied === 'alt' ? 'ALT TEXT COPIED' : 'COPY ALT TEXT'}
                  </button>
                </section>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: PRIVATE JOB TRACKER */}
        {activeTab === 'tracker' && (
          <Tracker
            applications={applications}
            setApplications={setApplications}
            onSelectForReceipt={handleSelectAppForReceipt}
            onSelectForEmail={handleSelectAppForEmail}
          />
        )}

        {/* TAB 3: GHOSTING INDEX & WALL OF SHAME */}
        {activeTab === 'companies' && (
          <CompanyIndex
            companies={companies}
            setCompanies={setCompanies}
            onSelectCompanyForReceipt={handleSelectCompanyForReceipt}
          />
        )}

        {/* TAB 4: LABOR & LOSS AUDIT */}
        {activeTab === 'audit' && (
          <LossAudit
            applications={applications}
            defaultSalary={defaultSalary}
            setDefaultSalary={setDefaultSalary}
          />
        )}

        {/* TAB 5: FOLLOW-UP & CLOSURE ENGINE */}
        {activeTab === 'email' && (
          <EmailGenerator applications={applications} prefillData={emailPrefill} />
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

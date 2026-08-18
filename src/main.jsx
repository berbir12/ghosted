import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { toPng } from 'html-to-image';
import './styles.css';

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

const itemPresets = ['Take-home assignment', 'Portfolio presentation', 'Reference checks', 'Rescheduled interview', 'Follow-up emails', 'Culture fit round'];

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

function Receipt({ data, receiptRef, printing }) {
  const { company, role, rounds, silence, vent, outcome, items, hours, estimatedCost, hideCompany, hideRole, hideDate } = data;
  const outcomeData = outcomes[outcome];
  const shownCompany = hideCompany ? 'A COMPANY THAT VALUES COMMUNICATION' : (company || 'COMPANY NAME');
  const shownRole = hideRole ? 'ROLE WITHHELD' : (role || 'ROLE');

  return (
    <div className="printer-stage">
      <div className="printer" aria-hidden="true"><div className="printer-top" /><div className="printer-slot" /></div>
      <div className={`receipt-mask ${printing ? 'is-printing' : ''}`}>
        <article className="receipt" ref={receiptRef} aria-label="Hiring process receipt preview">
          <svg className="receipt-filters" aria-hidden="true"><filter id="roughen"><feTurbulence baseFrequency="0.035" numOctaves="3" seed="8" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" /></filter></svg>
          <header className="receipt-header">
            <div className="store-name">THE HIRING PROCESS™</div>
            <div className="subtitle">PURVEYORS OF OPPORTUNITY</div>
            <div className="receipt-rule dotted" />
            <div className="company-role">{shownCompany}, {shownRole}</div>
            <div className="meta"><span>{hideDate ? 'DATE WITHHELD' : today}</span><span>TXN #{transaction}</span></div>
          </header>

          <div className="receipt-rule" />
          <ol className="line-items">
            <li><span>1x&nbsp; Application submitted</span><span>$0.00</span></li>
            <li><span>{rounds}x&nbsp; Interview round{rounds === 1 ? '' : 's'}</span><span>$0.00</span></li>
            <li><span>1x&nbsp; “We'll be in touch!”</span><span>$0.00</span></li>
            <li><span>{silence}x&nbsp; Days of total silence</span><span>$0.00</span></li>
            {items.map((item) => <li key={item.id}><span>1x&nbsp; {item.name || 'Additional charge'}</span><span>{money(item.cost)}</span></li>)}
          </ol>
          <div className="receipt-rule" />

          <div className="receipt-totals">
            <div><span>TOTAL TIME SPENT:</span><strong>{Number(hours || 0).toFixed(1)} HRS</strong></div>
            <div><span>ESTIMATED COST:</span><strong>{money(estimatedCost)}</strong></div>
            <div className="total"><span>REPLIES RECEIVED:</span><strong>0</strong></div>
          </div>
          {vent && <blockquote>“{vent}”</blockquote>}

          <div className={`stamp-wrap stamp-${outcomeData.stamp.length}`} aria-hidden="true"><div className="stamp">{outcomeData.stamp}</div></div>
          <div className="follow-up-audit" aria-label="Follow-up audit">
            <div><span>FOLLOW-UP EMAILS SENT</span><strong>3</strong></div>
            <div><span>ANSWERS RECEIVED</span><strong>0</strong></div>
          </div>

          <footer>
            <div className="barcode" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
            <div className="scan">SCAN FOR REPLY</div>
            <div className="error">{outcomeData.closing}</div>
            <p>thanks for your time! we value<br />your candidacy.</p>
          </footer>
          <div className="tear" aria-hidden="true" />
        </article>
      </div>
    </div>
  );
}

function App() {
  const [company, setCompany] = useState('Northstar Labs');
  const [role, setRole] = useState('Product Designer');
  const [rounds, setRounds] = useState(4);
  const [silence, setSilence] = useState(47);
  const [vent, setVent] = useState('Calendar invites were the only feedback I received.');
  const [outcome, setOutcome] = useState('ghosted');
  const [hours, setHours] = useState(18);
  const [salary, setSalary] = useState(65000);
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
  const receiptRef = useRef(null);

  const directCosts = Number(travel || 0) + Number(childcare || 0) + Number(unpaid || 0) + items.reduce((sum, item) => sum + Number(item.cost || 0), 0);
  const estimatedCost = (Number(salary || 0) / 2080) * Number(hours || 0) + directCosts;
  const visibleCompany = hideCompany ? 'a company that values communication' : (company || 'this company');
  const caption = `${rounds} interview${rounds === 1 ? '' : 's'}, ${Number(hours || 0).toFixed(1)} hours, ${silence} days of silence, and ${money(estimatedCost)} in estimated time and costs. ${outcomes[outcome].label} by ${visibleCompany}. Here’s the receipt.`;
  const altText = `A satirical thermal receipt from The Hiring Process for ${hideCompany ? 'an unnamed company' : company || 'a company'}${hideRole ? '' : ` and the ${role || 'unnamed'} role`}. It lists ${rounds} interview rounds, ${silence} days of silence, ${Number(hours || 0).toFixed(1)} hours spent, an estimated cost of ${money(estimatedCost)}, and zero replies. A distressed red ${outcomes[outcome].stamp} stamp crosses the receipt.`;
  const receiptData = { company, role, rounds, silence, vent, outcome, items, hours, estimatedCost, hideCompany, hideRole, hideDate };

  const addItem = () => {
    if (items.length >= 3) return;
    setItems([...items, { id: crypto.randomUUID(), name: itemPresets[items.length] || 'Additional charge', cost: 0 }]);
  };
  const updateItem = (id, key, value) => setItems(items.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const copyText = async (text, type) => { await navigator.clipboard.writeText(text); setCopied(type); window.setTimeout(() => setCopied(''), 1600); };
  const printReceipt = () => { setPrinting(false); setHasPrinted(true); window.requestAnimationFrame(() => window.requestAnimationFrame(() => setPrinting(true))); };
  const downloadReceipt = async () => {
    if (!receiptRef.current || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, { width: 540, height: 800, pixelRatio: 2, cacheBust: true, style: { margin: '0', transform: 'none' } });
      const link = document.createElement('a');
      link.download = `ghosted-${(company || 'receipt').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } finally { setDownloading(false); }
  };

  return (
    <main className="app-shell">
      <section className="form-panel">
        <div className="eyebrow"><span className="status-dot" /> NOW SERVING: THE OVERQUALIFIED</div>
        <h1>Turn ghosting into<br /><em>proof of purchase.</em></h1>
        <p className="lede">Itemize the hiring process. Print the receipt.<br /> Let the record show what it actually cost.</p>

        <form onSubmit={(event) => { event.preventDefault(); printReceipt(); }}>
          <div className="field-grid">
            <label><span className="field-label">Company you applied to</span><input value={company} onChange={(e) => setCompany(e.target.value)} maxLength="38" placeholder="e.g. Acme Corp" /></label>
            <label><span className="field-label">Role</span><input value={role} onChange={(e) => setRole(e.target.value)} maxLength="38" placeholder="e.g. Senior Designer" /></label>
          </div>
          <label><span className="field-label">What happened?</span><select value={outcome} onChange={(e) => setOutcome(e.target.value)}>{Object.entries(outcomes).map(([value, item]) => <option value={value} key={value}>{item.label}</option>)}</select></label>
          <div className="stepper-row"><Stepper label="Interview rounds" value={rounds} onChange={setRounds} max={20} /><Stepper label="Days of silence" value={silence} onChange={setSilence} max={365} /></div>
          <label><span className="field-label">Your one-line vent <small>OPTIONAL</small></span><input value={vent} onChange={(e) => setVent(e.target.value)} maxLength="74" placeholder="Keep it brief. Keep it billable." /><span className="character-count">{vent.length} / 74</span></label>

          <details className="receipt-options">
            <summary>ADD REAL COSTS + RECEIPT DETAILS <span>OPTIONAL</span></summary>
            <div className="details-body">
              <div className="cost-grid">
                <label><span className="field-label">Hours spent</span><input type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} /></label>
                <label><span className="field-label">Annual salary estimate</span><span className="money-input"><i>$</i><input type="number" min="0" step="1000" value={salary} onChange={(e) => setSalary(e.target.value)} /></span></label>
                <label><span className="field-label">Travel</span><span className="money-input"><i>$</i><input type="number" min="0" step="1" value={travel} onChange={(e) => setTravel(e.target.value)} /></span></label>
                <label><span className="field-label">Childcare</span><span className="money-input"><i>$</i><input type="number" min="0" step="1" value={childcare} onChange={(e) => setChildcare(e.target.value)} /></span></label>
                <label><span className="field-label">Unpaid work</span><span className="money-input"><i>$</i><input type="number" min="0" step="1" value={unpaid} onChange={(e) => setUnpaid(e.target.value)} /></span></label>
              </div>
              <div className="custom-items">
                <div className="option-heading"><span>CUSTOM LINE ITEMS</span><span>{items.length}/3</span></div>
                {items.map((item) => <div className="custom-item" key={item.id}><select aria-label="Line item" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)}>{itemPresets.map((preset) => <option key={preset}>{preset}</option>)}</select><span className="money-input"><i>$</i><input aria-label={`${item.name} cost`} type="number" min="0" value={item.cost} onChange={(e) => updateItem(item.id, 'cost', e.target.value)} /></span><button type="button" aria-label={`Remove ${item.name}`} onClick={() => setItems(items.filter(({ id }) => id !== item.id))}>×</button></div>)}
                <button className="add-item" type="button" onClick={addItem} disabled={items.length >= 3}>+ ADD A CHARGE</button>
              </div>
              <fieldset className="privacy-controls"><legend>PRIVACY ON EXPORT</legend>{[[hideCompany,setHideCompany,'Hide company'],[hideRole,setHideRole,'Hide role'],[hideDate,setHideDate,'Hide date']].map(([checked,setter,label]) => <label key={label}><input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} /><span>{label}</span></label>)}</fieldset>
              <p className="estimate-note">Estimate = salary ÷ 2,080 work hours × time spent, plus direct costs.</p>
            </div>
          </details>

          <button className="print-button" type="submit"><span>PRINT MY RECEIPT</span><span aria-hidden="true">→</span></button>
        </form>
        <p className="privacy">NO SIGN-UP · NO DATA STORED · JUST RECEIPTS</p>
      </section>

      <section className="preview-panel">
        <div className="preview-heading"><span>LIVE RECEIPT</span><span>THERMAL PREVIEW · 01</span></div>
        <Receipt data={receiptData} receiptRef={receiptRef} printing={printing} />
        <button className="download-button" type="button" onClick={downloadReceipt} disabled={downloading}><span aria-hidden="true">↓</span> {downloading ? 'PREPARING PNG…' : 'DOWNLOAD PNG'}</button>
        <p className="export-note">1080 × 1600 PX · READY FOR THE TIMELINE</p>

        {hasPrinted && <section className="share-panel" aria-label="Share your receipt">
          <div className="option-heading"><span>POST THE RECEIPT</span><span>READY</span></div>
          <label><span className="field-label">Caption</span><textarea readOnly value={caption} /></label>
          <div className="share-actions"><button type="button" onClick={() => copyText(caption, 'caption')}>{copied === 'caption' ? 'COPIED' : 'COPY CAPTION'}</button><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`} target="_blank" rel="noreferrer">SHARE ON X ↗</a></div>
          <label><span className="field-label">Image alt text</span><textarea readOnly value={altText} /></label>
          <button className="copy-alt" type="button" onClick={() => copyText(altText, 'alt')}>{copied === 'alt' ? 'ALT TEXT COPIED' : 'COPY ALT TEXT'}</button>
        </section>}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

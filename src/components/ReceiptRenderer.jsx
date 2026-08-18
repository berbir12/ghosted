import React from 'react';

const outcomes = {
  ghosted: { label: 'Ghosted', stamp: 'GHOSTED', closing: 'ERR:404 — NOTHING FOUND', color: '#ff3344' },
  rejected: { label: 'Rejected after final round', stamp: 'REJECTED', closing: 'FINAL ROUND — NO SALE', color: '#ff6633' },
  closed: { label: 'Position suddenly closed', stamp: 'ROLE CLOSED', closing: 'POSITION NO LONGER AVAILABLE', color: '#ffaa00' },
  reposted: { label: 'Role reposted', stamp: 'REPOSTED', closing: 'SAME ROLE — BRAND NEW LISTING', color: '#e60067' },
  pending: { label: 'Still “circling back”', stamp: 'PENDING', closing: 'STATUS: STILL CIRCLING', color: '#3b82f6' },
};

const money = (value) => `$${Number(value || 0).toFixed(2)}`;

export function ReceiptRenderer({ data, receiptRef, printing, template = 'thermal' }) {
  const {
    company = 'Northstar Labs',
    role = 'Product Designer',
    rounds = 4,
    silence = 47,
    vent = '',
    outcome = 'ghosted',
    items = [],
    hours = 18,
    estimatedCost = 562.5,
    hideCompany = false,
    hideRole = false,
    hideDate = false,
    date = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date()).toUpperCase(),
    transaction = 492019
  } = data;

  const outcomeData = outcomes[outcome] || outcomes.ghosted;
  const shownCompany = hideCompany ? 'A COMPANY THAT VALUES COMMUNICATION' : (company || 'COMPANY NAME');
  const shownRole = hideRole ? 'ROLE WITHHELD' : (role || 'ROLE');
  const shownDate = hideDate ? 'DATE WITHHELD' : date;

  if (template === 'invoice') {
    return (
      <div className="printer-stage">
        <div className={`receipt-mask ${printing ? 'is-printing' : ''}`}>
          <article className="receipt invoice-style" ref={receiptRef} aria-label="Candidate labor invoice preview">
            <header className="invoice-header">
              <div className="invoice-brand">
                <div className="invoice-title">CANDIDATE CONSULTING INVOICE</div>
                <div className="invoice-tagline">STATEMENT FOR UNCOMPENSATED HIRING LABOR</div>
              </div>
              <div className="invoice-meta-grid">
                <div><span>INVOICE NO:</span> <strong>INV-{transaction}</strong></div>
                <div><span>ISSUE DATE:</span> <strong>{shownDate}</strong></div>
                <div><span>PAYMENT TERMS:</span> <strong className="danger-text">DUE UPON SILENCE</strong></div>
                <div><span>STATUS:</span> <strong className="status-pill">{outcomeData.stamp}</strong></div>
              </div>
            </header>

            <div className="invoice-billto">
              <span className="billto-label">BILL TO (RECIPIENT):</span>
              <div className="billto-name">{shownCompany}</div>
              <div className="billto-sub">Attn: Talent Acquisition & Hiring Committee</div>
              <div className="billto-role">Re: Position for {shownRole}</div>
            </div>

            <table className="invoice-table">
              <thead>
                <tr>
                  <th>DESCRIPTION OF SERVICES RENDERED</th>
                  <th>QTY / HRS</th>
                  <th>RATE</th>
                  <th className="text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Custom Resume Tailoring & Application Submission</td>
                  <td>1.0</td>
                  <td>$0.00</td>
                  <td className="text-right">$0.00</td>
                </tr>
                <tr>
                  <td>Multi-Stage Interview & Presentation Panels ({rounds} rounds)</td>
                  <td>{rounds} stages</td>
                  <td>$0.00</td>
                  <td className="text-right">$0.00</td>
                </tr>
                <tr>
                  <td>Candidate Time Dedicated to Pipeline Evaluation</td>
                  <td>{Number(hours || 0).toFixed(1)} hrs</td>
                  <td>Pro-rated</td>
                  <td className="text-right">{money(estimatedCost - (items.reduce((s, i) => s + Number(i.cost || 0), 0)))}</td>
                </tr>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name || 'Additional candidate charge'}</td>
                    <td>1 unit</td>
                    <td>{money(item.cost)}</td>
                    <td className="text-right">{money(item.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-summary-box">
              <div className="invoice-notes">
                <strong>MEMO / CANDIDATE OBSERVATION:</strong>
                <p>“{vent || 'Candidate spent substantial uncompensated time with zero constructive resolution.'}”</p>
                <div className="silence-warning">
                  ⚠️ Days since last meaningful communication: <strong>{silence} days</strong>
                </div>
              </div>
              <div className="invoice-totals-list">
                <div><span>Total Labor Hours:</span> <strong>{Number(hours || 0).toFixed(1)} HRS</strong></div>
                <div><span>Replies Provided:</span> <strong>0</strong></div>
                <div className="invoice-grand-total">
                  <span>TOTAL ESTIMATED LOSS:</span>
                  <strong>{money(estimatedCost)}</strong>
                </div>
              </div>
            </div>

            <div className={`stamp-wrap stamp-${outcomeData.stamp.length}`} aria-hidden="true">
              <div className="stamp">{outcomeData.stamp}</div>
            </div>

            <footer className="invoice-footer">
              <p>REMITTANCE ADDRESS: /DEV/NULL · PLEASE REMIT AT LEAST A COURTESY AUTOMATED REJECTION</p>
              <div className="invoice-hash">TXN_VERIFICATION_HASH: #{transaction}-GHOST-PROTOCOL-V2</div>
            </footer>
          </article>
        </div>
      </div>
    );
  }

  if (template === 'ticket') {
    return (
      <div className="printer-stage">
        <div className={`receipt-mask ${printing ? 'is-printing' : ''}`}>
          <article className="receipt ticket-style" ref={receiptRef} aria-label="Hiring boarding pass preview">
            <div className="ticket-top">
              <div className="ticket-header-logo">
                <span className="ticket-airline">GHOST AIRWAYS</span>
                <span className="ticket-type">NON-STOP TO NOWHERE</span>
              </div>
              <div className="ticket-pass-type">ONE-WAY CANDIDATE PASS</div>
            </div>

            <div className="ticket-body">
              <div className="ticket-main-flight">
                <div className="flight-route">
                  <div className="route-city">
                    <span className="city-code">APP</span>
                    <span className="city-name">APPLIED</span>
                  </div>
                  <div className="route-arrow">
                    <span>✈️ {rounds} ROUNDS</span>
                    <div className="route-line"></div>
                  </div>
                  <div className="route-city">
                    <span className="city-code">GHO</span>
                    <span className="city-name">RADIO SILENCE</span>
                  </div>
                </div>

                <div className="ticket-fields-grid">
                  <div><span>PASSENGER</span><strong>THE CANDIDATE</strong></div>
                  <div><span>DESTINATION EMPLOYER</span><strong>{shownCompany}</strong></div>
                  <div><span>TARGET ROLE</span><strong>{shownRole}</strong></div>
                  <div><span>DATE BOARDED</span><strong>{shownDate}</strong></div>
                  <div><span>GATE DEPARTURE</span><strong>SILENCE ({silence} DAYS)</strong></div>
                  <div><span>COST OF TICKET</span><strong>{money(estimatedCost)}</strong></div>
                </div>

                {vent && (
                  <div className="ticket-remark">
                    <span>IN-FLIGHT COMPLAINT:</span>
                    <blockquote>“{vent}”</blockquote>
                  </div>
                )}
              </div>

              <div className="ticket-stub-section">
                <div className="stub-notch top"></div>
                <div className="stub-notch bottom"></div>
                <div className="stub-content">
                  <div className="stub-title">GHOST AIR</div>
                  <div className="stub-item"><span>EMPLOYER:</span> <strong>{shownCompany.slice(0, 18)}</strong></div>
                  <div className="stub-item"><span>STATUS:</span> <strong className="danger-text">{outcomeData.stamp}</strong></div>
                  <div className="stub-item"><span>SEAT:</span> <strong>LIMBO 01</strong></div>
                  <div className="barcode-stub" aria-hidden="true">
                    {Array.from({ length: 10 }, (_, index) => <i key={index} />)}
                  </div>
                </div>
              </div>
            </div>

            <div className={`stamp-wrap stamp-${outcomeData.stamp.length}`} aria-hidden="true">
              <div className="stamp">{outcomeData.stamp}</div>
            </div>

            <footer className="ticket-footer">
              <div>BAGGAGE CLAIM: UNPAID TAKE-HOMES · NO REFUNDS · NO REPLIES</div>
            </footer>
          </article>
        </div>
      </div>
    );
  }

  // Default: Classic Thermal Receipt
  return (
    <div className="printer-stage">
      <div className="printer" aria-hidden="true">
        <div className="printer-top" />
        <div className="printer-slot" />
      </div>
      <div className={`receipt-mask ${printing ? 'is-printing' : ''}`}>
        <article className="receipt" ref={receiptRef} aria-label="Hiring process receipt preview">
          <svg className="receipt-filters" aria-hidden="true">
            <filter id="roughen">
              <feTurbulence baseFrequency="0.035" numOctaves="3" seed="8" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.6" />
            </filter>
          </svg>
          <header className="receipt-header">
            <div className="store-name">THE HIRING PROCESS™</div>
            <div className="subtitle">PURVEYORS OF OPPORTUNITY</div>
            <div className="receipt-rule dotted" />
            <div className="company-role">{shownCompany}, {shownRole}</div>
            <div className="meta">
              <span>{shownDate}</span>
              <span>TXN #{transaction}</span>
            </div>
          </header>

          <div className="receipt-rule" />
          <ol className="line-items">
            <li><span>1x&nbsp; Application submitted</span><span>$0.00</span></li>
            <li><span>{rounds}x&nbsp; Interview round{rounds === 1 ? '' : 's'}</span><span>$0.00</span></li>
            <li><span>1x&nbsp; “We'll be in touch!”</span><span>$0.00</span></li>
            <li><span>{silence}x&nbsp; Days of total silence</span><span>$0.00</span></li>
            {items.map((item) => (
              <li key={item.id}>
                <span>1x&nbsp; {item.name || 'Additional charge'}</span>
                <span>{money(item.cost)}</span>
              </li>
            ))}
          </ol>
          <div className="receipt-rule" />

          <div className="receipt-totals">
            <div><span>TOTAL TIME SPENT:</span><strong>{Number(hours || 0).toFixed(1)} HRS</strong></div>
            <div><span>ESTIMATED COST:</span><strong>{money(estimatedCost)}</strong></div>
            <div className="total"><span>REPLIES RECEIVED:</span><strong>0</strong></div>
          </div>
          {vent && <blockquote>“{vent}”</blockquote>}

          <div className={`stamp-wrap stamp-${outcomeData.stamp.length}`} aria-hidden="true">
            <div className="stamp">{outcomeData.stamp}</div>
          </div>
          <div className="follow-up-audit" aria-label="Follow-up audit">
            <div><span>FOLLOW-UP EMAILS SENT</span><strong>3</strong></div>
            <div><span>ANSWERS RECEIVED</span><strong>0</strong></div>
          </div>

          <footer>
            <div className="barcode" aria-hidden="true">
              {Array.from({ length: 14 }, (_, index) => <i key={index} />)}
            </div>
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

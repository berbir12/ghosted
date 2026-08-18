import React, { useState } from 'react';
import {
  CalculatorIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
  ShareIcon,
  FlameIcon,
  ClockIcon
} from './Icons';

const money = (val) => `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function LossAudit({ applications, defaultSalary, setDefaultSalary }) {
  const [copied, setCopied] = useState(false);

  // Compute aggregate stats
  const totalApps = applications.length;
  const ghostedApps = applications.filter((a) => a.status === 'ghosted');
  const rejectedApps = applications.filter((a) => a.status === 'rejected');
  const activeApps = applications.filter((a) => ['applied', 'screening', 'interviewing'].includes(a.status));
  const offerApps = applications.filter((a) => a.status === 'offer');

  const ghostRate = totalApps > 0 ? Math.round((ghostedApps.length / totalApps) * 100) : 0;
  const totalHours = applications.reduce((sum, a) => sum + Number(a.hours || 0), 0);
  const totalRounds = applications.reduce((sum, a) => sum + Number(a.rounds || 0), 0);

  // Cumulative money lost
  const hourlyRate = (Number(defaultSalary || 100000) / 2080);
  const laborValueLost = totalHours * hourlyRate;

  const directCosts = applications.reduce((sum, a) => {
    const travel = Number(a.travelCost || 0);
    const childcare = Number(a.childcareCost || 0);
    const custom = (a.customItems || []).reduce((s, i) => s + Number(i.cost || 0), 0);
    return sum + travel + childcare + custom;
  }, 0);

  const grandTotalLoss = laborValueLost + directCosts;

  // Max silence streak
  const now = new Date().getTime();
  const maxDaysSilent = applications.reduce((max, a) => {
    const last = new Date(a.lastContactDate || a.appliedDate || new Date()).getTime();
    const diff = Math.floor(Math.max(0, now - last) / (1000 * 60 * 60 * 24));
    return Math.max(max, diff);
  }, 0);

  const shareText = `📊 My Hiring Process Audit:
• ${totalApps} Applications Submitted
• ${totalHours.toFixed(1)} Unpaid Hours Spent
• ${ghostRate}% Ghosting Rate (${ghostedApps.length} companies vanished)
• Estimated Uncompensated Labor: ${money(grandTotalLoss)}
• Longest Ghost Silence: ${maxDaysSilent} days

Itemize your hiring loss: https://ghosted-receipt.vercel.app`;

  const handleCopySummary = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="loss-audit-container">
      {/* Hero Header */}
      <div className="audit-header">
        <div className="audit-badge">
          <CalculatorIcon size={16} />
          <span>CUMULATIVE HIRING EXPENSE STATEMENT</span>
        </div>
        <h2>The Cost of Being a Candidate</h2>
        <p className="audit-sub">
          Your time has an invoice price. Here is what companies have extracted in uncompensated interviews, take-homes, and pipeline waiting time.
        </p>
      </div>

      {/* Primary Highlight Cards */}
      <div className="audit-metrics-grid">
        <div className="audit-metric-card highlight-danger">
          <span className="card-label">TOTAL UNCOMPENSATED LOSS</span>
          <div className="metric-large">{money(grandTotalLoss)}</div>
          <span className="metric-subtext">Based on your target hourly rate (${hourlyRate.toFixed(2)}/hr)</span>
        </div>

        <div className="audit-metric-card">
          <span className="card-label">TOTAL HOURS INVESTED</span>
          <div className="metric-large">{totalHours.toFixed(1)} <small>HRS</small></div>
          <span className="metric-subtext">Across {totalRounds} interview stages & take-homes</span>
        </div>

        <div className="audit-metric-card">
          <span className="card-label">PERSONAL GHOST RATE</span>
          <div className="metric-large">{ghostRate}%</div>
          <span className="metric-subtext">{ghostedApps.length} out of {totalApps} companies vanished</span>
        </div>

        <div className="audit-metric-card">
          <span className="card-label">LONGEST SILENCE STREAK</span>
          <div className="metric-large">{maxDaysSilent} <small>DAYS</small></div>
          <span className="metric-subtext">Peak wait without a single human update</span>
        </div>
      </div>

      {/* Salary Slider & Calculator Controls */}
      <div className="audit-rate-adjuster">
        <div className="rate-adjuster-header">
          <div>
            <h4>Adjust Your Compensation Baseline</h4>
            <p>Modify your target annual salary to dynamically update your hourly consulting valuation.</p>
          </div>
          <div className="current-rate-tag">
            <span>Target: ${Number(defaultSalary).toLocaleString()}/yr</span>
            <strong>(${hourlyRate.toFixed(2)}/hr)</strong>
          </div>
        </div>

        <input
          type="range"
          min="40000"
          max="350000"
          step="5000"
          value={defaultSalary}
          onChange={(e) => setDefaultSalary(Number(e.target.value))}
          className="salary-range-slider"
        />

        <div className="slider-ticks">
          <span>$40k ($19/hr)</span>
          <span>$120k ($58/hr)</span>
          <span>$200k ($96/hr)</span>
          <span>$350k ($168/hr)</span>
        </div>
      </div>

      {/* Breakdown Table & Statement Card */}
      <div className="audit-statement-card">
        <div className="statement-top">
          <div>
            <h3>ANNUAL CANDIDATE W-2 / LABOR AUDIT</h3>
            <span className="statement-meta">STATEMENT PERIOD: CURRENT JOB SEARCH CYCLE</span>
          </div>
          <div className="statement-actions">
            <button className="btn-secondary" onClick={handleCopySummary}>
              {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              {copied ? 'Copied Summary' : 'Copy Audit Summary'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <ShareIcon size={16} /> Post Audit to X
            </a>
          </div>
        </div>

        <table className="audit-breakdown-table">
          <thead>
            <tr>
              <th>APPLICATION / COMPANY</th>
              <th>STATUS</th>
              <th>ROUNDS</th>
              <th>HOURS</th>
              <th>DAYS OF SILENCE</th>
              <th className="text-right">LABOR VALUE</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const appLoss = (Number(app.hours || 0) * hourlyRate) +
                ((app.customItems || []).reduce((s, i) => s + Number(i.cost || 0), 0)) +
                Number(app.travelCost || 0);

              return (
                <tr key={app.id}>
                  <td>
                    <strong>{app.company}</strong>
                    <div className="sub-role">{app.role}</div>
                  </td>
                  <td>
                    <span className={`status-pill status-${app.status}`}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{app.rounds} stages</td>
                  <td>{Number(app.hours || 0).toFixed(1)} hrs</td>
                  <td>{app.status === 'ghosted' ? `⚠️ Silent` : '—'}</td>
                  <td className="text-right font-mono font-bold">
                    {money(appLoss)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3">
                <strong>GRAND TOTALS ({totalApps} PIPELINES):</strong>
              </td>
              <td><strong>{totalHours.toFixed(1)} hrs</strong></td>
              <td><strong>{ghostRate}% ghosted</strong></td>
              <td className="text-right font-mono font-bold text-danger">
                {money(grandTotalLoss)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

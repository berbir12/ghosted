import React, { useState } from 'react';
import {
  FlameIcon,
  AwardIcon,
  SearchIcon,
  BuildingIcon,
  ReceiptIcon,
  ClockIcon,
  PlusIcon,
  CheckIcon,
  AlertCircleIcon
} from './Icons';

export function CompanyIndex({ companies, setCompanies, onSelectCompanyForReceipt }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'shame' | 'fame'
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Form for reporting a ghoster
  const [reportForm, setReportForm] = useState({
    companyName: '',
    industry: 'Tech / SaaS',
    rounds: 3,
    daysSilent: 30,
    outcome: 'ghosted',
    hadTakeHome: true,
    notes: ''
  });

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportForm.companyName.trim()) return;

    const existingIndex = companies.findIndex(
      (c) => c.name.toLowerCase() === reportForm.companyName.trim().toLowerCase()
    );

    if (existingIndex >= 0) {
      // Update existing
      const updated = [...companies];
      const target = updated[existingIndex];
      const isGhost = reportForm.outcome === 'ghosted';
      const newTotal = target.totalReports + 1;
      const newGhostCount = Math.round((target.ghostRate / 100) * target.totalReports) + (isGhost ? 1 : 0);
      const newGhostRate = Math.round((newGhostCount / newTotal) * 100);

      updated[existingIndex] = {
        ...target,
        ghostRate: newGhostRate,
        responseRate: 100 - newGhostRate,
        totalReports: newTotal,
        avgDaysToSilence: Math.round((target.avgDaysToSilence + reportForm.daysSilent) / 2),
        recentReport: reportForm.notes || target.recentReport,
        hallType: newGhostRate > 50 ? 'shame' : 'fame'
      };
      setCompanies(updated);
    } else {
      // Add new company
      const isGhost = reportForm.outcome === 'ghosted';
      const ghostRate = isGhost ? 90 : 20;
      const newCompany = {
        id: `comp-${Date.now()}`,
        name: reportForm.companyName.trim(),
        industry: reportForm.industry,
        logo: '🏢',
        ghostRate: ghostRate,
        responseRate: 100 - ghostRate,
        avgDaysToSilence: reportForm.daysSilent,
        avgRounds: reportForm.rounds,
        totalReports: 1,
        sentiment: isGhost ? 'negative' : 'positive',
        tag: isGhost ? 'Candidate reported ghosting' : 'Candidate reported reply',
        hallType: isGhost ? 'shame' : 'fame',
        recentReport: reportForm.notes || 'Community report submitted.'
      };
      setCompanies([newCompany, ...companies]);
    }

    setIsReportModalOpen(false);
    setReportForm({
      companyName: '',
      industry: 'Tech / SaaS',
      rounds: 3,
      daysSilent: 30,
      outcome: 'ghosted',
      hadTakeHome: true,
      notes: ''
    });
    alert(`Thank you for submitting community transparency data on ${reportForm.companyName}!`);
  };

  const filtered = companies.filter((c) => {
    const matchFilter =
      filterType === 'all' ||
      (filterType === 'shame' && c.hallType === 'shame') ||
      (filterType === 'fame' && c.hallType === 'fame');

    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.tag.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div className="company-index-container">
      {/* Top Banner */}
      <div className="index-hero">
        <div className="index-hero-content">
          <div className="index-badge-group">
            <span className="index-tag">🌐 UNIVERSAL HIRING TRANSPARENCY</span>
            <span className="index-pulse-dot" />
          </div>
          <h2>Wall of Shame & Hall of Fame</h2>
          <p>
            Crowdsourced candidate intelligence on company response rates, average ghost delays, and multi-round pipeline blackouts.
          </p>
        </div>
        <div className="index-hero-cta">
          <button className="btn-report-ghost" onClick={() => setIsReportModalOpen(true)}>
            <PlusIcon size={18} /> Report a Company
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="index-stats-strip">
        <div className="stat-card">
          <div className="stat-icon red"><FlameIcon size={24} /></div>
          <div>
            <div className="stat-val">{companies.filter((c) => c.hallType === 'shame').length}</div>
            <div className="stat-lbl">Wall of Shame Employers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><AwardIcon size={24} /></div>
          <div>
            <div className="stat-val">{companies.filter((c) => c.hallType === 'fame').length}</div>
            <div className="stat-lbl">Courteous Responsive Heroes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><BuildingIcon size={24} /></div>
          <div>
            <div className="stat-val">
              {companies.reduce((sum, c) => sum + c.totalReports, 0).toLocaleString()}
            </div>
            <div className="stat-lbl">Anonymous Candidate Reports</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="index-controls-bar">
        <div className="search-input-wrap wide">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search company (e.g. Google, Stripe, Tesla, ByteDance)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="clear-search" onClick={() => setSearch('')}>×</button>}
        </div>

        <div className="tab-pill-group">
          <button
            className={`pill-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Companies ({companies.length})
          </button>
          <button
            className={`pill-btn danger ${filterType === 'shame' ? 'active' : ''}`}
            onClick={() => setFilterType('shame')}
          >
            <FlameIcon size={14} /> Wall of Shame ({companies.filter((c) => c.hallType === 'shame').length})
          </button>
          <button
            className={`pill-btn success ${filterType === 'fame' ? 'active' : ''}`}
            onClick={() => setFilterType('fame')}
          >
            <AwardIcon size={14} /> Hall of Fame ({companies.filter((c) => c.hallType === 'fame').length})
          </button>
        </div>
      </div>

      {/* Grid of Company Cards */}
      <div className="companies-grid">
        {filtered.map((company) => {
          const isShame = company.hallType === 'shame';
          return (
            <div className={`company-card ${isShame ? 'is-shame' : 'is-fame'}`} key={company.id}>
              <div className="company-card-header">
                <div className="company-info-main">
                  <span className="company-logo-emoji">{company.logo}</span>
                  <div>
                    <h3 className="company-name">{company.name}</h3>
                    <span className="company-industry">{company.industry}</span>
                  </div>
                </div>
                <div className={`hall-tag ${isShame ? 'shame-tag' : 'fame-tag'}`}>
                  {isShame ? <FlameIcon size={14} /> : <AwardIcon size={14} />}
                  <span>{isShame ? 'WALL OF SHAME' : 'HALL OF FAME'}</span>
                </div>
              </div>

              {/* Ghost vs Response Rate Bar */}
              <div className="rate-breakdown">
                <div className="rate-labels">
                  <span className="ghost-pct">👻 {company.ghostRate}% Ghost Rate</span>
                  <span className="resp-pct">💬 {company.responseRate}% Response Rate</span>
                </div>
                <div className="rate-bar-track">
                  <div
                    className="rate-bar-fill ghost-fill"
                    style={{ width: `${company.ghostRate}%` }}
                    title={`Ghost rate: ${company.ghostRate}%`}
                  />
                  <div
                    className="rate-bar-fill resp-fill"
                    style={{ width: `${company.responseRate}%` }}
                    title={`Response rate: ${company.responseRate}%`}
                  />
                </div>
              </div>

              {/* Metrics strip */}
              <div className="company-card-stats">
                <div className="c-stat">
                  <span className="c-stat-lbl">AVG SILENCE</span>
                  <span className="c-stat-val">{company.avgDaysToSilence} days</span>
                </div>
                <div className="c-stat">
                  <span className="c-stat-lbl">AVG ROUNDS</span>
                  <span className="c-stat-val">{company.avgRounds} rounds</span>
                </div>
                <div className="c-stat">
                  <span className="c-stat-lbl">REPORTS</span>
                  <span className="c-stat-val">{company.totalReports}</span>
                </div>
              </div>

              {/* Field quote */}
              {company.recentReport && (
                <div className="company-report-quote">
                  <span className="quote-label">LATEST CANDIDATE DISPATCH:</span>
                  <p>“{company.recentReport}”</p>
                </div>
              )}

              {/* Card Footer */}
              <div className="company-card-footer">
                <button
                  className="btn-print-for-company"
                  onClick={() => onSelectCompanyForReceipt(company.name)}
                >
                  <ReceiptIcon size={15} /> Print {company.name} Receipt
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-search-state">
          <AlertCircleIcon size={32} />
          <h4>No companies found matching "{search}"</h4>
          <p>Be the first to report them to the universal database!</p>
          <button className="btn-primary" onClick={() => setIsReportModalOpen(true)}>
            + Report {search || 'a Company'}
          </button>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="modal-overlay" onClick={() => setIsReportModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report Company Hiring Behavior</h3>
              <button className="modal-close" onClick={() => setIsReportModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleReportSubmit} className="modal-form">
              <div className="form-row two-col">
                <label>
                  <span className="field-label">Company Name *</span>
                  <input
                    required
                    value={reportForm.companyName}
                    onChange={(e) => setReportForm({ ...reportForm, companyName: e.target.value })}
                    placeholder="e.g. Acme Corp"
                  />
                </label>
                <label>
                  <span className="field-label">Industry</span>
                  <select
                    value={reportForm.industry}
                    onChange={(e) => setReportForm({ ...reportForm, industry: e.target.value })}
                  >
                    <option>Tech / SaaS</option>
                    <option>Fintech / Finance</option>
                    <option>AI / Machine Learning</option>
                    <option>Consulting / Agency</option>
                    <option>Healthcare / Biotech</option>
                    <option>Retail / E-commerce</option>
                    <option>Media & Entertainment</option>
                  </select>
                </label>
              </div>

              <div className="form-row three-col">
                <label>
                  <span className="field-label">Outcome</span>
                  <select
                    value={reportForm.outcome}
                    onChange={(e) => setReportForm({ ...reportForm, outcome: e.target.value })}
                  >
                    <option value="ghosted">Ghosted (Zero Reply)</option>
                    <option value="replied">Courteous Reply / Feedback</option>
                    <option value="reposted">Role Cancelled & Reposted</option>
                  </select>
                </label>
                <label>
                  <span className="field-label">Interview Rounds</span>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={reportForm.rounds}
                    onChange={(e) => setReportForm({ ...reportForm, rounds: Number(e.target.value) })}
                  />
                </label>
                <label>
                  <span className="field-label">Days of Silence</span>
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={reportForm.daysSilent}
                    onChange={(e) => setReportForm({ ...reportForm, daysSilent: Number(e.target.value) })}
                  />
                </label>
              </div>

              <label>
                <span className="field-label">Candidate Field Notes (Anonymous)</span>
                <textarea
                  rows="3"
                  value={reportForm.notes}
                  onChange={(e) => setReportForm({ ...reportForm, notes: e.target.value })}
                  placeholder="Share details on how the process went (e.g. 'Did 4 rounds and presentation, recruiter went dark for 6 weeks')."
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsReportModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Anonymous Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

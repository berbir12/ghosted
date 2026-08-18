import React, { useState } from 'react';
import {
  GhostIcon,
  ReceiptIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  SearchIcon,
  MailIcon,
  DownloadIcon,
  AlertCircleIcon,
  CheckIcon
} from './Icons';

const statusConfig = {
  applied: { label: 'Applied', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: '#475569' },
  screening: { label: 'Screening', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', border: '#0284c7' },
  interviewing: { label: 'Interviewing', color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', border: '#ca8a04' },
  ghosted: { label: 'Ghosted 👻', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: '#e11d48' },
  rejected: { label: 'Rejected', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', border: '#7e22ce' },
  offer: { label: 'Offer Received 🎉', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: '#16a34a' }
};

const calculateDaysOfSilence = (lastContactDate) => {
  if (!lastContactDate) return 0;
  const last = new Date(lastContactDate).getTime();
  const now = new Date().getTime();
  const diffTime = Math.max(0, now - last);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const money = (val) => `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function Tracker({ applications, setApplications, onSelectForReceipt, onSelectForEmail }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'applied',
    appliedDate: new Date().toISOString().split('T')[0],
    lastContactDate: new Date().toISOString().split('T')[0],
    rounds: 1,
    hours: 4,
    salary: 100000,
    notes: '',
    vent: ''
  });

  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      company: '',
      role: '',
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
      lastContactDate: new Date().toISOString().split('T')[0],
      rounds: 1,
      hours: 4,
      salary: 100000,
      notes: '',
      vent: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (app) => {
    setEditingId(app.id);
    setFormData({ ...app });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.company.trim()) return;

    if (editingId) {
      setApplications(applications.map((app) => (app.id === editingId ? { ...formData, id: editingId } : app)));
    } else {
      const newApp = {
        ...formData,
        id: `app-${Date.now()}`,
        customItems: []
      };
      setApplications([newApp, ...applications]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this application from your tracker?')) {
      setApplications(applications.filter((a) => a.id !== id));
    }
  };

  const handleStatusChange = (id, newStatus, e) => {
    e.stopPropagation();
    setApplications(applications.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
  };

  // Export & Import backup
  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(applications, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ghosted-tracker-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            setApplications(parsed);
            alert(`Successfully restored ${parsed.length} applications!`);
          }
        } catch {
          alert('Invalid JSON backup file.');
        }
      };
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchQuery =
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchQuery;
  });

  return (
    <div className="tracker-container">
      {/* Header controls */}
      <div className="tracker-topbar">
        <div className="tracker-heading">
          <div className="tracker-title-wrap">
            <h2>Private Job Tracker</h2>
            <span className="no-auth-tag">🔒 100% Client-Side · No Sign-Up Needed</span>
          </div>
          <p className="tracker-sub">
            Track pipeline stages, auto-detect ghosting periods, and convert any stalled application into a receipt.
          </p>
        </div>

        <div className="tracker-actions">
          <button className="btn-secondary" onClick={handleExportData} title="Backup your application list">
            <DownloadIcon size={16} /> Export JSON
          </button>
          <label className="btn-secondary file-upload-label" title="Restore previous data">
            Restore
            <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
          </label>
          <button className="btn-primary" onClick={openNewModal}>
            <PlusIcon size={18} /> Add Application
          </button>
        </div>
      </div>

      {/* Filter and View bar */}
      <div className="tracker-filters-row">
        <div className="search-input-wrap">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search company, role, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ×
            </button>
          )}
        </div>

        <div className="status-pill-filters">
          <button className={filterStatus === 'all' ? 'active' : ''} onClick={() => setFilterStatus('all')}>
            All ({applications.length})
          </button>
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = applications.filter((a) => a.status === key).length;
            return (
              <button
                key={key}
                className={filterStatus === key ? 'active' : ''}
                onClick={() => setFilterStatus(key)}
                style={{ borderColor: filterStatus === key ? config.border : 'transparent' }}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="view-toggle">
          <button className={viewMode === 'board' ? 'active' : ''} onClick={() => setViewMode('board')}>
            Kanban
          </button>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
            List
          </button>
        </div>
      </div>

      {/* Main content display */}
      {viewMode === 'board' ? (
        <div className="kanban-board">
          {Object.entries(statusConfig).map(([statusKey, config]) => {
            const columnApps = filteredApps.filter((a) => a.status === statusKey);
            return (
              <div className="kanban-column" key={statusKey}>
                <div className="kanban-column-header" style={{ borderTopColor: config.color }}>
                  <div className="column-title">
                    <span>{config.label}</span>
                    <span className="column-badge">{columnApps.length}</span>
                  </div>
                </div>

                <div className="kanban-cards-list">
                  {columnApps.map((app) => {
                    const daysSilent = calculateDaysOfSilence(app.lastContactDate || app.appliedDate);
                    const isSevereGhost = daysSilent > 14 && app.status !== 'offer' && app.status !== 'rejected';
                    const hourlyRate = (Number(app.salary || 100000) / 2080);
                    const costLost = (Number(app.hours || 0) * hourlyRate);

                    return (
                      <div
                        className={`job-card ${isSevereGhost ? 'ghost-alert-card' : ''}`}
                        key={app.id}
                        onClick={() => openEditModal(app)}
                      >
                        <div className="card-header">
                          <h4 className="card-company">{app.company}</h4>
                          <span
                            className="card-status-badge"
                            style={{ color: config.color, background: config.bg, borderColor: config.border }}
                          >
                            {config.label}
                          </span>
                        </div>

                        <div className="card-role">{app.role}</div>

                        <div className="card-metrics">
                          <div className="metric-item" title="Interview rounds completed">
                            <span>Rounds:</span> <strong>{app.rounds || 0}</strong>
                          </div>
                          <div className="metric-item" title="Candidate hours spent">
                            <span>Hours:</span> <strong>{app.hours || 0}h</strong>
                          </div>
                          <div className="metric-item" title="Estimated candidate labor value">
                            <span>Loss:</span> <strong>{money(costLost)}</strong>
                          </div>
                        </div>

                        <div className="card-silence-meter">
                          <ClockIcon size={14} />
                          <span className={daysSilent > 14 ? 'silence-critical' : 'silence-normal'}>
                            {daysSilent === 0 ? 'Contact today' : `${daysSilent} days of silence`}
                          </span>
                          {isSevereGhost && <span className="ghost-warning-pill">STALLED</span>}
                        </div>

                        {app.vent && <p className="card-vent">“{app.vent}”</p>}

                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn-card-action receipt-action"
                            title="Generate a receipt for this application"
                            onClick={() => onSelectForReceipt(app)}
                          >
                            <ReceiptIcon size={14} /> Receipt
                          </button>
                          <button
                            className="btn-card-action email-action"
                            title="Generate follow-up or closure email"
                            onClick={() => onSelectForEmail(app)}
                          >
                            <MailIcon size={14} /> Follow-up
                          </button>
                          <button
                            className="btn-card-action delete-action"
                            title="Delete"
                            onClick={(e) => handleDelete(app.id, e)}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {columnApps.length === 0 && (
                    <div className="empty-column-drop">
                      <span>No jobs in {config.label.toLowerCase()}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="tracker-table-wrap">
          <table className="tracker-table">
            <thead>
              <tr>
                <th>COMPANY</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>APPLIED / CONTACT</th>
                <th>DAYS SILENT</th>
                <th>ROUNDS</th>
                <th>HOURS</th>
                <th>VALUE ($)</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => {
                const daysSilent = calculateDaysOfSilence(app.lastContactDate || app.appliedDate);
                const config = statusConfig[app.status] || statusConfig.applied;
                const hourlyRate = Number(app.salary || 100000) / 2080;
                const costLost = Number(app.hours || 0) * hourlyRate;

                return (
                  <tr key={app.id} onClick={() => openEditModal(app)}>
                    <td>
                      <strong>{app.company}</strong>
                    </td>
                    <td>{app.role}</td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="table-status-select"
                        style={{ color: config.color, borderColor: config.border }}
                      >
                        {Object.entries(statusConfig).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className="table-date">{app.appliedDate}</span>
                    </td>
                    <td>
                      <span className={daysSilent > 14 ? 'silence-critical font-bold' : ''}>
                        {daysSilent} days
                      </span>
                    </td>
                    <td>{app.rounds}</td>
                    <td>{app.hours}h</td>
                    <td>{money(costLost)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions">
                        <button
                          className="btn-icon"
                          title="Generate Receipt"
                          onClick={() => onSelectForReceipt(app)}
                        >
                          <ReceiptIcon size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Follow up Email"
                          onClick={() => onSelectForEmail(app)}
                        >
                          <MailIcon size={16} />
                        </button>
                        <button
                          className="btn-icon danger"
                          title="Delete"
                          onClick={(e) => handleDelete(app.id, e)}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Application' : 'Add New Application'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="form-row two-col">
                <label>
                  <span className="field-label">Company Name *</span>
                  <input
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                  />
                </label>
                <label>
                  <span className="field-label">Role Title *</span>
                  <input
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </label>
              </div>

              <div className="form-row three-col">
                <label>
                  <span className="field-label">Current Pipeline Status</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="field-label">Applied Date</span>
                  <input
                    type="date"
                    value={formData.appliedDate}
                    onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                  />
                </label>
                <label>
                  <span className="field-label">Last Contact / Response Date</span>
                  <input
                    type="date"
                    value={formData.lastContactDate}
                    onChange={(e) => setFormData({ ...formData, lastContactDate: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-row three-col">
                <label>
                  <span className="field-label">Interview Rounds</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.rounds}
                    onChange={(e) => setFormData({ ...formData, rounds: Number(e.target.value) })}
                  />
                </label>
                <label>
                  <span className="field-label">Total Hours Spent</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                  />
                </label>
                <label>
                  <span className="field-label">Target Annual Salary ($)</span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                  />
                </label>
              </div>

              <label>
                <span className="field-label">Field Notes / Interview Context</span>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Completed 3rd round with VP of Engineering. Take-home submitted on Monday."
                />
              </label>

              <label>
                <span className="field-label">One-Line Vent / Ghosting Summary</span>
                <input
                  maxLength="80"
                  value={formData.vent}
                  onChange={(e) => setFormData({ ...formData, vent: e.target.value })}
                  placeholder="e.g. Recruiter disappeared after promising next steps within 24 hours."
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Save Changes' : 'Create Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

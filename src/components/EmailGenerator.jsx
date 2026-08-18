import React, { useState, useEffect } from 'react';
import {
  MailIcon,
  CopyIcon,
  CheckIcon,
  ClockIcon,
  FlameIcon,
  ReceiptIcon
} from './Icons';

const templates = [
  {
    id: 'polite_nudge',
    name: '🕊️ The Polite Nudge',
    subtitle: 'Standard, professional follow-up checking on hiring timeline',
    generate: (data) => ({
      subject: `Follow-up: ${data.role} Interview Status — [Your Name]`,
      body: `Hi [Recruiter/Hiring Manager Name],

I hope you're having a productive week.

I’m following up on our recent conversation regarding the ${data.role} role at ${data.company || 'your company'}. I really enjoyed speaking with the team through ${data.rounds} interview stage${data.rounds === 1 ? '' : 's'} and learning more about the goals for this position.

Could you provide a quick update on your hiring timeline and whether there are any additional materials I can provide?

Thank you for your time and consideration!

Best regards,
[Your Name]
[Your Phone / Portfolio Link]`
    })
  },
  {
    id: 'dignified_closure',
    name: '🚪 Dignified Candidate Archival',
    subtitle: 'Close the loop yourself and withdraw with professionalism',
    generate: (data) => ({
      subject: `Withdrawing Candidacy & Closing Loop — ${data.role} at ${data.company || 'Company'}`,
      body: `Hi [Recruiter/Hiring Manager Name],

I hope this note finds you well.

As it has been ${data.daysSilent || 'several'} days since our last exchange following my ${data.rounds} interview round${data.rounds === 1 ? '' : 's'} for the ${data.role} opening, I am assuming the team has decided to pursue other directions or put this search on pause.

To keep my active search organized, I will be archiving this application on my end. I appreciated the opportunity to meet the team and wish you all the best with the hire.

Should a relevant opportunity open in the future where communication timelines align, feel free to reach out.

Sincerely,
[Your Name]`
    })
  },
  {
    id: 'itemized_invoice',
    name: '🧾 The Consulting Labor Invoice',
    subtitle: 'Itemized satirical invoice for candidate evaluation hours',
    generate: (data) => ({
      subject: `INVOICE FOR CANDIDATE CONSULTING SERVICES: ${data.company || 'Company'} — #${Math.floor(100000 + Math.random() * 900000)}`,
      body: `ATTENTION: Talent Acquisition & Hiring Committee
COMPANY: ${data.company || 'Company'}
POSITION EVALUATED: ${data.role || 'Role'}

STATEMENT FOR UNCOMPENSATED CANDIDATE LABOR:
------------------------------------------------------------
1. Application Customization & Review:        1.0 hr  ($0.00)
2. Pipeline Interviews (${data.rounds} rounds):              ${Number(data.hours || 8).toFixed(1)} hrs (BILLABLE)
3. Days in Unresolved Pipeline Silence:      ${data.daysSilent || 30} days ($0.00)
4. Recruiter Follow-ups Sent:                2 attempts ($0.00)
------------------------------------------------------------
TOTAL TIME DEDICATED:                        ${Number(data.hours || 8).toFixed(1)} HRS
TOTAL REPLIES RECEIVED:                      0
AMOUNT DUE:                                  1 COURTESY EMAIL / FEEDBACK

MEMO:
Please remit payment in the form of a brief, human closure email. Candidate labor was supplied in good faith.

Generated via Ghosted Receipt Protocol`
    })
  },
  {
    id: 'ghost_buster',
    name: '👻 The "Checking for Pulses" Check-in',
    subtitle: 'Lighthearted, slightly cheeky inquiry about sudden silence',
    generate: (data) => ({
      subject: `Checking in / Confirming you haven't been captured by aliens? (${data.role})`,
      body: `Hi [Recruiter Name],

I'm checking in on our interview process for the ${data.role} position. 

Having not heard back in ${data.daysSilent || 'a while'}, I wanted to make sure everything is okay on your end and that your team wasn't overwhelmed by an unexpected alien invasion or sudden office blackout!

If the role has been filled, cancelled, or placed on ice, no worries at all — a 10-second one-line note is all I need so I can update my tracker.

Cheers,
[Your Name]`
    })
  }
];

export function EmailGenerator({ applications, prefillData }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('polite_nudge');
  const [copied, setCopied] = useState(false);

  const [emailData, setEmailData] = useState({
    company: 'Northstar Labs',
    role: 'Senior Product Designer',
    rounds: 4,
    hours: 18,
    daysSilent: 45
  });

  // Handle prefill if passed from Tracker
  useEffect(() => {
    if (prefillData) {
      setEmailData({
        company: prefillData.company || '',
        role: prefillData.role || '',
        rounds: prefillData.rounds || 2,
        hours: prefillData.hours || 6,
        daysSilent: prefillData.daysSilent || 21
      });
    }
  }, [prefillData]);

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];
  const renderedEmail = activeTemplate.generate(emailData);

  const handleCopy = async () => {
    const fullText = `Subject: ${renderedEmail.subject}\n\n${renderedEmail.body}`;
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(renderedEmail.subject)}&body=${encodeURIComponent(renderedEmail.body)}`;

  return (
    <div className="email-generator-container">
      {/* Header */}
      <div className="email-gen-header">
        <div className="email-badge">
          <MailIcon size={16} />
          <span>RECRUITER CLOSURE & FOLLOW-UP ENGINE</span>
        </div>
        <h2>Take Back Your Narrative</h2>
        <p>
          Send a dignified follow-up, an official withdrawal note, or a tongue-in-cheek consulting invoice to close out ghosted pipelines.
        </p>
      </div>

      <div className="email-gen-grid">
        {/* Left Form controls */}
        <div className="email-controls-panel">
          <div className="option-heading">
            <span>APPLICATION DETAILS</span>
            {applications.length > 0 && <span>PRESET AVAILABLE</span>}
          </div>

          {applications.length > 0 && (
            <label>
              <span className="field-label">Quick load from your tracked applications:</span>
              <select
                onChange={(e) => {
                  const found = applications.find((a) => a.id === e.target.value);
                  if (found) {
                    const now = new Date().getTime();
                    const last = new Date(found.lastContactDate || found.appliedDate).getTime();
                    const days = Math.floor(Math.max(0, now - last) / (1000 * 60 * 60 * 24));
                    setEmailData({
                      company: found.company,
                      role: found.role,
                      rounds: found.rounds,
                      hours: found.hours,
                      daysSilent: days
                    });
                  }
                }}
              >
                <option value="">-- Select an Application --</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.company} — {app.role} ({app.status})
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="field-grid">
            <label>
              <span className="field-label">Company</span>
              <input
                value={emailData.company}
                onChange={(e) => setEmailData({ ...emailData, company: e.target.value })}
                placeholder="e.g. Acme Corp"
              />
            </label>
            <label>
              <span className="field-label">Role Title</span>
              <input
                value={emailData.role}
                onChange={(e) => setEmailData({ ...emailData, role: e.target.value })}
                placeholder="e.g. Senior Designer"
              />
            </label>
          </div>

          <div className="field-grid">
            <label>
              <span className="field-label">Rounds Completed</span>
              <input
                type="number"
                min="0"
                value={emailData.rounds}
                onChange={(e) => setEmailData({ ...emailData, rounds: Number(e.target.value) })}
              />
            </label>
            <label>
              <span className="field-label">Days of Silence</span>
              <input
                type="number"
                min="0"
                value={emailData.daysSilent}
                onChange={(e) => setEmailData({ ...emailData, daysSilent: Number(e.target.value) })}
              />
            </label>
          </div>

          <div className="template-selector-list">
            <span className="field-label">SELECT TEMPLATE TONE:</span>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className={`template-card-btn ${selectedTemplateId === tpl.id ? 'active' : ''}`}
                onClick={() => setSelectedTemplateId(tpl.id)}
              >
                <div className="tpl-name">{tpl.name}</div>
                <div className="tpl-desc">{tpl.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Email Preview Box */}
        <div className="email-preview-panel">
          <div className="email-box-header">
            <div className="email-traffic-lights">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="email-box-title">DRAFT PREVIEW</div>
            <div className="email-box-actions">
              <button className="btn-copy-email" onClick={handleCopy}>
                {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <a href={mailtoUrl} className="btn-open-client">
                <MailIcon size={14} /> Open in Email App ↗
              </a>
            </div>
          </div>

          <div className="email-rendered-box">
            <div className="email-subject-line">
              <span className="subj-label">SUBJECT:</span>
              <span className="subj-content">{renderedEmail.subject}</span>
            </div>
            <pre className="email-body-content">{renderedEmail.body}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

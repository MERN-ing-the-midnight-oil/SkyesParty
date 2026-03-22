import React, { useState, useEffect, useMemo, useRef } from 'react';
import './AdminView.css';
import { getRSVPs, getDeletedRSVPs, getStats, clearAllRSVPs, deleteRSVP, undeleteRSVP } from '../services/githubGist';
import { isBulkEmailConfigured, sendBulkAttendeeEmails } from '../services/emailService';

const AdminView = () => {
  const [rsvps, setRsvps] = useState([]);
  const [deletedRsvps, setDeletedRsvps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailProgress, setEmailProgress] = useState(null);

  const rsvpsRef = useRef(rsvps);
  useEffect(() => {
    rsvpsRef.current = rsvps;
  }, [rsvps]);

  // Everyone with an email is selected by default; admin unchecks rows to exclude.
  useEffect(() => {
    const withEmail = rsvps.filter((r) => (r.email || '').trim());
    setSelectedIds(new Set(withEmail.map((r) => r.id)));
  }, [rsvps]);

  useEffect(() => {
    // Check if token is missing
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const tokenFromStorage = sessionStorage.getItem('github_token');
    // Note: We don't check config/env here since getGitHubToken() will handle it
    // If token is in config, it will work automatically
    
    if (!tokenFromUrl && !tokenFromStorage) {
      // Check if token exists in config or env (via getGitHubToken)
      // We'll let loadData() try first, and if it fails, show the input
      loadData();
      return;
    }
    
    loadData();
  }, []);

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      sessionStorage.setItem('github_token', tokenInput.trim());
      setShowTokenInput(false);
      setLoading(true);
      loadData();
    }
  };

  const loadData = async () => {
    try {
      const [rsvpsData, deletedData, statsData] = await Promise.all([
        getRSVPs(),
        getDeletedRSVPs(),
        getStats()
      ]);

      setRsvps(rsvpsData || []);
      setDeletedRsvps(deletedData || []);
      setStats(statsData);
      setError(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load RSVPs. Please check your GitHub token configuration.';
      setError(errorMessage);
      
      // If it's a token error, show the token input
      if (errorMessage.includes('token') || errorMessage.includes('Token')) {
        setShowTokenInput(true);
      }
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRSVP = async (rsvpId) => {
    const confirmed = window.confirm('Are you sure you want to delete this RSVP? It can be restored later.');
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);
      await deleteRSVP(rsvpId);
      await loadData();
    } catch (err) {
      console.error('Delete RSVP error:', err);
      setError(err.message || 'Failed to delete RSVP');
      alert(`Error: ${err.message || 'Failed to delete RSVP'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUndeleteRSVP = async (rsvpId) => {
    try {
      setLoading(true);
      setError(null);
      await undeleteRSVP(rsvpId);
      await loadData();
    } catch (err) {
      console.error('Undelete RSVP error:', err);
      setError(err.message || 'Failed to restore RSVP');
      alert(`Error: ${err.message || 'Failed to restore RSVP'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const rsvpsWithEmail = useMemo(
    () => rsvps.filter((r) => (r.email || '').trim()),
    [rsvps]
  );

  const selectedWithEmail = useMemo(() => {
    return rsvpsWithEmail.filter((r) => selectedIds.has(r.id));
  }, [rsvpsWithEmail, selectedIds]);

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllWithEmail = () => {
    setSelectedIds(new Set(rsvpsWithEmail.map((r) => r.id)));
  };

  const clearEmailSelection = () => setSelectedIds(new Set());

  const handleSendAttendeeEmail = async () => {
    if (!isBulkEmailConfigured()) {
      alert(
        'Bulk email is not configured. Add REACT_APP_EMAILJS_BULK_TEMPLATE_ID to your build (see EmailJS bulk template in project docs).'
      );
      return;
    }

    const subject = emailSubject.trim();
    const body = emailBody.trim();
    if (!subject || !body) {
      alert('Please enter a subject and message.');
      return;
    }

    if (selectedWithEmail.length === 0) {
      alert('Select at least one RSVP that has an email address.');
      return;
    }

    const confirmed = window.confirm(
      `Send this email to ${selectedWithEmail.length} recipient(s)?`
    );
    if (!confirmed) return;

    setSendingEmail(true);
    setEmailProgress({ current: 0, total: selectedWithEmail.length });
    setError(null);

    try {
      const recipients = selectedWithEmail.map((r) => ({
        email: r.email,
        name: r.name,
      }));

      const result = await sendBulkAttendeeEmails(
        recipients,
        subject,
        body,
        ({ current, total }) => setEmailProgress({ current, total })
      );

      const failedMsg =
        result.failed.length > 0
          ? `\n\nFailed (${result.failed.length}):\n${result.failed
              .map((f) => `${f.email}: ${f.error}`)
              .join('\n')}`
          : '';

      alert(
        `Sent: ${result.sent.length}.${result.failed.length > 0 ? ` Failed: ${result.failed.length}.` : ''}${failedMsg}`
      );

      if (result.sent.length > 0 && result.failed.length === 0) {
        const withEmail = rsvpsRef.current.filter((r) => (r.email || '').trim());
        setSelectedIds(new Set(withEmail.map((r) => r.id)));
      }
    } catch (err) {
      console.error('Send attendee email error:', err);
      setError(err.message || 'Failed to send emails');
      alert(err.message || 'Failed to send emails');
    } finally {
      setSendingEmail(false);
      setEmailProgress(null);
    }
  };

  if (showTokenInput) {
    return (
      <div className="admin-container">
        <div className="error-message" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>🔑 GitHub Token Required</h2>
          <p style={{ marginBottom: '20px' }}>
            The admin dashboard needs a GitHub Personal Access Token to access your RSVPs stored in a GitHub Gist.
          </p>
          <p style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#555' }}>
            <strong>Tip:</strong> You can also open this page with <code>?/admin&token=YOUR_TOKEN</code> in the URL (same token as below). It will be saved for this browser session.
          </p>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '0.9rem'
          }}>
            <p><strong>How to get a GitHub Token:</strong></p>
            <ol style={{ marginLeft: '20px', marginTop: '10px' }}>
              <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub Settings → Developer settings → Personal access tokens</a></li>
              <li>Click "Generate new token (classic)"</li>
              <li>Give it a name like "Skye's Party Admin"</li>
              <li>Select the <strong>gist</strong> scope (check the "gist" checkbox)</li>
              <li>Click "Generate token" and copy it</li>
            </ol>
          </div>

          <form onSubmit={handleTokenSubmit} style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="token-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Enter your GitHub Personal Access Token:
              </label>
              <input
                id="token-input"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit" 
                className="retry-button"
                disabled={!tokenInput.trim()}
                style={{ flex: 1 }}
              >
                Submit Token
              </button>
              <button 
                type="button"
                onClick={() => {
                  const url = new URL(window.location);
                  url.searchParams.set('token', 'YOUR_TOKEN_HERE');
                  alert(`Alternatively, you can add the token to the URL:\n${url.toString()}\n\nOr set REACT_APP_GITHUB_TOKEN as an environment variable.`);
                }}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Show URL Option
              </button>
            </div>
          </form>

          <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#666' }}>
            <strong>Note:</strong> The token will be stored in your browser's session storage for this session only. 
            It will not be saved permanently.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-spinner"></div>
        <p>Loading RSVPs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error-message">
          <p>{error}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button onClick={loadData} className="retry-button">Retry</button>
            <button 
              onClick={() => {
                sessionStorage.removeItem('github_token');
                setShowTokenInput(true);
              }}
              style={{
                padding: '10px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Enter New Token
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🎉 Skye's 4th Birthday Party - Admin View 🎉</h1>
        <p className="party-info">
          <strong>Date:</strong> Sunday, March 22nd, 2026 | 
          <strong> Time:</strong> 10:30 AM - 12:30 PM | 
          <strong> Location:</strong> Arne Hanna Aquatic Center, Bellingham WA
        </p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total RSVPs</div>
          </div>
          <div className="stat-card going">
            <div className="stat-number">{stats.going}</div>
            <div className="stat-label">Going 🎉</div>
          </div>
          <div className="stat-card not-going">
            <div className="stat-number">{stats.not_going}</div>
            <div className="stat-label">Not Going</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_adults || 0}</div>
            <div className="stat-label">Total Adults</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.total_kids || 0}</div>
            <div className="stat-label">Total Kids</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{(stats.total_adults || 0) + (stats.total_kids || 0)}</div>
            <div className="stat-label">Total Attendees</div>
          </div>
        </div>
      )}

      <div className="admin-actions">
        <button onClick={loadData} className="refresh-button">🔄 Refresh</button>
        <button 
          onClick={async () => {
            const confirmed = window.confirm(
              `Are you sure you want to delete ALL ${rsvps.length} RSVPs? This action cannot be undone.\n\nClick OK to confirm deletion.`
            );
            if (confirmed) {
              try {
                setLoading(true);
                setError(null);
                await clearAllRSVPs();
                // Wait a moment for GitHub to process the update
                await new Promise(resolve => setTimeout(resolve, 500));
                // Force reload with cache busting
                await loadData();
                // Clear any cached data
                setRsvps([]);
                setStats(null);
                // Reload again to get fresh data
                await loadData();
                alert('All RSVPs have been successfully deleted. The page will refresh.');
                // Force a hard refresh
                window.location.reload();
              } catch (err) {
                console.error('Clear RSVPs error:', err);
                setError(err.message || 'Failed to clear RSVPs');
                alert(`Error: ${err.message || 'Failed to clear RSVPs'}\n\nCheck the browser console for more details.`);
              } finally {
                setLoading(false);
              }
            }
          }}
          className="refresh-button"
          style={{ 
            backgroundColor: '#dc3545', 
            marginLeft: '10px' 
          }}
          disabled={rsvps.length === 0}
        >
          🗑️ Clear All RSVPs
        </button>
      </div>

      <div className="rsvps-section">
        <h2>RSVP Management</h2>

        {!showDeleted && rsvps.length > 0 && (
          <div className="email-attendees-panel">
            <h3 className="email-attendees-heading">Email attendees</h3>
            {rsvpsWithEmail.length === 0 && (
              <p className="email-config-hint">
                No active RSVPs include an email address yet. Guests who RSVP with an email can be messaged here.
              </p>
            )}
            {!isBulkEmailConfigured() ? (
              <p className="email-config-hint">
                To email guests from the admin dashboard, configure EmailJS with{' '}
                <code>REACT_APP_EMAILJS_BULK_TEMPLATE_ID</code> (separate from the RSVP notification template).
                The template should send to <code>{'{{to_email}}'}</code> and include{' '}
                <code>to_name</code>, <code>subject</code>, and <code>message</code> in the body.
              </p>
            ) : (
              <>
                <p className="email-selection-summary">
                  {selectedWithEmail.length} of {rsvpsWithEmail.length} with email selected
                  <span className="email-selection-hint">
                    {' '}
                    (everyone starts selected—uncheck to exclude)
                  </span>
                  {emailProgress && (
                    <span className="email-send-progress">
                      {' '}
                      · Sending {emailProgress.current} / {emailProgress.total}
                    </span>
                  )}
                </p>
                <div className="email-attendees-actions">
                  <button
                    type="button"
                    className="email-secondary-button"
                    onClick={selectAllWithEmail}
                    disabled={sendingEmail || rsvpsWithEmail.length === 0}
                  >
                    Select all with email
                  </button>
                  <button
                    type="button"
                    className="email-secondary-button"
                    onClick={clearEmailSelection}
                    disabled={sendingEmail || selectedIds.size === 0}
                  >
                    Clear selection
                  </button>
                </div>
                <div className="email-compose-row">
                  <label className="email-compose-label" htmlFor="admin-email-subject">
                    Subject
                  </label>
                  <input
                    id="admin-email-subject"
                    type="text"
                    className="email-compose-input"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. Update about the party"
                    disabled={sendingEmail}
                  />
                </div>
                <div className="email-compose-row">
                  <label className="email-compose-label" htmlFor="admin-email-body">
                    Message
                  </label>
                  <textarea
                    id="admin-email-body"
                    className="email-compose-textarea"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your message to selected guests…"
                    rows={5}
                    disabled={sendingEmail}
                  />
                </div>
                <div className="email-compose-footer">
                  <button
                    type="button"
                    className="email-send-button"
                    onClick={handleSendAttendeeEmail}
                    disabled={
                      sendingEmail ||
                      selectedWithEmail.length === 0 ||
                      !emailSubject.trim() ||
                      !emailBody.trim()
                    }
                  >
                    {sendingEmail ? 'Sending…' : 'Send email to selected'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {rsvps.length === 0 && deletedRsvps.length === 0 ? (
          <div className="no-rsvps">
            <p>No RSVPs yet. Share your RSVP link to start receiving responses!</p>
          </div>
        ) : (
          <>
            <div className="rsvps-tabs">
              <div 
                className={`tab ${!showDeleted ? 'active' : ''}`}
                onClick={() => setShowDeleted(false)}
              >
                Active ({rsvps.length})
              </div>
              <div 
                className={`tab ${showDeleted ? 'active' : ''}`}
                onClick={() => setShowDeleted(true)}
              >
                Deleted ({deletedRsvps.length})
              </div>
            </div>

            {!showDeleted ? (
              <div className="table-container">
                {rsvps.length === 0 ? (
                  <div className="no-rsvps">
                    <p>No active RSVPs. Check the Deleted tab to see removed records.</p>
                  </div>
                ) : (
                  <table className="rsvps-table">
                    <thead>
                      <tr>
                        <th className="th-select">
                          <span className="sr-only">Select</span>
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Adults</th>
                        <th>Kids</th>
                        <th>Total People</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rsvps.map((rsvp) => {
                        const hasEmail = Boolean((rsvp.email || '').trim());
                        return (
                          <tr key={rsvp.id} className={rsvp.going ? 'going-row' : 'not-going-row'}>
                            <td className="td-select">
                              <input
                                type="checkbox"
                                className="rsvp-select-checkbox"
                                checked={selectedIds.has(rsvp.id)}
                                onChange={() => toggleSelected(rsvp.id)}
                                disabled={!hasEmail || sendingEmail}
                                title={hasEmail ? 'Select for email' : 'No email on this RSVP'}
                                aria-label={hasEmail ? `Select ${rsvp.name || rsvp.email} for email` : 'No email'}
                              />
                            </td>
                            <td>{rsvp.name || <em>No name</em>}</td>
                            <td>{rsvp.email || <em>No email</em>}</td>
                            <td>
                              <span className={`status-badge ${rsvp.going ? 'going' : 'not-going'}`}>
                                {rsvp.going ? '✅ Going' : '❌ Not Going'}
                              </span>
                            </td>
                            <td>{rsvp.num_adults || 0}</td>
                            <td>{rsvp.num_kids || 0}</td>
                            <td><strong>{(rsvp.num_adults || 0) + (rsvp.num_kids || 0)}</strong></td>
                            <td>{formatDate(rsvp.submitted_at)}</td>
                            <td>
                              <button
                                onClick={() => handleDeleteRSVP(rsvp.id)}
                                className="delete-button"
                                title="Delete this RSVP"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <div className="table-container">
                {deletedRsvps.length === 0 ? (
                  <div className="no-rsvps">
                    <p>No deleted RSVPs.</p>
                  </div>
                ) : (
                  <table className="rsvps-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Adults</th>
                        <th>Kids</th>
                        <th>Total People</th>
                        <th>Deleted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedRsvps.map((rsvp) => (
                        <tr key={rsvp.id} className="deleted-row">
                          <td>{rsvp.name || <em>No name</em>}</td>
                          <td>{rsvp.email || <em>No email</em>}</td>
                          <td>
                            <span className={`status-badge ${rsvp.going ? 'going' : 'not-going'}`}>
                              {rsvp.going ? '✅ Going' : '❌ Not Going'}
                            </span>
                          </td>
                          <td>{rsvp.num_adults || 0}</td>
                          <td>{rsvp.num_kids || 0}</td>
                          <td><strong>{rsvp.num_adults + rsvp.num_kids}</strong></td>
                          <td>{formatDate(rsvp.deleted_at)}</td>
                          <td>
                            <button
                              onClick={() => handleUndeleteRSVP(rsvp.id)}
                              className="undelete-button"
                              title="Restore this RSVP"
                            >
                              ♻️ Restore
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            <div className="summary-section">
              <h3>Summary for Planning</h3>
              <div className="summary-cards">
                <div className="summary-card">
                  <h4>Pizza Planning 🍕</h4>
                  <p><strong>Adults attending:</strong> {stats?.total_adults || 0}</p>
                  <p><strong>Kids attending:</strong> {stats?.total_kids || 0}</p>
                  <p><strong>Total people:</strong> {(stats?.total_adults || 0) + (stats?.total_kids || 0)}</p>
                </div>
                <div className="summary-card">
                  <h4>Cupcake Planning 🧁</h4>
                  <p><strong>Total attendees:</strong> {(stats?.total_adults || 0) + (stats?.total_kids || 0)}</p>
                  <p><em>Don't forget to add a few extra!</em></p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminView;


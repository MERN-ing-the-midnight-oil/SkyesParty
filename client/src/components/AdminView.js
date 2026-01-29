import React, { useState, useEffect } from 'react';
import './AdminView.css';
import { getRSVPs, getStats } from '../services/githubGist';

const AdminView = () => {
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenInput, setTokenInput] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

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
      const [rsvpsData, statsData] = await Promise.all([
        getRSVPs(),
        getStats()
      ]);

      setRsvps(rsvpsData || []);
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

  if (showTokenInput) {
    return (
      <div className="admin-container">
        <div className="error-message" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>🔑 GitHub Token Required</h2>
          <p style={{ marginBottom: '20px' }}>
            The admin dashboard needs a GitHub Personal Access Token to access your RSVPs stored in a GitHub Gist.
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
          <strong>Date:</strong> Saturday, March 22nd, 2026 | 
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
      </div>

      <div className="rsvps-section">
        <h2>All RSVPs ({rsvps.length})</h2>
        
        {rsvps.length === 0 ? (
          <div className="no-rsvps">
            <p>No RSVPs yet. Share your RSVP link to start receiving responses!</p>
          </div>
        ) : (
          <>
            <div className="rsvps-tabs">
              <div className="tab active">
                All ({rsvps.length})
              </div>
            </div>

            <div className="table-container">
              <table className="rsvps-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Adults</th>
                    <th>Kids</th>
                    <th>Total People</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className={rsvp.going ? 'going-row' : 'not-going-row'}>
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
                      <td>{formatDate(rsvp.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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


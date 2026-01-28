import React, { useState, useEffect } from 'react';
import './AdminView.css';
import { getRSVPs, getStats } from '../services/githubGist';

const AdminView = () => {
  const [rsvps, setRsvps] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

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
      setError(err.message || 'Failed to load RSVPs. Please check your GitHub token configuration.');
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
          <button onClick={loadData} className="retry-button">Retry</button>
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


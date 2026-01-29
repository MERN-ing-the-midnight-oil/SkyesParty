import React, { useState, useEffect } from 'react';
import './App.css';
import RSVPForm from './components/RSVPForm';
import AdminView from './components/AdminView';

// Get the expected access token from environment variable
// You can set this during build: REACT_APP_ACCESS_TOKEN=your_secret_token
const EXPECTED_ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN || '';

// Check if access token is valid
const isValidAccessToken = (token) => {
  // If no access token is configured, allow access (backward compatibility)
  if (!EXPECTED_ACCESS_TOKEN) {
    return true;
  }
  // Otherwise, check if the provided token matches
  return token === EXPECTED_ACCESS_TOKEN;
};

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check if this is the admin page
    // Handle both normal routing and GitHub Pages routing (/?/admin)
    const path = window.location.pathname;
    const search = window.location.search;
    
    // Check for GitHub Pages format: /?/admin
    if (search.startsWith('?/')) {
      const pathInQuery = search.slice(2).split('&')[0].split('#')[0];
      if (pathInQuery === 'admin' || pathInQuery === 'admin/') {
        setIsAdmin(true);
        setLoading(false);
        return;
      }
    }
    
    // Check normal pathname
    if (path === '/admin' || path === '/admin/') {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    // Check for access token in URL
    const urlParams = new URLSearchParams(search);
    const accessToken = urlParams.get('access');
    
    // Validate access token
    if (isValidAccessToken(accessToken)) {
      setHasAccess(true);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="App">
        <AdminView />
      </div>
    );
  }

  // Check access for RSVP form
  if (!hasAccess) {
    return (
      <div className="App">
        <div className="error-container">
          <h1>🔒 Private Event</h1>
          <div className="error-message">
            <p>This RSVP form is private. Please use the access link provided to you.</p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem', opacity: 0.9 }}>
              If you have the access link, make sure it includes <code>?access=YOUR_TOKEN</code> in the URL.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <RSVPForm />
    </div>
  );
}

export default App;

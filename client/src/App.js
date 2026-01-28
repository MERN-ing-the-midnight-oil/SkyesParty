import React, { useState, useEffect } from 'react';
import './App.css';
import RSVPForm from './components/RSVPForm';
import AdminView from './components/AdminView';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

    // Get token from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    
    if (tokenParam) {
      setToken(tokenParam);
      // Verify token
      verifyToken(tokenParam);
    } else {
      setLoading(false);
      setError('No magic link token found. Please use the link from your email.');
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-token/${tokenToVerify}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setError(null);
      } else {
        setError('Invalid or expired magic link. Please request a new one.');
      }
    } catch (err) {
      setError('Failed to verify magic link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  if (error && !token) {
    return (
      <div className="App">
        <div className="error-container">
          <h1>🎉 Skye's 4th Birthday Party 🎉</h1>
          <div className="error-message">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="App">
        <AdminView apiUrl={API_URL} />
      </div>
    );
  }

  return (
    <div className="App">
      <RSVPForm token={token} apiUrl={API_URL} />
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import './App.css';
import RSVPForm from './components/RSVPForm';
import AdminView from './components/AdminView';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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

    // Not admin page, show RSVP form
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

  return (
    <div className="App">
      <RSVPForm />
    </div>
  );
}

export default App;

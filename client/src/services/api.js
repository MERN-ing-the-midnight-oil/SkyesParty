// Backend API service for RSVP submissions
// This calls the backend server which handles email notifications

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Get token from URL (supports both 'token' and 'access' query parameters)
const getTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token') || urlParams.get('access') || '';
};

// Submit RSVP to backend
export const submitRSVP = async (rsvpData) => {
  const token = getTokenFromUrl();
  
  if (!token) {
    throw new Error('Token is required. Please use the access link provided to you.');
  }

  const response = await fetch(`${API_BASE_URL}/rsvp/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      ...rsvpData
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to submit RSVP' }));
    throw new Error(error.error || 'Failed to submit RSVP');
  }

  const result = await response.json();
  return result.rsvp;
};


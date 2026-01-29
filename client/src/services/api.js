// GitHub Gists API service for RSVP submissions
// Uses githubGist.js as the backend service
// Pure frontend - no backend required!

import { getRSVPs as getRSVPsFromGist, addRSVP } from './githubGist';

// Get access token from URL (for private event access control)
const getAccessToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('access') || '';
};

// Check if user has access to the RSVP form
export const checkAccess = () => {
  const requiredAccessToken = process.env.REACT_APP_ACCESS_TOKEN;
  
  // If no access token is configured, allow public access (backward compatible)
  if (!requiredAccessToken) {
    return true;
  }
  
  // Otherwise, check if the URL has the correct access token
  const providedToken = getAccessToken();
  return providedToken === requiredAccessToken;
};

// Get all RSVPs from the Gist (re-exported from githubGist.js for compatibility)
export const getRSVPs = async () => {
  try {
    return await getRSVPsFromGist();
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    throw error;
  }
};

// Submit a new RSVP
export const submitRSVP = async (rsvpData) => {
  // Check access token
  if (!checkAccess()) {
    throw new Error('Access denied. Please use the correct access link.');
  }

  try {
    // Use addRSVP from githubGist.js which handles all the Gist operations
    const newRSVP = await addRSVP(rsvpData);
    return newRSVP;
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    throw error;
  }
};
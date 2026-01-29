// GitHub Gists API service for RSVP submissions
// Pure frontend - no backend required!

const GIST_DESCRIPTION = "Skye's Party RSVPs";
const GIST_FILENAME = "rsvps.json";

// Get GitHub token from environment variable or URL parameter
const getGitHubToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return process.env.REACT_APP_GITHUB_TOKEN || urlParams.get('token') || '';
};

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

// Get or create the Gist ID
const getGistId = () => {
  return localStorage.getItem('rsvp_gist_id');
};

const setGistId = (gistId) => {
  localStorage.setItem('rsvp_gist_id', gistId);
};

// Create a new Gist
const createGist = async (token, rsvps) => {
  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(rsvps, null, 2)
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create Gist');
  }

  const gist = await response.json();
  setGistId(gist.id);
  return gist;
};

// Update an existing Gist
const updateGist = async (token, gistId, rsvps) => {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(rsvps, null, 2)
        }
      }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to update Gist');
  }

  return await response.json();
};

// Get all RSVPs from the Gist
export const getRSVPs = async () => {
  const token = getGitHubToken();
  
  if (!token) {
    throw new Error('GitHub token not found. Please configure REACT_APP_GITHUB_TOKEN.');
  }

  const gistId = getGistId();
  
  if (!gistId) {
    // No RSVPs yet
    return [];
  }

  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      'Authorization': `token ${token}`,
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      // Gist was deleted, clear the stored ID
      localStorage.removeItem('rsvp_gist_id');
      return [];
    }
    throw new Error('Failed to fetch RSVPs');
  }

  const gist = await response.json();
  const content = gist.files[GIST_FILENAME]?.content;
  
  if (!content) {
    return [];
  }

  return JSON.parse(content);
};

// Submit a new RSVP
export const submitRSVP = async (rsvpData) => {
  // Check access token
  if (!checkAccess()) {
    throw new Error('Access denied. Please use the correct access link.');
  }

  const token = getGitHubToken();
  
  if (!token) {
    throw new Error('GitHub token not found. Please configure REACT_APP_GITHUB_TOKEN.');
  }

  // Get existing RSVPs
  const existingRSVPs = await getRSVPs();
  
  // Add new RSVP with timestamp
  const newRSVP = {
    ...rsvpData,
    id: Date.now().toString(),
    submittedAt: new Date().toISOString()
  };
  
  const updatedRSVPs = [...existingRSVPs, newRSVP];

  // Create or update Gist
  const gistId = getGistId();
  
  if (!gistId) {
    await createGist(token, updatedRSVPs);
  } else {
    await updateGist(token, gistId, updatedRSVPs);
  }

  return newRSVP;
};
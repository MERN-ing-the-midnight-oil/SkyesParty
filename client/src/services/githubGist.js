// GitHub Gist service for storing RSVPs
// This replaces the backend by using GitHub Gists API as a simple database

const GIST_FILENAME = 'rsvps.json';
const GIST_DESCRIPTION = 'Skye\'s Party RSVPs';

// Get GitHub token from environment variable or URL parameter
// For GitHub Pages, you can set this as a GitHub secret and use it in the build
// Or pass it as a URL parameter (less secure but works)
const getGitHubToken = () => {
  // Check URL parameter first (for easy setup)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  if (tokenFromUrl) {
    return tokenFromUrl;
  }
  
  // Check environment variable (set during build)
  return process.env.REACT_APP_GITHUB_TOKEN || '';
};

// Get or create the Gist ID from localStorage (or you can hardcode it after first creation)
const getGistId = () => {
  return localStorage.getItem('rsvp_gist_id') || '';
};

const setGistId = (id) => {
  localStorage.setItem('rsvp_gist_id', id);
};

// Create a new Gist
export const createGist = async () => {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token not found. Please set REACT_APP_GITHUB_TOKEN or pass ?token=YOUR_TOKEN in the URL.');
  }

  const initialData = {
    rsvps: [],
    created_at: new Date().toISOString()
  };

  try {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        public: false, // Private gist
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(initialData, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Gist');
    }

    const gist = await response.json();
    setGistId(gist.id);
    return gist.id;
  } catch (error) {
    console.error('Error creating Gist:', error);
    throw error;
  }
};

// Get all RSVPs from the Gist
export const getRSVPs = async () => {
  const token = getGitHubToken();
  const gistId = getGistId();

  if (!token) {
    throw new Error('GitHub token not found. Please set REACT_APP_GITHUB_TOKEN or pass ?token=YOUR_TOKEN in the URL.');
  }

  if (!gistId) {
    // Try to create a new Gist
    const newGistId = await createGist();
    return [];
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Gist doesn't exist, create a new one
        const newGistId = await createGist();
        return [];
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch Gist');
    }

    const gist = await response.json();
    const file = gist.files[GIST_FILENAME];
    
    if (!file) {
      return [];
    }

    const data = JSON.parse(file.content);
    return data.rsvps || [];
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    throw error;
  }
};

// Add a new RSVP to the Gist
export const addRSVP = async (rsvpData) => {
  const token = getGitHubToken();
  const gistId = getGistId();

  if (!token) {
    throw new Error('GitHub token not found. Please set REACT_APP_GITHUB_TOKEN or pass ?token=YOUR_TOKEN in the URL.');
  }

  // Get existing RSVPs
  let existingRSVPs = [];
  let currentGistId = gistId;

  if (!currentGistId) {
    // Create a new Gist if it doesn't exist
    currentGistId = await createGist();
  } else {
    try {
      existingRSVPs = await getRSVPs();
    } catch (error) {
      // If fetch fails, create a new Gist
      currentGistId = await createGist();
      existingRSVPs = [];
    }
  }

  // Create new RSVP entry
  const newRSVP = {
    id: Date.now().toString(), // Simple ID generation
    ...rsvpData,
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Add to existing RSVPs
  const updatedRSVPs = [...existingRSVPs, newRSVP];

  // Update the Gist
  try {
    const response = await fetch(`https://api.github.com/gists/${currentGistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify({
              rsvps: updatedRSVPs,
              updated_at: new Date().toISOString()
            }, null, 2)
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update Gist');
    }

    return newRSVP;
  } catch (error) {
    console.error('Error adding RSVP:', error);
    throw error;
  }
};

// Get statistics
export const getStats = async () => {
  const rsvps = await getRSVPs();
  
  const stats = {
    total: rsvps.length,
    going: rsvps.filter(r => r.going).length,
    not_going: rsvps.filter(r => !r.going).length,
    total_adults: rsvps.reduce((sum, r) => sum + (r.num_adults || 0), 0),
    total_kids: rsvps.reduce((sum, r) => sum + (r.num_kids || 0), 0)
  };

  return stats;
};


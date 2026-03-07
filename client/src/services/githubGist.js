// GitHub Gist service for storing RSVPs
// This replaces the backend by using GitHub Gists API as a simple database

import { GITHUB_TOKEN as CONFIG_TOKEN } from '../config';

const GIST_FILENAME = 'rsvps.json';
const GIST_DESCRIPTION = 'Skye\'s Party RSVPs';

// Get GitHub token from URL (search or hash), sessionStorage, config, or env
// Priority: URL (search then hash) -> sessionStorage -> config -> env
const getGitHubToken = () => {
  // 1. Query string (e.g. ?/admin&token=ghp_xxx)
  const searchParams = new URLSearchParams(window.location.search);
  let tokenFromUrl = searchParams.get('token');
  // 2. Hash (e.g. #/admin?token=ghp_xxx - some setups put route in hash)
  if (!tokenFromUrl && window.location.hash) {
    const hashPart = window.location.hash.indexOf('?') >= 0
      ? window.location.hash.slice(window.location.hash.indexOf('?'))
      : '';
    if (hashPart) tokenFromUrl = new URLSearchParams(hashPart).get('token');
  }
  if (tokenFromUrl) {
    sessionStorage.setItem('github_token', tokenFromUrl);
    return tokenFromUrl;
  }

  const tokenFromStorage = sessionStorage.getItem('github_token');
  if (tokenFromStorage) return tokenFromStorage;
  if (CONFIG_TOKEN && CONFIG_TOKEN !== 'YOUR_GITHUB_TOKEN_HERE') return CONFIG_TOKEN;
  return process.env.REACT_APP_GITHUB_TOKEN || '';
};

// Get Gist ID from localStorage (device-specific; may be empty on new devices)
const getGistId = () => {
  return localStorage.getItem('rsvp_gist_id') || '';
};

const setGistId = (id) => {
  localStorage.setItem('rsvp_gist_id', id);
};

// Canonical Gist ID from build (set REACT_APP_GIST_ID in GitHub Actions secrets so production always uses the merged Gist)
const getCanonicalGistId = () => (process.env.REACT_APP_GIST_ID || '').trim();

// Resolve Gist ID so all devices use the same Gist.
// 1. Canonical from build (REACT_APP_GIST_ID). 2. localStorage. 3. List Gists and pick by description (most recently updated).
const getOrResolveGistId = async () => {
  const canonical = getCanonicalGistId();
  if (canonical) return canonical;

  const fromStorage = getGistId();
  if (fromStorage) return fromStorage;

  const token = getGitHubToken();
  if (!token) return '';

  try {
    const response = await fetch('https://api.github.com/gists', {
      headers: {
        'Authorization': getAuthHeader(token),
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!response.ok) return '';

    const gists = await response.json();
    const matches = gists.filter(g => g.description && g.description.trim() === GIST_DESCRIPTION);
    const match = matches.length
      ? matches.sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0))[0]
      : null;
    if (match) {
      setGistId(match.id);
      return match.id;
    }
  } catch (e) {
    console.error('Error resolving Gist by description:', e);
  }
  return '';
};

// Get authorization header with correct format for GitHub API
const getAuthHeader = (token) => {
  // GitHub accepts both formats, but newer tokens (ghp_, gho_, ghu_) work better with Bearer
  if (token.startsWith('ghp_') || token.startsWith('gho_') || token.startsWith('ghu_')) {
    return `Bearer ${token}`;
  }
  // Fallback to token format for older tokens or custom formats
  return `token ${token}`;
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
        'Authorization': getAuthHeader(token),
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

// Get all RSVPs from the Gist (excluding deleted ones)
export const getRSVPs = async () => {
  const token = getGitHubToken();
  const gistId = await getOrResolveGistId();

  if (!token) {
    throw new Error('GitHub token not found. Please set REACT_APP_GITHUB_TOKEN or pass ?token=YOUR_TOKEN in the URL.');
  }

  if (!gistId) {
    // No Gist found by description; create a new one (e.g. first-time setup)
    await createGist();
    return [];
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': getAuthHeader(token),
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Gist doesn't exist, create a new one
        await createGist();
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
    const allRsvps = data.rsvps || [];
    // Filter out deleted records
    return allRsvps.filter(rsvp => !rsvp.deleted_at);
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    throw error;
  }
};

// Get only deleted RSVPs
export const getDeletedRSVPs = async () => {
  const token = getGitHubToken();
  const gistId = await getOrResolveGistId();

  if (!token) {
    throw new Error('GitHub token not found. Please set REACT_APP_GITHUB_TOKEN or pass ?token=YOUR_TOKEN in the URL.');
  }

  if (!gistId) {
    return [];
  }

  try {
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': getAuthHeader(token),
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
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
    const allRsvps = data.rsvps || [];
    // Return only deleted records
    return allRsvps.filter(rsvp => rsvp.deleted_at);
  } catch (error) {
    console.error('Error fetching deleted RSVPs:', error);
    throw error;
  }
};

// Add a new RSVP to the Gist
export const addRSVP = async (rsvpData) => {
  const token = getGitHubToken();
  let currentGistId = await getOrResolveGistId();

  if (!token) {
    throw new Error('GitHub token not found. Please set REACT_APP_GITHUB_TOKEN or pass ?token=YOUR_TOKEN in the URL.');
  }

  // Get existing RSVPs
  let existingRSVPs = [];

  if (!currentGistId) {
    // No Gist found by description; create a new one (first-time setup)
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
        'Authorization': getAuthHeader(token),
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

// Clear all RSVPs from the Gist
export const clearAllRSVPs = async () => {
  const token = getGitHubToken();
  const gistId = await getOrResolveGistId();

  if (!token) {
    throw new Error('GitHub token not found. Please set REACT_APP_GITHUB_TOKEN or pass ?token=YOUR_TOKEN in the URL.');
  }

  if (!gistId) {
    throw new Error('Gist ID not found. No RSVPs to clear.');
  }

  try {
    const authHeader = getAuthHeader(token);

    // Get current Gist to preserve created_at timestamp
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to fetch Gist:', error);
      throw new Error(error.message || 'Failed to fetch Gist');
    }

    const gist = await response.json();
    const file = gist.files[GIST_FILENAME];
    
    let existingData = {};
    if (file) {
      try {
        existingData = JSON.parse(file.content);
        console.log('Current RSVPs count:', existingData.rsvps?.length || 0);
      } catch (e) {
        // If parsing fails, use empty structure
        existingData = { rsvps: [] };
      }
    }

    // Update the Gist with empty RSVPs array, preserving created_at
    const updateResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify({
              rsvps: [],
              created_at: existingData.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
              cleared_at: new Date().toISOString()
            }, null, 2)
          }
        }
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error('Failed to update Gist:', error);
      throw new Error(error.message || 'Failed to clear RSVPs');
    }

    const updatedGist = await updateResponse.json();
    console.log('Gist updated successfully:', updatedGist.id);
    
    // Verify the update worked by fetching again
    const verifyResponse = await fetch(`https://api.github.com/gists/${gistId}?t=${Date.now()}`, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (verifyResponse.ok) {
      const verifiedGist = await verifyResponse.json();
      const verifiedFile = verifiedGist.files[GIST_FILENAME];
      if (verifiedFile) {
        const verifiedData = JSON.parse(verifiedFile.content);
        console.log('Verified RSVPs count after clear:', verifiedData.rsvps?.length || 0);
      }
    }

    return true;
  } catch (error) {
    console.error('Error clearing RSVPs:', error);
    throw error;
  }
};

// Delete an RSVP (soft delete - marks as deleted)
export const deleteRSVP = async (rsvpId) => {
  const token = getGitHubToken();
  const gistId = await getOrResolveGistId();

  if (!token) {
    throw new Error('GitHub token not found. Please set REACT_APP_GITHUB_TOKEN or pass ?token=YOUR_TOKEN in the URL.');
  }

  if (!gistId) {
    throw new Error('Gist ID not found.');
  }

  try {
    // Get current Gist
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': getAuthHeader(token),
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch Gist');
    }

    const gist = await response.json();
    const file = gist.files[GIST_FILENAME];
    
    if (!file) {
      throw new Error('RSVPs file not found in Gist');
    }

    const data = JSON.parse(file.content);
    const rsvps = data.rsvps || [];
    
    // Find and mark the RSVP as deleted
    const updatedRsvps = rsvps.map(rsvp => {
      if (rsvp.id === rsvpId || rsvp.id === String(rsvpId)) {
        return {
          ...rsvp,
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      return rsvp;
    });

    // Update the Gist
    const updateResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': getAuthHeader(token),
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify({
              ...data,
              rsvps: updatedRsvps,
              updated_at: new Date().toISOString()
            }, null, 2)
          }
        }
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.message || 'Failed to delete RSVP');
    }

    return true;
  } catch (error) {
    console.error('Error deleting RSVP:', error);
    throw error;
  }
};

// Undelete an RSVP
export const undeleteRSVP = async (rsvpId) => {
  const token = getGitHubToken();
  const gistId = await getOrResolveGistId();

  if (!token) {
    throw new Error('GitHub token not found. Please set REACT_APP_GITHUB_TOKEN or pass ?token=YOUR_TOKEN in the URL.');
  }

  if (!gistId) {
    throw new Error('Gist ID not found.');
  }

  try {
    // Get current Gist
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': getAuthHeader(token),
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch Gist');
    }

    const gist = await response.json();
    const file = gist.files[GIST_FILENAME];
    
    if (!file) {
      throw new Error('RSVPs file not found in Gist');
    }

    const data = JSON.parse(file.content);
    const rsvps = data.rsvps || [];
    
    // Find and remove the deleted_at field
    const updatedRsvps = rsvps.map(rsvp => {
      if (rsvp.id === rsvpId || rsvp.id === String(rsvpId)) {
        const { deleted_at, ...rest } = rsvp;
        return {
          ...rest,
          updated_at: new Date().toISOString()
        };
      }
      return rsvp;
    });

    // Update the Gist
    const updateResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': getAuthHeader(token),
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify({
              ...data,
              rsvps: updatedRsvps,
              updated_at: new Date().toISOString()
            }, null, 2)
          }
        }
      })
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      throw new Error(error.message || 'Failed to undelete RSVP');
    }

    return true;
  } catch (error) {
    console.error('Error undeleting RSVP:', error);
    throw error;
  }
};

// Get statistics
export const getStats = async () => {
  const rsvps = await getRSVPs(); // Already filters out deleted records
  
  const stats = {
    total: rsvps.length,
    going: rsvps.filter(r => r.going).length,
    not_going: rsvps.filter(r => !r.going).length,
    total_adults: rsvps.reduce((sum, r) => sum + (r.num_adults || 0), 0),
    total_kids: rsvps.reduce((sum, r) => sum + (r.num_kids || 0), 0)
  };

  return stats;
};


#!/usr/bin/env node
/**
 * One-time script: find all "Skye's Party RSVPs" Gists, collect RSVPs, merge into one Gist.
 * Usage: GITHUB_TOKEN=ghp_xxx node server/scripts/recover-rsvps.js
 *    or: REACT_APP_GITHUB_TOKEN in client/.env or server/.env (dotenv loaded)
 */

const path = require('path');
const fs = require('fs');

// Load env from server and client
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../client/.env') });

const GIST_DESCRIPTION = "Skye's Party RSVPs";
const GIST_FILENAME = 'rsvps.json';

const token = process.env.GITHUB_TOKEN || process.env.REACT_APP_GITHUB_TOKEN;

function authHeader(t) {
  if (!t) return '';
  if (t.startsWith('ghp_') || t.startsWith('gho_') || t.startsWith('ghu_')) return 'Bearer ' + t;
  return 'token ' + t;
}

async function main() {
  if (!token || token === 'YOUR_GITHUB_TOKEN_HERE') {
    console.error('Missing GitHub token. Set GITHUB_TOKEN or REACT_APP_GITHUB_TOKEN in .env or environment.');
    process.exit(1);
  }

  const headers = {
    Authorization: authHeader(token),
    Accept: 'application/vnd.github.v3+json',
  };

  console.log('Fetching your Gists...');
  const listRes = await fetch('https://api.github.com/gists', { headers });
  if (!listRes.ok) {
    console.error('GitHub API error:', listRes.status, await listRes.text());
    process.exit(1);
  }
  const gists = await listRes.json();
  const partyGists = gists.filter((g) => g.description && g.description.trim() === GIST_DESCRIPTION);

  if (partyGists.length === 0) {
    console.log('No Gists found with description "' + GIST_DESCRIPTION + '".');
    return;
  }

  console.log('Found', partyGists.length, 'Gist(s) with "' + GIST_DESCRIPTION + '".');

  const allGistData = [];
  let totalRsvps = 0;
  const seenIds = new Set();
  const combinedRsvps = [];

  for (const gist of partyGists) {
    const fullRes = await fetch(gist.url, { headers });
    if (!fullRes.ok) continue;
    const full = await fullRes.json();
    const file = full.files[GIST_FILENAME];
    let rsvps = [];
    if (file && file.content) {
      try {
        const data = JSON.parse(file.content);
        rsvps = (data.rsvps || []).filter((r) => !r.deleted_at);
      } catch (e) {
        rsvps = [];
      }
    }
    allGistData.push({ id: gist.id, url: gist.html_url, rsvps, created: gist.created_at });
    totalRsvps += rsvps.length;
    for (const r of rsvps) {
      const id = r.id || (r.name + (r.submitted_at || ''));
      if (!seenIds.has(id)) {
        seenIds.add(id);
        combinedRsvps.push(r);
      }
    }
  }

  console.log('Total RSVPs across Gists:', totalRsvps);
  console.log('Unique RSVPs after deduping:', combinedRsvps.length);
  allGistData.forEach((d, i) => {
    console.log('  Gist', i + 1, d.id, ':', d.rsvps.length, 'RSVP(s)');
  });

  if (combinedRsvps.length === 0) {
    console.log('No RSVPs to merge.');
    return;
  }

  const targetGistId = allGistData[0].id;
  console.log('\nMerging all into Gist', targetGistId, '...');

  const getRes = await fetch('https://api.github.com/gists/' + targetGistId, { headers });
  if (!getRes.ok) {
    console.error('Failed to fetch target Gist:', getRes.status);
    process.exit(1);
  }
  const gist = await getRes.json();
  const targetFile = gist.files[GIST_FILENAME];
  let created_at = new Date().toISOString();
  if (targetFile && targetFile.content) {
    try {
      const data = JSON.parse(targetFile.content);
      created_at = data.created_at || created_at;
    } catch (e) {}
  }

  const updateRes = await fetch('https://api.github.com/gists/' + targetGistId, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(
            {
              rsvps: combinedRsvps,
              created_at,
              updated_at: new Date().toISOString(),
              merged_at: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      },
    }),
  });

  if (!updateRes.ok) {
    console.error('Failed to update Gist:', updateRes.status, await updateRes.text());
    process.exit(1);
  }

  console.log('Done. Gist', targetGistId, 'now has', combinedRsvps.length, 'RSVPs.');
  console.log('Refresh your admin dashboard; all devices will now resolve to this Gist.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

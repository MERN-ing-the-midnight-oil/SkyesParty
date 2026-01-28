#!/usr/bin/env node

/**
 * Helper script to generate or get the single shared magic link
 * Usage: 
 *   node generate-links.js                    # Get/create the link
 *   node generate-links.js email@example.com  # Get/create and send to email
 */

const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function main() {
  const email = process.argv[2];
  
  try {
    if (email) {
      console.log(`\nGenerating magic link and sending to: ${email}...`);
      const response = await axios.post(`${API_URL}/auth/generate-link`, {
        email: email
      });
      
      console.log(`\n✅ Magic link:`);
      console.log(`   ${response.data.link}`);
      console.log(`   (Email sent to ${email})`);
    } else {
      console.log(`\nGetting magic link...`);
      const response = await axios.get(`${API_URL}/auth/get-link`);
      
      console.log(`\n✅ Magic link:`);
      console.log(`   ${response.data.link}`);
      console.log(`\n📧 You can share this link with anyone!`);
      console.log(`   Or use: node generate-links.js email@example.com to send via email`);
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('\n⚠️  No magic link found. Creating one...');
      try {
        const response = await axios.post(`${API_URL}/auth/generate-link`, email ? { email } : {});
        console.log(`\n✅ Magic link created:`);
        console.log(`   ${response.data.link}`);
        if (email) {
          console.log(`   (Email sent to ${email})`);
        }
      } catch (createError) {
        console.error('❌ Error:', createError.response?.data?.error || createError.message);
      }
    } else {
      console.error('❌ Error:', error.response?.data?.error || error.message);
    }
  }
  
  console.log('\n');
}

main().catch(console.error);


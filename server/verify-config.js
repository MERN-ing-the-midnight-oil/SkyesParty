#!/usr/bin/env node
/**
 * Configuration Verification Script
 * Checks if all required environment variables and setup are correct
 */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'rsvp.db');

console.log('\n🔍 Verifying Skye\'s Party Server Configuration...\n');
console.log('=' .repeat(60));

let allGood = true;

// Check Email Configuration
console.log('\n📧 Email Configuration:');
console.log('-'.repeat(60));

const sendgridKey = process.env.SENDGRID_API_KEY;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const adminEmail = process.env.ADMIN_EMAIL || 'r.smoker@gmail.com';
const fromEmail = process.env.FROM_EMAIL || 'noreply@skyesparty.com';

if (sendgridKey) {
  console.log('✅ SENDGRID_API_KEY:', sendgridKey.substring(0, 10) + '...' + ' (configured)');
  console.log('✅ Using SendGrid (no app password needed!)');
  console.log('✅ Email sending is ENABLED');
} else if (smtpUser && smtpPass) {
  console.log('✅ SMTP_USER:', smtpUser);
  console.log('✅ SMTP_PASS:', '*'.repeat(smtpPass.length) + ' (configured)');
  console.log('✅ Using SMTP (Gmail/Outlook/etc.)');
  console.log('✅ Email sending is ENABLED');
} else {
  console.log('❌ SENDGRID_API_KEY:', sendgridKey ? 'SET' : 'NOT SET');
  console.log('❌ SMTP_USER:', smtpUser || 'NOT SET');
  console.log('❌ SMTP_PASS:', smtpPass ? '*'.repeat(smtpPass.length) + ' (configured)' : 'NOT SET');
  console.log('⚠️  Email sending is DISABLED (emails will be mocked)');
  console.log('💡 TIP: Use SendGrid (easier - no app password needed!)');
  console.log('   See: server/SETUP_SENDGRID.md');
  allGood = false;
}

console.log('📬 ADMIN_EMAIL:', adminEmail);
console.log('📤 FROM_EMAIL:', fromEmail);

// Check Server Configuration
console.log('\n🖥️  Server Configuration:');
console.log('-'.repeat(60));
const port = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log('✅ PORT:', port);
console.log('🌐 FRONTEND_URL:', frontendUrl);

// Check Database
console.log('\n💾 Database Configuration:');
console.log('-'.repeat(60));

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log('❌ Cannot connect to database:', err.message);
    allGood = false;
    return;
  }
  
  console.log('✅ Database file exists and is accessible');
  
  // Check for magic links
  db.get('SELECT COUNT(*) as count FROM magic_links', [], (err, row) => {
    if (err) {
      console.log('❌ Error checking magic_links:', err.message);
      allGood = false;
    } else {
      const count = row.count;
      if (count > 0) {
        console.log(`✅ Found ${count} magic link token(s) in database`);
        
        // Get the first token
        db.get('SELECT token FROM magic_links LIMIT 1', [], (err, linkRow) => {
          if (!err && linkRow) {
            const magicLink = `${frontendUrl}?token=${linkRow.token}`;
            console.log('🔗 Magic Link:', magicLink);
          }
          db.close();
          printSummary();
        });
      } else {
        console.log('⚠️  No magic link tokens found in database');
        console.log('   Run: node generate-links.js to create one');
        db.close();
        printSummary();
      }
    }
  });
});

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Summary:');
  console.log('-'.repeat(60));
  
  if (allGood && (sendgridKey || (smtpUser && smtpPass))) {
    console.log('✅ All configurations look good!');
    console.log('✅ Email notifications will be sent to:', adminEmail);
  } else {
    console.log('⚠️  Some configurations need attention:');
    if (!sendgridKey && (!smtpUser || !smtpPass)) {
      console.log('   - Email credentials not configured');
      console.log('   - EASIEST: Use SendGrid (no app password needed!)');
      console.log('     See: server/SETUP_SENDGRID.md');
      console.log('   - OR: Use Gmail SMTP (requires app password)');
      console.log('     Create server/.env file with:');
      console.log('     SENDGRID_API_KEY=SG.your-key-here  (recommended)');
      console.log('     OR');
      console.log('     SMTP_USER=your-email@gmail.com');
      console.log('     SMTP_PASS=your-app-password');
      console.log('     ADMIN_EMAIL=r.smoker@gmail.com');
    }
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Ensure server/.env file exists with SMTP credentials');
  console.log('   2. For Gmail, use an App Password (not your regular password)');
  console.log('   3. Generate a magic link: node generate-links.js');
  console.log('   4. Test by submitting an RSVP through the form');
  console.log('\n');
}


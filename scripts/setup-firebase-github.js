#!/usr/bin/env node

/**
 * Automated Setup Script
 * Настраивает Firebase и GitHub автоматически
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

function executeCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function setup() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   WazalGames Center - Automatic Setup                  ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Firebase Setup
    console.log('📱 STEP 1: Firebase Setup');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const firebaseProjectId = await question('Enter Firebase Project ID: ');
    const apiKey = await question('Enter API Key from Firebase: ');
    const authDomain = await question('Enter Auth Domain (e.g., project.firebaseapp.com): ');
    const storageBucket = await question('Enter Storage Bucket (e.g., project.appspot.com): ');
    const messagingSenderId = await question('Enter Messaging Sender ID: ');
    const appId = await question('Enter App ID: ');

    // Update Firebase config
    const firebaseConfigPath = path.join(__dirname, '..', 'src', 'services', 'firebase.js');
    let firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');

    firebaseConfig = firebaseConfig
      .replace('YOUR_API_KEY', apiKey)
      .replace('YOUR_PROJECT_ID', firebaseProjectId)
      .replace('YOUR_SENDER_ID', messagingSenderId)
      .replace('YOUR_APP_ID', appId);

    firebaseConfig = firebaseConfig
      .replace(/YOUR_PROJECT_ID\.firebaseapp\.com/g, authDomain)
      .replace(/YOUR_PROJECT_ID\.appspot\.com/g, storageBucket);

    fs.writeFileSync(firebaseConfigPath, firebaseConfig);

    // Also update script configs
    const scriptFiles = [
      path.join(__dirname, 'upload-game.js'),
      path.join(__dirname, 'sync-github.js'),
      path.join(__dirname, 'update-games.js'),
      path.join(__dirname, 'load-local-games.js')
    ];

    for (const filePath of scriptFiles) {
      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content
          .replace('YOUR_API_KEY', apiKey)
          .replace(/YOUR_PROJECT_ID/g, firebaseProjectId)
          .replace('YOUR_SENDER_ID', messagingSenderId)
          .replace('YOUR_APP_ID', appId)
          .replace(/YOUR_PROJECT_ID\.firebaseapp\.com/g, authDomain)
          .replace(/YOUR_PROJECT_ID\.appspot\.com/g, storageBucket);
        fs.writeFileSync(filePath, content);
      }
    }

    console.log('✅ Firebase configured!\n');

    // Step 2: GitHub Setup
    console.log('🐙 STEP 2: GitHub Setup');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('1. Create a NEW GitHub repository at: https://github.com/new');
    console.log('2. Name it: WazalGames-Center');
    console.log('3. Leave other settings as default');
    console.log('4. Click "Create repository"\n');

    const githubUsername = await question('Enter your GitHub username: ');
    const githubToken = await question('Enter your GitHub token (from https://github.com/settings/tokens): ');

    // Step 3: Initialize Git
    console.log('\n🔧 STEP 3: Initializing Git Repository');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const projectDir = path.join(__dirname, '..');

    try {
      await executeCommand(`cd "${projectDir}" && git init`);
      console.log('✅ Git initialized');

      await executeCommand(`cd "${projectDir}" && git config user.name "${githubUsername}"`);
      await executeCommand(`cd "${projectDir}" && git config user.email "${githubUsername}@users.noreply.github.com"`);
      console.log('✅ Git configured');

      // Add all files
      await executeCommand(`cd "${projectDir}" && git add .`);
      console.log('✅ Files staged');

      // Initial commit
      await executeCommand(`cd "${projectDir}" && git commit -m "Initial commit: WazalGames Center"`);
      console.log('✅ Initial commit created');

      // Create main branch
      await executeCommand(`cd "${projectDir}" && git branch -M main`);
      console.log('✅ Main branch created');

      // Add remote
      const remoteUrl = `https://${githubUsername}:${githubToken}@github.com/${githubUsername}/WazalGames-Center.git`;
      await executeCommand(`cd "${projectDir}" && git remote add origin ${remoteUrl}`);
      console.log('✅ Remote added');

      // Push to GitHub
      console.log('\n📤 Pushing to GitHub...');
      await executeCommand(`cd "${projectDir}" && git push -u origin main`);
      console.log('✅ Pushed to GitHub!\n');

    } catch (gitError) {
      console.log('⚠️  Git setup issue. You may need to push manually:');
      console.log(`   git remote add origin https://github.com/${githubUsername}/WazalGames-Center.git`);
      console.log('   git push -u origin main\n');
    }

    // Step 4: Create Admin User
    console.log('\n👤 STEP 4: Create Admin User');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const adminEmail = await question('Enter admin email: ');
    console.log('\n✅ Save this email! You\'ll use it to sign in as admin.');
    console.log('   After login, manually update user role in Firebase Console:\n');
    console.log('   1. Go to: https://console.firebase.google.com');
    console.log('   2. Select your project');
    console.log('   3. Go to Firestore Database');
    console.log('   4. Find users collection');
    console.log('   5. Edit the admin user document');
    console.log('   6. Add field: role = "admin"\n');

    // Step 5: Summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              ✅ Setup Complete!                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📋 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Firebase Project: ${firebaseProjectId}`);
    console.log(`GitHub Repo: https://github.com/${githubUsername}/WazalGames-Center`);
    console.log(`Admin Email: ${adminEmail}`);
    console.log('\n🚀 NEXT STEPS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. npm install');
    console.log('2. npm run dev');
    console.log('3. Sign up with admin email');
    console.log('4. Update user role to "admin" in Firebase');
    console.log('5. Access /admin panel');
    console.log('6. Upload games and configure!\n');

  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup();

#!/usr/bin/env node

/**
 * Sync GitHub Releases Script
 * Загружает игры из GitHub releases
 *
 * Использование:
 * node scripts/sync-github.js username/repo
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import axios from 'axios';

// Firebase конфиг - замени на свой
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getGitHubReleases(repo) {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repo}/releases`);
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub releases:', error.message);
    return [];
  }
}

async function syncGames() {
  const repo = process.argv[2];

  if (!repo) {
    console.log('Usage: node scripts/sync-github.js username/repo');
    console.log('Example: node scripts/sync-github.js yourname/Elvo-Tanks-Battles');
    process.exit(1);
  }

  try {
    console.log(`\n=== Syncing games from ${repo} ===\n`);

    const releases = await getGitHubReleases(repo);

    if (releases.length === 0) {
      console.log('No releases found.');
      return;
    }

    for (const release of releases) {
      const gameName = release.name || release.tag_name;

      // Check if game already exists
      const q = query(collection(db, 'games'), where('name', '==', gameName));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const gameData = {
          name: gameName,
          description: release.body || 'No description available',
          genre: 'Action', // Измени на нужный жанр
          releaseDate: new Date(release.published_at).toISOString().split('T')[0],
          downloadUrl: release.assets[0]?.browser_download_url || release.html_url,
          coverImage: 'https://via.placeholder.com/300x400?text=' + gameName.replace(/ /g, '+'),
          rating: 0,
          downloads: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          type: 'pc',
          repository: {
            name: repo,
            url: release.html_url
          },
          screenshots: [],
          requirements: {
            minOS: 'Windows 10',
            minRAM: '8 GB',
            minStorage: '50 GB'
          }
        };

        const docRef = await addDoc(collection(db, 'games'), gameData);
        console.log(`✅ Added: ${gameName}`);
      } else {
        console.log(`⏭️  Skipped: ${gameName} (already exists)`);
      }
    }

    console.log('\n✅ Sync completed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

syncGames();

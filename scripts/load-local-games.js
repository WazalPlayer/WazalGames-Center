#!/usr/bin/env node

/**
 * Load Local Games Script
 * Загружает игры из папки games/pc в Firestore
 *
 * Использование:
 * node scripts/load-local-games.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Firebase конфиг
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

// Метаданные игр
const gamesMetadata = {
  'ElvoTanksBattles.exe': {
    name: 'Elvo Tanks Battles',
    description: 'Strategic tank warfare game with intense multiplayer battles. Control your tank and defeat enemies in various maps and game modes.',
    genre: 'Action',
    releaseDate: '2024-01-15',
    coverImage: 'https://via.placeholder.com/400x300?text=Elvo+Tanks+Battles',
    screenshots: [
      'https://via.placeholder.com/800x600?text=Elvo+Tanks+Screenshot+1',
      'https://via.placeholder.com/800x600?text=Elvo+Tanks+Screenshot+2'
    ],
    rating: 8.5
  },
  'IronFront1939_x64.exe': {
    name: 'Iron Front 1939',
    description: 'Experience World War 2 in a tactical strategy game. Lead your forces through historical campaigns with realistic military gameplay.',
    genre: 'Strategy',
    releaseDate: '2024-02-10',
    coverImage: 'https://via.placeholder.com/400x300?text=Iron+Front+1939',
    screenshots: [
      'https://via.placeholder.com/800x600?text=IronFront+Screenshot+1',
      'https://via.placeholder.com/800x600?text=IronFront+Screenshot+2'
    ],
    rating: 9.0
  }
};

async function loadGames() {
  try {
    console.log('\n=== Loading Local Games ===\n');

    const gamesPath = path.join(__dirname, '..', 'games', 'pc');

    // Check if games folder exists
    if (!fs.existsSync(gamesPath)) {
      console.log('❌ Games folder not found:', gamesPath);
      return;
    }

    // Get all exe files
    const files = fs.readdirSync(gamesPath).filter(file => file.endsWith('.exe'));

    if (files.length === 0) {
      console.log('No games found in', gamesPath);
      return;
    }

    console.log(`Found ${files.length} games\n`);

    for (const file of files) {
      const filePath = path.join(gamesPath, file);
      const fileSize = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);
      const metadata = gamesMetadata[file] || {};

      // Check if game already exists
      const q = query(collection(db, 'games'), where('name', '==', metadata.name));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const gameData = {
          name: metadata.name || file.replace('.exe', ''),
          description: metadata.description || 'A great game to play',
          genre: metadata.genre || 'Action',
          releaseDate: metadata.releaseDate || new Date().toISOString().split('T')[0],
          fileSize: `${fileSize} MB`,
          downloadUrl: file, // Local file reference
          exePath: `games/pc/${file}`,
          coverImage: metadata.coverImage,
          screenshots: metadata.screenshots || [],
          rating: metadata.rating || 0,
          downloads: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          type: 'pc',
          requirements: {
            minOS: 'Windows 10 64-bit',
            minRAM: '8 GB',
            minStorage: '20 GB',
            minProcessor: 'Intel i5 or AMD Ryzen 5'
          }
        };

        const docRef = await addDoc(collection(db, 'games'), gameData);
        console.log(`✅ Added: ${gameData.name}`);
        console.log(`   Size: ${fileSize} MB`);
        console.log(`   ID: ${docRef.id}\n`);
      } else {
        console.log(`⏭️  Skipped: ${metadata.name || file} (already exists)\n`);
      }
    }

    console.log('✅ All games loaded!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

console.log('⚠️  Make sure your Firebase config is set in this file!');
console.log('Update firebaseConfig variable with your credentials.\n');

// Auto-load games
loadGames();

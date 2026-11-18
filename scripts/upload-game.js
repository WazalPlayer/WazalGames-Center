#!/usr/bin/env node

/**
 * Upload Game Script
 * Загружает новую игру в Firestore
 *
 * Использование:
 * node scripts/upload-game.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

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
const storage = getStorage(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function uploadGameCover(filePath) {
  try {
    const fileName = path.basename(filePath);
    const fileRef = ref(storage, `games/covers/${Date.now()}_${fileName}`);
    const fileBuffer = fs.readFileSync(filePath);

    await uploadBytes(fileRef, fileBuffer);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error uploading cover:', error);
    return 'https://via.placeholder.com/300x400?text=Game+Cover';
  }
}

async function uploadGame() {
  try {
    console.log('\n=== WazalGames - Upload New Game ===\n');

    const name = await question('Game Name: ');
    const description = await question('Description: ');
    const genre = await question('Genre (Action/Adventure/RPG/Strategy/Puzzle/Shooter): ');
    const releaseDate = await question('Release Date (YYYY-MM-DD): ');
    const fileSize = await question('File Size (e.g., 2.5 GB): ');
    const downloadUrl = await question('Download URL (GitHub or Drive): ');
    const coverPath = await question('Cover Image Path: ');
    const rating = await question('Rating (0-10): ');

    console.log('\nUploading cover image...');
    let coverUrl = 'https://via.placeholder.com/300x400?text=Game+Cover';

    if (coverPath && fs.existsSync(coverPath)) {
      coverUrl = await uploadGameCover(coverPath);
      console.log('✅ Cover uploaded!');
    }

    const gameData = {
      name: name,
      description: description,
      genre: genre,
      releaseDate: releaseDate,
      fileSize: fileSize,
      downloadUrl: downloadUrl,
      coverImage: coverUrl,
      rating: parseInt(rating) || 0,
      downloads: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'pc', // или 'mobile'
      screenshots: [],
      requirements: {
        minOS: 'Windows 10',
        minRAM: '8 GB',
        minStorage: '50 GB'
      }
    };

    const docRef = await addDoc(collection(db, 'games'), gameData);

    console.log('\n✅ Game uploaded successfully!');
    console.log(`Game ID: ${docRef.id}`);
    console.log(`Game: ${name}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

uploadGame();

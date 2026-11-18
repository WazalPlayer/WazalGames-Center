#!/usr/bin/env node

/**
 * Update Games Script
 * Обновляет информацию о существующих играх
 *
 * Использование:
 * node scripts/update-games.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import readline from 'readline';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function listGames() {
  try {
    const gamesSnap = await getDocs(collection(db, 'games'));
    const games = [];

    console.log('\n=== Available Games ===\n');
    gamesSnap.forEach((doc, index) => {
      const game = doc.data();
      games.push({ id: doc.id, ...game });
      console.log(`${index + 1}. ${game.name}`);
    });

    return games;
  } catch (error) {
    console.error('Error fetching games:', error.message);
    return [];
  }
}

async function updateGame(gameId, gameData) {
  try {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      ...gameData,
      updatedAt: new Date()
    });
    console.log('✅ Game updated successfully!');
  } catch (error) {
    console.error('Error updating game:', error.message);
  }
}

async function main() {
  try {
    const games = await listGames();

    if (games.length === 0) {
      console.log('No games found.');
      rl.close();
      return;
    }

    const choiceStr = await question('\nEnter game number to update (or 0 to exit): ');
    const choice = parseInt(choiceStr) - 1;

    if (choice < 0 || choice >= games.length) {
      console.log('Cancelled.');
      rl.close();
      return;
    }

    const game = games[choice];
    console.log(`\nUpdating: ${game.name}`);

    const newRating = await question(`Rating (current: ${game.rating}): `);
    const newDownloads = await question(`Downloads (current: ${game.downloads}): `);
    const newDescription = await question('Description (leave empty to skip): ');

    const updateData = {};
    if (newRating) updateData.rating = parseFloat(newRating);
    if (newDownloads) updateData.downloads = parseInt(newDownloads);
    if (newDescription) updateData.description = newDescription;

    if (Object.keys(updateData).length > 0) {
      await updateGame(game.id, updateData);
    } else {
      console.log('No updates provided.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
  }
}

main();

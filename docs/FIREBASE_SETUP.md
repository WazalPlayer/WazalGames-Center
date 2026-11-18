# Firebase Setup для WazalGames Center

## Шаг 1: Создание Firebase проекта

1. Перейди на https://console.firebase.google.com
2. Нажми "Создать проект" или "Add project"
3. Введи имя проекта: `WazalGames` (или любое другое)
4. Выбери регион (рекомендуется Europe - для лучшей скорости)
5. Нажми "Create project"

## Шаг 2: Получение SDK конфигурации

1. В Firebase Console выбери Settings (⚙️) > Project settings
2. В разделе "Your apps" нажми на иконку `</>` для web
3. Регистрируй app с именем: `WazalGames Center`
4. Скопируй конфиг (будет выглядеть так):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",
  authDomain: "wazalgames-xxxxx.firebaseapp.com",
  projectId: "wazalgames-xxxxx",
  storageBucket: "wazalgames-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234567"
};
```

5. Вставь эти значения в `src/services/firebase.js`

## Шаг 3: Включение Authentication (Аутентификация)

1. В Firebase Console выбери **Authentication**
2. Нажми на вкладку **Sign-in method**
3. Включи:
   - Email/Password
   - Google
4. Для Google нужно:
   - Перейти в APIs & Services
   - Создать OAuth 2.0 Client ID для Web
   - Добавить authorized redirect URIs: `localhost:5173`, твой домен

## Шаг 4: Создание Firestore Database

1. Выбери **Firestore Database**
2. Нажми **Create database**
3. Выбери режим: **Start in test mode** (для разработки)
4. Выбери регион: Europe (или ближайший к тебе)

**Security Rules для Firestore** (вставь это в правила):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    match /friends/{uid}/friendsList/{friendId} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

## Шаг 5: Настройка Cloud Storage (для аватарок и скриншотов)

1. Выбери **Storage**
2. Нажми **Get started**
3. Выбери режим: **Start in test mode**
4. Выбери регион: Europe

**Security Rules для Storage**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{filename} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    match /screenshots/{userId}/{filename} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    match /games/{gameId}/{filename} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Шаг 6: Включение Realtime Database (для чата)

1. Выбери **Realtime Database**
2. Нажми **Create Database**
3. Выбери регион
4. Начни в test mode

**Security Rules**:

```json
{
  "rules": {
    "chats": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$chatId": {
        "messages": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    },
    "userStatus": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$uid": {
        ".read": "auth != null",
        ".write": "root.child('users').child(auth.uid).exists()"
      }
    }
  }
}
```

## Завершение

После всех шагов у тебя должны быть:
- ✅ Firebase Project
- ✅ SDK Config в `src/services/firebase.js`
- ✅ Authentication (Email + Google)
- ✅ Firestore Database
- ✅ Cloud Storage
- ✅ Realtime Database

Теперь запускай приложение с `npm run dev` 🚀

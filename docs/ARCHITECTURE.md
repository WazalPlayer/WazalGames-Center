# 🏗️ Архитектура WazalGames Center

## 📊 Общая Структура

```
┌─────────────────────────────────────────────────────────┐
│                   WazalGames Center                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (React)                                       │
│  ├── Pages (7 страниц)                                │
│  ├── Components (переиспользуемые)                     │
│  └── Services (Firebase интеграция)                    │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Backend & Database (Firebase)                         │
│  ├── Authentication (Email + Google)                   │
│  ├── Firestore (основные данные)                       │
│  ├── Storage (аватарки, обложки)                       │
│  └── Realtime DB (чат, статус)                         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Scripts (Node.js)                                     │
│  ├── upload-game.js (загрузить игру)                   │
│  ├── sync-github.js (синхронизировать)                 │
│  └── update-games.js (обновить игру)                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🗄️ Структура Базы Данных

### Firestore Collections

#### `users` Collection
```javascript
{
  uid: "user_id",
  username: "player_name",
  email: "user@example.com",
  avatar: "image_url",
  bio: "user biography",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  gameAccounts: {
    "game_name": {
      username: "game_username",
      password: "encrypted_password",
      level: 50,
      playtime: 1000
    }
  },
  friends: ["friend_id_1", "friend_id_2"],
  blockedUsers: ["blocked_user_id"],
  stats: {
    gamesDownloaded: 5,
    gamesPlayed: 3,
    playtime: 2000,
    totalReviews: 10
  }
}
```

#### `games` Collection
```javascript
{
  id: "game_id",
  name: "Game Name",
  description: "Full description",
  genre: "Action",
  releaseDate: "2024-01-01",
  fileSize: "2.5 GB",
  downloadUrl: "https://github.com/...",
  coverImage: "image_url",
  rating: 8.5,
  downloads: 150,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  type: "pc", // или "mobile"
  screenshots: ["url1", "url2"],
  requirements: {
    minOS: "Windows 10",
    minRAM: "8 GB",
    minStorage: "50 GB",
    minProcessor: "Intel i5"
  },
  repository: {
    name: "username/repo",
    url: "https://github.com/..."
  }
}
```

#### `reviews` Collection
```javascript
{
  id: "review_id",
  gameId: "game_id",
  userId: "user_id",
  username: "reviewer_name",
  rating: 5,
  comment: "Great game!",
  createdAt: Timestamp,
  likes: 25,
  helpful: 10
}
```

#### `friends` Collection (Subcollection users/{uid}/friendsList)
```javascript
{
  friendId: "friend_user_id",
  addedAt: Timestamp,
  status: "active" // или "blocked"
}
```

### Firebase Realtime Database

#### `/chats/{chatId}/messages`
```json
{
  "msg1": {
    "sender": "user_id",
    "text": "Hello!",
    "timestamp": 1234567890
  }
}
```

#### `/userStatus/{uid}`
```json
{
  "online": true,
  "lastSeen": 1234567890,
  "currentGame": "game_name"
}
```

## 🎯 Компоненты React

### Страницы (Pages)
1. **LoginPage** - Аутентификация (email + Google)
2. **HomePage** - Главная страница с статистикой
3. **GamesPage** - Каталог игр с фильтром
4. **GameDetailPage** - Детали игры + отзывы
5. **ProfilePage** - Профиль пользователя
6. **FriendsPage** - Список друзей и добавление
7. **ChatPage** - Чат с другом

### Компоненты (Components)
1. **Navbar** - Навигация и меню профиля

## 🔄 Data Flow

```
User Login
    ↓
Firebase Auth (email/Google)
    ↓
Создание User Document в Firestore
    ↓
Redirect to Home Page
    ↓
Загрузка Games из Firestore
    ↓
Display Games Grid
    ↓
User Click на Game
    ↓
Load Game Details + Reviews
    ↓
User может написать Review → добавляется в Firestore
```

## 🔐 Security Rules

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: только они могут читать/писать свои данные
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Games: все могут читать, только админ пишет
    match /games/{gameId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Reviews: все могут читать, юзеры пишут свои
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }
    
    // Friends: только пользователь может управлять
    match /users/{uid}/friendsList/{friendId} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Аватарки
    match /avatars/{userId}/{filename} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    // Скриншоты
    match /screenshots/{userId}/{filename} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## 📱 Адаптивный Дизайн

### Breakpoints
- **Mobile**: < 768px (одна колона)
- **Tablet**: 768px - 1024px (две колоны)
- **Desktop**: > 1024px (три колоны)

## 🔄 Жизненный Цикл Игры

```
1. Developer загружает릴리스 на GitHub
   ↓
2. Admin запускает: node scripts/sync-github.js username/repo
   ↓
3. Скрипт получает релиз через GitHub API
   ↓
4. Создает Document в Firestore collection 'games'
   ↓
5. Пользователь видит игру в каталоге
   ↓
6. Может скачать, добавить в профиль, написать отзыв
   ↓
7. Admin может обновить инфо: node scripts/update-games.js
```

## 🚀 Развертывание

### Локально
```bash
npm install
npm run dev
```

### На Firebase Hosting
```bash
npm run build
firebase deploy
```

### На других платформах
- Vercel
- Netlify
- AWS
- Google Cloud

## 🔗 API Интеграции

### GitHub API
- Получение релизов
- Автоматическая загрузка версий

### Firebase APIs
- Authentication (email, Google)
- Firestore (CRUD операции)
- Storage (загрузка файлов)
- Realtime Database (чат)

## 📈 Масштабирование

### Текущие лимиты
- **Firestore**: ~1 млн документов
- **Storage**: Не ограничено
- **Users**: ~100k одновременно
- **Realtime DB**: ~1 млн сообщений/день

### Оптимизация
- Индексирование часто используемых полей
- Кэширование на фронтенде
- Paginated загрузка игр
- Сжатие изображений перед загрузкой

## 🛡️ Authentication Flow

```
User enters email/password
    ↓
Firebase.auth.createUserWithEmailAndPassword()
    ↓
User created in Firebase Auth
    ↓
Create User document in Firestore
    ↓
Save to localStorage
    ↓
Redirect to home page
```

## 📊 Performance Metrics

- **FCP** (First Contentful Paint): < 2s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time To Interactive): < 3.5s

---

**Архитектура готова к расширению!** 🚀

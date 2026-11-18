# 🎮 WazalGames Center

**WazalGames Center** - это платформа для распределения и скачивания игр с поддержкой ПК и мобильных устройств.

## ✨ Основные Функции

### 🔐 Аутентификация
- ✅ Email/Password авторизация
- ✅ Google Sign-In
- ✅ Локальное сохранение сессии

### 🎮 Управление Играми
- ✅ Каталог всех игр
- ✅ Фильтрация по жанру
- ✅ Поиск по названию
- ✅ Загрузка игр
- ✅ Информация о требованиях

### 👤 Профиль Пользователя
- ✅ Аватарка
- ✅ Сохранение учетных данных для игр
- ✅ Статистика игрока
- ✅ Биография

### 👥 Социальные Функции
- ✅ Список друзей
- ✅ Добавление друзей
- ✅ Встроенный чат (Realtime Database)
- ✅ Просмотр профилей

### ⭐ Отзывы и Рейтинги
- ✅ Оставление отзывов на игры
- ✅ Рейтинговая система (1-5 звезд)
- ✅ Просмотр отзывов других пользователей

### 📊 Статистика
- ✅ Количество скачанных игр
- ✅ Общее время игры
- ✅ Уровень игрока
- ✅ Список друзей

## 🚀 Быстрый Старт

### Требования
- Node.js 16+
- npm или yarn
- Firebase Project (бесплатный уровень подходит)

### Шаг 1: Установка Зависимостей

```bash
npm install
```

### Шаг 2: Настройка Firebase

1. Перейди на [Firebase Console](https://console.firebase.google.com)
2. Создай новый проект
3. Получи SDK конфиг
4. Обнови `src/services/firebase.js` с твоим конфигом

Подробные инструкции смотри в `docs/FIREBASE_SETUP.md`

### Шаг 3: Запуск Приложения

```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`

### Шаг 4: Загрузка Первых Игр

```bash
# Загрузить игру вручную
node scripts/upload-game.js

# Синхронизировать с GitHub releases
node scripts/sync-github.js username/repo-name
```

## 📂 Структура Проекта

```
WazalGames Center/
├── src/
│   ├── components/        # Переиспользуемые компоненты
│   │   └── Navbar.jsx
│   ├── pages/             # Страницы приложения
│   │   ├── LoginPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── GamesPage.jsx
│   │   ├── GameDetailPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── FriendsPage.jsx
│   │   └── ChatPage.jsx
│   ├── services/          # Сервисы (Firebase, API)
│   │   └── firebase.js
│   ├── App.jsx            # Главный компонент
│   ├── App.css            # Глобальные стили
│   ├── index.css          # CSS переменные
│   └── main.jsx           # Точка входа
├── public/                # Статические файлы
├── scripts/               # Скрипты управления
│   ├── upload-game.js     # Загрузить игру
│   ├── sync-github.js     # Синхронизировать с GitHub
│   └── update-games.js    # Обновить информацию игры
├── games/                 # Папки для игр
│   ├── pc/
│   └── mobile/
├── docs/                  # Документация
│   └── FIREBASE_SETUP.md
├── package.json
├── vite.config.js
└── index.html
```

## 📝 Как Загружать Игры

### Вариант 1: Вручную через скрипт

```bash
node scripts/upload-game.js
```

Скрипт попросит ввести:
- Название игры
- Описание
- Жанр
- Дату выхода
- Размер файла
- Ссылку на скачивание
- Путь к изображению обложки

### Вариант 2: Синхронизировать с GitHub

```bash
node scripts/sync-github.js yourname/game-repository
```

Скрипт автоматически загрузит все релизы из GitHub как игры.

### Вариант 3: Обновить существующую игру

```bash
node scripts/update-games.js
```

## 🛠️ Технологический Стек

### Frontend
- **React 18** - UI фреймворк
- **React Router v6** - Маршрутизация
- **Vite** - Сборщик
- **CSS3** - Стили с переменными и анимациями

### Backend & Database
- **Firebase Authentication** - Аутентификация
- **Firestore** - Основная БД
- **Firebase Storage** - Хранилище файлов
- **Firebase Realtime Database** - Чат и real-time функции

### Инструменты
- **Node.js** - Скрипты управления
- **Axios** - HTTP запросы

## 🎨 Дизайн

### Цветовая Палитра
- **Primary**: #6366f1 (Индиго)
- **Secondary**: #8b5cf6 (Фиолетовый)
- **Background**: #020617 → #0f172a (Градиент)
- **Text**: #f1f5f9 (Светлый)

### Особенности
- 🌙 Dark Mode по умолчанию
- 📱 Полная адаптивность (Mobile-first)
- ✨ Плавные анимации и переходы
- 🎭 Glassmorphism дизайн (размытые фоны)

## 📱 Версии

### ПК Версия
- Главная доступна на `localhost:5173`
- Оптимизирована для экранов 1920x1080+
- Поддерживает все функции

### Мобильная Версия
- Автоматическое масштабирование
- Вертикальная и горизонтальная ориентация
- Touch-friendly интерфейс
- Оптимизирована для экранов 375x812+

## 🔧 Команды

```bash
# Развитие
npm run dev              # Запустить dev сервер

# Производство
npm run build            # Собрать проект
npm run preview          # Превью production сборки

# Игры
node scripts/upload-game.js      # Загрузить новую игру
node scripts/sync-github.js      # Синхронизировать с GitHub
node scripts/update-games.js     # Обновить игру
```

## 📚 Документация

- [Firebase Setup Guide](docs/FIREBASE_SETUP.md) - Подробная настройка Firebase
- [API Documentation](docs/API.md) - Документация API (если будет)
- [Deployment Guide](docs/DEPLOYMENT.md) - Развертывание (если будет)

## 🚀 Развертывание

### На Firebase Hosting (Рекомендуется)

```bash
# Установить CLI
npm install -g firebase-tools

# Инициализировать
firebase init

# Собрать проект
npm run build

# Развернуть
firebase deploy
```

### На Vercel

```bash
# Установить Vercel CLI
npm i -g vercel

# Развернуть
vercel
```

### На Netlify

1. Собери проект: `npm run build`
2. Загрузи папку `dist` на Netlify

## 🐛 Решение Проблем

### Firebase не работает
- ✅ Проверь конфиг в `src/services/firebase.js`
- ✅ Убедись что Firestore включена
- ✅ Проверь Security Rules

### Игры не загружаются
- ✅ Проверь ссылку на скачивание
- ✅ Убедись что Firebase Storage включен
- ✅ Проверь права доступа

### Мобильная версия не работает
- ✅ Проверь viewport meta tag
- ✅ Очисти кэш браузера
- ✅ Проверь viewport в DevTools

## 📞 Поддержка

Если что-то не работает:
1. Проверь консоль браузера (F12)
2. Прочитай логи в Firebase Console
3. Проверь правильность конфигурации

## 📄 Лицензия

MIT License - используй свободно

## 👨‍💻 Разработка

Создано для WazalGames как платформа для распределения игр.

Текущий статус: **In Development** 🚧

## 🎯 План Развития

- [ ] Функция записи видео (медаль-подобная)
- [ ] Встроенный лаунчер игр
- [ ] Система достижений
- [ ] Лидерборд
- [ ] Поддержка мультиплеера
- [ ] Mobile App (React Native)
- [ ] Desktop App (Electron)

---

**Готов к использованию!** 🎉

Если у тебя есть вопросы или предложения, обращайся! 👨‍💻

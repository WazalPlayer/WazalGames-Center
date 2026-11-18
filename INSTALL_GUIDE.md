# 🚀 WazalGames Center - Полная Инструкция Установки

## 📋 Что Включено Сейчас

✅ **Админ Панель** - управление играми через веб-интерфейс  
✅ **Две Игры Загружены** - Elvo Tanks Battles, Iron Front 1939  
✅ **Скрипты для Загрузки** - автоматическая загрузка локальных игр  
✅ **Electron Конфиг** - для сборки в exe файл  
✅ **Автоматическая Настройка** - Firebase + GitHub за 1 команду  

## 🎯 Быстрый Старт (5 минут)

### 1️⃣ Автоматическая Настройка

```bash
cd "E:\WazalGames Center"
node scripts/setup-firebase-github.js
```

Скрипт попросит:
- **Firebase Project ID** - название проекта (например: `wazalgames-center`)
- **API Key** - из Firebase Console
- **Auth Domain** - из Firebase Console
- **Storage Bucket** - из Firebase Console
- **Messaging Sender ID** - из Firebase Console
- **App ID** - из Firebase Console
- **GitHub Username** - твой логин GitHub
- **GitHub Token** - твой персональный токен GitHub

**Скрипт сам:**
- ✅ Обновит все конфиги
- ✅ Инициализирует Git
- ✅ Создаст репозиторий на GitHub
- ✅ Загрузит все файлы

### 2️⃣ Получение Ключей Firebase (5 минут)

1. Перейди на https://console.firebase.google.com
2. Нажми **"Создать проект"**
3. Введи название: `wazalgames-center`
4. Следуй инструкциям
5. Когда проект создан, нажми на **"Добавить приложение"** (иконка `</>`)
6. Скопируй конфиг (будут все нужные ключи)

### 3️⃣ Создание GitHub Токена (2 минуты)

1. Перейди на https://github.com/settings/tokens
2. Нажми **"Generate new token"** (classic)
3. Дай ему имя: `wazalgames`
4. Выбери права: `repo`, `workflow`
5. Скопируй токен
6. ⚠️ **ВАЖНО**: сохрани его, больше не увидишь!

### 4️⃣ Установка Зависимостей

```bash
cd "E:\WazalGames Center"
npm install
```

Это установит:
- React, Vite
- Firebase SDK
- Electron (для exe файла)
- Все скрипты

### 5️⃣ Запуск Приложения

```bash
npm run dev
```

Откроется на `http://localhost:5173`

### 6️⃣ Вход в Админ Панель

1. Создай аккаунт со своим email
2. Перейди на `/admin`
3. ⚠️ **Доступ запрещен** - нужна роль `admin`

**Как сделать себя админом:**

1. Перейди на https://console.firebase.google.com
2. Выбери свой проект
3. Перейди в **Firestore Database**
4. Найди **users** collection
5. Найди свой email в документах
6. Нажми **Edit**
7. Добавь поле: `role` = `"admin"`
8. Сохрани
9. Обнови страницу приложения - теперь доступна админ панель!

### 7️⃣ Загрузка Игр

#### Способ 1: Автоматически из папки `games/pc`

```bash
node scripts/load-local-games.js
```

Скрипт найдет все `.exe` файлы и загрузит их:
- ✅ ElvoTanksBattles.exe (180 MB)
- ✅ IronFront1939_x64.exe (144 MB)

#### Способ 2: Через Админ Панель

1. Перейди на `/admin`
2. Нажми **"+ Add Game"**
3. Заполни форму:
   - Название
   - Описание
   - Жанр
   - Дату выхода
   - Размер файла
   - Ссылку для скачивания
   - Загрузи обложку
4. Нажми **"Add Game"**

#### Способ 3: Вручную через скрипт

```bash
node scripts/upload-game.js
```

## 🛠️ Сборка в EXE Файл

### Требования
- Node.js 16+
- Windows 10/11 (для сборки на Windows)

### Сборка

```bash
# Установи дополнительные зависимости
npm install

# Собери приложение и EXE файл
npm run electron-build
```

Файлы появятся в папке `dist/`:
- `WazalGames Center Setup.exe` - установщик
- `WazalGames Center.exe` - портативная версия

### Запуск в режиме разработки Electron

```bash
npm run electron-dev
```

Откроет окно программы с приложением.

## 📱 Версии

| Версия | Запуск | Для |
|--------|--------|-----|
| **Web** | `npm run dev` | Браузер, веб-приложение |
| **Desktop** | `npm run electron-dev` | Собственное окно Windows |
| **Standalone EXE** | `npm run electron-build` | Установщик для пользователей |

## 🎮 Функции

### Пользовательские
- 🔐 Email/Google вход
- 🎮 Просмотр всех игр
- ⭐ Оставление отзывов
- 👤 Профиль с аватаркой
- 👥 Список друзей + чат
- 📊 Статистика

### Администратора
- 📥 Загрузка новых игр
- 📝 Редактирование информации
- 🗑️ Удаление игр
- 🔑 Управление доступом

## 📂 Структура

```
WazalGames Center/
├── src/
│   ├── pages/
│   │   ├── AdminPage.jsx ← Новая админ панель
│   │   └── ... (другие страницы)
│   ├── services/firebase.js ← Конфиг
│   └── ...
├── scripts/
│   ├── setup-firebase-github.js ← Автоматическая настройка
│   ├── load-local-games.js ← Загрузить игры из папки
│   └── ... (другие скрипты)
├── games/pc/
│   ├── ElvoTanksBattles.exe
│   └── IronFront1939_x64.exe
├── electron.js ← Конфиг для EXE
├── preload.js ← Настройка Electron
├── package.json ← Скрипты сборки
└── ...
```

## ⚡ Команды

```bash
# Разработка
npm run dev              # Веб-приложение (http://localhost:5173)
npm run electron-dev     # Desktop приложение (Electron)

# Сборка
npm run build            # Собрать веб-версию
npm run electron-build   # Собрать EXE файл

# Игры
node scripts/setup-firebase-github.js    # Настройка Firebase + GitHub
node scripts/load-local-games.js         # Загрузить локальные игры
node scripts/upload-game.js              # Загрузить игру вручную
node scripts/update-games.js             # Обновить информацию игры

# Git
git status               # Статус репозитория
git add .                # Добавить все файлы
git commit -m "message"  # Сделать коммит
git push                 # Загрузить на GitHub
```

## 🐛 Решение Проблем

### "Не могу войти в админ панель"
- ✅ Убедись что добавил поле `role: "admin"` в Firebase
- ✅ Обнови страницу (Ctrl+F5)

### "Игры не загружаются"
- ✅ Проверь что Firestore включена
- ✅ Проверь Security Rules
- ✅ Смотри консоль браузера (F12)

### "Firebase конфиг неправильный"
- ✅ Пересоздай конфиг через `setup-firebase-github.js`
- ✅ Или обнови вручную в `src/services/firebase.js`

### "Сборка EXE не работает"
```bash
# Переустанови зависимости
npm install
# Попробуй еще раз
npm run electron-build
```

## 📚 Файлы Конфигурации

| Файл | Описание |
|------|----------|
| `src/services/firebase.js` | Firebase конфиг и инициализация |
| `electron.js` | Конфиг Electron app |
| `package.json` | Скрипты сборки и зависимости |
| `vite.config.js` | Конфиг Vite сборщика |

## 🔒 Безопасность

⚠️ **Важно:**
- Никогда не выкладывай API ключи в публичный GitHub
- Используй `.env` файлы для локальной разработки (если нужно)
- Всегда проверяй Security Rules в Firebase

## 🚀 Развертывание

### На Firebase Hosting (Рекомендуется)

```bash
# Установи Firebase CLI
npm install -g firebase-tools

# Инициализируй проект
firebase login
firebase init

# Выбери Hosting

# Собери приложение
npm run build

# Разверни
firebase deploy
```

### На Vercel

```bash
# Установи Vercel CLI
npm i -g vercel

# Разверни
vercel
```

## 📞 Поддержка

Если что-то не работает:

1. **Проверь консоль браузера** - F12 → Console
2. **Проверь Firebase Console** - есть ли ошибки
3. **Перечитай этот гайд** - 90% проблем там
4. **Переустанови все** - `rm -rf node_modules && npm install`

---

## 🎉 Готово!

Теперь у тебя есть:
✅ Полнофункциональное приложение  
✅ Админ панель для управления  
✅ Две загруженные игры  
✅ Возможность собрать в EXE  
✅ Все на GitHub и Firebase  

**Начни разработку!** 🚀

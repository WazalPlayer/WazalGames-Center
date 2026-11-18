# 🚀 Как Начать

## 1️⃣ Первый Запуск

### Установка
```bash
cd "E:\WazalGames Center"
npm install
```

### Запуск
```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`

## 2️⃣ Настройка Firebase

Смотри [FIREBASE_SETUP.md](FIREBASE_SETUP.md) для полной инструкции

Быстро:
1. Перейди на https://console.firebase.google.com
2. Создай проект "WazalGames"
3. Скопируй SDK конфиг
4. Вставь в `src/services/firebase.js`

## 3️⃣ Загрузка Первой Игры

### Способ 1: GitHub релизы

Если у тебя есть репозиторий с игрой на GitHub:

```bash
node scripts/sync-github.js yourname/game-repository
```

Автоматически загрузит все релизы как игры.

### Способ 2: Вручную

```bash
node scripts/upload-game.js
```

И введи информацию о игре.

## 4️⃣ Первый Запуск Приложения

1. **Создай аккаунт** - используй email или Google
2. **Просмотри игры** - перейди на страницу Games
3. **Добавь друзей** - перейди на Friends и добавь пользователей
4. **Оставь отзыв** - нажми на игру и напиши отзыв

## 🎮 Три Игры для Начала

Скопируй команды для загрузки примеров:

```bash
# Если твои репозитории на GitHub:
node scripts/sync-github.js yourname/Elvo-Tanks-Battles
node scripts/sync-github.js yourname/Gru-Dash  
node scripts/sync-github.js yourname/Iron-Front
```

Или загрузи вручную через:
```bash
node scripts/upload-game.js
```

## 📱 Тестирование на Мобильном

1. Открой приложение на мобильном
2. Введи `http://твой-ip:5173` в браузер (найди IP командой `ipconfig`)
3. Или используй DevTools в Chrome (F12) и выбери мобильный размер

## 🔐 Первый Вход

**Email тестирования:**
- Email: test@example.com
- Password: Test123456!

Или создай собственный аккаунт.

## ✅ Контрольный Список

- [ ] Node.js установлен (проверка: `node --version`)
- [ ] npm установлен (проверка: `npm --version`)
- [ ] Проект клонирован
- [ ] `npm install` выполнен
- [ ] Firebase конфиг добавлен
- [ ] `npm run dev` работает
- [ ] Браузер открыл http://localhost:5173
- [ ] Создан аккаунт
- [ ] Добавлена хотя бы одна игра
- [ ] Работает поиск и фильтрация

## 🛠️ Если Что-то Не Работает

### "npm не найден"
```bash
# Переустанови Node.js с https://nodejs.org
```

### "Module not found"
```bash
# Переустанови зависимости
rm -rf node_modules package-lock.json
npm install
```

### "Firebase конфиг неправильный"
```bash
# Проверь в браузере консоль (F12)
# Там будут ошибки Firebase
```

### "Порт 5173 занят"
```bash
# Вайт переведет на другой порт (например 5174)
# Или закрой другой процесс на порту 5173
```

## 📚 Дальше

После того как все работает:

1. **Добавь свои игры** - загрузи реальные игры
2. **Настрой стили** - измени цвета в `src/App.css`
3. **Добавь функционал** - реализуй запись видео (Medal)
4. **Развертывание** - разверни на Firebase Hosting

---

Готов к разработке! 🎉

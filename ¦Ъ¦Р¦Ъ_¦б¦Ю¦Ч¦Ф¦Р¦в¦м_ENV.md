# Как создать и настроить файл .env

## Где находится файл .env

Файл `.env` должен находиться в **корне проекта** (там же, где `package.json`):

```
курсор/
├── .env          ← ЗДЕСЬ
├── package.json
├── src/
├── vite.config.ts
└── ...
```

## Как создать файл .env

### Способ 1: Через редактор кода

1. Откройте папку проекта в VS Code (или другом редакторе)
2. Создайте новый файл в корне проекта
3. Назовите его `.env` (с точкой в начале!)
4. Скопируйте содержимое из файла `.env.example` (если есть) или используйте шаблон ниже

### Способ 2: Через командную строку

В терминале в папке проекта:

```bash
# Windows (PowerShell)
New-Item -Path .env -ItemType File

# Или просто создайте файл вручную
```

## Содержимое файла .env

Скопируйте это в файл `.env`:

```env
VITE_FIREBASE_API_KEY=ваш-api-key
VITE_FIREBASE_AUTH_DOMAIN=ваш-проект.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ваш-проект-id
VITE_FIREBASE_STORAGE_BUCKET=ваш-проект.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=ваш-sender-id
VITE_FIREBASE_APP_ID=ваш-app-id
```

## Где взять значения для .env

### Шаг 1: Откройте Firebase Console

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Выберите ваш проект (или создайте новый)

### Шаг 2: Получите конфигурацию

1. Нажмите на **шестеренку** (⚙️) рядом с "Project Overview"
2. Выберите **"Project settings"**
3. Прокрутите вниз до раздела **"Your apps"**
4. Если веб-приложение еще не создано:
   - Нажмите на иконку **</>** (Web)
   - Введите название приложения (например, "apevault-web")
   - Нажмите "Register app"
5. Скопируйте значения из блока `const firebaseConfig = { ... }`:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           ← VITE_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com",  ← VITE_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",            ← VITE_FIREBASE_PROJECT_ID
  storageBucket: "xxx.appspot.com",   ← VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456", ← VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456:web:xxx"    ← VITE_FIREBASE_APP_ID
};
```

### Шаг 3: Заполните .env

Скопируйте значения в файл `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=apevault-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apevault-xxx
VITE_FIREBASE_STORAGE_BUCKET=apevault-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Важно:**
- Без кавычек!
- Без пробелов вокруг знака `=`
- Каждое значение на новой строке

## Проверка

После создания `.env` файла:

1. Перезапустите dev сервер:
```bash
npm run dev
```

2. Если всё правильно - приложение должно подключиться к Firebase

## Важно!

- ✅ Файл `.env` **НЕ** должен быть загружен на GitHub (он в `.gitignore`)
- ✅ Файл `.env` должен быть **только локально** на вашем компьютере
- ✅ Для Vercel нужно добавить переменные окружения в настройках проекта

## Для Vercel

После создания `.env` локально, добавьте те же переменные в Vercel:

1. Откройте проект на [vercel.com](https://vercel.com)
2. Settings → Environment Variables
3. Добавьте каждую переменную из `.env`
4. Сделайте Redeploy




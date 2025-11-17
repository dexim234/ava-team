# Пошаговая инструкция: Подключение к Firebase

## ШАГ 1: Создать проект в Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите **"Add project"** или **"Create a project"**
3. Введите название проекта: `apevault` (или любое другое)
4. Нажмите **"Continue"**
5. (Опционально) Отключите Google Analytics, если не нужен
6. Нажмите **"Create project"**
7. Дождитесь создания проекта (30-60 секунд)
8. Нажмите **"Continue"**

## ШАГ 2: Включить Firestore Database

1. В Firebase Console в меню слева найдите **"Firestore Database"**
2. Нажмите **"Create database"**
3. Выберите режим:
   - **"Start in production mode"** (рекомендуется) - для продакшена
   - **"Start in test mode"** - для тестирования (разрешает все операции на 30 дней)
4. Выберите регион базы данных:
   - `europe-west` (Европа) - для России
   - `us-central` (США)
   - Или любой другой ближайший регион
5. Нажмите **"Enable"**
6. Дождитесь создания базы данных

## ШАГ 3: Настроить правила безопасности Firestore

1. В разделе **Firestore Database** перейдите на вкладку **"Rules"**
2. Замените правила на следующие:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Разрешить чтение и запись всем (для начала)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Нажмите **"Publish"**

**⚠️ Внимание:** Эти правила разрешают всем читать и писать данные. Для продакшена лучше использовать:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Но для начала используйте первый вариант, чтобы всё работало.

## ШАГ 4: Создать веб-приложение в Firebase

1. В Firebase Console нажмите на **шестеренку** (⚙️) рядом с "Project Overview"
2. Выберите **"Project settings"**
3. Прокрутите вниз до раздела **"Your apps"**
4. Нажмите на иконку **`</>`** (Web) - это создаст веб-приложение
5. Введите название приложения: `apevault-web`
6. **НЕ** отмечайте галочку "Also set up Firebase Hosting" (она нам не нужна)
7. Нажмите **"Register app"**

## ШАГ 5: Скопировать конфигурацию Firebase

После создания веб-приложения вы увидите блок с кодом:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "apevault-xxx.firebaseapp.com",
  projectId: "apevault-xxx",
  storageBucket: "apevault-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**Скопируйте эти значения!** Они понадобятся в следующем шаге.

## ШАГ 6: Создать файл .env локально

1. Откройте папку проекта: `C:\Users\user\Desktop\курсор`
2. Создайте новый файл `.env` в корне проекта (там же, где `package.json`)
3. Вставьте туда следующее, заменив значения на ваши из Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSyC... (ваш apiKey)
VITE_FIREBASE_AUTH_DOMAIN=apevault-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apevault-xxx
VITE_FIREBASE_STORAGE_BUCKET=apevault-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Важно:**
- Без кавычек!
- Без пробелов вокруг знака `=`
- Каждое значение на новой строке
- Используйте реальные значения из Firebase

**Пример правильного .env файла:**

```env
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnop
VITE_FIREBASE_AUTH_DOMAIN=apevault-team.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=apevault-team
VITE_FIREBASE_STORAGE_BUCKET=apevault-team.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=987654321
VITE_FIREBASE_APP_ID=1:987654321:web:abcdef123456789
```

## ШАГ 7: Добавить переменные окружения в Vercel

1. Откройте [vercel.com](https://vercel.com)
2. Войдите в ваш аккаунт
3. Откройте проект `apevaultteam`
4. Перейдите в **Settings** → **Environment Variables**
5. Добавьте каждую переменную:

   **Первая переменная:**
   - Нажмите **"Add New"**
   - Key: `VITE_FIREBASE_API_KEY`
   - Value: (скопируйте значение из .env файла)
   - Environment: выберите **Production** (и **Preview**, если нужно)
   - Нажмите **"Save"**

   **Повторите для остальных 5 переменных:**
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

6. После добавления всех переменных перейдите в **Deployments**
7. Нажмите на **три точки** (⋮) у последнего деплоя
8. Выберите **"Redeploy"**
9. Подтвердите и дождитесь завершения

## ШАГ 8: Проверить подключение

### Локально:

1. Откройте терминал в папке проекта
2. Запустите:
```bash
npm run dev
```

3. Откройте http://localhost:5173
4. Если всё правильно - должна открыться страница авторизации
5. Попробуйте войти:
   - Логин: `artyom03`
   - Пароль: `248artdex`

### На Vercel:

1. Откройте ваш сайт: https://apevaultteam-t7h5.vercel.app
2. Должна открыться страница авторизации
3. Попробуйте войти
4. Если работает - Firebase подключен!

## Проверка работы Firebase

### Проверка 1: Консоль браузера

1. Откройте сайт
2. Нажмите **F12** (DevTools)
3. Перейдите в **Console**
4. Не должно быть ошибок типа:
   - `Firebase: Error (auth/api-key-not-valid)`
   - `Failed to fetch`
   - `Cannot read property 'env'`

### Проверка 2: Firestore

1. Откройте Firebase Console
2. Перейдите в **Firestore Database**
3. Попробуйте создать слот на сайте
4. В Firestore должны появиться коллекции:
   - `workSlots`
   - `dayStatuses`
   - `earnings`
   - `ratings`

## Решение проблем

### Проблема: "Firebase: Error (auth/api-key-not-valid)"

**Решение:**
- Проверьте правильность `VITE_FIREBASE_API_KEY` в `.env` и Vercel
- Убедитесь, что ключ скопирован полностью, без пробелов

### Проблема: "Failed to fetch" или белая страница

**Решение:**
- Проверьте, что все переменные окружения добавлены в Vercel
- Сделайте Redeploy после добавления переменных
- Проверьте консоль браузера (F12) на ошибки

### Проблема: Данные не сохраняются

**Решение:**
- Проверьте правила Firestore (должны разрешать запись)
- Проверьте, что Firestore включен
- Проверьте консоль браузера на ошибки

### Проблема: "Cannot read property 'env'"

**Решение:**
- Убедитесь, что файл `.env` создан в корне проекта
- Проверьте, что переменные начинаются с `VITE_`
- Перезапустите dev сервер (`npm run dev`)

## Чеклист подключения:

- [ ] Firebase проект создан
- [ ] Firestore Database включен
- [ ] Правила безопасности настроены
- [ ] Веб-приложение создано в Firebase
- [ ] Конфигурация скопирована
- [ ] Файл `.env` создан локально
- [ ] Все переменные добавлены в Vercel
- [ ] Проект передеплоен на Vercel
- [ ] Сайт работает локально
- [ ] Сайт работает на Vercel
- [ ] Данные сохраняются в Firestore

## Готово!

После выполнения всех шагов ваш проект будет полностью подключен к Firebase и готов к работе!

Если возникнут проблемы на любом шаге - напишите, помогу решить.




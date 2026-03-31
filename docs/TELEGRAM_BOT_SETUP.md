# 🤖 Telegram Bot Setup Guide for GastroGuide

**Date:** 2026-03-31  
**Status:** ✅ **READY TO DEPLOY**  
**Time:** 10 минут  
**Complexity:** ⭐⭐ (из 5)

---

## 📋 OVERVIEW

Этот гайд поможет тебе создать Telegram бота для GastroGuide, который:
- ✅ Отвечает на вопросы о ресторанах через OpenRouter AI
- ✅ Помнит контекст диалога (последние 8 сообщений)
- ✅ Поддерживает команды: `/start`, `/help`, `/ask`
- ✅ Работает с бесплатными моделями (Step 3.5 Flash)
- ✅ Показывает индикатор набора текста

---

## 🚀 БЫСТРЫЙ СТАРТ

### Шаг 1: Создать бота в Telegram (2 минуты)

1. **Открой Telegram** → найди **@BotFather**
2. Напиши `/newbot`
3. **Придумай имя:** `GastroGuide Bot` (можно изменить позже)
4. **Придумай username:** `@GastroGuideBot` (должен быть свободен)
5. **Скопируй токен** (выглядит так):
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

**Важно:** Токен нельзя показывать никому! Храни его в секрете.

---

### Шаг 2: Настроить переменные окружения (1 минута)

Добавь в `.env` файл проекта:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# OpenRouter (уже должен быть)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=step3ai/step-3.5-flash:free
```

**Где взять OPENROUTER_API_KEY:**
- Если уже есть в проекте — используй его
- Если нет: https://openrouter.ai/keys → Create New Key

---

### Шаг 3: Задеплоить backend функцию (2 минуты)

**Вариант A: Base44 Functions (рекомендую)**

1. Скажи своему Superagent (Gas):
   ```
   Задеплой функцию telegramWebhook.ts
   ```

2. Он создаст функцию и даст URL вида:
   ```
   https://your-app.base44.app/functions/telegramWebhook
   ```

3. Настрой переменные окружения в Base44:
   - TELEGRAM_BOT_TOKEN
   - OPENROUTER_API_KEY
   - OPENROUTER_MODEL

**Вариант B: Vercel/Netlify**

1. Запушь код в GitHub
2. Задеплой на Vercel/Netlify
3. Добавь environment variables в настройках проекта

---

### Шаг 4: Настроить webhook (2 минуты)

Отправь POST запрос на Telegram API:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.base44.app/functions/telegramWebhook"
  }'
```

**Или через браузер:**
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.base44.app/functions/telegramWebhook
```

**Проверка:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

Должен увидеть:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-app.base44.app/functions/telegramWebhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

---

### Шаг 5: Протестировать (1 минута)

1. **Найди своего бота** в Telegram по username (например, `@GastroGuideBot`)
2. **Напиши `/start`**
3. **Задай вопрос:** "Где лучший итальянский ресторан?"
4. **Получи ответ** от AI! 🎉

---

## 🎯 ФУНКЦИОНАЛ БОТА

### Команды

| Команда | Описание | Пример |
|---------|----------|--------|
| `/start` | Приветствие и инструкции | `/start` |
| `/help` | Справка по командам | `/help` |
| `/ask` | Задать вопрос | `/ask Где лучший кофе?` |

### Обычные сообщения

Бот понимает естественные запросы:

```
"Ищу уютный итальянский ресторан для свидания"
"Где можно попробовать местную кухню?"
"Посоветуй место с панорамным видом"
"Куда пойти с детьми?"
"Есть вегетарианские варианты?"
```

### Контекст диалога

Бот помнит последние 8 сообщений:

```
User: "Где хороший итальянский ресторан?"
Bot: "В Кракове рекомендую..."

User: "А что насчёт пиццы?"
Bot: "Лучшую пиццу готовят в..." (понимает, что речь об Италии)
```

---

## 🔧 НАСТРОЙКИ

### Выбор модели

В `.env` укажи желаемую модель:

```bash
# Быстрая бесплатная (рекомендую)
OPENROUTER_MODEL=step3ai/step-3.5-flash:free

# Другие бесплатные варианты:
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free
OPENROUTER_MODEL=nvidia/nemotron-3-405b-instruct:free
OPENROUTER_MODEL=qwen/qwen-3-coder:free
```

### Изменение системного промпта

В файле `functions/telegramWebhook.ts` найди `SYSTEM_PROMPT` и измени:

```typescript
const SYSTEM_PROMPT = `You are GastroGuide...`
// Измени текст под свои нужды
```

### Хранение контекста

Сейчас контекст хранится в памяти (Map). Для production:

```typescript
// Используй базу данных (Supabase, Redis)
import { supabase } from '@/shared/api/client'

async function saveContext(userId: number, messages: any[]) {
  await supabase
    .from('telegram_conversations')
    .upsert({ user_id: userId, messages, updated_at: new Date() })
}
```

---

## 📊 МОНИТОРИНГ

### Проверка статуса бота

```bash
# Получить информацию о webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Получить информацию о боте
curl "https://api.telegram.org/bot<TOKEN>/getMe"
```

### Логи

Смотри логи в Base44 dashboard или Vercel:

```bash
# Base44
https://app.base44.com/functions/logs

# Vercel
vercel logs --follow
```

### Метрики

Отслеживай:
- Количество сообщений в день
- Среднее время ответа
- Ошибки API
- Использование токенов OpenRouter

---

## 🆘 TROUBLESHOOTING

### Бот не отвечает

**Проверь webhook:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

**Проверь логи:**
- Base44: Functions → Logs
- Vercel: Deployments → Logs

**Проверь переменные окружения:**
```bash
echo $TELEGRAM_BOT_TOKEN
echo $OPENROUTER_API_KEY
```

### Ошибка "OPENROUTER_API_KEY not configured"

Добавь в environment variables:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Ошибка "BOT_TOKEN not configured"

Добавь в environment variables:
```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Модель не отвечает

Попробуй другую бесплатную модель:
```bash
OPENROUTER_MODEL=step3ai/step-3.5-flash:free
# или
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free
```

### Webhook не устанавливается

**Проверь URL:**
- Должен быть HTTPS
- Должен быть доступен из интернета
- Не должен блокироваться firewall

**Пересоздай webhook:**
```bash
# Удалить webhook
curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook"

# Создать заново
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-url.com/webhook"}'
```

---

## 💡 СОВЕТЫ

### 1. Оптимизация затрат

Используй бесплатные модели:
```bash
OPENROUTER_MODEL=step3ai/step-3.5-flash:free
```

### 2. Улучшение ответов

Добавь больше контекста в SYSTEM_PROMPT:
```typescript
const SYSTEM_PROMPT = `You are GastroGuide...
Focus on Krakow and Warsaw restaurants.
Mention specific dishes when relevant.
Ask follow-up questions about budget and preferences.`
```

### 3. Добавление кнопок

Создай inline keyboard с быстрыми вариантами:

```typescript
const keyboard = {
  inline_keyboard: [
    [{ text: '🍕 Итальянская', callback_data: 'cuisine:italian' }],
    [{ text: '🥩 Стейки', callback_data: 'cuisine:steakhouse' }],
    [{ text: '🥗 Вегетарианская', callback_data: 'cuisine:vegetarian' }]
  ]
}

await sendMessage(chatId, 'Выберите кухню:', keyboard)
```

### 4. Rate limiting

Ограничь количество запросов от одного пользователя:

```typescript
const userRequests = new Map<number, number[]>()

function checkRateLimit(userId: number): boolean {
  const now = Date.now()
  const requests = userRequests.get(userId) || []
  const recent = requests.filter(t => now - t < 60000) // 1 минута
  
  if (recent.length >= 10) return false
  
  recent.push(now)
  userRequests.set(userId, recent)
  return true
}
```

### 5. Аналитика

Собирай статистику使用:

```typescript
// Сохраняй каждое сообщение в базу
await supabase.from('telegram_analytics').insert({
  user_id: userId,
  message: text,
  response: aiResponse,
  timestamp: new Date()
})
```

---

## 📁 FILES REFERENCE

### Созданные файлы

```
functions/telegramWebhook.ts    # Backend функция (готово!)
docs/TELEGRAM_BOT_SETUP.md      # Этот гайд
```

### Используемые файлы

```
src/shared/api/ai.api.js        # OpenRouter интеграция
src/hooks/useAIChat.js          # GastroGuide логика
```

---

## 🎯 СЛЕДУЮЩИЕ ШАГИ

### После настройки:

1. ✅ **Протестируй бота** — напиши `/start` и задай вопрос
2. ✅ **Проверь логи** — убедись что нет ошибок
3. ✅ **Пригласи друзей** — пусть протестируют
4. ✅ **Собери фидбек** — что можно улучшить

### Улучшения (опционально):

- [ ] Добавить базу данных для контекста
- [ ] Inline кнопки с быстрыми запросами
- [ ] Аналитика использования
- [ ] Мультиязычность (автоматическое определение)
- [ ] Интеграция с реальной базой ресторанов
- [ ] Отправка фото ресторанов
- [ ] Бронирование через бота

---

## 💬 FAQ

**Q: Сколько это стоит?**  
A: Telegram боты бесплатные. Платишь только за OpenRouter API (бесплатные модели: $0).

**Q: Сколько запросов можно делать?**  
A: Зависит от модели. Бесплатные: ~100-1000 запросов/день.

**Q: Можно ли использовать в группе?**  
A: Да! Бот работает в личных сообщениях и группах.

**Q: Как добавить кнопки меню?**  
A: Используй `reply_markup` в `sendMessage()`.

**Q: Бот работает 24/7?**  
A: Да, если функция задеплоена на Base44/Vercel.

**Q: Можно ли кастомизировать ответы?**  
A: Да! Измени `SYSTEM_PROMPT` в коде функции.

---

## 🚀 ГОТОВО!

Теперь у тебя есть Telegram бот с ИИ! 🎉

**Quick links:**
- Bot Father: https://t.me/BotFather
- OpenRouter: https://openrouter.ai
- Telegram API: https://core.telegram.org/bots/api

**Need help?** Just ask your Superagent (Gas)! 🤖

---

**Created by:** Gas AI  
**Date:** 2026-03-31  
**Status:** ✅ **READY TO DEPLOY**

---

## 📊 АРХИТЕКТУРА

### Схема работы

```
┌─────────────┐
│   User      │
│  Telegram   │
└──────┬──────┘
       │ Message
       ↓
┌─────────────────────────┐
│  Telegram Bot API       │
│  (api.telegram.org)     │
└──────┬──────────────────┘
       │ Webhook POST
       ↓
┌─────────────────────────┐
│  Backend Function       │
│  (telegramWebhook.ts)   │
│  - Parse message        │
│  - Build context        │
│  - Call OpenRouter      │
└──────┬──────────────────┘
       │ HTTP POST
       ↓
┌─────────────────────────┐
│  OpenRouter API         │
│  (openrouter.ai)        │
│  - AI Model (Step 3.5)  │
│  - Generate response    │
└──────┬──────────────────┘
       │ JSON Response
       ↓
┌─────────────────────────┐
│  Backend Function       │
│  (saves context)        │
└──────┬──────────────────┘
       │ sendMessage()
       ↓
┌─────────────────────────┐
│  Telegram Bot API       │
└──────┬──────────────────┘
       │ Message
       ↓
┌─────────────┐
│   User      │
│  Telegram   │
└─────────────┘
```

### Flow Diagram

```
User: "Где лучший итальянский ресторан?"
  │
  ├─→ Telegram API
  │    └─→ Webhook → Backend Function
  │         ├─→ Save to context (Map)
  │         ├─→ Build messages array
  │         │    [system, user history...]
  │         └─→ OpenRouter API
  │              └─→ AI Model (Step 3.5 Flash)
  │                   └─→ Generate response
  │                        └─→ Return text
  │
  └─← Backend Function
       ├─→ Save AI response to context
       └─→ Telegram API
            └─→ Send message to User
```

### Context Management

```
┌──────────────────────────────────────┐
│  conversations (Map<number, Context>)│
├──────────────────────────────────────┤
│  userId: 12345                       │
│  ├─ messages: [                      │
│  │   {role: "user", content: "..."}, │
│  │   {role: "assistant", content: ".."},
│  │   ... (max 8)                     │
│  └─ lastActive: timestamp            │
└──────────────────────────────────────┘
```

---

## 🔐 БЕЗОПАСНОСТЬ

### Best Practices

1. **Храни токены в секрете:**
   ```bash
   # Не коммить .env в git
   echo ".env" >> .gitignore
   ```

2. **Валидируй входящие запросы:**
   ```typescript
   // Проверь что запрос от Telegram
   const secretToken = process.env.TELEGRAM_SECRET_TOKEN
   if (req.headers.get('X-Telegram-Bot-Api-Secret-Token') !== secretToken) {
     return new Response('Unauthorized', { status: 401 })
   }
   ```

3. **Rate limiting:**
   ```typescript
   const userRequests = new Map<number, number[]>()
   
   function checkRateLimit(userId: number): boolean {
     const now = Date.now()
     const requests = userRequests.get(userId) || []
     const recent = requests.filter(t => now - t < 60000)
     
     if (recent.length >= 10) return false
     recent.push(now)
     userRequests.set(userId, recent)
     return true
   }
   ```

4. **Санитизация ввода:**
   ```typescript
   const cleanText = text?.replace(/[<>]/g, '') || ''
   ```

---

# 🤖 AI Integration Guide - GastroMap

**Полное руководство по ИИ-интеграциям в GastroMap**

---

## 📚 ОГЛАВЛЕНИЕ

### 1. GastroGuide (Web App)
- **Где:** В приложении
- **Статус:** ✅ Работает
- **Гайд:** [`docs/AI_AGENT_INTEGRATION_GUIDE.md`](docs/AI_AGENT_INTEGRATION_GUIDE.md)

### 2. Telegram Bot
- **Где:** Telegram (@GastroGuideBot)
- **Статус:** ✅ Готов к деплою
- **Гайд:** [`docs/TELEGRAM_BOT_SETUP.md`](docs/TELEGRAM_BOT_SETUP.md)
- **Quick Start:** [`TELEGRAM_README.md`](TELEGRAM_README.md)
- **Checklist:** [`TELEGRAM_CHECKLIST.md`](TELEGRAM_CHECKLIST.md)

### 3. AI Research Automation
- **Где:** Base44 Automation
- **Статус:** ✅ Работает (ежедневно)
- **Сущность:** `AiResearch`

---

## 🎯 ТЕКУЩИЕ ИНТЕГРАЦИИ

### ✅ OpenRouter API

**Используется в:**
- GastroGuide (web app)
- Telegram Bot

**Модели:**
| Модель | Бесплатно | Контекст | Скорость |
|--------|-----------|----------|----------|
| Step 3.5 Flash | ✅ | 256K | ⭐⭐⭐⭐⭐ |
| DeepSeek V3.2 | ✅ | 128K | ⭐⭐⭐ |
| Nemotron 3 Super | ✅ | 1M | ⭐⭐⭐⭐ |
| Qwen3 Coder | ✅ | 262K | ⭐⭐⭐⭐ |

**Настройки:**
```bash
OPENROUTER_API_KEY=sk-or-v1-your-key
OPENROUTER_MODEL=step3ai/step-3.5-flash:free
```

---

## 📁 ФАЙЛЫ

### Backend Functions
```
functions/
├── telegramWebhook.ts      # Telegram Bot webhook
├── classifyIntent.ts       # Intent classification
├── semanticSearch.ts       # Semantic search
└── kgSearch.ts             # Knowledge Graph search
```

### API
```
src/shared/api/
├── ai.api.js               # OpenRouter integration
├── translation.api.js      # Auto-translation
└── stripe.api.js           # Payment stub
```

### Hooks
```
src/hooks/
└── useAIChat.js            # GastroGuide hook
```

### Documentation
```
docs/
├── AI_AGENT_INTEGRATION_GUIDE.md    # Full AI guide
├── TELEGRAM_BOT_SETUP.md            # Telegram setup
└── AI_AGENTS_GUIDE.md               # AI Agents overview

Root:
├── TELEGRAM_README.md               # Quick start
├── TELEGRAM_CHECKLIST.md            # Deployment checklist
└── README.AI.md                     # This file
```

---

## 🚀 БЫСТРЫЙ СТАРТ

### GastroGuide (Web)

1. **Открой приложение**
2. **Нажми на AI чат** (GastroGuide)
3. **Задай вопрос:** "Где лучший итальянский ресторан?"
4. **Получи ответ** ✨

### Telegram Bot

1. **Создай бота:** @BotFather → /newbot
2. **Добавь ключи:** `.env`
3. **Задеплой функцию:** Скажи Gas
4. **Настрой webhook:** curl запрос
5. **Готово!** 🎉

**Гайды:**
- Quick: [`TELEGRAM_README.md`](TELEGRAM_README.md)
- Full: [`docs/TELEGRAM_BOT_SETUP.md`](docs/TELEGRAM_BOT_SETUP.md)

---

## 🔧 КОНФИГУРАЦИЯ

### Environment Variables

```bash
# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-your-key
OPENROUTER_MODEL=step3ai/step-3.5-flash:free

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456789:ABCdef...

# AI Settings
VITE_AI_PROVIDER=openrouter
VITE_AI_TEMPERATURE=0.7
VITE_AI_MAX_TOKENS=300
```

### Model Selection

**Бесплатные (рекомендую):**
```bash
# Быстрая
OPENROUTER_MODEL=step3ai/step-3.5-flash:free

# Для сложных задач
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free

# Большой контекст
OPENROUTER_MODEL=nvidia/nemotron-3-405b-instruct:free
```

**Premium:**
```bash
# Claude 3.7
OPENROUTER_MODEL=anthropic/claude-3.7-sonnet

# GPT-5.4
OPENROUTER_MODEL=openai/gpt-5.4
```

---

## 📊 USAGE

### GastroGuide (Web)

```javascript
import { useAIChat } from '@/hooks/useAIChat'

function MyComponent() {
  const { sendMessage, messages, isTyping } = useAIChat()
  
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.content}</div>
      ))}
      <button onClick={() => sendMessage('Find Italian restaurants')}>
        Ask AI
      </button>
    </div>
  )
}
```

### Telegram Bot

```
User: /start
Bot: 👋 Привет! Я GastroGuide...

User: Где лучший итальянский ресторан?
Bot: В Кракове рекомендую... 🍷
```

---

## 🧪 TESTING

### Unit Tests

```bash
# AI API tests
npm test -- ai.api

# Translation tests
npm test -- translation.api

# All tests
npm test
```

### E2E Tests

```bash
# Stripe + Translation
npm run test:e2e
```

### Manual Testing

1. **Web App:**
   - Открой приложение
   - Задай вопрос AI
   - Проверь ответ

2. **Telegram:**
   - Найди бота
   - Напиши /start
   - Задай вопрос
   - Проверь контекст

---

## 📈 METRICS

### OpenRouter Usage

- **URL:** https://openrouter.ai/activity
- **Мониторинг:** Токены, запросы, баланс

### Telegram Bot

- **Команда:** `/getWebhookInfo`
- **Метрики:** Сообщения, ошибки, latency

### AI Research

- **Сущность:** `AiResearch`
- **Частота:** Ежедневно
- **Кредиты:** ~1.1 запуск

---

## 🆘 TROUBLESHOOTING

### Common Issues

**"OPENROUTER_API_KEY not configured"**
```bash
# Добавь в .env
OPENROUTER_API_KEY=sk-or-v1-your-key
```

**"BOT_TOKEN not configured"**
```bash
# Добавь в .env
TELEGRAM_BOT_TOKEN=123456789:ABCdef...
```

**"Model not found"**
```bash
# Попробуй другую модель
OPENROUTER_MODEL=step3ai/step-3.5-flash:free
```

**"Rate limit exceeded"**
```bash
# Бесплатные модели имеют лимиты
# Подожди или используй premium
```

### Logs

**Base44:**
```
Dashboard → Functions → Logs
```

**Vercel:**
```bash
vercel logs --follow
```

---

## 💡 TIPS

### Optimization

1. **Используй быстрые модели:**
   ```bash
   OPENROUTER_MODEL=step3ai/step-3.5-flash:free
   ```

2. **Кэшируй частые запросы:**
   ```javascript
   const cache = new Map()
   ```

3. **Ограничь длину ответов:**
   ```javascript
   max_tokens: 300
   ```

4. **Добавь fallback:**
   ```javascript
   try {
     await query(model1)
   } catch {
     await query(model2)
   }
   ```

### Cost Savings

- **Бесплатные модели:** $0
- **Лимиты:** 100-1000 запросов/день
- **Оптимизация:** Кэширование, rate limiting

---

## 📚 ADDITIONAL RESOURCES

- **OpenRouter Docs:** https://openrouter.ai/docs
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Base44 Functions:** https://docs.base44.com/functions

---

## 🎯 NEXT STEPS

- [ ] Добавить мультиязычность в Telegram
- [ ] Интеграция с базой ресторанов
- [ ] Offline режим
- [ ] Voice сообщения
- [ ] Отправка фото
- [ ] Бронирование столов

---

## ✅ STATUS

| Integration | Status | Docs |
|-------------|--------|------|
| GastroGuide Web | ✅ Live | [Guide](docs/AI_AGENT_INTEGRATION_GUIDE.md) |
| Telegram Bot | ✅ Ready | [Guide](docs/TELEGRAM_BOT_SETUP.md) |
| AI Research | ✅ Daily | Auto |
| Translation | ✅ Live | Auto |
| Stripe Stub | ✅ Test | [Guide](STRIPE_SETUP_GUIDE.md) |

---

**Last Updated:** 2026-03-31  
**Maintained by:** Gas AI  
**Questions?** Ask your Superagent! 🤖

# 🤖 GastroGuide Telegram Bot - Quick Start

**Готов за 10 минут!** ⚡

---

## ⚡ БЫСТРЫЙ СТАРТ (10 МИНУТ)

### 1️⃣ Создай бота (2 мин)

```
1. Telegram → @BotFather
2. /newbot
3. Имя: GastroGuide Bot
4. Username: @GastroGuideBot
5. Скопируй токен
```

### 2️⃣ Добавь ключи (1 мин)

Создай файл `.env`:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_MODEL=step3ai/step-3.5-flash:free
```

### 3️⃣ Задеплой функцию (2 мин)

**Base44:**
```
Скажи Gas: "Задеплой telegramWebhook"
```

**Vercel:**
```bash
git push
vercel deploy
```

### 4️⃣ Настрой webhook (2 мин)

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-url.com/functions/telegramWebhook"}'
```

### 5️⃣ Готово! (1 мин)

1. Найди бота в Telegram
2. Напиши `/start`
3. Задай вопрос: "Где лучший итальянский ресторан?"
4. Наслаждайся! 🎉

---

## 📚 ПОЛНАЯ ДОКУМЕНТАЦИЯ

Смотри: [`docs/TELEGRAM_BOT_SETUP.md`](docs/TELEGRAM_BOT_SETUP.md)

**Включает:**
- ✅ Подробные инструкции
- ✅ Troubleshooting
- ✅ Настройки и оптимизация
- ✅ Примеры кода
- ✅ FAQ

---

## 🎯 ФУНКЦИИ БОТА

- 🤖 AI-ответы через OpenRouter
- 💬 Контекст диалога (8 сообщений)
- ⌨️ Команды: `/start`, `/help`, `/ask`
- ⏳ Индикатор "печатает..."
- 🌍 Мультиязычность
- 🆓 Бесплатные модели

---

## 💡 ПРИМЕРЫ

**Пользователь:** "Ищу уютный итальянский ресторан"

**Бот:** "В Кракове рекомендую итальянские рестораны в Старом городе. Ищи места с винной картой и живой музыкой! 🍷"

---

**Пользователь:** "А пицца?"

**Бот:** "Лучшую пиццу ищи в неаполитанских пиццериях с тонким тестом! 🍕"

*(Бот помнит контекст!)*

---

## 🆘 ПРОБЛЕМЫ?

**Бот не отвечает:**
```bash
# Проверь webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Проверь логи
# Base44: Functions → Logs
# Vercel: vercel logs
```

**Ошибка API:**
```bash
# Проверь ключи
echo $TELEGRAM_BOT_TOKEN
echo $OPENROUTER_API_KEY
```

**Полный troubleshooting:** [`docs/TELEGRAM_BOT_SETUP.md`](docs/TELEGRAM_BOT_SETUP.md#-troubleshooting)

---

## 📁 ФАЙЛЫ

```
functions/telegramWebhook.ts      # Backend функция
docs/TELEGRAM_BOT_SETUP.md        # Полная инструкция
TELEGRAM_README.md                # Этот файл (быстрый старт)
```

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

- [ ] Протестировать бота
- [ ] Добавить кнопки меню
- [ ] Интеграция с базой ресторанов
- [ ] Аналитика использования
- [ ] Отправка фото

---

**Ready?** Let's go! 🚀

**Questions?** Ask Gas (your Superagent)! 🤖

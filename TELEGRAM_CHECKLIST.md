# ✅ Telegram Bot Deployment Checklist

Используй этот чеклист для быстрой проверки всех шагов!

---

## 📋 PRE-DEPLOYMENT

- [ ] **Создан бот в @BotFather**
  - [ ] Имя бота: `GastroGuide Bot`
  - [ ] Username: `@GastroGuideBot` (или свой)
  - [ ] Токен получен и сохранён

- [ ] **OpenRouter API ключ**
  - [ ] Ключ создан: https://openrouter.ai/keys
  - [ ] Ключ скопирован
  - [ ] Проверен баланс (бесплатные модели: $0)

- [ ] **Файл .env создан**
  ```bash
  TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
  OPENROUTER_API_KEY=sk-or-v1-your-key-here
  OPENROUTER_MODEL=step3ai/step-3.5-flash:free
  ```
  - [ ] TELEGRAM_BOT_TOKEN добавлен
  - [ ] OPENROUTER_API_KEY добавлен
  - [ ] OPENROUTER_MODEL добавлен
  - [ ] .env добавлен в .gitignore

---

## 🚀 DEPLOYMENT

### Base44

- [ ] **Функция задеплоена**
  - [ ] Gas задеплоил `telegramWebhook.ts`
  - [ ] URL получен: `https://your-app.base44.app/functions/telegramWebhook`
  - [ ] Environment variables настроены в Base44 dashboard

### Vercel (альтернатива)

- [ ] **Код запушен**
  - [ ] `git add -A`
  - [ ] `git commit -m "Deploy Telegram Bot"`
  - [ ] `git push`

- [ ] **Vercel deployment**
  - [ ] `vercel deploy`
  - [ ] URL получен: `https://your-project.vercel.app/api/telegramWebhook`
  - [ ] Environment variables добавлены в Vercel dashboard

---

## 🔗 WEBHOOK SETUP

- [ ] **Webhook установлен**
  ```bash
  curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://your-url.com/functions/telegramWebhook"}'
  ```
  - [ ] Запрос отправлен
  - [ ] Получен ответ: `{"ok":true,"result":{...}}`

- [ ] **Webhook проверен**
  ```bash
  curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
  ```
  - [ ] `ok: true`
  - [ ] `url` правильный
  - [ ] `pending_update_count: 0`

---

## 🧪 TESTING

- [ ] **Бот найден в Telegram**
  - [ ] Поиск по username: `@GastroGuideBot`
  - [ ] Бот отображается в поиске
  - [ ] Кнопка "Start" есть

- [ ] **Команда /start**
  - [ ] Бот ответил приветствием
  - [ ] Текст корректный
  - [ ] Эмодзи отображаются

- [ ] **Команда /help**
  - [ ] Бот отправил справку
  - [ ] Список команд правильный
  - [ ] Примеры запросов есть

- [ ] **Обычный запрос**
  - [ ] Запрос: "Где лучший итальянский ресторан?"
  - [ ] Бот показал "печатает..."
  - [ ] Бот ответил через 1-5 секунд
  - [ ] Ответ релевантный
  - [ ] Эмодзи в ответе (1-2 шт)

- [ ] **Контекст диалога**
  - [ ] Запрос 1: "Ищу итальянский ресторан"
  - [ ] Запрос 2: "А пицца?"
  - [ ] Бот понял контекст (ответ про пиццу в Италии)
  - [ ] Контекст сохраняется (8 сообщений)

- [ ] **Разные языки**
  - [ ] English: "Find Italian restaurants"
  - [ ] Polski: "Gdzie najlepsza pizza?"
  - [ ] Українська: "Де найкращий ресторан?"
  - [ ] Бот отвечает на том же языке

---

## 🔍 MONITORING

- [ ] **Логи проверены**
  - [ ] Base44: Functions → Logs
  - [ ] Или Vercel: `vercel logs`
  - [ ] Ошибок нет
  - [ ] Запросы логируются

- [ ] **Метрики**
  - [ ] Количество сообщений в день
  - [ ] Среднее время ответа
  - [ ] Ошибки API (должно быть 0)

- [ ] **OpenRouter usage**
  - [ ] https://openrouter.ai/activity
  - [ ] Токены используются
  - [ ] Баланс положительный

---

## 🛡️ SECURITY

- [ ] **Токены защищены**
  - [ ] .env не закоммичен в git
  - [ ] Токены не показаны никому
  - [ ] Использованы environment variables

- [ ] **Webhook секрет** (опционально)
  - [ ] Secret token создан
  - [ ] Проверка заголовка добавлена в код
  - [ ] Secret token сохранён в env

- [ ] **Rate limiting** (опционально)
  - [ ] Лимит: 10 запросов/мин на пользователя
  - [ ] Обработка превышения лимита

---

## 📊 OPTIMIZATION

- [ ] **Модель выбрана**
  - [ ] Быстрая: `step3ai/step-3.5-flash:free`
  - [ ] Или бесплатная: `deepseek/deepseek-chat-v3-0324:free`
  - [ ] Тест скорости проведён

- [ ] **Кэширование** (опционально)
  - [ ] Частые запросы кэшируются
  - [ ] TTL настроен (5-10 мин)

- [ ] **Ответы оптимизированы**
  - [ ] Длина: 2-3 предложения
  - [ ] Эмодзи: 1-2 шт
  - [ ] Тон: дружелюбный

---

## 🎯 POST-DEPLOYMENT

- [ ] **Друзья протестировали**
  - [ ] 2-3 человека попробовали
  - [ ] Фидбек собран
  - [ ] Баги найдены и исправлены

- [ ] **Документация прочитана**
  - [ ] TELEGRAM_README.md
  - [ ] docs/TELEGRAM_BOT_SETUP.md
  - [ ] FAQ изучен

- [ ] **Следующие шаги запланированы**
  - [ ] Добавить кнопки меню
  - [ ] Интеграция с базой ресторанов
  - [ ] Аналитика использования
  - [ ] Отправка фото ресторанов

---

## 🆘 TROUBLESHOOTING

Если что-то не работает:

1. **Проверь webhook:**
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

2. **Проверь логи:**
   - Base44: Functions → Logs
   - Vercel: `vercel logs --follow`

3. **Проверь переменные:**
   ```bash
   echo $TELEGRAM_BOT_TOKEN
   echo $OPENROUTER_API_KEY
   ```

4. **Полный гайд:** [`docs/TELEGRAM_BOT_SETUP.md`](docs/TELEGRAM_BOT_SETUP.md)

---

## ✅ ВСЁ ГОТОВО!

Если все галочки отмечены — поздравляю! 🎉

Твой бот работает и готов к использованию!

**Ссылки:**
- GitHub: https://github.com/alik2191/Gastromap_StandAlone
- Бот: @GastroGuideBot (или твой username)
- Документация: docs/TELEGRAM_BOT_SETUP.md

---

**Created:** 2026-03-31  
**Status:** ✅ READY TO USE

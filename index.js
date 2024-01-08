const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const token = process.env.token;
const userCounters = {};

// Создание бота
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Привет! Я буду считать сообщения с словами "Заявка" и "КК" в этой группе.'
  );
});
// Обработчик команды /reset

bot.onText(/\/reset/, (msg) => {
  const chatId = msg.chat.id;
  Object.keys(userCounters[chatId]).forEach((userId) => {
    userCounters[chatId][userId] = { заявка: 0, кк: 0 };
  });
  bot.sendMessage(chatId, "Статистика по заявкам и картам сброшена");
  console.log("Счетчики сброшены.");
});
bot.onText(/\/stats/, (msg) => {
  const chatId = msg.chat.id;
  let statsMessage = "Статистика по заявкам и картам:\n\n";
  let sumApp = 0
  let sumCard = 0
  // Перебираем всех пользователей в чате
  Object.keys(userCounters[chatId] || {}).forEach((userId) => {
    const userStats = userCounters[chatId][userId];
    sumApp+=userStats["заявка"]
    sumCard+=userStats["кк"]
    statsMessage += `Пользователь: @${userId} Заявки: ${
      userStats["заявка"]
    } Карты: ${userStats["кк"]} Коэф: ${
      Math.round((userStats["кк"] / userStats["заявка"]) * 100) || 0
    }% \n`;
  });
  statsMessage += `Сумма заявок: ${sumApp} карт: ${sumCard} Коэф: ${ Math.round((sumCard/sumApp) * 100) || 0}%`
  bot.sendMessage(chatId, statsMessage);
});

// Обработчик всех текстовых сообщений
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.username;
  if (msg.caption) {
    const text = msg.caption.toLowerCase();

    // Инициализируем счетчики для текущего пользователя и чата, если их еще нет
    if (!userCounters[chatId]) {
      userCounters[chatId] = {};
    }
    if (!userCounters[chatId][userId]) {
      userCounters[chatId][userId] = { заявка: 0, кк: 0 };
    }
    // Проверяем наличие ключевых слов в тексте сообщения
    if (text.includes("заявка")) {
      userCounters[chatId][userId]["заявка"]++;
    }

    if (text.includes("кк")) {
      userCounters[chatId][userId]["кк"]++;
      userCounters[chatId][userId]["заявка"]++;
    }
  }
});

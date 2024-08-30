const TelegramBot = require("node-telegram-bot-api");
const fetch = require("node-fetch");
const cron = require("node-cron"); // For scheduling tasks

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const userPreferences = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "سلام خوش اومدی! لطفا زمان مورد نظر برای دریافت گزارش آب و هوا را به فرمت HH:mm وارد کنید."
  );
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  if (msg.text.startsWith("/")) return;

  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (timePattern.test(msg.text)) {
    userPreferences[chatId] = msg.text; // Store the preferred time
    bot.sendMessage(
      chatId,
      `زمان ${msg.text} ذخیره شد. هر روز در این زمان گزارش آب و هوا ارسال خواهد شد.`
    );

    const adjustedTime = adjustTime(msg.text, -6, -30);

    scheduleDailyWeather(chatId, adjustedTime);
  } else {
    bot.sendMessage(
      chatId,
      "فرمت زمان صحیح نیست. لطفا زمان را به فرمت HH:mm وارد کنید."
    );
  }
});

function adjustTime(time, adjustHours, adjustMinutes) {
  const [hour, minute] = time.split(":").map(Number);
  let date = new Date();
  date.setHours(hour, minute, 0, 0);

  date.setHours(date.getHours() + adjustHours);
  date.setMinutes(date.getMinutes() + adjustMinutes);

  const adjustedHour = String(date.getHours()).padStart(2, "0");
  const adjustedMinute = String(date.getMinutes()).padStart(2, "0");

  return `${adjustedHour}:${adjustedMinute}`;
}

function scheduleDailyWeather(chatId, time) {
  const [hour, minute] = time.split(":");

  cron.schedule(
    `${minute} ${hour} * * *`,
    () => {
      getWeather(chatId);
    },
    {
      scheduled: true,
      timezone: "America/Sao_Paulo", 
    }
  );
}

async function getWeather(chatId) {
  const url = `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=Tehran&aqi=no`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    const location = data.location;
    const current = data.current;

    const weatherReport = `
📍 Location: ${location.name}, ${location.region}, ${location.country}
🕒 Local Time: ${location.localtime}

🌡 Temperature: ${current.temp_c}°C (${current.temp_f}°F)
🌤 Condition: ${current.condition.text}
💧 Humidity: ${current.humidity}%
🌬 Wind: ${current.wind_kph} kph (${current.wind_mph} mph) from ${current.wind_dir}
👁 Visibility: ${current.vis_km} km (${current.vis_miles} miles)
🌡 Feels Like: ${current.feelslike_c}°C (${current.feelslike_f}°F)
    `;
    bot.sendMessage(chatId, weatherReport);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    bot.sendMessage(
      chatId,
      "خطا در دریافت اطلاعات آب و هوا. لطفا دوباره امتحان کنید."
    );
  }
}

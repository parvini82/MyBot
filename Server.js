const TelegramBot = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const fetch = require("node-fetch");

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "سلام خوش اومدی");
  getWeather(chatId);
});
async function getWeather(chatId) {
  const url = `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=Tehran&aqi=no`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    //console.log(data);

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
    return bot.sendMessage(chatId, weatherReport);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return "null";
  }
}

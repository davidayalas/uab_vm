require('dotenv').config();
const puppeteer = require('puppeteer');
const TelegramBot = require('node-telegram-bot-api');

(async () => {
   const browser = await puppeteer.launch({
       headless: false,
       slowMo: 250,
       args: [
           '--no-sandbox',
           '--disable-setuid-sandbox',
           '--disable-dev-shm-usage',
           '--disable-gpu'
       ]
   });
   const page = await browser.newPage();
   const timeout = 15000;
   page.setDefaultTimeout(timeout);

   {
       const targetPage = page;
       await targetPage.setViewport({
           width: 1905,
           height: 460
       })
   }
   {
       const targetPage = page;
       await targetPage.goto('https://www.meteo.cat/');
   }
   {
       const targetPage = page;
       await targetPage.goto('https://www.meteo.cat/prediccio/municipal/081878#taula_hores');
   }

   await page.screenshot({ path: 'screenshot.png', fullPage: true });

   await browser.close();

   try {
       const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
       await bot.sendPhoto(process.env.CHAT_ID, 'screenshot.png', {
           caption: `Predicció meteorològica - ${new Date().toLocaleString('ca-ES')}`
       });
       console.log('Screenshot enviat a Telegram correctament');
   } catch (error) {
       console.error('Error enviant a Telegram:', error);
   }

})().catch(err => {
   console.error(err);
   process.exit(1);
});




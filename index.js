const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const TOKEN = process.env.TOKEN
const webAppUrl = 'https://magnificent-otter-516d9f.netlify.app';

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text
    if (text === '/start') {
        await bot.sendMessage(chatId, `Нижче з'явиться кнопка, заповни форму`, {
            reply_markup: {
                keyboard: [
                    [{ text: 'Заповни форму', web_app: { url: webAppUrl + '/form' } }]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Заходь до нашого інтернет магазину по кнопці нижче', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Зроби замовлення', web_app: { url: webAppUrl } }]
                ]
            }
        })
    }
    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);
            console.log(data);
            await bot.sendMessage(chatId, `Дякуємо за зворотній зв'язок!`);
            await bot.sendMessage(chatId, `Ваша країна: ` + data?.country);
            await bot.sendMessage(chatId, `Ваша вулиця: ` + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, `Усю інформацію ви отримаєте в цьому чаті`);
            }, 3000)
        } catch (e) {
            console.log(e);
        }

    }
});

app.post('/web-data', async (req, res) => {
    const { queryId, products, totalPrice } = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успішная покупка',
            input_message_content: { message_text: 'Вітаєємо з покупкою, ви придбали товар на суму' + totalPrice }
        })
        return res.status(200).json({})
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не вдалося отримати товар',
            input_message_content: { message_text: 'Не вдалося отримати товар' }
        })
        return res.status(500).json({})
    }

})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))


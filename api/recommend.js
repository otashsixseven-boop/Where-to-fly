import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // отдаем index.html и статику из корня

app.post('/api/recommend', async (req, res) => {
  const { city, month, budget, vibe } = req.body;

  if (!city  !month  !budget || !vibe) {
    return res.status(400).json({ error: 'Заполни все поля!' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = Ты — профессиональный тревел-эксперт. 
Пользователь ищет направление:
- Город вылета: ${city}
- Месяц: ${month}
- Бюджет: ${budget}
- Вайб: ${vibe}

Предложи топ-3 направления с подробностями (погода, бюджет, что посмотреть). Ответ на русском языке.;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({ text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка сервера при запросе к ИИ' });
  }
});

app.listen(port, () => {
  console.log(Server is running on port ${port});
});

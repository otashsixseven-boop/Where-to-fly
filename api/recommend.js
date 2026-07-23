import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/api/recommend', async (req, res) => {
  const { city, month, budget, vibe } = req.body;

  if (!city || !month || !budget || !vibe) {
    return res.status(400).json({ error: 'Заполни все поля!' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Ключ GEMINI_API_KEY не найден в Environment Variables!');
      return res.status(500).json({ error: 'API ключ не настроен на сервере' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Используем стандартную модель Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const prompt = `Ты — профессиональный тревел-эксперт. 
Пользователь ищет направление:
- Город вылета: ${city}
- Месяц: ${month}
- Бюджет: ${budget}
- Вайб: ${vibe}

Предложи топ-3 направления с подробностями (погода, бюджет, что посмотреть). Ответ на русском языке.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({ text });
  } catch (error) {
    console.error('ОШИБКА GEMINI:', error);
    return res.status(500).json({ error: `Ошибка ИИ: ${error.message || 'Неизвестный сбой'}` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

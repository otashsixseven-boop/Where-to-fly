import express from 'express';
import cors from 'cors';

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
      return res.status(500).json({ error: 'API ключ не настроен в Environment Variables' });
    }

    const prompt = `Ты — профессиональный тревел-эксперт. 
Пользователь ищет направление:
- Город вылета: ${city}
- Месяц: ${month}
- Бюджет: ${budget}
- Вайб: ${vibe}

Предложи топ-3 направления с подробностями (погода, бюджет, что посмотреть). Ответ на русском языке.`;

    // Прямой REST-запрос к официальному API Google Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Error:', data);
      return res.status(response.status).json({ 
        error: `Ошибка Google API (${response.status}): ${data.error?.message || 'Неизвестный сбой'}` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Не удалось получить текст ответа';
    return res.json({ text });

  } catch (error) {
    console.error('Ошибка сервера:', error);
    return res.status(500).json({ error: `Ошибка сервера: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

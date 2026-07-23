import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city, month, budget, vibe } = req.body;

  if (!city  !month  !budget || !vibe) {
    return res.status(400).json({ error: 'Заполни все поля!' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = Ты — профессиональный тревел-эксперт и турагент. 
Пользователь ищет идеальное направление для путешествия со следующими параметрами:
- Город вылета: ${city}
- Месяц поездки: ${month}
- Бюджет: ${budget}
- Предпочитаемый вайб/формат: ${vibe}

Предложи топ-3 лучших направления (страна/город). Для каждого направления распиши:
1. 📍 **Название места** и почему оно подходит под этот запрос.
2. 🌤 **Погода и сезон:** Комфортно ли там в ${month}.
3. 💰 **Бюджет:** Примерные расходы (перелет, жилье, еда).
4. 🎒 **Что обязательно сделать/посмотреть:** 2-3 главных фишки.

Ответ выдай на русском языке, структурированно, красиво и вдохновляюще.;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка сервера при запросе к ИИ' });
  }
}

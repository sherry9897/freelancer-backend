// 1️⃣ BACKEND: server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/generate-caption', async (req, res) => {
  const { service } = req.body;
  if (!service) return res.status(400).json({ error: 'Service is required' });

  try {
    const prompt = `You're a social media copywriter for a freelancer. Write:
1. A caption for: ${service}
2. A few hashtags
3. An image idea

Format:
Caption: ...
Hashtags: ...
ImageIdea: ...`;

    const response = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
      temperature: 0.8,
    });

    const text = response.choices[0].message.content;
    const caption = text.match(/Caption:\s*([\s\S]*?)\nHashtags:/)?.[1]?.trim();
    const hashtags = text.match(/Hashtags:\s*(.*?)\nImageIdea:/)?.[1]?.trim();
    const imageIdea = text.match(/ImageIdea:\s*(.*)/)?.[1]?.trim();

    res.json({ caption, hashtags, imageIdea });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'Failed to generate caption' });
  }
});

app.get('/', (_, res) => res.send('🧠 Freelancer AI Backend Running'));

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

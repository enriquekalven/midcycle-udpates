import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { customerAssistantAgent } from './agents/customer-assistant.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/audio', express.static(path.join(process.cwd(), 'public', 'audio')));
app.use('/api/videos', express.static(path.join(process.cwd(), 'public', 'videos')));
import path from 'path';

app.get('/api/chat/stream', async (req, res) => {
  const { message } = req.query as { message: string };

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await (customerAssistantAgent as any).runAsync({
      userId: 'anonymous-user',
      session: 'web-session-' + Date.now(),
      newMessage: {
        role: 'user',
        parts: [{ text: message }]
      }
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        res.write(`data: ${JSON.stringify({ content: chunk.content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('[ChatServer] Stream execution error:', error);
    res.write(`data: ${JSON.stringify({ errorCode: "INTERNAL_ERROR", errorMessage: error.message || "Unknown execution failure" })}\n\n`);
    res.end();
  }
});

import { chirpTtsTool } from './tools/tts-generator.js';

app.post('/api/tts', async (req, res) => {
  const { text, style = 'friendly_server', lang = 'en-US' } = req.body;
  
  if (!text) {
    return res.status(400).json({ status: "error", message: "Missing 'text' field" });
  }

  try {
    const result = await (chirpTtsTool as any).run({ text, voice_style: style, lang });
    res.json(result);
  } catch (error: any) {
    console.error('[ChatServer] TTS error:', error);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(port, () => {
  console.log(`[ChatServer] Streaming assistant backend running at http://localhost:${port}`);
});

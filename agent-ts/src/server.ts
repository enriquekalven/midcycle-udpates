import express from 'express';
import { orchestrator } from './agents/orchestrator.js';
import { InMemoryRunner } from '@google/adk';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

// A2A v0.3 Discovery Endpoints
app.get('/.well-known/agent-card.json', (req, res) => {
  const cardPath = path.resolve(process.cwd(), 'registry/agent-card.json');
  if (fs.existsSync(cardPath)) {
    const cardData = fs.readFileSync(cardPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    return res.send(cardData);
  }
  res.status(404).json({ error: 'Agent Card not found' });
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    agent: 'fishermans-wharf-agent-v2',
    protocol: 'A2A v0.3',
    discovery: '/.well-known/agent-card.json'
  });
});

app.post('/query', async (req, res) => {
  const { message, userId, sessionId } = req.body;
  if (!message || !userId) {
    return res.status(400).json({ error: 'message and userId are required' });
  }

  const runner = new InMemoryRunner({
    appName: 'fishermans-wharf-agent-v2',
    agent: orchestrator,
  });

  try {
    let lastContent = '';
    // Use runEphemeral for a single-turn query or runAsync for session-based
    for await (const event of runner.runEphemeral({
      userId,
      newMessage: { role: 'user', parts: [{ text: message }] },
    })) {
      if (event.content?.parts) {
        lastContent += event.content.parts.map((c: any) => c.text).join('');
      }
    }
    res.json({ answer: lastContent });
  } catch (error: any) {

    console.error('[Server Error]:', error);
    res.status(500).json({ error: error.message || 'internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Agent server listening on port ${port}`);
  console.log(`A2A v0.3 Discovery: http://localhost:${port}/.well-known/agent-card.json`);
});


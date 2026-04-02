/**
 * Seed script: registers AggroBot, SmartBot, RandomBot into OpenClaw Arena.
 * Also creates a demo user and sets up their balance.
 *
 * Usage: node seed.js
 * (backend must be running on localhost:3001)
 */

const http = require('http');

const BACKEND = 'http://localhost:3001';

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const url = new URL(BACKEND + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function seed() {
  const userId = 'user_demo01';

  const bots = [
    { name: 'AggroBot', endpoint_url: 'internal:aggrobot' },
    { name: 'SmartBot', endpoint_url: 'internal:smartbot' },
    { name: 'RandomBot', endpoint_url: 'internal:randombot' },
  ];

  console.log('Seeding demo agents...\n');
  for (const bot of bots) {
    const agent = await post('/agents', { user_id: userId, ...bot });
    console.log(`Registered ${bot.name}: ${agent.id}`);
  }

  console.log('\nDone! Use the agent IDs above with POST /matches/run to run matches.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  console.error('Make sure the backend is running: cd backend && npm start');
  process.exit(1);
});

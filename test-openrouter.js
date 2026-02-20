require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function test() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("No API key");
    return;
  }
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash:free',
      messages: [{role: 'user', content: 'hello'}]
    })
  });
  console.log("Status:", response.status);
  const data = await response.text();
  console.log("Data:", data);
}
test();

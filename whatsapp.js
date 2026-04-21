const https = require(‘https’);

module.exports = async function handler(req, res) {
if (req.method !== ‘POST’) {
return res.status(405).send(‘Method not allowed’);
}

const userMessage = req.body.Body;
const from = req.body.From;

if (!userMessage) {
return res.status(400).send(‘No message body’);
}

const SYSTEM_PROMPT = `You are SwiftBot, a helpful friendly AI assistant for SwiftCargo — a global freight & logistics company. Keep replies concise and warm. Use occasional emojis. You’re responding via WhatsApp so keep messages short and clear.

SwiftCargo info:

- Services: Air Freight, Sea Freight (FCL/LCL), Road Transport, Rail Freight, Warehousing, Customs Clearance
- Contact: +1 (800) 795-2460 | quotes@swiftcargo.com | 100 Trade Center Dr, Miami FL
- Hours: Mon–Fri 8AM–8PM, emergency 24/7
- 180+ countries, 50,000+ shipments/year, 98% on-time delivery, 15+ years experience
- Website: swiftcargo-xi.vercel.app

Demo shipments (for tracking questions):

- SC-2024-78432: Air Freight, New York to Frankfurt, In Transit, ETA Mar 19
- SC-2024-91205: Sea Freight, Shanghai to Los Angeles, DELIVERED Mar 10
- SC-2024-33871: Road Transport, Dubai to Mumbai, Processing, ETA Mar 22`;
  
  try {
  // Call Claude AI
  const claudeResponse = await callClaude(userMessage, SYSTEM_PROMPT);
  
  // Send WhatsApp reply via Twilio
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>

<Response>
  <Message>${claudeResponse}</Message>
</Response>`;

```
res.setHeader('Content-Type', 'text/xml');
return res.status(200).send(twimlResponse);
```

} catch (error) {
console.error(‘Error:’, error);
const errorResponse = `<?xml version="1.0" encoding="UTF-8"?> <Response> <Message>Sorry, I'm having trouble right now. Please call us at +1 (800) 795-2460 or email quotes@swiftcargo.com</Message> </Response>`;
res.setHeader(‘Content-Type’, ‘text/xml’);
return res.status(200).send(errorResponse);
}
}

function callClaude(message, systemPrompt) {
return new Promise((resolve, reject) => {
const body = JSON.stringify({
model: ‘claude-sonnet-4-20250514’,
max_tokens: 500,
system: systemPrompt,
messages: [{ role: ‘user’, content: message }]
});

```
const options = {
  hostname: 'api.anthropic.com',
  path: '/v1/messages',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  }
};

const request = https.request(options, (response) => {
  let data = '';
  response.on('data', (chunk) => { data += chunk; });
  response.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const text = parsed.content?.[0]?.text || "I couldn't process that. Please try again.";
      resolve(text);
    } catch(e) {
      reject(new Error('Failed to parse Claude response'));
    }
  });
});

request.on('error', reject);
request.write(body);
request.end();
```

});
}

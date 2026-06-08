const { Anthropic } = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: 'dummy' });

try {
  const req = anthropic.messages.buildRequest({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: 'dummy'
          }
        },
        {
          type: 'text',
          text: 'test'
        }
      ]
    }]
  });
  console.log("Built request successfully");
} catch(e) {
  console.error("Error building request:", e);
}

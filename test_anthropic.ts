import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

async function test() {
  const anthropic = new Anthropic();
  const data = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Title (Test)\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF');
  try {
    const response = await anthropic.messages.create({
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
              data: data.toString('base64')
            }
          } as any,
          {
            type: 'text',
            text: 'What is this document?'
          }
        ]
      }]
    });
    console.log(response);
  } catch(e) {
    console.error(e);
  }
}
test();

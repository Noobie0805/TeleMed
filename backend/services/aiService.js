import fetch from 'node-fetch';

const HF_API_TOKEN = process.env.HF_API_TOKEN;
const MODEL_URL = 'https://api-inference.huggingface.co/models/deepset/roberta-base-squad2';

export async function askAI(question, context = 'Provide a medical answer as an AI assistant.') {
  const response = await fetch(MODEL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {
        question,
        context,
      },
    }),
  });
  const data = await response.json();
  return data;
} 
const fs = require('fs/promises');
const config =
require("../config/config");
const SYSTEM_PROMPT = 'Analyze this anatomy/object image for a medical-tech visualization app. Return strict JSON only with: object string, description string, labels string array, confidence number between 0 and 1.';

function stripJsonFence(text) {
  return String(text || '{}').replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
}

function normalizeAnalysis(parsed, provider, model) {
  return {
    object: parsed.object || parsed.name || 'unknown anatomy/object',
    description: parsed.description || parsed.analysis || '',
    labels: Array.isArray(parsed.labels) ? parsed.labels : [],
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : undefined,
    provider,
    model,
    raw: parsed,
  };
}

async function analyzeImage(imagePath, mimeType) {
  const provider = (process.env.AI_ANALYSIS_PROVIDER || 'mock').toLowerCase();
  if (provider === 'gemini') return analyzeWithGemini(imagePath, mimeType);
  if (provider === 'openai') return analyzeWithOpenAICompatible(imagePath, mimeType, {
    provider: 'openai',
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  });
  if (provider === 'openrouter') return analyzeWithOpenAICompatible(imagePath, mimeType, {
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-exp:free',
  });
  if (provider === 'compatible') return analyzeWithOpenAICompatible(imagePath, mimeType, {
    provider: process.env.COMPATIBLE_PROVIDER_NAME || 'compatible',
    apiKey: process.env.COMPATIBLE_API_KEY,
    baseUrl: process.env.COMPATIBLE_BASE_URL,
    model: process.env.COMPATIBLE_MODEL,
  });
  return normalizeAnalysis({ object: 'anatomy specimen', description: 'Mock analysis. Configure AI_ANALYSIS_PROVIDER with gemini, openai, openrouter, or compatible to use your preferred free-tier or paid model.', labels: ['specimen', 'structure', '3d-ready'], confidence: 0 }, 'mock', 'mock');
}

async function analyzeWithGemini(imagePath, mimeType) {
  if (!config.geminiKey) throw new Error('GEMINI_API_KEY missing for AI_ANALYSIS_PROVIDER=gemini');
  const imageBase64 = await fs.readFile(imagePath, 'base64');
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const body = { contents: [{ parts: [{ text: SYSTEM_PROMPT }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }], generationConfig: { response_mime_type: 'application/json' } };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiKey}`;
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`Gemini failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return normalizeAnalysis(JSON.parse(stripJsonFence(text)), 'gemini', model);
}

async function analyzeWithOpenAICompatible(imagePath, mimeType, config) {
  if (!config.apiKey) throw new Error(`${config.provider.toUpperCase()} API key missing`);
  if (!config.baseUrl || !config.model) throw new Error(`${config.provider} base URL and model are required`);
  const imageBase64 = await fs.readFile(imagePath, 'base64');
  const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      'HTTP-Referer': process.env.API_PUBLIC_URL,
      'X-Title': 'Dissectra',
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: [{ type: 'text', text: SYSTEM_PROMPT }, { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } }] }],
    }),
  });
  if (!response.ok) throw new Error(`${config.provider} failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '{}';
  return normalizeAnalysis(JSON.parse(stripJsonFence(text)), config.provider, config.model);
}

module.exports = {
    analyzeImage,
    analyzeWithGemini,
};
const fs = require('fs/promises');
async function analyzeWithGemini(imagePath, mimeType) {
  if (!process.env.GEMINI_API_KEY) return { object: 'anatomy specimen', description: 'Mock analysis because GEMINI_API_KEY is not configured. Configure backend/.env for cloud AI.', labels: ['specimen', 'structure', '3d-ready'], confidence: 0 };
  const imageBase64 = await fs.readFile(imagePath, 'base64');
  const body = { contents: [{ parts: [{ text: 'Analyze this anatomy/object image. Return strict JSON with object, description, labels array, confidence.' }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }], generationConfig: { response_mime_type: 'application/json' } };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-1.5-flash'}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`Gemini failed: ${response.status} ${await response.text()}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const parsed = JSON.parse(text.replace(/^```json|```$/g, '').trim());
  return { object: parsed.object || 'unknown anatomy', description: parsed.description || '', labels: Array.isArray(parsed.labels) ? parsed.labels : [], confidence: parsed.confidence, raw: parsed };
}
module.exports = { analyzeWithGemini };

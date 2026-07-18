export const DEFAULT_COMPONENTS = [
  {
    name: 'Main Body',
    function: 'Primary structure',
    material: 'Unknown',
    category: 'Structural',
  },
];

const stripCodeFence = (text) => text
  .replace(/^```(?:json)?\s*/i, '')
  .replace(/\s*```$/i, '')
  .trim();

const findJsonObject = (text) => {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return text;
  }

  return text.slice(firstBrace, lastBrace + 1);
};

const normalizeComponent = (component, index) => ({
  name: component?.name || `Component ${index + 1}`,
  function: component?.function || component?.purpose || 'Unknown',
  material: component?.material || 'Unknown',
  category: component?.category || 'General',
});

export function parseGeminiDissectionResponse(aiResponse) {
  const textOutput = aiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput || typeof textOutput !== 'string') {
    return {
      productName: 'unknown product',
      components: DEFAULT_COMPONENTS,
      rawText: '',
      parseError: 'Gemini response did not include text output',
    };
  }

  try {
    const jsonText = findJsonObject(stripCodeFence(textOutput));
    const parsed = JSON.parse(jsonText);
    const components = Array.isArray(parsed.components) && parsed.components.length > 0
      ? parsed.components.map(normalizeComponent)
      : DEFAULT_COMPONENTS;

    return {
      productName: parsed.product || parsed.productName || 'unknown product',
      components,
      rawText: textOutput,
      parseError: null,
    };
  } catch (error) {
    return {
      productName: 'unknown product',
      components: DEFAULT_COMPONENTS,
      rawText: textOutput,
      parseError: error.message,
    };
  }
}

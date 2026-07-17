import { parseGeminiDissectionResponse, DEFAULT_COMPONENTS } from '../src/utils/parseGeminiDissectionResponse';

const geminiResponse = (text) => ({
  candidates: [{ content: { parts: [{ text }] } }],
});

describe('parseGeminiDissectionResponse', () => {
  it('parses raw JSON responses', () => {
    const result = parseGeminiDissectionResponse(geminiResponse(JSON.stringify({
      product: 'Camera',
      components: [{ name: 'Lens', function: 'Focuses light', material: 'Glass', category: 'Optical' }],
    })));

    expect(result.productName).toBe('Camera');
    expect(result.components).toEqual([
      { name: 'Lens', function: 'Focuses light', material: 'Glass', category: 'Optical' },
    ]);
    expect(result.parseError).toBeNull();
  });

  it('parses fenced JSON with surrounding text', () => {
    const result = parseGeminiDissectionResponse(geminiResponse(`Here is the result:\n\`\`\`json\n{
      "product": "Headphones",
      "components": [{ "name": "Speaker", "purpose": "Audio output" }]
    }\n\`\`\``));

    expect(result.productName).toBe('Headphones');
    expect(result.components[0]).toEqual({
      name: 'Speaker',
      function: 'Audio output',
      material: 'Unknown',
      category: 'General',
    });
  });

  it('falls back safely on invalid output', () => {
    const result = parseGeminiDissectionResponse(geminiResponse('not json'));

    expect(result.productName).toBe('unknown product');
    expect(result.components).toEqual(DEFAULT_COMPONENTS);
    expect(result.parseError).toBeTruthy();
  });
});

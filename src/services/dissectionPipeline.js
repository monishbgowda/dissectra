import { convertToBase64 } from '../modules/Base64Converter';
import { analyzeImage } from '../modules/GeminiAnalyser';
import { getModel } from './modelRetrieval';
import { parseGeminiDissectionResponse } from '../utils/parseGeminiDissectionResponse';

export async function runDissectionPipeline(imagePath) {
  const base64 = await convertToBase64(imagePath);
  const aiResponse = await analyzeImage(base64);
  const analysis = parseGeminiDissectionResponse(aiResponse);
  const model = await getModel(analysis.productName, base64);

  return {
    ...analysis,
    modelUrl: model?.url || model,
    modelSource: model?.source || 'unknown',
    modelReason: model?.reason || null,
  };
}

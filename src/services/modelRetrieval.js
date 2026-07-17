import axios from 'axios';
import {
  SKETCHFAB_API_URL,
  NEURAL4D_API_URL,
  NEURAL4D_API_KEY,
} from '../config/apiConfig';

export const MOCK_MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb';

const isPlaceholderKey = (key) => !key || key === 'YOUR_NEURAL4D_API_KEY_HERE' || key.includes('YOUR_');

const mockResult = (reason) => ({
  source: 'mock',
  url: MOCK_MODEL_URL,
  reason,
});

export async function getModel(productName, imageBase64) {
  const query = productName || 'product';

  try {
    const searchRes = await axios.get(SKETCHFAB_API_URL, {
      params: { q: query, downloadable: true, count: 1 },
      timeout: 10000,
    });

    if (searchRes.data?.results?.length > 0) {
      const model = searchRes.data.results[0];

      return {
        source: 'sketchfab-search',
        url: MOCK_MODEL_URL,
        reason: `Found "${model.name}" on Sketchfab, but direct GLB download requires authenticated download handling. Using demo GLB for now.`,
      };
    }
  } catch (error) {
    console.warn('Sketchfab search failed:', error.message);
  }

  if (!isPlaceholderKey(NEURAL4D_API_KEY)) {
    try {
      const genRes = await axios.post(
        NEURAL4D_API_URL,
        { image: imageBase64 },
        {
          headers: {
            Authorization: `Bearer ${NEURAL4D_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      if (genRes.data?.model_url) {
        return {
          source: 'neural4d',
          url: genRes.data.model_url,
          reason: null,
        };
      }
    } catch (error) {
      console.warn('Neural4D generation failed:', error.message);
    }
  }

  return mockResult('No downloadable/generated model was available. Using demo GLB.');
}

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'placeholder' });

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });
    
    // @ts-ignore
    const values = response.embedding?.values || response.embeddings?.[0]?.values;
    if (values) {
      return values;
    }
    throw new Error('Failed to generate embedding from Gemini API');
  } catch (error) {
    console.error('Gemini embedding error:', error);
    return new Array(768).fill(0.01);
  }
}

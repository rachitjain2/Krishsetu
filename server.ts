import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'KrishiSetu API' });
});

// API: AI Crop Advisor
app.post('/api/advisor/analyze', async (req, res) => {
  try {
    const {
      cropName,
      location,
      landSize,
      sowingDate,
      expectedHarvestDate,
      currentQuantity,
      farmerQuestion,
    } = req.body;

    if (!cropName || !location) {
      return res.status(400).json({
        error: 'Crop name and location are required fields.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `You are KrishiSetu AI Crop Advisor, an expert agricultural economist and agronomy advisor specializing in Indian agriculture, regional cropping calendars, crop rotation, mandi supply-demand dynamics, post-harvest storage, and farmer profitability.
Your task is to analyze farmer-provided harvest details and deliver actionable, prudent advice.

CRITICAL INSTRUCTIONS:
1. Clearly state insights as AI-generated strategic estimates.
2. DO NOT fabricate or invent specific spot rupee prices as verified live real-time market data. Instead focus on relative demand pressure (Low / Medium / High), supply arrival volume windows, quality preservation, and strategic timing (Sell Now / Hold / Store).
3. Ensure demandLevel is strictly one of: "Low", "Medium", or "High".
4. Ensure sellingRecommendation is strictly one of: "Sell Now", "Hold", or "Store".
5. Give realistic next-season crop rotation options suited for Indian agronomy (e.g. Rabi after Kharif, Zaid pulses, soil nitrogen replenishing legumes).
6. Give clear practical factors to consider.
7. Address any specific farmer question clearly and practically in Hindi/English agricultural terms.`;

    const userPrompt = `Please analyze the following crop and harvest data for an Indian farmer:
- Crop Name: ${cropName}
- Farmer Location: ${location}
- Land Size: ${landSize || 'Not specified'}
- Sowing Date: ${sowingDate || 'Not specified'}
- Expected Harvest Date: ${expectedHarvestDate || 'Not specified'}
- Current Crop Quantity: ${currentQuantity || 'Not specified'}
- Farmer's Specific Question: ${farmerQuestion || 'None provided'}

Provide a comprehensive agricultural advisory evaluation in the requested JSON structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropSituationSummary: {
              type: Type.STRING,
              description: 'Concise summary of the crop situation and stage based on the dates and location.',
            },
            demandLevel: {
              type: Type.STRING,
              description: 'Estimated demand level: must be strictly "Low", "Medium", or "High".',
            },
            sellingRecommendation: {
              type: Type.STRING,
              description: 'Selling recommendation: must be strictly "Sell Now", "Hold", or "Store".',
            },
            recommendationReasoning: {
              type: Type.STRING,
              description: 'Clear, detailed reasoning explaining why this recommendation is given.',
            },
            nextSeasonSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cropName: { type: Type.STRING },
                  hindiName: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  suitabilityScore: { type: Type.STRING },
                },
                required: ['cropName', 'rationale'],
              },
              description: '2-3 viable next season crop rotation suggestions.',
            },
            importantFactors: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: '4-5 important factors the farmer should consider.',
            },
            customQuestionAnswer: {
              type: Type.STRING,
              description: 'Direct response to the farmer question if asked, or practical tip.',
            },
            disclaimer: {
              type: Type.STRING,
              description: 'Clear notice stating this is an AI-generated advisory estimate.',
            },
          },
          required: [
            'cropSituationSummary',
            'demandLevel',
            'sellingRecommendation',
            'recommendationReasoning',
            'nextSeasonSuggestions',
            'importantFactors',
            'disclaimer',
          ],
        },
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsedData = JSON.parse(responseText);

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini Crop Advisor Error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate AI Crop Advisory. Please try again.',
    });
  }
});

// Vite middleware / Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KrishiSetu Full-Stack Server running on port ${PORT}`);
  });
}

startServer();

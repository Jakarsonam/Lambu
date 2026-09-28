import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Health / config info
app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    imageModel: 'gemini-3.1-flash-image-preview',
    videoModel: 'veo-3.1-fast-generate-preview',
  });
});

// API: Create or Edit Image
app.post('/api/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, image, aspectRatio = '1:1', imageSize = '1K' } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'A text prompt is required.' });
      return;
    }

    const ai = getGeminiClient();

    // Prepare contents
    const parts: any[] = [];

    // If an existing image was provided, add it for image editing
    if (image && image.data) {
      // Clean base64 string if it contains data prefix
      const cleanData = image.data.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanData,
          mimeType: image.mimeType || 'image/jpeg',
        },
      });
    }

    parts.push({ text: prompt });

    const imageConfig: any = {
      aspectRatio: aspectRatio || '1:1',
    };
    if (imageSize) {
      imageConfig.imageSize = imageSize;
    }

    const modelsToTry = [
      'gemini-3.1-flash-image-preview',
      'gemini-3.1-flash-image',
      'gemini-3.1-flash-lite-image',
    ];

    let lastError: any = null;
    let response: any = null;
    let usedModel = '';

    for (const model of modelsToTry) {
      try {
        usedModel = model;
        response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            imageConfig,
          },
        });
        if (response) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Failed with model ${model}, trying fallback if available...`, err?.message || err);
      }
    }

    if (!response) {
      throw lastError || new Error('Image generation failed on all models.');
    }

    let imageUrl = '';
    let textResponse = '';

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    if (!imageUrl) {
      res.status(500).json({
        error: 'No image was generated in the model output.',
        modelMessage: textResponse || undefined,
      });
      return;
    }

    res.json({
      success: true,
      imageUrl,
      text: textResponse,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Error generating/editing image:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while processing the image.',
    });
  }
});

// API: Generate Video (Veo) - Step 1: Start
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, image, aspectRatio = '16:9' } = req.body;

    const ai = getGeminiClient();

    // Required aspect ratio: '16:9' or '9:16'
    const validAspectRatio = aspectRatio === '9:16' ? '9:16' : '16:9';

    const config: any = {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: validAspectRatio,
    };

    const params: any = {
      model: 'veo-3.1-fast-generate-preview',
      config,
    };

    if (prompt && prompt.trim()) {
      params.prompt = prompt.trim();
    } else {
      params.prompt = 'Cinematic slow camera motion with realistic subtle lighting and movement.';
    }

    if (image && image.imageBytes) {
      const cleanBytes = image.imageBytes.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
      params.image = {
        imageBytes: cleanBytes,
        mimeType: image.mimeType || 'image/jpeg',
      };
    }

    let operation;
    try {
      operation = await ai.models.generateVideos(params);
    } catch (err: any) {
      console.warn('veo-3.1-fast-generate-preview failed, trying veo-3.1-lite-generate-preview...', err?.message);
      params.model = 'veo-3.1-lite-generate-preview';
      operation = await ai.models.generateVideos(params);
    }

    res.json({
      operationName: operation.name,
      model: params.model,
    });
  } catch (error: any) {
    console.error('Error starting video generation:', error);
    res.status(500).json({
      error: error.message || 'Failed to initiate video generation.',
    });
  }
});

// API: Generate Music using Lyria (lyria-3-clip-preview or lyria-3-pro-preview)
app.post('/api/generate-music', async (req: Request, res: Response) => {
  try {
    const { prompt, model = 'lyria-3-clip-preview' } = req.body;
    const selectedModel = model === 'lyria-3-pro-preview' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'A prompt description is required for music generation.' });
      return;
    }

    const ai = getGeminiClient();

    try {
      const interaction = await ai.interactions.create({
        model: selectedModel,
        input: prompt.trim(),
        response_format: { type: 'audio' },
      }, { timeout: 300000 });

      let audioData = '';
      let mimeType = 'audio/mp3';

      if ((interaction as any).output_audio) {
        audioData = (interaction as any).output_audio.data;
        mimeType = (interaction as any).output_audio.mime_type || 'audio/mp3';
      } else if (interaction.steps) {
        for (const step of interaction.steps) {
          if (step.type === 'model_output' && Array.isArray(step.content)) {
            for (const item of step.content as any[]) {
              if (item.type === 'audio' && item.data) {
                audioData = item.data;
                mimeType = item.mime_type || 'audio/mp3';
                break;
              }
            }
          }
        }
      }

      if (!audioData) {
        throw new Error('No audio content was generated by Lyria model.');
      }

      const audioUrl = `data:${mimeType};base64,${audioData}`;
      res.json({
        success: true,
        audioUrl,
        mimeType,
        model: selectedModel,
        prompt: prompt.trim(),
      });
    } catch (apiError: any) {
      console.warn('Lyria API returned error:', apiError?.message);
      const isQuotaError = 
        apiError?.message?.includes('Rate limit') || 
        apiError?.message?.includes('Free Tier') || 
        apiError?.status === 429 || 
        apiError?.statusCode === 429;

      res.status(isQuotaError ? 429 : 500).json({
        error: apiError?.message || 'Music generation failed.',
        isQuotaError: !!isQuotaError,
        requiresPaidTier: !!isQuotaError,
        model: selectedModel,
      });
    }
  } catch (error: any) {
    console.error('Error generating music:', error);
    res.status(500).json({
      error: error.message || 'Failed to process music generation request.',
    });
  }
});

// API: Generate Video (Veo) - Step 2: Poll Status
app.post('/api/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      res.status(400).json({ error: 'operationName is required' });
      return;
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    res.json({
      done: !!updated.done,
      error: updated.error || null,
      metadata: updated.metadata || null,
    });
  } catch (error: any) {
    console.error('Error polling video operation:', error);
    res.status(500).json({
      error: error.message || 'Failed to check video status.',
    });
  }
});

// API: Generate Video (Veo) - Step 3: Download
app.post('/api/video-download', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      res.status(400).json({ error: 'operationName is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
      return;
    }

    const ai = getGeminiClient();
    const op = new GenerateVideosOperation();
    op.name = operationName;

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (!updated.done) {
      res.status(400).json({ error: 'Video generation is not yet complete.' });
      return;
    }

    const uri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) {
      res.status(404).json({ error: 'Video URI not found in completed operation.' });
      return;
    }

    const videoRes = await fetch(uri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video from storage: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (videoRes.body) {
      const reader = videoRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const arrayBuffer = await videoRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    }
  } catch (error: any) {
    console.error('Error downloading video:', error);
    res.status(500).json({
      error: error.message || 'Failed to download generated video.',
    });
  }
});

// Setup server with Vite in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Phunsto Lumbu app running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

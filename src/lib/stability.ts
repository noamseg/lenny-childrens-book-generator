import { IllustrationStyle } from '@/types';

const STABILITY_API_URL = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';

interface GenerateImageParams {
  prompt: string;
  style: IllustrationStyle;
  negativePrompt?: string;
}

interface StabilityResponse {
  artifacts: Array<{
    base64: string;
    seed: number;
    finishReason: string;
  }>;
}

// Style-specific prompt prefixes for better illustration quality
const STYLE_PREFIXES: Record<IllustrationStyle, string> = {
  watercolor: 'watercolor painting, soft colors, gentle brush strokes, children\'s book illustration,',
  cartoon: 'cartoon style, bold outlines, vibrant colors, playful, children\'s book illustration,',
  storybook: 'classic storybook illustration, warm lighting, detailed background, children\'s book art,',
  whimsical: 'whimsical fantasy art, magical atmosphere, dreamy colors, children\'s book illustration,',
  minimalist: 'minimalist illustration, simple shapes, clean lines, soft pastel colors, children\'s book,',
};

// Default negative prompt for child-safe content
const DEFAULT_NEGATIVE_PROMPT =
  'scary, violent, adult content, realistic photo, photorealistic, dark, horror, blood, weapons, nsfw, text, words, letters, watermark, signature';

export async function generateImage(params: GenerateImageParams): Promise<string> {
  const { prompt, style, negativePrompt = DEFAULT_NEGATIVE_PROMPT } = params;

  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error('STABILITY_API_KEY environment variable is not set');
  }

  const styledPrompt = `${STYLE_PREFIXES[style]} ${prompt}`;

  const response = await fetch(STABILITY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [
        {
          text: styledPrompt,
          weight: 1,
        },
        {
          text: negativePrompt,
          weight: -1,
        },
      ],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      samples: 1,
      steps: 30,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stability AI API error: ${response.status} - ${error}`);
  }

  const data: StabilityResponse = await response.json();

  if (!data.artifacts || data.artifacts.length === 0) {
    throw new Error('No image generated');
  }

  // Return base64 data URL
  return `data:image/png;base64,${data.artifacts[0].base64}`;
}

export async function generateBookImages(
  pages: Array<{ pageNumber: number; imagePrompt: string }>,
  style: IllustrationStyle,
  onProgress?: (pageNumber: number, imageUrl: string) => void
): Promise<Array<{ pageNumber: number; imageUrl: string }>> {
  const results: Array<{ pageNumber: number; imageUrl: string }> = [];

  // Generate images sequentially to avoid rate limiting
  for (const page of pages) {
    const imageUrl = await generateImage({
      prompt: page.imagePrompt,
      style,
    });

    results.push({
      pageNumber: page.pageNumber,
      imageUrl,
    });

    if (onProgress) {
      onProgress(page.pageNumber, imageUrl);
    }
  }

  return results;
}

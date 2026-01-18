import { fal } from "@fal-ai/client";
import { IllustrationStyle, CharacterDescriptions } from "@/types";

// Style-specific prompt prefixes for better illustration quality
const STYLE_PREFIXES: Record<IllustrationStyle, string> = {
  watercolor:
    "watercolor painting, soft colors, gentle brush strokes, children's book illustration,",
  cartoon:
    "cartoon style, bold outlines, vibrant colors, playful, children's book illustration,",
  storybook:
    "classic storybook illustration, warm lighting, detailed background, children's book art,",
  whimsical:
    "whimsical fantasy art, magical atmosphere, dreamy colors, children's book illustration,",
  minimalist:
    "minimalist illustration, simple shapes, clean lines, soft pastel colors, children's book,",
};

// Default negative prompt elements to avoid
const SAFETY_SUFFIX =
  ", child-friendly, colorful, warm lighting, no text, no words, no letters";

interface FalImageResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
}

/**
 * Generate a character reference image using FLUX text-to-image.
 * This creates a clear portrait that will be used as visual reference
 * for maintaining character consistency across all page illustrations.
 */
export async function generateCharacterReference(
  characterDescription: string,
  style: IllustrationStyle
): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux/dev", {
    input: {
      prompt: `${STYLE_PREFIXES[style]} Portrait of ${characterDescription}, facing slightly right, clear view of face and upper body, children's book character design, centered composition${SAFETY_SUFFIX}`,
      image_size: "square_hd",
      num_images: 1,
      enable_safety_checker: true,
    },
  });

  const data = result.data as FalImageResult;
  if (!data.images || data.images.length === 0) {
    throw new Error("No character reference image generated");
  }

  return data.images[0].url;
}

/**
 * Generate a scene illustration with character consistency using fal.ai Instant Character.
 * The reference image ensures the character looks the same across all pages,
 * while the scene prompt describes what's happening on this specific page.
 */
export async function generateSceneWithCharacter(
  scenePrompt: string,
  characterReferenceUrl: string,
  style: IllustrationStyle,
  scale: number = 1.2 // Higher = stronger identity preservation (0-2)
): Promise<string> {
  const result = await fal.subscribe("fal-ai/instant-character", {
    input: {
      prompt: `${STYLE_PREFIXES[style]} ${scenePrompt}${SAFETY_SUFFIX}`,
      image_url: characterReferenceUrl,
      scale: scale,
      image_size: "landscape_16_9",
      guidance_scale: 3.5,
      num_inference_steps: 28,
      enable_safety_checker: true,
    },
  });

  const data = result.data as FalImageResult;
  if (!data.images || data.images.length === 0) {
    throw new Error("No scene image generated");
  }

  return data.images[0].url;
}

/**
 * Generate a scene illustration without character reference (fallback).
 * Used when no character reference is available.
 */
export async function generateSceneWithoutCharacter(
  scenePrompt: string,
  style: IllustrationStyle
): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux/dev", {
    input: {
      prompt: `${STYLE_PREFIXES[style]} ${scenePrompt}${SAFETY_SUFFIX}`,
      image_size: "landscape_16_9",
      num_images: 1,
      enable_safety_checker: true,
    },
  });

  const data = result.data as FalImageResult;
  if (!data.images || data.images.length === 0) {
    throw new Error("No image generated");
  }

  return data.images[0].url;
}

interface GeneratedImage {
  pageNumber: number;
  imageUrl: string;
}

interface PageInput {
  pageNumber: number;
  imagePrompt: string;
}

/**
 * Generate all book images with consistent characters.
 *
 * Flow:
 * 1. Generate character reference image(s) using FLUX text-to-image
 * 2. For each page, call Instant Character API with the reference + scene prompt
 *
 * The character reference ensures visual consistency, while each page's
 * imagePrompt focuses purely on the scene/action (narrative fidelity).
 */
export async function generateBookImages(
  pages: PageInput[],
  style: IllustrationStyle,
  characterDescriptions?: CharacterDescriptions,
  onProgress?: (pageNumber: number, imageUrl: string) => void
): Promise<GeneratedImage[]> {
  let mainCharacterRef: string | null = null;

  // Step 1: Generate character reference image if we have a description
  if (characterDescriptions?.mainCharacter) {
    try {
      console.log("Generating main character reference image...");
      mainCharacterRef = await generateCharacterReference(
        characterDescriptions.mainCharacter,
        style
      );
      console.log("Character reference generated:", mainCharacterRef);
    } catch (error) {
      console.error("Failed to generate character reference:", error);
      // Continue without character reference - will use fallback
    }
  }

  // Step 2: Generate each page illustration
  const results: GeneratedImage[] = [];

  for (const page of pages) {
    try {
      let imageUrl: string;

      if (mainCharacterRef) {
        // Use Instant Character for consistent character appearance
        imageUrl = await generateSceneWithCharacter(
          page.imagePrompt,
          mainCharacterRef,
          style
        );
      } else {
        // Fallback: generate without character reference
        imageUrl = await generateSceneWithoutCharacter(page.imagePrompt, style);
      }

      results.push({
        pageNumber: page.pageNumber,
        imageUrl,
      });

      if (onProgress) {
        onProgress(page.pageNumber, imageUrl);
      }
    } catch (error) {
      console.error(`Failed to generate image for page ${page.pageNumber}:`, error);
      // Add a placeholder for failed pages
      results.push({
        pageNumber: page.pageNumber,
        imageUrl: `https://placehold.co/1920x1080/E8D5B7/333333?text=Page+${page.pageNumber}`,
      });
    }
  }

  return results;
}

/**
 * Configure the fal.ai client with credentials.
 * This should be called once at the start of image generation.
 */
export function configureFalClient(): void {
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error("FAL_KEY environment variable is not set");
  }

  fal.config({
    credentials: apiKey,
  });
}

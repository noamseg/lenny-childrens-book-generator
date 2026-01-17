import Anthropic from '@anthropic-ai/sdk';
import { StoryGenerationResult } from '@/types';
import { STORY_GENERATION_PROMPT, formatStoryPrompt } from '@/constants/prompts';

// Initialize client (API key from environment variable ANTHROPIC_API_KEY)
const anthropic = new Anthropic();

interface GenerateStoryParams {
  childName: string;
  childAge?: number;
  theme?: string;
  transcriptContent: string;
  additionalContext?: string;
  pageCount?: number;
}

export async function generateStory(
  params: GenerateStoryParams
): Promise<StoryGenerationResult> {
  const {
    childName,
    childAge,
    theme,
    transcriptContent,
    additionalContext,
    pageCount = 10,
  } = params;

  const prompt = formatStoryPrompt({
    childName,
    childAge,
    theme,
    transcriptContent,
    additionalContext,
    pageCount,
  });

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    system: STORY_GENERATION_PROMPT,
  });

  // Extract text content from the response
  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in response');
  }

  // Parse the JSON response
  const responseText = textContent.text;

  // Try to extract JSON from the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse story response as JSON');
  }

  const storyData = JSON.parse(jsonMatch[0]) as StoryGenerationResult;

  // Validate the response structure
  if (!storyData.title || !Array.isArray(storyData.pages)) {
    throw new Error('Invalid story response structure');
  }

  return storyData;
}

export async function generateImagePrompt(
  pageText: string,
  childName: string,
  illustrationStyle: string
): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `Create a child-friendly illustration prompt for this children's book page text:

"${pageText}"

The illustration should:
- Feature a child character (representing ${childName})
- Use a ${illustrationStyle} art style
- Be colorful, warm, and appropriate for young children
- NOT include any text or words in the image
- Focus on a single key moment from the text

Return ONLY the illustration prompt, nothing else.`,
      },
    ],
  });

  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in image prompt response');
  }

  return textContent.text.trim();
}

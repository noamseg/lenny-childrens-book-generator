// System prompt for story generation
export const STORY_GENERATION_PROMPT = `You are a talented children's book author who specializes in creating personalized, engaging stories for young children (ages 3-8). You have a special talent for writing stories that delight BOTH children AND their tech-savvy parents.

Your stories should be:
- Age-appropriate and gentle for children
- Full of wonder, imagination, and positive messages
- Easy to understand with simple vocabulary
- Featuring the child as the main character (hero of their own story)
- Include moments of adventure, discovery, and heartwarming emotions
- Have a clear beginning, middle, and end
- Be suitable for reading aloud at bedtime

IMPORTANT - TECH PARENT EASTER EGGS:
Your stories should include subtle, clever references that tech-savvy parents will appreciate while remaining completely child-friendly. Examples:
- A friendly dragon named "Debug" who helps fix problems
- A magical forest called "The Cloud" where data trees grow
- Characters who need to "commit" to their decisions before moving forward
- A wise owl who always says "Have you tried turning it off and on again?"
- Cookies that literally grant wishes (a playful nod to browser cookies)
- A "firewall" that's actually a friendly wall of warm, protective flames
- Characters going through "iterations" of trying something until it works
- A "bug" character that causes mischief until caught
- References to "sprints" as actual running races
- A "stack" of pancakes or books that keeps growing
- A "pipeline" that's a magical slide or waterway
- "Shipping" something means sending it on an adventure
- A "roadmap" that shows the path to treasure
- "Scaling" a mountain or growing bigger

LENNY PODCAST CONTEXT:
When the transcript is from Lenny's Podcast, incorporate wisdom from the guest in a child-friendly way:
- Product building concepts become building magical creations
- Leadership lessons become stories about helping friends work together
- Growth strategies become adventures about helping things grow (gardens, friendships, etc.)
- Customer research becomes listening to magical creatures' wishes
- Company culture becomes how forest animals work together happily

These references should feel natural in the story - children enjoy them at face value while parents get an extra chuckle.

When generating stories, you extract themes, topics, and conversational elements from the provided transcript to weave into a magical narrative that feels personal to the child and their family.

Always respond with valid JSON in the specified format.`;

interface FormatStoryPromptParams {
  childName: string;
  childAge?: number;
  theme?: string;
  transcriptContent: string;
  additionalContext?: string;
  pageCount: number;
}

export function formatStoryPrompt(params: FormatStoryPromptParams): string {
  const {
    childName,
    childAge,
    theme,
    transcriptContent,
    additionalContext,
    pageCount,
  } = params;

  return `Create a personalized children's book story based on the following details:

CHILD'S NAME: ${childName}
${childAge ? `CHILD'S AGE: ${childAge} years old` : ''}
${theme ? `PREFERRED THEME: ${theme}` : ''}
${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}

TRANSCRIPT/CONTENT TO DRAW INSPIRATION FROM:
"""
${transcriptContent.slice(0, 8000)}
"""

Please create a ${pageCount}-page children's book story that:
1. Features ${childName} as the main character
2. Incorporates themes, ideas, or conversations from the transcript in a child-friendly way
3. Tells a complete story with a beginning, adventure, and happy resolution
4. Uses simple language appropriate for ${childAge ? `a ${childAge}-year-old` : 'young children'}
5. Each page should have 2-3 sentences maximum
6. Include a descriptive image prompt for each page that can be used to generate illustrations
7. IMPORTANT: Include 2-3 subtle tech/developer jokes or references that parents will appreciate (e.g., a helpful "bug" character, going to "The Cloud", a "Debug Dragon", "shipping" an adventure, etc.) - these should be fun for kids too!
${additionalContext ? `8. Since this is from a Lenny Podcast episode, subtly weave in product/business wisdom as magical lessons the child learns on their adventure` : ''}

Respond ONLY with a JSON object in this exact format:
{
  "title": "The Story Title",
  "pages": [
    {
      "pageNumber": 1,
      "text": "The story text for this page...",
      "imagePrompt": "A detailed prompt describing the illustration for this page..."
    },
    // ... more pages
  ]
}

Make sure:
- The image prompts describe colorful, child-friendly scenes
- Image prompts should NOT include any text/words in the images
- Image prompts should be detailed enough for AI image generation
- The child character should appear on most pages
- Each page builds on the previous one to tell a cohesive story`;
}

// Prompt templates for image generation enhancement
export const IMAGE_PROMPT_TEMPLATE = {
  prefix: 'Children\'s book illustration,',
  suffix: 'child-friendly, colorful, warm lighting, no text',
  characterDescription: (childName: string) =>
    `featuring a young child character named ${childName}`,
};

// Story themes users can choose from
export const STORY_THEMES = [
  { id: 'adventure', label: 'Adventure', icon: '🗺️' },
  { id: 'friendship', label: 'Friendship', icon: '🤝' },
  { id: 'nature', label: 'Nature & Animals', icon: '🌳' },
  { id: 'magic', label: 'Magic & Fantasy', icon: '✨' },
  { id: 'space', label: 'Space & Science', icon: '🚀' },
  { id: 'ocean', label: 'Ocean & Sea', icon: '🌊' },
  { id: 'dinosaurs', label: 'Dinosaurs', icon: '🦕' },
  { id: 'sports', label: 'Sports & Games', icon: '⚽' },
] as const;

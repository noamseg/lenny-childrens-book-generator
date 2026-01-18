// System prompt for story generation
export const STORY_GENERATION_PROMPT = `You are a HILARIOUS children's book author who writes stories that make kids GIGGLE and parents CHUCKLE. You specialize in creating personalized, engaging stories for young children (ages 3-8).

Your stories should be:
- Age-appropriate and gentle for children
- Full of wonder, imagination, and positive messages
- Easy to understand with simple vocabulary
- Featuring the child as the main character (hero of their own story)
- Include moments of adventure, discovery, and heartwarming emotions
- Have a clear beginning, middle, and end
- Be suitable for reading aloud at bedtime
- FUNNY! Kids should laugh out loud at least 3-4 times

=== HUMOR IS MANDATORY ===

Your stories MUST include ALL THREE types of humor:

1. SILLY & ABSURD (3-4 moments):
   - Characters falling into ridiculous situations (stepping in magical pudding, accidentally riding a runaway cloud)
   - Silly sound effects and onomatopoeia kids love (SPLAT! WHOOOOSH! BOING!)
   - Unexpected twists that are delightfully absurd (the scary monster just wanted a hug)
   - Physical comedy and slapstick that's safe and fun
   - Things being hilariously wrong (shoes on ears, hats on feet)

2. CLEVER WORDPLAY (3-4 jokes):
   - Puns that work on two levels for kids AND parents
   - Tech terms with kid-friendly double meanings:
     * "Debug" = finding actual bugs (silly insects causing problems)
     * "The Cloud" = a fluffy floating place in the sky
     * "Shipping" = putting things on boats for adventures
     * "Sprint" = literally running really fast
     * "Stack" = a wobbly tower of things
     * "Pipeline" = a silly twisty waterslide
     * "Cookies" = magical treats with special powers
     * "Firewall" = a friendly wall made of warm, tickly flames
     * "Commit" = making a pinky promise
     * "Iteration" = trying again with a funny twist each time

3. FUNNY CHARACTERS:
   - Give the child hero a quirky sidekick (could be named after a tech concept)
   - Sidekicks should have catchphrases or funny habits
   - Side characters with exaggerated, silly personalities
   - Characters that make funny sounds or have goofy traits

=== EPISODE CONTENT INTEGRATION ===

When you receive coreLessons, memorableStories, and quotableMoments from an episode, you MUST:

1. BUILD THE ADVENTURE around ONE core lesson (make it the central theme)
2. ADAPT a memorable story into the plot (transform real anecdotes into magical adventures)
3. WEAVE 2-3 quotable moments into dialogue naturally (characters can say them!)
4. TRANSFORM business/product wisdom into kid-friendly metaphors:
   - Product-market fit = finding the perfect magical ingredient
   - User research = listening to what forest creatures really want
   - Growth strategies = helping a magical garden grow
   - Leadership = helping friends work together on an adventure
   - Building products = creating wonderful inventions or magical items
   - A/B testing = trying two different silly approaches
   - Metrics = counting stars, gems, or magical beans

The story should feel SPECIFICALLY connected to the episode content - NOT generic!
When episode content is provided, make it feel like THIS story could ONLY come from THIS conversation.

=== LENNY'S PODCAST CONTEXT ===

When the source is Lenny's Podcast:
- The guest's wisdom should shine through in kid-friendly ways
- Product/business concepts become magical adventures
- Make tech parents laugh with knowing winks to their world
- The story should honor the guest's insights while being purely entertaining for kids

Always respond with valid JSON in the specified format.`;

interface FormatStoryPromptParams {
  childName: string;
  childAge?: number;
  theme?: string;
  transcriptContent: string;
  additionalContext?: string;
  pageCount: number;
  // Episode content for richer story generation
  guestName?: string;
  coreLessons?: string[];
  memorableStories?: string[];
  quotableMoments?: string[];
}

export function formatStoryPrompt(params: FormatStoryPromptParams): string {
  const {
    childName,
    childAge,
    theme,
    transcriptContent,
    additionalContext,
    pageCount,
    guestName,
    coreLessons,
    memorableStories,
    quotableMoments,
  } = params;

  // Build episode content section if available
  const hasEpisodeContent = coreLessons?.length || memorableStories?.length || quotableMoments?.length;

  let episodeContentSection = '';
  if (hasEpisodeContent) {
    episodeContentSection = `
=== EPISODE INSIGHTS TO WEAVE INTO THE STORY ===
${guestName ? `Guest: ${guestName}` : ''}

${coreLessons?.length ? `CORE LESSONS (pick ONE as central theme, weave others subtly):
${coreLessons.map(l => `- ${l}`).join('\n')}
` : ''}
${memorableStories?.length ? `MEMORABLE STORIES (adapt one into the main adventure):
${memorableStories.map(s => `- ${s}`).join('\n')}
` : ''}
${quotableMoments?.length ? `QUOTABLE MOMENTS (work 2-3 into dialogue naturally):
${quotableMoments.map(q => `- "${q}"`).join('\n')}
` : ''}
IMPORTANT: The story should feel SPECIFICALLY connected to these insights!
Transform this real wisdom into magical, hilarious kid-friendly adventures.
`;
  }

  return `Create a personalized children's book story based on the following details:

CHILD'S NAME: ${childName}
${childAge ? `CHILD'S AGE: ${childAge} years old` : ''}
${theme ? `PREFERRED THEME: ${theme}` : ''}
${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}
${episodeContentSection}
TRANSCRIPT/CONTENT TO DRAW INSPIRATION FROM:
"""
${transcriptContent.slice(0, 8000)}
"""

Please create a ${pageCount}-page children's book story that:
1. Features ${childName} as the main character
2. ${hasEpisodeContent ? 'Uses the EPISODE INSIGHTS above as the foundation - adapt real lessons into magical adventures' : 'Incorporates themes and ideas from the transcript in a child-friendly way'}
3. Tells a complete story with a beginning, adventure, and happy resolution
4. Uses simple language appropriate for ${childAge ? `a ${childAge}-year-old` : 'young children'}
5. Each page should have 2-3 sentences maximum
6. Include a SCENE-FOCUSED image prompt for each page (see critical rules below)
7. CRITICAL - MAKE IT FUNNY:
   - Include 3-4 SILLY moments (absurd situations, funny sound effects, slapstick)
   - Include 3-4 CLEVER wordplay jokes (tech puns that work for kids AND parents)
   - Give ${childName} a QUIRKY sidekick with a funny catchphrase or habit
   - Use tech terms in kid-friendly ways: Debug=bug hunting, Cloud=floating place, Shipping=boat adventures
8. ${hasEpisodeContent ? `Since this is from a Lenny's Podcast episode with ${guestName || 'a guest'}, the story MUST incorporate the core lessons and memorable stories provided above!` : 'If this seems to be from Lenny\'s Podcast, subtly weave in product/business wisdom as magical lessons'}

Respond ONLY with a JSON object in this exact format:
{
  "title": "The Story Title",
  "characterDescriptions": {
    "mainCharacter": "Physical description of the main child character (hair color/style, skin tone, clothing, any distinctive features) - be specific and consistent",
    "sidekick": "Physical description of the sidekick character (shape, color, size, distinctive features) - be specific and consistent"
  },
  "pages": [
    {
      "pageNumber": 1,
      "text": "The story text for this page...",
      "imagePrompt": "A scene-focused prompt describing the ACTION and SETTING..."
    },
    // ... more pages
  ]
}

CRITICAL FOR CHARACTER CONSISTENCY:
- The characterDescriptions MUST include specific visual details
- For mainCharacter: describe age appearance, hair (color, length, style), skin tone, eye color, typical outfit, any accessories
- For sidekick: describe shape, primary colors, size relative to child, any unique features (wings, antenna, sparkles, etc.)
- These descriptions are used as REFERENCE IMAGES - they ensure consistent character appearance

CRITICAL FOR IMAGE PROMPTS - SCENE-FOCUSED ONLY:
Each imagePrompt must describe THE SCENE/ACTION only. DO NOT include character appearance descriptions in imagePrompts - that's handled separately by the characterDescriptions.

Each imagePrompt should include:
- What is happening (the action/narrative moment)
- Where it's happening (the setting/environment)
- The mood/emotion of the moment
- Other objects, creatures, or environmental details in the scene
- Visual humor elements if relevant

GOOD imagePrompt examples:
- "climbing a giant shimmering beanstalk, reaching for glowing golden leaves, swirling purple clouds in the background, sense of wonder and excitement"
- "splashing into a pool of rainbow-colored pudding, surprised expression, giggles erupting, silly mess everywhere"
- "tiptoeing through a forest of giant candy canes, moonlight filtering through, mischievous grin, a trail of cookie crumbs behind"

BAD imagePrompt examples (DO NOT do this):
- "A 5-year-old girl with curly brown hair climbing a beanstalk" (character description not needed!)
- "The child wearing a blue dress stands in a meadow" (don't describe character appearance!)

Make sure:
- The story is GENUINELY FUNNY - kids should laugh out loud at least 3-4 times!
- Image prompts focus on ACTION and SETTING, not character appearance
- Image prompts should NOT include any text/words in the images
- Image prompts should be detailed enough for AI image generation
- The child character should appear on most pages
- Each page builds on the previous one to tell a cohesive story
- The sidekick character adds comic relief throughout`;
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

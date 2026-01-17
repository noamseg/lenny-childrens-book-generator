// Content filtering for child safety

// List of inappropriate words/phrases (simplified for example)
const BLOCKED_WORDS = [
  // Violence
  'kill', 'murder', 'blood', 'death', 'die', 'dead', 'weapon', 'gun', 'knife',
  // Adult content
  'explicit', 'adult', 'mature', 'nsfw',
  // Scary content
  'horror', 'nightmare', 'terror', 'demon', 'monster', 'zombie',
  // Profanity (common ones)
  'damn', 'hell', 'crap',
];

// Patterns that might indicate inappropriate content
const BLOCKED_PATTERNS = [
  /\b(hurt|harm)ing\s+(people|children|animals)\b/gi,
  /\b(scary|frightening|terrifying)\b/gi,
];

export interface ContentFilterResult {
  isAppropriate: boolean;
  flaggedContent: string[];
  cleanedContent: string;
  confidence: 'high' | 'medium' | 'low';
}

// Check if content is appropriate for children
export function filterContent(content: string): ContentFilterResult {
  const flaggedContent: string[] = [];
  let cleanedContent = content;

  // Check for blocked words
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      flaggedContent.push(...matches);
      // Replace with child-friendly alternatives or remove
      cleanedContent = cleanedContent.replace(regex, '***');
    }
  }

  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      flaggedContent.push(...matches);
    }
  }

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (flaggedContent.length > 5) {
    confidence = 'low';
  } else if (flaggedContent.length > 0) {
    confidence = 'medium';
  }

  return {
    isAppropriate: flaggedContent.length === 0,
    flaggedContent: [...new Set(flaggedContent)], // Remove duplicates
    cleanedContent,
    confidence,
  };
}

// Sanitize text for display
export function sanitizeForDisplay(text: string): string {
  return text
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    // Remove any remaining suspicious patterns
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Validate image prompt for child safety
export function validateImagePrompt(prompt: string): {
  isValid: boolean;
  sanitizedPrompt: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  let sanitizedPrompt = prompt;

  // Check for inappropriate content
  const filterResult = filterContent(prompt);
  if (!filterResult.isAppropriate) {
    warnings.push('Prompt contained inappropriate content that was removed');
    sanitizedPrompt = filterResult.cleanedContent;
  }

  // Ensure child-friendly elements
  const hasChildSafetyKeywords =
    /\b(child-friendly|children|playful|cute|happy|colorful|whimsical)\b/i.test(sanitizedPrompt);

  if (!hasChildSafetyKeywords) {
    sanitizedPrompt = `child-friendly, cheerful, ${sanitizedPrompt}`;
  }

  // Add negative prompt guidance (for when passed to image generation)
  sanitizedPrompt = sanitizedPrompt.replace(/\brealistic\b/gi, 'illustrated');

  return {
    isValid: filterResult.isAppropriate,
    sanitizedPrompt,
    warnings,
  };
}

/**
 * Extracts hashtags from a given text content
 * @param content The text content to extract hashtags from
 * @returns Array of hashtags found in the content
 */
export const extractHashtags = (content: string): string[] => {
  if (!content) return [];
  
  // Regular expression to match hashtags
  // Matches # followed by word characters, allowing for underscores and hyphens
  const hashtagRegex = /#[\w-]+/g;
  
  // Find all matches and remove the # symbol
  const hashtags = content.match(hashtagRegex) || [];
  
  // Remove duplicates and return
  return [...new Set(hashtags.map(tag => tag.slice(1)))];
};

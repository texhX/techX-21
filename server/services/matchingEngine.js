// ==============================================================================
// CAMPUSFIND AI — BACKEND MATCHING ENGINE SERVICE
// ==============================================================================

export const MATCH_WEIGHTS = {
  category: 0.25,
  description: 0.25,
  location: 0.20,
  date: 0.15,
  color: 0.10,
  image: 0.05,
};

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with',
  'by', 'about', 'like', 'through', 'over', 'before', 'between', 'after',
  'is', 'are', 'was', 'were', 'it', 'its', 'my', 'your', 'has', 'have',
  'item', 'found', 'lost', 'please', 'help', 'near', 'inside'
]);

export function tokenizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export function calculateTextSimilarity(textA, textB) {
  const tokensA = tokenizeText(textA);
  const tokensB = tokenizeText(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersection = 0;
  setA.forEach((token) => {
    if (setB.has(token)) intersection++;
  });

  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

export function calculateLocationScore(locA, locB) {
  if (!locA || !locB) return 0.2;
  const a = locA.toLowerCase().trim();
  const b = locB.toLowerCase().trim();

  if (a === b) return 1.0;

  const tokensA = a.split(/[\s,()/-]+/);
  const tokensB = b.split(/[\s,()/-]+/);
  const hasSharedBuilding = tokensA.some(
    (t) => t.length > 3 && tokensB.includes(t)
  );

  if (hasSharedBuilding) return 0.85;
  return 0.2;
}

export function calculateDateScore(dateA, dateB) {
  if (!dateA || !dateB) return 0.5;

  const timeA = new Date(dateA).getTime();
  const timeB = new Date(dateB).getTime();

  if (isNaN(timeA) || isNaN(timeB)) return 0.5;

  const diffDays = Math.abs((timeB - timeA) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return 1.0;
  if (diffDays <= 3) return 0.85;
  if (diffDays <= 7) return 0.65;
  if (diffDays <= 14) return 0.35;
  return 0.1;
}

export function calculateColorScore(colorA, colorB) {
  if (!colorA || !colorB) return 0.5;
  const a = colorA.toLowerCase().trim();
  const b = colorB.toLowerCase().trim();

  if (a === b) return 1.0;
  if (a === 'multicolor/pattern' || b === 'multicolor/pattern') return 0.6;
  if ((a.includes('black') || a.includes('gray') || a.includes('silver')) &&
      (b.includes('black') || b.includes('gray') || b.includes('silver'))) {
    return 0.7;
  }
  return 0.1;
}

export function calculateMatchScore(lostItem, foundItem) {
  if (!lostItem || !foundItem) return null;

  const categoryMatch = lostItem.category && foundItem.category && 
    lostItem.category.toLowerCase() === foundItem.category.toLowerCase();
  const categoryScore = categoryMatch ? 1.0 : 0.0;

  const combinedLostText = `${lostItem.title || ''} ${lostItem.description || ''} ${lostItem.subcategory || ''}`;
  const combinedFoundText = `${foundItem.title || ''} ${foundItem.description || ''} ${foundItem.subcategory || ''}`;
  const descriptionScore = calculateTextSimilarity(combinedLostText, combinedFoundText);

  const locationScore = calculateLocationScore(lostItem.location, foundItem.location);
  const dateScore = calculateDateScore(lostItem.lost_date, foundItem.found_date);
  const colorScore = calculateColorScore(lostItem.color, foundItem.color);
  const imageScore = (lostItem.image_url && foundItem.image_url) ? 0.9 : 0.5;

  const weightedSum =
    (categoryScore * MATCH_WEIGHTS.category) +
    (descriptionScore * MATCH_WEIGHTS.description) +
    (locationScore * MATCH_WEIGHTS.location) +
    (dateScore * MATCH_WEIGHTS.date) +
    (colorScore * MATCH_WEIGHTS.color) +
    (imageScore * MATCH_WEIGHTS.image);

  const totalPercentage = Math.min(100, Math.max(0, Math.round(weightedSum * 100)));

  const reasons = [];
  if (categoryScore >= 0.9) reasons.push(`Identical Category (${lostItem.category})`);
  if (locationScore >= 0.8) reasons.push(`Matching / Adjacent Location (${lostItem.location})`);
  if (dateScore >= 0.8) reasons.push('Dates align within 24–72 hours');
  if (colorScore >= 0.7) reasons.push(`Matching color profile (${lostItem.color})`);
  if (descriptionScore >= 0.25) reasons.push('Textual description & keyword correlation');

  return {
    match_score: totalPercentage,
    category_score: Math.round(categoryScore * 100),
    description_score: Math.round(descriptionScore * 100),
    location_score: Math.round(locationScore * 100),
    date_score: Math.round(dateScore * 100),
    color_score: Math.round(colorScore * 100),
    image_score: Math.round(imageScore * 100),
    match_reason: reasons,
  };
}

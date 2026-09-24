import type { ImageGenerationToolConfig } from '../interfaces';

const IMAGE_TOKENS_MAPPING: Record<string, Record<string, number>> = {
  '1024x1024': {
    low: 272,
    medium: 1056,
    high: 4160,
  },
  '1024x1536': {
    low: 408,
    medium: 1584,
    high: 6240,
  },
  '1536x1024': {
    low: 400,
    medium: 1568,
    high: 6208,
  },
  auto: {
    low: 272,
    medium: 1056,
    high: 4160,
  },
};

export function getImageGenerationTokens(
  size: string = '1024x1024',
  quality: string = 'medium',
): number {
  const normalizedSize = size || '1024x1024';
  const normalizedQuality = quality || 'medium';

  const sizeTokens = IMAGE_TOKENS_MAPPING[normalizedSize];

  if (!sizeTokens)
    throw new Error(
      `Invalid image size: ${normalizedSize}. Supported sizes: ${Object.keys(IMAGE_TOKENS_MAPPING).join(', ')}`,
    );

  const tokens = sizeTokens[normalizedQuality];

  if (tokens === undefined)
    throw new Error(
      `Invalid image quality: ${normalizedQuality}. Supported qualities: ${Object.keys(sizeTokens).join(', ')}`,
    );

  return tokens;
}

export function calculateImageGenerationTokens(
  toolConfig: ImageGenerationToolConfig,
): number {
  return getImageGenerationTokens(toolConfig.size, toolConfig.quality);
}

export function calculateImageGenerationTokensWithPartials(
  size: string = '1024x1024',
  quality: string = 'medium',
  partialImages: number = 0,
): number {
  const baseTokens = getImageGenerationTokens(size, quality);
  const additionalTokens = Math.max(0, Math.min(partialImages, 3)) * baseTokens;
  return baseTokens + additionalTokens;
}

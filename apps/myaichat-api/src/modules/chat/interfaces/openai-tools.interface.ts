/**
 * OpenAI Tool Configuration Interfaces
 * These interfaces define the structure for OpenAI's built-in tools like image generation and web search
 * @see https://platform.openai.com/docs/guides/tools
 */

/**
 * Configuration for image generation tool
 * @see https://platform.openai.com/docs/guides/tools-image-generation
 */
export interface ImageGenerationToolConfig {
  /** The type of the image generation tool. Always `image_generation`. */
  type: 'image_generation';

  /**
   * Background type for the generated image.
   * @default 'auto'
   */
  background?: 'transparent' | 'opaque' | 'auto';

  /**
   * Control how much effort the model will exert to match the style and features,
   * especially facial features, of input images. Only supported for `gpt-image-1`.
   * @default 'low'
   */
  input_fidelity?: 'high' | 'low' | null;

  /**
   * The image generation model to use.
   * @default 'gpt-image-1'
   */
  model?: 'gpt-image-1' | 'gpt-image-1-mini';

  /**
   * Moderation level for the generated image.
   * @default 'auto'
   */
  moderation?: 'auto' | 'low';

  /**
   * Compression level for the output image.
   * @default 100
   */
  output_compression?: number;

  /**
   * The output format of the generated image.
   * @default 'png'
   */
  output_format?: 'png' | 'webp' | 'jpeg';

  /**
   * Number of partial images to generate in streaming mode.
   * Range: 0 to 3
   * @default 0
   */
  partial_images?: number;

  /**
   * The quality of the generated image.
   * @default 'auto'
   */
  quality?: 'low' | 'medium' | 'high' | 'auto';

  /**
   * The size of the generated image.
   * @default 'auto'
   */
  size?: '1024x1024' | '1024x1536' | '1536x1024' | 'auto';
}

/**
 * User location for web search
 */
export interface WebSearchUserLocation {
  /** Free text input for the city of the user, e.g. `San Francisco`. */
  city?: string | null;

  /** The two-letter ISO country code of the user, e.g. `US`. */
  country?: string | null;

  /** Free text input for the region of the user, e.g. `California`. */
  region?: string | null;

  /** The IANA timezone of the user, e.g. `America/Los_Angeles`. */
  timezone?: string | null;

  /** The type of location approximation. Always `approximate`. */
  type?: 'approximate';
}

/**
 * Filters for web search
 */
export interface WebSearchFilters {
  /**
   * Allowed domains for the search. If not provided, all domains are allowed.
   * Subdomains of the provided domains are allowed as well.
   * Example: `["pubmed.ncbi.nlm.nih.gov"]`
   */
  allowed_domains?: string[] | null;
}

/**
 * Configuration for web search tool
 * @see https://platform.openai.com/docs/guides/tools-web-search
 */
export interface WebSearchToolConfig {
  /** The type of the web search tool. */
  type: 'web_search' | 'web_search_2025_08_26';

  /** Filters for the search. */
  filters?: WebSearchFilters | null;

  /**
   * High level guidance for the amount of context window space to use for the search.
   * @default 'medium'
   */
  search_context_size?: 'low' | 'medium' | 'high';

  /** The approximate location of the user. */
  user_location?: WebSearchUserLocation | null;
}

/**
 * Helper type to create an image generation tool with default values
 */
export type CreateImageGenerationTool = Partial<
  Omit<ImageGenerationToolConfig, 'type'>
> & {
  type: 'image_generation';
};

/**
 * Helper type to create a web search tool with default values
 */
export type CreateWebSearchTool = Partial<Omit<WebSearchToolConfig, 'type'>> & {
  type: 'web_search' | 'web_search_2025_08_26';
};

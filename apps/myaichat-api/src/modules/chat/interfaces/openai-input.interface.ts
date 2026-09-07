/**
 * OpenAI Responses API Input Types
 * @see https://platform.openai.com/docs/api-reference/responses
 */

/** Text input content */
export interface OpenAIInputText {
  type: 'input_text';
  text: string;
}

/** Image input content */
export interface OpenAIInputImage {
  type: 'input_image';
  /** URL or base64 data URL of the image */
  image_url?: string;
  /** File ID from OpenAI uploaded file */
  file_id?: string;
  /** Detail level for image processing */
  detail?: 'low' | 'high' | 'auto';
}

/** File input content (e.g., PDF) */
export interface OpenAIInputFile {
  type: 'input_file';
  /** URL of the file */
  file_url?: string;
  /** File ID from OpenAI uploaded file */
  file_id?: string;
  /** Base64 encoded file data */
  file_data?: string;
  /** Name of the file */
  filename?: string;
}

/** Audio input content */
export interface OpenAIInputAudio {
  type: 'input_audio';
  input_audio: {
    /** Base64-encoded audio data */
    data: string;
    /** Audio format */
    format: 'mp3' | 'wav';
  };
}

/** Union type for all content types within a message */
export type OpenAIMessageContent =
  | OpenAIInputText
  | OpenAIInputImage
  | OpenAIInputFile
  | OpenAIInputAudio;

/** Content list for multi-modal messages */
export type OpenAIMessageContentList = OpenAIMessageContent[];

/** Role types for messages */
export type OpenAIMessageRole = 'user' | 'system' | 'developer' | 'assistant';

/** A structured message with role and content */
export interface OpenAIMessageItem {
  role: OpenAIMessageRole;
  content: string | OpenAIMessageContentList;
  type?: 'message';
  status?: 'in_progress' | 'completed' | 'incomplete';
}

/** Simple string message (easy input format) */
/**
 * Union type representing all valid input item types for OpenAI Responses API
 */
export type OpenAIInputItem = OpenAIMessageItem | string;

/**
 * The full input type for OpenAI Responses API
 * Can be a simple string or an array of input items
 */
export type OpenAIResponseInput = string | OpenAIInputItem[];

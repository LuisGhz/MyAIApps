export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export type ApiError = {
  message: string;
  status: number;
  statusCode?: string;
};

export type GenerateImageRequest = {
  prompt: string;
  file?: File;
  model: string;
  options: Record<string, string>;
  lastAssistantGeneratedImage?: {
    file: File;
    key: string;
  };
};

export type GenerateImageResponse = {
  image: string; // base64-encoded image
  key: string; // S3 or storage key
};

export type ChatMessageResponse = {
  id: string;
  role: "user" | "assistant";
  prompt: string;
  imageUrl?: string;
  file?: string;
};

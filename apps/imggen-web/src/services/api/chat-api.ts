import { apiClient } from "./api-client";
import type { GenerateImageRequest, GenerateImageResponse } from "./types";

export type ImageGenerationResult = {
  file: File | null;
  key: string;
};

export const chatApi = {
  async generateImage(request: GenerateImageRequest): Promise<ImageGenerationResult> {
    const { prompt, file, model, options, lastAssistantGeneratedImage } = request;

    // Determine endpoint based on model
    const endpoint = model.startsWith("gpt") ? "/img/openai" : "/img/gemini";

    // Always use FormData for consistent API calls
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("model", model);
    formData.append("options", JSON.stringify(options));

    if (file) {
      formData.append("file", file);
    }

    if (lastAssistantGeneratedImage) {
      formData.append("lastGeneratedImage", lastAssistantGeneratedImage.file);
      formData.append("lastGeneratedImageKey", lastAssistantGeneratedImage.key);
    }

    const response = await apiClient.postFormData<GenerateImageResponse>(endpoint, formData);

    if (!response) {
      return { file: null, key: "" };
    }

    // Convert base64 image to File
    const binaryString = atob(response.image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "image/png" });
    const imageFile = new File([blob], "image.png", { type: "image/png" });

    return {
      file: imageFile,
      key: response.key,
    };
  },

  generatedImages() {
    return apiClient.get<{ src: string }[]>("/img/generated");
  },

  async downloadImage(src: string): Promise<Blob> {
    return apiClient.get<Blob>(`/img/download`, {
      params: { src },
    });
  },
};

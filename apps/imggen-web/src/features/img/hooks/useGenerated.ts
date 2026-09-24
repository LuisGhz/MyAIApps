import { chatApi } from "@/services";
import { useState } from "react";

export const useGenerated = () => {
  const [images, setImages] = useState<{ src: string }[]>([]);

  const getImages = async () => {
    const response = await chatApi.generatedImages();
    setImages(response || []);
  };

  return {
    getImages,
    images,
  };
};

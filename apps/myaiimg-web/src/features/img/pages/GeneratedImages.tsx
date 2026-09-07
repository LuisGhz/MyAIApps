import { useEffect } from "react";
import { Image } from "antd";
import { useGenerated } from "../hooks/useGenerated";
import { DownloadOutlined } from "@ant-design/icons";
import { chatApi } from "@/services";

export const GeneratedImages = () => {
  const { getImages, images } = useGenerated();

  useEffect(() => {
    getImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = async (imageSrc: string) => {
    const blob = await chatApi.downloadImage(imageSrc);
    const filename = imageSrc.split("/").pop()!;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-4 overflow-auto h-full">
      {images.length === 0 ? (
        <p className="text-gray-500">No images generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105"
              role="article"
              aria-label={`Generated image ${index + 1}`}
            >
              <Image
                className="w-full h-64 object-cover rounded-lg"
                src={image.src}
                alt={`Generated image ${index + 1}`}
                loading="lazy"
              />
              <button
                className="absolute bottom-2 right-2 py-2 px-3 bg-black/25 hocusvi:bg-black/45 transition-all duration-200 cursor-pointer text-sm font-medium rounded md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                type="button"
                onClick={() => handleDownload(image.src)}
                aria-label={`Download generated image ${index + 1}`}
              >
                <DownloadOutlined className="text-white! text-xl" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

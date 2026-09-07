import { Logger } from '@nestjs/common';

export const fetchImageAsBase64 = async (
  url: string,
): Promise<
  | {
      mimeType: string;
      dataBase64: string;
    }
  | undefined
> => {
  const logger = new Logger('ImageFetcherHelper');
  try {
    const res = await fetch(url);
    if (!res.ok) {
      logger.warn(`Failed to fetch image: ${res.status} ${res.statusText}`);
      return undefined;
    }

    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim();
    const mimeType = contentType || 'image/png';
    const arrayBuffer = await res.arrayBuffer();
    const dataBase64 = Buffer.from(arrayBuffer).toString('base64');

    return { mimeType, dataBase64 };
  } catch (error) {
    logger.warn(`Failed to fetch image: ${url}`, error instanceof Error ? error.message : error);
    return undefined;
  }
};


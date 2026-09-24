import { fetchImageAsBase64 } from './image-fetcher.helper';

global.fetch = jest.fn();

describe('image-fetcher.helper', () => {
  describe('fetchImageAsBase64', () => {
    const mockUrl = 'https://example.com/image.png';
    let fetchMock: jest.Mock;

    beforeEach(() => {
      fetchMock = global.fetch as jest.Mock;
      fetchMock.mockClear();
    });

    it('should fetch and convert image to base64', async () => {
      const mockArrayBuffer = new Uint8Array([1, 2, 3, 4]).buffer;
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/png'),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      };
      fetchMock.mockResolvedValue(mockResponse);

      const result = await fetchImageAsBase64(mockUrl);

      expect(fetchMock).toHaveBeenCalledWith(mockUrl);
      expect(result).toEqual({
        mimeType: 'image/png',
        dataBase64: Buffer.from(mockArrayBuffer).toString('base64'),
      });
    });

    it('should handle content-type with charset', async () => {
      const mockArrayBuffer = new Uint8Array([5, 6, 7, 8]).buffer;
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/jpeg; charset=utf-8'),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      };
      fetchMock.mockResolvedValue(mockResponse);

      const result = await fetchImageAsBase64(mockUrl);

      expect(result).toEqual({
        mimeType: 'image/jpeg',
        dataBase64: Buffer.from(mockArrayBuffer).toString('base64'),
      });
    });

    it('should default to image/png when content-type is missing', async () => {
      const mockArrayBuffer = new Uint8Array([9, 10]).buffer;
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      };
      fetchMock.mockResolvedValue(mockResponse);

      const result = await fetchImageAsBase64(mockUrl);

      expect(result).toEqual({
        mimeType: 'image/png',
        dataBase64: Buffer.from(mockArrayBuffer).toString('base64'),
      });
    });

    it('should return undefined when fetch response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {
          get: jest.fn(),
        },
      };
      fetchMock.mockResolvedValue(mockResponse);

      const result = await fetchImageAsBase64(mockUrl);

      expect(result).toBeUndefined();
    });

    it('should return undefined when fetch throws error', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));

      const result = await fetchImageAsBase64(mockUrl);

      expect(result).toBeUndefined();
    });

    it('should handle 500 server error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: jest.fn(),
        },
      };
      fetchMock.mockResolvedValue(mockResponse);

      const result = await fetchImageAsBase64(mockUrl);

      expect(result).toBeUndefined();
    });

    it('should handle empty array buffer', async () => {
      const mockArrayBuffer = new Uint8Array([]).buffer;
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/png'),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      };
      fetchMock.mockResolvedValue(mockResponse);

      const result = await fetchImageAsBase64(mockUrl);

      expect(result).toEqual({
        mimeType: 'image/png',
        dataBase64: '',
      });
    });

    it('should handle different image mime types', async () => {
      const mockArrayBuffer = new Uint8Array([11, 12]).buffer;
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('image/webp'),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
      };
      fetchMock.mockResolvedValue(mockResponse);

      const result = await fetchImageAsBase64(mockUrl);

      expect(result).toEqual({
        mimeType: 'image/webp',
        dataBase64: Buffer.from(mockArrayBuffer).toString('base64'),
      });
    });
  });
});

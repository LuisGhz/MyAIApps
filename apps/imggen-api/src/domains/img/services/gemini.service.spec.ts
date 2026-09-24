import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { EnvService } from '@config/env';
import { GoogleGenAI } from '@google/genai';
import { base64toImage } from '@img/util/base64toImage.util';

jest.mock('@google/genai');
jest.mock('@img/util/base64toImage.util');

describe('GeminiService', () => {
  let service: GeminiService;
  let envServiceInstance: EnvService;
  let geminiClientMock: jest.Mocked<GoogleGenAI>;

  const envServiceMock = {
    geminiApiKey: 'test-gemini-api-key',
  };

  const mockGenerateContentResponse = {
    data: 'base64-encoded-image-data',
  };

  const mockImageBuffer = Buffer.from('test-image-data');

  beforeEach(async () => {
    geminiClientMock = {
      models: {
        generateContent: jest.fn().mockResolvedValue(mockGenerateContentResponse),
      },
    } as any;

    (GoogleGenAI as jest.Mock).mockImplementation(() => geminiClientMock);
    (base64toImage as jest.Mock).mockReturnValue(mockImageBuffer);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    envServiceInstance = module.get<EnvService>(EnvService);

    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate an image with correct parameters', async () => {
    const dto = {
      model: 'gemini-2.5-flash-image',
      prompt: 'A beautiful landscape with mountains',
      options: {
        size: '2K',
        aspectRatio: '16:9',
      },
    };

    const result = await service.genImage(dto);

    expect(geminiClientMock.models.generateContent).toHaveBeenCalledWith({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });
    expect(geminiClientMock.models.generateContent).toHaveBeenCalledTimes(1);
    expect(base64toImage).toHaveBeenCalledWith('base64-encoded-image-data');
    expect(base64toImage).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockImageBuffer);
  });

  it('should log debug information when generating an image', async () => {
    const dto = {
      model: 'gemini-3-pro-image-preview',
      prompt: 'Create an abstract art',
      options: {
        size: '4K',
        aspectRatio: '1:1',
      },
    };

    const loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug');

    await service.genImage(dto);

    expect(loggerDebugSpy).toHaveBeenCalledWith({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });
  });

  it('should edit an image with provided file and parameters', async () => {
    const dto = {
      model: 'gemini-2.5-flash-image',
      prompt: 'Add vibrant colors to this image',
      options: {
        size: '2K',
        aspectRatio: '4:3',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'test-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('test-file-data'),
        size: 1024,
      } as Express.Multer.File,
    ];

    const result = await service.editImage(dto, mockFiles);

    expect(geminiClientMock.models.generateContent).toHaveBeenCalledWith({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
            {
              inlineData: {
                mimeType: mockFiles[0].mimetype,
                data: mockFiles[0].buffer.toString('base64'),
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });
    expect(geminiClientMock.models.generateContent).toHaveBeenCalledTimes(1);
    expect(base64toImage).toHaveBeenCalledWith('base64-encoded-image-data');
    expect(result).toBe(mockImageBuffer);
  });

  it('should process multiple files when editing an image', async () => {
    const dto = {
      model: 'gemini-2.5-flash-image',
      prompt: 'Merge these images together',
      options: {
        size: '1K',
        aspectRatio: '21:9',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'image-1.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('image-data-1'),
        size: 2048,
      } as Express.Multer.File,
      {
        fieldname: 'image',
        originalname: 'image-2.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('image-data-2'),
        size: 3072,
      } as Express.Multer.File,
    ];

    const result = await service.editImage(dto, mockFiles);

    expect(geminiClientMock.models.generateContent).toHaveBeenCalledWith({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
            {
              inlineData: {
                mimeType: mockFiles[0].mimetype,
                data: mockFiles[0].buffer.toString('base64'),
              },
            },
            {
              inlineData: {
                mimeType: mockFiles[1].mimetype,
                data: mockFiles[1].buffer.toString('base64'),
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });
    expect(result).toBe(mockImageBuffer);
  });

  it('should log debug information when editing an image', async () => {
    const dto = {
      model: 'gemini-3-pro-image-preview',
      prompt: 'Enhance this photo',
      options: {
        size: '4K',
        aspectRatio: '3:2',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'photo.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('photo-data'),
        size: 4096,
      } as Express.Multer.File,
    ];

    const loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug');

    await service.editImage(dto, mockFiles);

    expect(loggerDebugSpy).toHaveBeenCalledWith({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
            {
              inlineData: {
                mimeType: mockFiles[0].mimetype,
                data: mockFiles[0].buffer.toString('base64'),
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });
  });

  it('should throw error when API returns no image data for genImage', async () => {
    const dto = {
      model: 'gemini-2.5-flash-image',
      prompt: 'A beautiful landscape',
      options: {
        size: '2K',
        aspectRatio: '16:9',
      },
    };

    (geminiClientMock.models.generateContent as any).mockResolvedValue({
      data: null,
    } as any);

    await expect(service.genImage(dto)).rejects.toThrow(
      'No image data received from Gemini API',
    );
    expect(geminiClientMock.models.generateContent).toHaveBeenCalledTimes(1);
  });

  it('should throw error when API returns undefined data for genImage', async () => {
    const dto = {
      model: 'gemini-2.5-flash-image',
      prompt: 'Create abstract art',
      options: {
        size: '1K',
        aspectRatio: '1:1',
      },
    };

    (geminiClientMock.models.generateContent as any).mockResolvedValue({
      data: undefined,
    } as any);

    await expect(service.genImage(dto)).rejects.toThrow(
      'No image data received from Gemini API',
    );
  });

  it('should throw error when API returns empty string for genImage', async () => {
    const dto = {
      model: 'gemini-3-pro-image-preview',
      prompt: 'Generate a cityscape',
      options: {
        size: '4K',
        aspectRatio: '21:9',
      },
    };

    (geminiClientMock.models.generateContent as any).mockResolvedValue({
      data: '',
    } as any);

    await expect(service.genImage(dto)).rejects.toThrow(
      'No image data received from Gemini API',
    );
  });

  it('should throw error when API returns no image data for editImage', async () => {
    const dto = {
      model: 'gemini-2.5-flash-image',
      prompt: 'Enhance this image',
      options: {
        size: '2K',
        aspectRatio: '4:3',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test-data'),
        size: 1024,
      } as Express.Multer.File,
    ];

    (geminiClientMock.models.generateContent as any).mockResolvedValue({
      data: null,
    } as any);

    await expect(service.editImage(dto, mockFiles)).rejects.toThrow(
      'No image data received from Gemini API',
    );
    expect(geminiClientMock.models.generateContent).toHaveBeenCalledTimes(1);
  });

  it('should propagate API errors when generateContent fails for genImage', async () => {
    const dto = {
      model: 'gemini-2.5-flash-image',
      prompt: 'Test prompt',
      options: {
        size: '2K',
        aspectRatio: '16:9',
      },
    };

    const apiError = new Error('Gemini API is unavailable');
    (geminiClientMock.models.generateContent as any).mockRejectedValue(apiError);

    await expect(service.genImage(dto)).rejects.toThrow(
      'Gemini API is unavailable',
    );
    expect(geminiClientMock.models.generateContent).toHaveBeenCalledTimes(1);
  });

  it('should propagate API errors when generateContent fails for editImage', async () => {
    const dto = {
      model: 'gemini-2.5-flash-image',
      prompt: 'Edit this image',
      options: {
        size: '2K',
        aspectRatio: '4:3',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'edit.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('image-data'),
        size: 2048,
      } as Express.Multer.File,
    ];

    const apiError = new Error('Rate limit exceeded');
    (geminiClientMock.models.generateContent as any).mockRejectedValue(apiError);

    await expect(service.editImage(dto, mockFiles)).rejects.toThrow(
      'Rate limit exceeded',
    );
  });

  it('should handle empty files array when editing image', async () => {
    const dto = {
      model: 'gemini-2.5-flash-image',
      prompt: 'Process this',
      options: {
        size: '1K',
        aspectRatio: '1:1',
      },
    };

    const mockFiles: Express.Multer.File[] = [];

    const result = await service.editImage(dto, mockFiles);

    expect(geminiClientMock.models.generateContent).toHaveBeenCalledWith({
      model: dto.model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: dto.prompt,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: dto.options.aspectRatio,
          imageSize: dto.options.size,
        },
      },
    });
    expect(result).toBe(mockImageBuffer);
  });
});

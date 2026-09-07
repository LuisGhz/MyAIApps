import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { EnvService } from '@config/env';
import openAIClient, { toFile } from 'openai';
import { base64toImage } from '@img/util/base64toImage.util';

jest.mock('openai');
jest.mock('@img/util/base64toImage.util');

describe('OpenAIService', () => {
  let service: OpenAIService;
  let envServiceInstance: EnvService;
  let openAIClientMock: jest.Mocked<openAIClient>;

  const envServiceMock = {
    openAIApiKey: 'test-openai-api-key',
  };

  const mockGenerateResponse = {
    data: [
      {
        b64_json: 'base64-encoded-image-data',
      },
    ],
  };

  const mockImageBuffer = Buffer.from('test-image-data');

  beforeEach(async () => {
    openAIClientMock = {
      images: {
        generate: jest.fn().mockResolvedValue(mockGenerateResponse),
        edit: jest.fn().mockResolvedValue(mockGenerateResponse),
      },
    } as any;

    (openAIClient as unknown as jest.Mock).mockImplementation(() => openAIClientMock);
    (base64toImage as jest.Mock).mockReturnValue(mockImageBuffer);
    (toFile as jest.Mock).mockResolvedValue({} as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
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
      model: 'dall-e-3',
      prompt: 'A beautiful sunset over mountains',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'high' as 'high',
      },
    };

    const result = await service.genImage(dto);

    expect(openAIClientMock.images.generate).toHaveBeenCalledWith({
      model: dto.model,
      prompt: dto.prompt,
      n: 1,
      size: dto.options.size,
      quality: dto.options.quality,
    });
    expect(openAIClientMock.images.generate).toHaveBeenCalledTimes(1);
    expect(base64toImage).toHaveBeenCalledWith('base64-encoded-image-data');
    expect(base64toImage).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockImageBuffer);
  });

  it('should log debug information when generating an image', async () => {
    const dto = {
      model: 'dall-e-3',
      prompt: 'A beautiful sunset',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'high' as 'high',
      },
    };

    const loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug');

    await service.genImage(dto);

    expect(loggerDebugSpy).toHaveBeenCalledWith({
      model: dto.model,
      prompt: dto.prompt,
      n: 1,
      size: dto.options.size,
      quality: dto.options.quality,
    });
  });

  it('should edit an image with provided files and parameters', async () => {
    const dto = {
      model: 'dall-e-2',
      prompt: 'Edit this image to add a rainbow',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'low' as 'low',
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

    expect(toFile).toHaveBeenCalledWith(
      mockFiles[0].buffer,
      mockFiles[0].originalname,
      { type: mockFiles[0].mimetype },
    );
    expect(toFile).toHaveBeenCalledTimes(1);
    expect(openAIClientMock.images.edit).toHaveBeenCalledWith({
      model: dto.model,
      image: [{}],
      prompt: dto.prompt,
      n: 1,
      size: dto.options.size,
      quality: dto.options.quality,
    });
    expect(openAIClientMock.images.edit).toHaveBeenCalledTimes(1);
    expect(base64toImage).toHaveBeenCalledWith('base64-encoded-image-data');
    expect(result).toBe(mockImageBuffer);
  });

  it('should process multiple files when editing an image', async () => {
    const dto = {
      model: 'dall-e-2',
      prompt: 'Combine these images',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'auto' as 'auto',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'test-image-1.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('test-file-data-1'),
        size: 1024,
      } as Express.Multer.File,
      {
        fieldname: 'image',
        originalname: 'test-image-2.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('test-file-data-2'),
        size: 2048,
      } as Express.Multer.File,
    ];

    const result = await service.editImage(dto, mockFiles);

    expect(toFile).toHaveBeenCalledTimes(2);
    expect(toFile).toHaveBeenNthCalledWith(
      1,
      mockFiles[0].buffer,
      mockFiles[0].originalname,
      { type: mockFiles[0].mimetype },
    );
    expect(toFile).toHaveBeenNthCalledWith(
      2,
      mockFiles[1].buffer,
      mockFiles[1].originalname,
      { type: mockFiles[1].mimetype },
    );
    expect(result).toBe(mockImageBuffer);
  });

  it('should log debug information when editing an image', async () => {
    const dto = {
      model: 'dall-e-2',
      prompt: 'Add colors',
      options: {
        size: '1536x1024' as '1536x1024',
        quality: 'medium' as 'medium',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'edit-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('edit-file-data'),
        size: 512,
      } as Express.Multer.File,
    ];

    const loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug');

    await service.editImage(dto, mockFiles);

    expect(loggerDebugSpy).toHaveBeenCalledWith({
      model: dto.model,
      image: [{}],
      prompt: dto.prompt,
      n: 1,
      size: dto.options.size,
      quality: dto.options.quality,
    });
  });

  it('should throw error when API returns no data for genImage', async () => {
    const dto = {
      model: 'dall-e-3',
      prompt: 'Generate landscape',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'high' as 'high',
      },
    };

    (openAIClientMock.images.generate as any).mockResolvedValue({
      data: [],
    } as any);

    await expect(service.genImage(dto)).rejects.toThrow(
      'Image generation failed: No data returned from OpenAI',
    );
    expect(openAIClientMock.images.generate).toHaveBeenCalledTimes(1);
  });

  it('should throw error when API returns null data for genImage', async () => {
    const dto = {
      model: 'dall-e-3',
      prompt: 'Create abstract art',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'low' as 'low',
      },
    };

    (openAIClientMock.images.generate as any).mockResolvedValue({
      data: null,
    } as any);

    await expect(service.genImage(dto)).rejects.toThrow(
      'Image generation failed: No data returned from OpenAI',
    );
  });

  it('should throw error when API returns data without b64_json for genImage', async () => {
    const dto = {
      model: 'dall-e-3',
      prompt: 'Generate image',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'auto' as 'auto',
      },
    };

    (openAIClientMock.images.generate as any).mockResolvedValue({
      data: [{ b64_json: null }],
    } as any);

    await expect(service.genImage(dto)).rejects.toThrow(
      'Image generation failed: No data returned from OpenAI',
    );
  });

  it('should throw error when API returns no data for editImage', async () => {
    const dto = {
      model: 'dall-e-2',
      prompt: 'Edit this image',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'high' as 'high',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('test-data'),
        size: 1024,
      } as Express.Multer.File,
    ];

    (openAIClientMock.images.edit as any).mockResolvedValue({
      data: [],
    } as any);

    await expect(service.editImage(dto, mockFiles)).rejects.toThrow(
      'Image editing failed: No data returned from OpenAI',
    );
    expect(openAIClientMock.images.edit).toHaveBeenCalledTimes(1);
  });

  it('should throw error when API returns undefined b64_json for editImage', async () => {
    const dto = {
      model: 'dall-e-2',
      prompt: 'Enhance image',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'low' as 'low',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'enhance.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('enhance-data'),
        size: 2048,
      } as Express.Multer.File,
    ];

    (openAIClientMock.images.edit as any).mockResolvedValue({
      data: [{ b64_json: undefined }],
    } as any);

    await expect(service.editImage(dto, mockFiles)).rejects.toThrow(
      'Image editing failed: No data returned from OpenAI',
    );
  });

  it('should propagate API errors when generate fails', async () => {
    const dto = {
      model: 'dall-e-3',
      prompt: 'Generate something',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'high' as 'high',
      },
    };

    const apiError = new Error('OpenAI API rate limit exceeded');
    (openAIClientMock.images.generate as any).mockRejectedValue(apiError);

    await expect(service.genImage(dto)).rejects.toThrow(
      'OpenAI API rate limit exceeded',
    );
    expect(openAIClientMock.images.generate).toHaveBeenCalledTimes(1);
  });

  it('should propagate API errors when edit fails', async () => {
    const dto = {
      model: 'dall-e-2',
      prompt: 'Edit image',
      options: {
        size: '1024x1024' as '1024x1024',
        quality: 'auto' as 'auto',
      },
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'image',
        originalname: 'fail.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('fail-data'),
        size: 512,
      } as Express.Multer.File,
    ];

    const apiError = new Error('Invalid image format');
    (openAIClientMock.images.edit as any).mockRejectedValue(apiError);

    await expect(service.editImage(dto, mockFiles)).rejects.toThrow(
      'Invalid image format',
    );
  });
});

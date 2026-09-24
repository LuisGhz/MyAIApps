import { StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ImgController } from './img.controller';
import { GeminiService, ImageService, OpenAIService, S3Service } from './services';
import { GeminiNewImageReqDto, OpenAINewImageReqDto } from './dtos';
import type { JwtPayload } from '@core/strategies/interfaces';
import type { Response } from 'express';

const openAIServiceMock = {
  genImage: jest.fn(),
  editImage: jest.fn(),
};

const geminiServiceMock = {
  genImage: jest.fn(),
  editImage: jest.fn(),
};

const s3ServiceMock = {
  uploadImage: jest.fn(),
  downloadImage: jest.fn(),
};

const imageServiceMock = {
  create: jest.fn(),
  findAllByUserId: jest.fn(),
};

describe('ImgController', () => {
  let controller: ImgController;
  let openAIServiceInstance: OpenAIService;
  let geminiServiceInstance: GeminiService;
  let s3ServiceInstance: S3Service;
  let imageServiceInstance: ImageService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImgController],
      providers: [
        { provide: OpenAIService, useValue: openAIServiceMock },
        { provide: GeminiService, useValue: geminiServiceMock },
        { provide: S3Service, useValue: s3ServiceMock },
        { provide: ImageService, useValue: imageServiceMock },
      ],
    }).compile();

    controller = module.get<ImgController>(ImgController);
    openAIServiceInstance = module.get<OpenAIService>(OpenAIService);
    geminiServiceInstance = module.get<GeminiService>(GeminiService);
    s3ServiceInstance = module.get<S3Service>(S3Service);
    imageServiceInstance = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOpenAIImage', () => {
    it('should generate a new image when no files are provided', async () => {
      const body = {
        prompt: 'A beautiful sunset',
        model: 'gpt-image-1.5',
        options: { size: '1024x1024' as const, quality: 'high' as const },
      } as OpenAINewImageReqDto;
      const user = { sub: 'user-123' } as JwtPayload;
      const buffer = Buffer.from('image-data');
      const key = 'user-123/image-key.png';

      openAIServiceMock.genImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockResolvedValue(key);
      imageServiceMock.create.mockResolvedValue(undefined);

      const result = await controller.getOpenAIImage(body, user);

      expect(openAIServiceMock.genImage).toHaveBeenCalledWith(body);
      expect(openAIServiceMock.genImage).toHaveBeenCalledTimes(1);
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledTimes(1);
      expect(imageServiceMock.create).toHaveBeenCalledWith({ key, userId: user.sub });
      expect(imageServiceMock.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        image: buffer.toString('base64'),
        key,
      });
    });

    it('should edit an image when image file is provided', async () => {
      const body = {
        prompt: 'Edit this image',
        model: 'gpt-image-1.5',
        options: { size: '1024x1024' as const, quality: 'high' as const },
      } as OpenAINewImageReqDto;
      const user = { sub: 'user-456' } as JwtPayload;
      const imageFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('original-image'),
        size: 1024,
      } as Express.Multer.File;
      const files = { image: [imageFile] };
      const buffer = Buffer.from('edited-image-data');
      const key = 'user-456/edited-image-key.png';

      openAIServiceMock.editImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockResolvedValue(key);
      imageServiceMock.create.mockResolvedValue(undefined);

      const result = await controller.getOpenAIImage(body, user, files);

      expect(openAIServiceMock.editImage).toHaveBeenCalledWith(body, [imageFile]);
      expect(openAIServiceMock.editImage).toHaveBeenCalledTimes(1);
      expect(openAIServiceMock.genImage).not.toHaveBeenCalled();
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(imageServiceMock.create).toHaveBeenCalledWith({ key, userId: user.sub });
      expect(result).toEqual({
        image: buffer.toString('base64'),
        key,
      });
    });

    it('should edit an image when lastGeneratedImage file is provided', async () => {
      const body = {
        prompt: 'Edit this image',
        model: 'gpt-image-1.5',
        options: { size: '1024x1024' as const, quality: 'high' as const },
      } as OpenAINewImageReqDto;
      const user = { sub: 'user-789' } as JwtPayload;
      const lastGeneratedImageFile: Express.Multer.File = {
        fieldname: 'lastGeneratedImage',
        originalname: 'last.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('last-generated-image'),
        size: 2048,
      } as Express.Multer.File;
      const files = { lastGeneratedImage: [lastGeneratedImageFile] };
      const buffer = Buffer.from('edited-image-data');
      const key = 'user-789/edited-image-key.png';

      openAIServiceMock.editImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockResolvedValue(key);
      imageServiceMock.create.mockResolvedValue(undefined);

      const result = await controller.getOpenAIImage(body, user, files);

      expect(openAIServiceMock.editImage).toHaveBeenCalledWith(body, [lastGeneratedImageFile]);
      expect(openAIServiceMock.editImage).toHaveBeenCalledTimes(1);
      expect(openAIServiceMock.genImage).not.toHaveBeenCalled();
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(imageServiceMock.create).toHaveBeenCalledWith({ key, userId: user.sub });
      expect(result).toEqual({
        image: buffer.toString('base64'),
        key,
      });
    });

    it('should edit an image when both image and lastGeneratedImage files are provided', async () => {
      const body = {
        prompt: 'Edit this image',
        model: 'gpt-image-1.5',
        options: { size: '1024x1024' as const, quality: 'high' as const },
      } as OpenAINewImageReqDto;
      const user = { sub: 'user-111' } as JwtPayload;
      const imageFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('original-image'),
        size: 1024,
      } as Express.Multer.File;
      const lastGeneratedImageFile: Express.Multer.File = {
        fieldname: 'lastGeneratedImage',
        originalname: 'last.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('last-generated-image'),
        size: 2048,
      } as Express.Multer.File;
      const files = { image: [imageFile], lastGeneratedImage: [lastGeneratedImageFile] };
      const buffer = Buffer.from('edited-image-data');
      const key = 'user-111/edited-image-key.png';

      openAIServiceMock.editImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockResolvedValue(key);
      imageServiceMock.create.mockResolvedValue(undefined);

      const result = await controller.getOpenAIImage(body, user, files);

      expect(openAIServiceMock.editImage).toHaveBeenCalledWith(body, [imageFile, lastGeneratedImageFile]);
      expect(openAIServiceMock.editImage).toHaveBeenCalledTimes(1);
      expect(openAIServiceMock.genImage).not.toHaveBeenCalled();
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(imageServiceMock.create).toHaveBeenCalledWith({ key, userId: user.sub });
      expect(result).toEqual({
        image: buffer.toString('base64'),
        key,
      });
    });
  });

  describe('getGeminiImage', () => {
    it('should generate a new image when no files are provided', async () => {
      const body = {
        prompt: 'A starry night',
        model: 'gemini-2.5-flash-image',
        options: { size: '1K', aspectRatio: '1:1' },
      } as GeminiNewImageReqDto;
      const user = { sub: 'user-222' } as JwtPayload;
      const buffer = Buffer.from('gemini-image-data');
      const key = 'user-222/gemini-image-key.png';

      geminiServiceMock.genImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockResolvedValue(key);
      imageServiceMock.create.mockResolvedValue(undefined);

      const result = await controller.getGeminiImage(body, user);

      expect(geminiServiceMock.genImage).toHaveBeenCalledWith(body);
      expect(geminiServiceMock.genImage).toHaveBeenCalledTimes(1);
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledTimes(1);
      expect(imageServiceMock.create).toHaveBeenCalledWith({ key, userId: user.sub });
      expect(imageServiceMock.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        image: buffer.toString('base64'),
        key,
      });
    });

    it('should edit an image when image file is provided', async () => {
      const body = {
        prompt: 'Edit this with Gemini',
        model: 'gemini-2.5-flash-image',
        options: { size: '1K', aspectRatio: '1:1' },
      } as GeminiNewImageReqDto;
      const user = { sub: 'user-333' } as JwtPayload;
      const imageFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'gemini.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('gemini-original-image'),
        size: 1024,
      } as Express.Multer.File;
      const files = { image: [imageFile] };
      const buffer = Buffer.from('gemini-edited-image-data');
      const key = 'user-333/gemini-edited-image-key.png';

      geminiServiceMock.editImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockResolvedValue(key);
      imageServiceMock.create.mockResolvedValue(undefined);

      const result = await controller.getGeminiImage(body, user, files);

      expect(geminiServiceMock.editImage).toHaveBeenCalledWith(body, [imageFile]);
      expect(geminiServiceMock.editImage).toHaveBeenCalledTimes(1);
      expect(geminiServiceMock.genImage).not.toHaveBeenCalled();
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(imageServiceMock.create).toHaveBeenCalledWith({ key, userId: user.sub });
      expect(result).toEqual({
        image: buffer.toString('base64'),
        key,
      });
    });

    it('should edit an image when lastGeneratedImage file is provided', async () => {
      const body = {
        prompt: 'Edit last generated',
        model: 'gemini-2.5-flash-image',
        options: { size: '1K', aspectRatio: '1:1' },
      } as GeminiNewImageReqDto;
      const user = { sub: 'user-444' } as JwtPayload;
      const lastGeneratedImageFile: Express.Multer.File = {
        fieldname: 'lastGeneratedImage',
        originalname: 'last-gemini.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('last-gemini-image'),
        size: 2048,
      } as Express.Multer.File;
      const files = { lastGeneratedImage: [lastGeneratedImageFile] };
      const buffer = Buffer.from('gemini-edited-image-data');
      const key = 'user-444/gemini-edited-image-key.png';

      geminiServiceMock.editImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockResolvedValue(key);
      imageServiceMock.create.mockResolvedValue(undefined);

      const result = await controller.getGeminiImage(body, user, files);

      expect(geminiServiceMock.editImage).toHaveBeenCalledWith(body, [lastGeneratedImageFile]);
      expect(geminiServiceMock.editImage).toHaveBeenCalledTimes(1);
      expect(geminiServiceMock.genImage).not.toHaveBeenCalled();
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(imageServiceMock.create).toHaveBeenCalledWith({ key, userId: user.sub });
      expect(result).toEqual({
        image: buffer.toString('base64'),
        key,
      });
    });

    it('should edit an image when both image and lastGeneratedImage files are provided', async () => {
      const body = {
        prompt: 'Edit both images',
        model: 'gemini-2.5-flash-image',
        options: { size: '1K', aspectRatio: '1:1' },
      } as GeminiNewImageReqDto;
      const user = { sub: 'user-555' } as JwtPayload;
      const imageFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'gemini.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('gemini-original-image'),
        size: 1024,
      } as Express.Multer.File;
      const lastGeneratedImageFile: Express.Multer.File = {
        fieldname: 'lastGeneratedImage',
        originalname: 'last-gemini.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('last-gemini-image'),
        size: 2048,
      } as Express.Multer.File;
      const files = { image: [imageFile], lastGeneratedImage: [lastGeneratedImageFile] };
      const buffer = Buffer.from('gemini-edited-image-data');
      const key = 'user-555/gemini-edited-image-key.png';

      geminiServiceMock.editImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockResolvedValue(key);
      imageServiceMock.create.mockResolvedValue(undefined);

      const result = await controller.getGeminiImage(body, user, files);

      expect(geminiServiceMock.editImage).toHaveBeenCalledWith(body, [imageFile, lastGeneratedImageFile]);
      expect(geminiServiceMock.editImage).toHaveBeenCalledTimes(1);
      expect(geminiServiceMock.genImage).not.toHaveBeenCalled();
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(imageServiceMock.create).toHaveBeenCalledWith({ key, userId: user.sub });
      expect(result).toEqual({
        image: buffer.toString('base64'),
        key,
      });
    });
  });

  describe('getUserImages', () => {
    it('should return all images for the authenticated user', async () => {
      const user = { sub: 'user-666' } as JwtPayload;
      const userImages = [
        { id: '1', key: 'user-666/image1.png', userId: 'user-666' },
        { id: '2', key: 'user-666/image2.png', userId: 'user-666' },
      ];

      imageServiceMock.findAllByUserId.mockResolvedValue(userImages);

      const result = await controller.getUserImages(user);

      expect(imageServiceMock.findAllByUserId).toHaveBeenCalledWith(user.sub);
      expect(imageServiceMock.findAllByUserId).toHaveBeenCalledTimes(1);
      expect(result).toEqual(userImages);
    });

    it('should return an empty array when user has no images', async () => {
      const user = { sub: 'user-777' } as JwtPayload;

      imageServiceMock.findAllByUserId.mockResolvedValue([]);

      const result = await controller.getUserImages(user);

      expect(imageServiceMock.findAllByUserId).toHaveBeenCalledWith(user.sub);
      expect(imageServiceMock.findAllByUserId).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should throw an error when image service fails to fetch images', async () => {
      const user = { sub: 'user-888' } as JwtPayload;
      const error = new Error('Database connection error');

      imageServiceMock.findAllByUserId.mockRejectedValue(error);

      await expect(controller.getUserImages(user)).rejects.toThrow('Database connection error');
      expect(imageServiceMock.findAllByUserId).toHaveBeenCalledWith(user.sub);
    });
  });

  describe('getOpenAIImage', () => {
    it('should throw an error when OpenAI service fails during image generation', async () => {
      const body = {
        prompt: 'A beautiful sunset',
        model: 'gpt-image-1.5',
        options: { size: '1024x1024' as const, quality: 'high' as const },
      } as OpenAINewImageReqDto;
      const user = { sub: 'user-999' } as JwtPayload;
      const error = new Error('OpenAI API rate limit exceeded');

      openAIServiceMock.genImage.mockRejectedValue(error);

      await expect(controller.getOpenAIImage(body, user)).rejects.toThrow('OpenAI API rate limit exceeded');
      expect(openAIServiceMock.genImage).toHaveBeenCalledWith(body);
      expect(s3ServiceMock.uploadImage).not.toHaveBeenCalled();
      expect(imageServiceMock.create).not.toHaveBeenCalled();
    });

    it('should throw an error when S3 upload fails', async () => {
      const body = {
        prompt: 'A beautiful sunset',
        model: 'gpt-image-1.5',
        options: { size: '1024x1024' as const, quality: 'high' as const },
      } as OpenAINewImageReqDto;
      const user = { sub: 'user-1000' } as JwtPayload;
      const buffer = Buffer.from('image-data');
      const error = new Error('S3 upload failed');

      openAIServiceMock.genImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockRejectedValue(error);

      await expect(controller.getOpenAIImage(body, user)).rejects.toThrow('S3 upload failed');
      expect(openAIServiceMock.genImage).toHaveBeenCalledWith(body);
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(imageServiceMock.create).not.toHaveBeenCalled();
    });

    it('should throw an error when database save fails', async () => {
      const body = {
        prompt: 'A beautiful sunset',
        model: 'gpt-image-1.5',
        options: { size: '1024x1024' as const, quality: 'high' as const },
      } as OpenAINewImageReqDto;
      const user = { sub: 'user-1001' } as JwtPayload;
      const buffer = Buffer.from('image-data');
      const key = 'user-1001/image-key.png';
      const error = new Error('Database save failed');

      openAIServiceMock.genImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockResolvedValue(key);
      imageServiceMock.create.mockRejectedValue(error);

      await expect(controller.getOpenAIImage(body, user)).rejects.toThrow('Database save failed');
      expect(openAIServiceMock.genImage).toHaveBeenCalledWith(body);
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(imageServiceMock.create).toHaveBeenCalledWith({ key, userId: user.sub });
    });

    it('should throw an error when OpenAI service fails during image editing', async () => {
      const body = {
        prompt: 'Edit this image',
        model: 'gpt-image-1.5',
        options: { size: '1024x1024' as const, quality: 'high' as const },
      } as OpenAINewImageReqDto;
      const user = { sub: 'user-1002' } as JwtPayload;
      const imageFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('original-image'),
        size: 1024,
      } as Express.Multer.File;
      const files = { image: [imageFile] };
      const error = new Error('Invalid image format');

      openAIServiceMock.editImage.mockRejectedValue(error);

      await expect(controller.getOpenAIImage(body, user, files)).rejects.toThrow('Invalid image format');
      expect(openAIServiceMock.editImage).toHaveBeenCalledWith(body, [imageFile]);
      expect(s3ServiceMock.uploadImage).not.toHaveBeenCalled();
      expect(imageServiceMock.create).not.toHaveBeenCalled();
    });
  });

  describe('getGeminiImage', () => {
    it('should throw an error when Gemini service fails during image generation', async () => {
      const body = {
        prompt: 'A starry night',
        model: 'gemini-2.5-flash-image',
        options: { size: '1K', aspectRatio: '1:1' },
      } as GeminiNewImageReqDto;
      const user = { sub: 'user-1003' } as JwtPayload;
      const error = new Error('Gemini API authentication failed');

      geminiServiceMock.genImage.mockRejectedValue(error);

      await expect(controller.getGeminiImage(body, user)).rejects.toThrow('Gemini API authentication failed');
      expect(geminiServiceMock.genImage).toHaveBeenCalledWith(body);
      expect(s3ServiceMock.uploadImage).not.toHaveBeenCalled();
      expect(imageServiceMock.create).not.toHaveBeenCalled();
    });

    it('should throw an error when Gemini service fails during image editing', async () => {
      const body = {
        prompt: 'Edit this with Gemini',
        model: 'gemini-2.5-flash-image',
        options: { size: '1K', aspectRatio: '1:1' },
      } as GeminiNewImageReqDto;
      const user = { sub: 'user-1004' } as JwtPayload;
      const imageFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'gemini.png',
        encoding: '7bit',
        mimetype: 'image/png',
        buffer: Buffer.from('gemini-original-image'),
        size: 1024,
      } as Express.Multer.File;
      const files = { image: [imageFile] };
      const error = new Error('Image processing timeout');

      geminiServiceMock.editImage.mockRejectedValue(error);

      await expect(controller.getGeminiImage(body, user, files)).rejects.toThrow('Image processing timeout');
      expect(geminiServiceMock.editImage).toHaveBeenCalledWith(body, [imageFile]);
      expect(s3ServiceMock.uploadImage).not.toHaveBeenCalled();
      expect(imageServiceMock.create).not.toHaveBeenCalled();
    });

    it('should throw an error when S3 upload fails after successful Gemini generation', async () => {
      const body = {
        prompt: 'A starry night',
        model: 'gemini-2.5-flash-image',
        options: { size: '1K', aspectRatio: '1:1' },
      } as GeminiNewImageReqDto;
      const user = { sub: 'user-1005' } as JwtPayload;
      const buffer = Buffer.from('gemini-image-data');
      const error = new Error('S3 bucket not accessible');

      geminiServiceMock.genImage.mockResolvedValue(buffer);
      s3ServiceMock.uploadImage.mockRejectedValue(error);

      await expect(controller.getGeminiImage(body, user)).rejects.toThrow('S3 bucket not accessible');
      expect(geminiServiceMock.genImage).toHaveBeenCalledWith(body);
      expect(s3ServiceMock.uploadImage).toHaveBeenCalledWith(buffer, user.sub);
      expect(imageServiceMock.create).not.toHaveBeenCalled();
    });
  });

  describe('downloadImage', () => {
    it('should download image and return a StreamableFile with proper response headers', async () => {
      const src = 'https://cdn.example.com/myaiimg/user-123/image.png';
      const user = { sub: 'user-123' } as JwtPayload;
      const buffer = Buffer.from('binary-image-data');
      const res = { set: jest.fn() } as unknown as Response;

      s3ServiceMock.downloadImage.mockResolvedValue(buffer);

      const result = await controller.downloadImage(src, user, res);

      expect(s3ServiceMock.downloadImage).toHaveBeenCalledWith('myaiimg/user-123/image.png');
      expect(s3ServiceMock.downloadImage).toHaveBeenCalledTimes(1);
      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="image.png"',
        'Content-Length': buffer.length,
      });
      expect(result).toBeInstanceOf(StreamableFile);
    });

    it('should normalize user.sub with | characters when constructing the S3 key', async () => {
      const src = 'https://cdn.example.com/myaiimg/auth0-user-abc123/photo.png';
      const user = { sub: 'auth0|user|abc123' } as JwtPayload;
      const buffer = Buffer.from('image-data');
      const res = { set: jest.fn() } as unknown as Response;

      s3ServiceMock.downloadImage.mockResolvedValue(buffer);

      await controller.downloadImage(src, user, res);

      expect(s3ServiceMock.downloadImage).toHaveBeenCalledWith('myaiimg/auth0-user-abc123/photo.png');
    });

    it('should extract filename correctly from a deeply nested src path', async () => {
      const src = 'https://s3.amazonaws.com/bucket/myaiimg/user-123/nested/deep/filename.png';
      const user = { sub: 'user-123' } as JwtPayload;
      const buffer = Buffer.from('image-data');
      const res = { set: jest.fn() } as unknown as Response;

      s3ServiceMock.downloadImage.mockResolvedValue(buffer);

      await controller.downloadImage(src, user, res);

      expect(res.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Disposition': 'attachment; filename="filename.png"',
        }),
      );
    });

    it('should throw when S3 download fails', async () => {
      const src = 'https://cdn.example.com/myaiimg/user-123/image.png';
      const user = { sub: 'user-123' } as JwtPayload;
      const res = { set: jest.fn() } as unknown as Response;
      const error = new Error('S3 object not found');

      s3ServiceMock.downloadImage.mockRejectedValue(error);

      await expect(controller.downloadImage(src, user, res)).rejects.toThrow('S3 object not found');
      expect(s3ServiceMock.downloadImage).toHaveBeenCalledWith('myaiimg/user-123/image.png');
      expect(res.set).not.toHaveBeenCalled();
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ImageService } from './image.service';
import { Image } from '../entities/image.entity';
import { EnvService } from '@config/env';

describe('ImageService', () => {
  let service: ImageService;
  let imageRepositoryInstance: Repository<Image>;
  let envServiceInstance: EnvService;

  const imageRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const envServiceMock = {
    cdn: 'https://cdn.example.com/',
  };

  const mockImage = {
    id: 'test-id',
    key: 'test-key',
    userId: 'user-123',
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: getRepositoryToken(Image),
          useValue: imageRepositoryMock,
        },
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    imageRepositoryInstance = module.get<Repository<Image>>(getRepositoryToken(Image));
    envServiceInstance = module.get<EnvService>(EnvService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an image with provided key and userId', async () => {
    const params = {
      key: 'test-key-123',
      userId: 'user-456',
    };

    imageRepositoryMock.create.mockReturnValue(mockImage);
    imageRepositoryMock.save.mockResolvedValue(mockImage);

    const result = await service.create(params);

    expect(imageRepositoryMock.create).toHaveBeenCalledWith({
      key: params.key,
      userId: params.userId,
    });
    expect(imageRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(imageRepositoryMock.save).toHaveBeenCalledWith(mockImage);
    expect(imageRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockImage);
  });

  it('should find all images by userId and return them with CDN URLs', async () => {
    const userId = 'user-123';
    const mockImages = [
      { ...mockImage, key: 'image-1.png', createdAt: new Date('2026-01-03') },
      { ...mockImage, key: 'image-2.png', createdAt: new Date('2026-01-02') },
      { ...mockImage, key: 'image-3.png', createdAt: new Date('2026-01-01') },
    ];

    imageRepositoryMock.find.mockResolvedValue(mockImages);

    const result = await service.findAllByUserId(userId);

    expect(imageRepositoryMock.find).toHaveBeenCalledWith({
      where: { userId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
    expect(imageRepositoryMock.find).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      { src: `${envServiceMock.cdn}image-1.png` },
      { src: `${envServiceMock.cdn}image-2.png` },
      { src: `${envServiceMock.cdn}image-3.png` },
    ]);
  });

  it('should return empty array when user has no images', async () => {
    const userId = 'user-without-images';

    imageRepositoryMock.find.mockResolvedValue([]);

    const result = await service.findAllByUserId(userId);

    expect(imageRepositoryMock.find).toHaveBeenCalledWith({
      where: { userId, isDeleted: false },
      order: { createdAt: 'DESC' },
    });
    expect(result).toEqual([]);
  });

  it('should soft delete an image with provided parameters', async () => {
    const params = {
      id: 'test-id',
      userId: 'user-123',
      deletedBy: 'user-123',
    };

    const deletedImage = {
      ...mockImage,
      isDeleted: true,
      deletedAt: expect.any(Date),
      deletedBy: params.deletedBy,
    };

    imageRepositoryMock.findOne.mockResolvedValue(mockImage);
    imageRepositoryMock.save.mockResolvedValue(deletedImage);

    const result = await service.softDelete(params);

    expect(imageRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: params.id, userId: params.userId, isDeleted: false },
    });
    expect(imageRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(imageRepositoryMock.save).toHaveBeenCalledWith({
      ...mockImage,
      isDeleted: true,
      deletedAt: expect.any(Date),
      deletedBy: params.deletedBy,
    });
    expect(imageRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(result).toEqual(deletedImage);
  });

  it('should throw NotFoundException when trying to delete non-existent image', async () => {
    const params = {
      id: 'non-existent-id',
      userId: 'user-123',
      deletedBy: 'user-123',
    };

    imageRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.softDelete(params)).rejects.toThrow(NotFoundException);
    await expect(service.softDelete(params)).rejects.toThrow('Image not found');
    expect(imageRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: params.id, userId: params.userId, isDeleted: false },
    });
    expect(imageRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when trying to delete image owned by different user', async () => {
    const params = {
      id: 'test-id',
      userId: 'different-user-id',
      deletedBy: 'different-user-id',
    };

    imageRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.softDelete(params)).rejects.toThrow(NotFoundException);
    expect(imageRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: params.id, userId: params.userId, isDeleted: false },
    });
    expect(imageRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when trying to delete already deleted image', async () => {
    const params = {
      id: 'test-id',
      userId: 'user-123',
      deletedBy: 'user-123',
    };

    imageRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.softDelete(params)).rejects.toThrow(NotFoundException);
    expect(imageRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: params.id, userId: params.userId, isDeleted: false },
    });
    expect(imageRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should propagate database errors when create fails', async () => {
    const params = {
      key: 'test-key',
      userId: 'user-123',
    };

    const dbError = new Error('Database connection error');
    imageRepositoryMock.create.mockReturnValue(mockImage);
    imageRepositoryMock.save.mockRejectedValue(dbError);

    await expect(service.create(params)).rejects.toThrow('Database connection error');
    expect(imageRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(imageRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should propagate database errors when findAllByUserId fails', async () => {
    const userId = 'user-123';
    const dbError = new Error('Query timeout');

    imageRepositoryMock.find.mockRejectedValue(dbError);

    await expect(service.findAllByUserId(userId)).rejects.toThrow('Query timeout');
    expect(imageRepositoryMock.find).toHaveBeenCalledTimes(1);
  });

  it('should propagate database errors when softDelete save fails', async () => {
    const params = {
      id: 'test-id',
      userId: 'user-123',
      deletedBy: 'user-123',
    };

    const dbError = new Error('Write operation failed');
    imageRepositoryMock.findOne.mockResolvedValue(mockImage);
    imageRepositoryMock.save.mockRejectedValue(dbError);

    await expect(service.softDelete(params)).rejects.toThrow('Write operation failed');
    expect(imageRepositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(imageRepositoryMock.save).toHaveBeenCalledTimes(1);
  });
});

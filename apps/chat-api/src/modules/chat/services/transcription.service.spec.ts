import { Test, TestingModule } from '@nestjs/testing';
import { TranscriptionService } from './transcription.service';
import { EnvService } from '@cfg/schema/env.service';
import OpenAI from 'openai';

jest.mock('openai');

const envServiceMock = {
  openaiApiKey: 'test-openai-api-key',
};

const mockOpenAIClient = {
  audio: {
    transcriptions: {
      create: jest.fn(),
    },
  },
};

describe('TranscriptionService', () => {
  let service: TranscriptionService;
  let envServiceInstance: EnvService;

  beforeEach(async () => {
    jest.clearAllMocks();

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () => mockOpenAIClient as any,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptionService,
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    service = module.get<TranscriptionService>(TranscriptionService);
    envServiceInstance = module.get<EnvService>(EnvService);
  });

  describe('transcribeAudio', () => {
    it('should successfully transcribe audio file with usage information', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'audio',
        originalname: 'test-audio.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
        size: 10240,
        buffer: Buffer.from('mock audio data'),
        destination: 'uploads',
        filename: 'test-audio.mp3',
        path: 'uploads/test-audio.mp3',
        stream: null as any,
      };

      const mockResponse = {
        text: 'This is a transcribed audio content.',
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150,
        },
      };

      mockOpenAIClient.audio.transcriptions.create.mockResolvedValueOnce(
        mockResponse,
      );

      const result = await service.transcribeAudio(mockFile);

      expect(result).toEqual({
        text: 'This is a transcribed audio content.',
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        },
      });
      expect(mockOpenAIClient.audio.transcriptions.create).toHaveBeenCalledWith(
        {
          file: expect.any(File),
          model: 'gpt-4o-mini-transcribe',
          temperature: 0,
          response_format: 'json',
        },
      );
      expect(
        mockOpenAIClient.audio.transcriptions.create,
      ).toHaveBeenCalledTimes(1);
    });

    it('should use default temperature of 0 when not provided', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'audio',
        originalname: 'test-audio.wav',
        encoding: '7bit',
        mimetype: 'audio/wav',
        size: 5120,
        buffer: Buffer.from('mock audio data'),
        destination: 'uploads',
        filename: 'test-audio.wav',
        path: 'uploads/test-audio.wav',
        stream: null as any,
      };

      const mockResponse = {
        text: 'Transcribed content',
        usage: {
          input_tokens: 80,
          output_tokens: 40,
          total_tokens: 120,
        },
      };

      mockOpenAIClient.audio.transcriptions.create.mockResolvedValueOnce(
        mockResponse,
      );

      await service.transcribeAudio(mockFile);

      expect(mockOpenAIClient.audio.transcriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({ temperature: 0 }),
      );
    });

    it('should use custom temperature when provided', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'audio',
        originalname: 'test-audio.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
        size: 8192,
        buffer: Buffer.from('mock audio data'),
        destination: 'uploads',
        filename: 'test-audio.mp3',
        path: 'uploads/test-audio.mp3',
        stream: null as any,
      };

      const mockResponse = {
        text: 'Transcribed with higher temperature',
        usage: {
          input_tokens: 90,
          output_tokens: 45,
          total_tokens: 135,
        },
      };

      mockOpenAIClient.audio.transcriptions.create.mockResolvedValueOnce(
        mockResponse,
      );

      const customTemperature = 0.7;
      await service.transcribeAudio(mockFile, customTemperature);

      expect(mockOpenAIClient.audio.transcriptions.create).toHaveBeenCalledWith(
        expect.objectContaining({ temperature: customTemperature }),
      );
    });

    it('should handle response without usage information', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'audio',
        originalname: 'test-audio.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
        size: 7680,
        buffer: Buffer.from('mock audio data'),
        destination: 'uploads',
        filename: 'test-audio.mp3',
        path: 'uploads/test-audio.mp3',
        stream: null as any,
      };

      const mockResponse = {
        text: 'Transcribed content without usage',
      };

      mockOpenAIClient.audio.transcriptions.create.mockResolvedValueOnce(
        mockResponse,
      );

      const result = await service.transcribeAudio(mockFile);

      expect(result).toEqual({
        text: 'Transcribed content without usage',
        usage: undefined,
      });
    });

    it('should correctly convert file buffer to File object', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'audio',
        originalname: 'test-audio.m4a',
        encoding: '7bit',
        mimetype: 'audio/mp4',
        size: 9216,
        buffer: Buffer.from('mock audio data'),
        destination: 'uploads',
        filename: 'test-audio.m4a',
        path: 'uploads/test-audio.m4a',
        stream: null as any,
      };

      const mockResponse = {
        text: 'Transcribed audio',
        usage: {
          input_tokens: 75,
          output_tokens: 35,
          total_tokens: 110,
        },
      };

      mockOpenAIClient.audio.transcriptions.create.mockResolvedValueOnce(
        mockResponse,
      );

      await service.transcribeAudio(mockFile);

      const callArgs =
        mockOpenAIClient.audio.transcriptions.create.mock.calls[0][0];
      expect(callArgs.file).toBeInstanceOf(File);
      expect((callArgs.file as File).name).toBe(mockFile.originalname);
      expect((callArgs.file as File).type).toBe(mockFile.mimetype);
    });

    it('should throw error when OpenAI API call fails', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'audio',
        originalname: 'test-audio.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
        size: 6144,
        buffer: Buffer.from('mock audio data'),
        destination: 'uploads',
        filename: 'test-audio.mp3',
        path: 'uploads/test-audio.mp3',
        stream: null as any,
      };

      const apiError = new Error('API rate limit exceeded');
      mockOpenAIClient.audio.transcriptions.create.mockRejectedValueOnce(
        apiError,
      );

      await expect(service.transcribeAudio(mockFile)).rejects.toThrow(
        'API rate limit exceeded',
      );
    });

    it('should throw error when file buffer is invalid', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'audio',
        originalname: 'invalid-file.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
        size: 0,
        buffer: Buffer.alloc(0),
        destination: 'uploads',
        filename: 'invalid-file.mp3',
        path: 'uploads/invalid-file.mp3',
        stream: null as any,
      };

      const apiError = new Error('Invalid audio file');
      mockOpenAIClient.audio.transcriptions.create.mockRejectedValueOnce(
        apiError,
      );

      await expect(service.transcribeAudio(mockFile)).rejects.toThrow(
        'Invalid audio file',
      );
    });

    it('should throw error when unsupported audio format is provided', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'audio',
        originalname: 'test-file.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('not audio data'),
        destination: 'uploads',
        filename: 'test-file.txt',
        path: 'uploads/test-file.txt',
        stream: null as any,
      };

      const apiError = new Error('Unsupported file format');
      mockOpenAIClient.audio.transcriptions.create.mockRejectedValueOnce(
        apiError,
      );

      await expect(service.transcribeAudio(mockFile)).rejects.toThrow(
        'Unsupported file format',
      );
    });

    it('should throw error when API key is invalid', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'audio',
        originalname: 'test-audio.mp3',
        encoding: '7bit',
        mimetype: 'audio/mpeg',
        size: 5120,
        buffer: Buffer.from('mock audio data'),
        destination: 'uploads',
        filename: 'test-audio.mp3',
        path: 'uploads/test-audio.mp3',
        stream: null as any,
      };

      const authError = new Error('Invalid API key');
      mockOpenAIClient.audio.transcriptions.create.mockRejectedValueOnce(
        authError,
      );

      await expect(service.transcribeAudio(mockFile)).rejects.toThrow(
        'Invalid API key',
      );
    });
  });
});

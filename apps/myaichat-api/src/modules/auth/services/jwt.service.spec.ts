import { Test, TestingModule } from '@nestjs/testing';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtService } from './jwt.service';

const nestJwtServiceMock = {
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
};

describe('JwtService', () => {
  let jwtService: JwtService;
  let nestJwtServiceInstance: NestJwtService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: NestJwtService,
          useValue: nestJwtServiceMock,
        },
      ],
    }).compile();

    jwtService = module.get<JwtService>(JwtService);
    nestJwtServiceInstance = module.get<NestJwtService>(NestJwtService);
  });

  it('should sign a payload and return a token', () => {
    const payload = {
      sub: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    };
    const expectedToken = 'signed-jwt-token';
    nestJwtServiceMock.sign.mockReturnValue(expectedToken);

    const result = jwtService.sign(payload);

    expect(result).toBe(expectedToken);
    expect(nestJwtServiceMock.sign).toHaveBeenCalledWith(payload);
    expect(nestJwtServiceMock.sign).toHaveBeenCalledTimes(1);
  });

  it('should sign with previous token and return new token', () => {
    const token = 'existing-jwt-token';
    const decodedPayload = {
      sub: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      exp: 1234567890,
      iat: 1234567800,
    };
    const expectedToken = 'new-jwt-token';
    nestJwtServiceMock.decode.mockReturnValue(decodedPayload);
    nestJwtServiceMock.sign.mockReturnValue(expectedToken);

    const result = jwtService.signWithPreviousToken(token);

    expect(result).toBe(expectedToken);
    expect(nestJwtServiceMock.decode).toHaveBeenCalledWith(token);
    expect(nestJwtServiceMock.sign).toHaveBeenCalledWith({
      sub: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
    });
    expect(nestJwtServiceMock.sign).toHaveBeenCalledTimes(1);
  });

  it('should verify a token and return payload', () => {
    const token = 'valid-jwt-token';
    const expectedPayload = {
      sub: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      exp: 1234567890,
      iat: 1234567800,
    };
    nestJwtServiceMock.verify.mockReturnValue(expectedPayload);

    const result = jwtService.verify(token);

    expect(result).toEqual(expectedPayload);
    expect(nestJwtServiceMock.verify).toHaveBeenCalledWith(token);
    expect(nestJwtServiceMock.verify).toHaveBeenCalledTimes(1);
  });

  it('should decode a token and return payload', () => {
    const token = 'jwt-token';
    const expectedPayload = {
      sub: 'user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      exp: 1234567890,
      iat: 1234567800,
    };
    nestJwtServiceMock.decode.mockReturnValue(expectedPayload);

    const result = jwtService.decode(token);

    expect(result).toEqual(expectedPayload);
    expect(nestJwtServiceMock.decode).toHaveBeenCalledWith(token);
    expect(nestJwtServiceMock.decode).toHaveBeenCalledTimes(1);
  });

  it('should throw error when verifying an invalid token', () => {
    const invalidToken = 'invalid-jwt-token';
    const error = new Error('invalid token');
    nestJwtServiceMock.verify.mockImplementation(() => {
      throw error;
    });

    expect(() => jwtService.verify(invalidToken)).toThrow(error);
    expect(nestJwtServiceMock.verify).toHaveBeenCalledWith(invalidToken);
    expect(nestJwtServiceMock.verify).toHaveBeenCalledTimes(1);
  });

  it('should throw error when verifying an expired token', () => {
    const expiredToken = 'expired-jwt-token';
    const error = new Error('jwt expired');
    nestJwtServiceMock.verify.mockImplementation(() => {
      throw error;
    });

    expect(() => jwtService.verify(expiredToken)).toThrow(error);
    expect(nestJwtServiceMock.verify).toHaveBeenCalledWith(expiredToken);
    expect(nestJwtServiceMock.verify).toHaveBeenCalledTimes(1);
  });

  it('should return null when decoding malformed token', () => {
    const malformedToken = 'malformed-token';
    nestJwtServiceMock.decode.mockReturnValue(null);

    const result = jwtService.decode(malformedToken);

    expect(result).toBeNull();
    expect(nestJwtServiceMock.decode).toHaveBeenCalledWith(malformedToken);
    expect(nestJwtServiceMock.decode).toHaveBeenCalledTimes(1);
  });

  it('should handle token with missing optional fields when signing with previous token', () => {
    const token = 'minimal-jwt-token';
    const decodedPayload = {
      sub: 'user-id',
      exp: 1234567890,
      iat: 1234567800,
    };
    const expectedToken = 'new-minimal-jwt-token';
    nestJwtServiceMock.decode.mockReturnValue(decodedPayload);
    nestJwtServiceMock.sign.mockReturnValue(expectedToken);

    const result = jwtService.signWithPreviousToken(token);

    expect(result).toBe(expectedToken);
    expect(nestJwtServiceMock.decode).toHaveBeenCalledWith(token);
    expect(nestJwtServiceMock.sign).toHaveBeenCalledWith({
      sub: 'user-id',
    });
    expect(nestJwtServiceMock.sign).toHaveBeenCalledTimes(1);
  });

  it('should sign payload with empty optional fields', () => {
    const payload = {
      sub: 'user-id',
      name: '',
      email: '',
      role: 'user',
    };
    const expectedToken = 'jwt-token-with-empty-fields';
    nestJwtServiceMock.sign.mockReturnValue(expectedToken);

    const result = jwtService.sign(payload);

    expect(result).toBe(expectedToken);
    expect(nestJwtServiceMock.sign).toHaveBeenCalledWith(payload);
    expect(nestJwtServiceMock.sign).toHaveBeenCalledTimes(1);
  });

  it('should handle null decoded payload when signing with previous token', () => {
    const token = 'invalid-token';
    nestJwtServiceMock.decode.mockReturnValue(null);

    expect(() => jwtService.signWithPreviousToken(token)).toThrow();
    expect(nestJwtServiceMock.decode).toHaveBeenCalledWith(token);
    expect(nestJwtServiceMock.decode).toHaveBeenCalledTimes(1);
  });

  it('should handle undefined payload properties when signing with previous token', () => {
    const token = 'token-with-undefined-fields';
    const decodedPayload = {
      sub: undefined,
      name: undefined,
      email: undefined,
      role: undefined,
      exp: 1234567890,
      iat: 1234567800,
    };
    const expectedToken = 'new-token-with-undefined';
    nestJwtServiceMock.decode.mockReturnValue(decodedPayload);
    nestJwtServiceMock.sign.mockReturnValue(expectedToken);

    const result = jwtService.signWithPreviousToken(token);

    expect(result).toBe(expectedToken);
    expect(nestJwtServiceMock.decode).toHaveBeenCalledWith(token);
    expect(nestJwtServiceMock.sign).toHaveBeenCalledWith({
      sub: undefined,
      name: undefined,
      email: undefined,
      role: undefined,
    });
    expect(nestJwtServiceMock.sign).toHaveBeenCalledTimes(1);
  });

  it('should throw error when sign fails due to invalid payload', () => {
    const invalidPayload = null as any;
    const error = new Error('Invalid payload');
    nestJwtServiceMock.sign.mockImplementation(() => {
      throw error;
    });

    expect(() => jwtService.sign(invalidPayload)).toThrow(error);
    expect(nestJwtServiceMock.sign).toHaveBeenCalledWith(invalidPayload);
    expect(nestJwtServiceMock.sign).toHaveBeenCalledTimes(1);
  });

  it('should handle empty string token when verifying', () => {
    const emptyToken = '';
    const error = new Error('jwt must be provided');
    nestJwtServiceMock.verify.mockImplementation(() => {
      throw error;
    });

    expect(() => jwtService.verify(emptyToken)).toThrow(error);
    expect(nestJwtServiceMock.verify).toHaveBeenCalledWith(emptyToken);
    expect(nestJwtServiceMock.verify).toHaveBeenCalledTimes(1);
  });

  it('should return null when decoding empty string token', () => {
    const emptyToken = '';
    nestJwtServiceMock.decode.mockReturnValue(null);

    const result = jwtService.decode(emptyToken);

    expect(result).toBeNull();
    expect(nestJwtServiceMock.decode).toHaveBeenCalledWith(emptyToken);
    expect(nestJwtServiceMock.decode).toHaveBeenCalledTimes(1);
  });
});

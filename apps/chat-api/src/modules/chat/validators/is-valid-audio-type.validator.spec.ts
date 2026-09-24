import { IsValidAudioTypeConstraint } from './is-valid-audio-type.validator';
import {
  ALLOWED_AUDIO_TYPES,
  ALLOWED_AUDIO_EXTENSIONS,
} from '../consts/audio.const';

describe('IsValidAudioTypeConstraint', () => {
  let constraint: IsValidAudioTypeConstraint;

  beforeEach(() => {
    constraint = new IsValidAudioTypeConstraint();
  });

  it('should return true when no file is provided', () => {
    expect(constraint.validate(undefined as any)).toBe(true);
    expect(constraint.validate(null as any)).toBe(true);
  });

  it('should return true for a valid mime type and extension', () => {
    const file = {
      mimetype: ALLOWED_AUDIO_TYPES[0],
      originalname: `test${ALLOWED_AUDIO_EXTENSIONS[0]}`,
    } as Express.Multer.File;

    expect(constraint.validate(file)).toBe(true);
  });

  it('should be case-insensitive for extensions', () => {
    const file = {
      mimetype: ALLOWED_AUDIO_TYPES[0],
      originalname: `UPPER${ALLOWED_AUDIO_EXTENSIONS[0].toUpperCase()}`,
    } as Express.Multer.File;

    expect(constraint.validate(file)).toBe(true);
  });

  it('should return false when mime type is allowed but extension is not', () => {
    const file = {
      mimetype: ALLOWED_AUDIO_TYPES[0],
      originalname: 'file.unknown',
    } as Express.Multer.File;

    expect(constraint.validate(file)).toBe(false);
  });

  it('should return false when extension is allowed but mime type is not', () => {
    const file = {
      mimetype: 'application/octet-stream',
      originalname: `file${ALLOWED_AUDIO_EXTENSIONS[0]}`,
    } as Express.Multer.File;

    expect(constraint.validate(file)).toBe(false);
  });

  it('should return false when file has no extension', () => {
    const file = {
      mimetype: ALLOWED_AUDIO_TYPES[0],
      originalname: 'file',
    } as Express.Multer.File;

    expect(constraint.validate(file)).toBe(false);
  });

  it('should return the expected default error message', () => {
    const expected = `Invalid audio file type. Allowed types: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}`;
    expect(constraint.defaultMessage()).toBe(expected);
  });
});

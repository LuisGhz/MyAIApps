import { base64toImage } from './base64toImage.util';

describe('base64toImage', () => {
  it('should convert base64 string with data URL prefix to Buffer', () => {
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const dataUrl = `data:image/png;base64,${base64Data}`;

    const result = base64toImage(dataUrl);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString('base64')).toBe(base64Data);
  });

  it('should convert plain base64 string without prefix to Buffer', () => {
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = base64toImage(base64Data);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString('base64')).toBe(base64Data);
  });

  it('should handle base64 string with image/jpeg MIME type', () => {
    const base64Data = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAB//2Q==';
    const dataUrl = `data:image/jpeg;base64,${base64Data}`;

    const result = base64toImage(dataUrl);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString('base64')).toBe(base64Data);
  });

  it('should handle base64 string with application/octet-stream MIME type', () => {
    const base64Data = 'SGVsbG8gV29ybGQ=';
    const dataUrl = `data:application/octet-stream;base64,${base64Data}`;

    const result = base64toImage(dataUrl);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString('base64')).toBe(base64Data);
  });

  it('should convert empty base64 string to empty Buffer', () => {
    const base64Data = '';

    const result = base64toImage(base64Data);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBe(0);
  });

  it('should convert base64 string with special characters', () => {
    const base64Data = 'SGVsbG8gV29ybGQh+/s=';

    const result = base64toImage(base64Data);

    expect(result).toBeInstanceOf(Buffer);
    expect(result.toString('base64')).toBe(base64Data);
  });
});

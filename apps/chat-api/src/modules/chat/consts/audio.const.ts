export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  'audio/flac',
  'audio/x-m4a',
] as const;

export const ALLOWED_AUDIO_EXTENSIONS = [
  '.mp3',
  '.mp4',
  '.mpeg',
  '.mpga',
  '.m4a',
  '.wav',
  '.webm',
  '.ogg',
  '.flac',
] as const;

export type AllowedAudioType = (typeof ALLOWED_AUDIO_TYPES)[number];
export type AllowedAudioExtension = (typeof ALLOWED_AUDIO_EXTENSIONS)[number];

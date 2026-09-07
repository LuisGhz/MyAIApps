export const base64toImage = (b64String: string): Buffer => {
  // Remove data URL prefix if present
  const matches = b64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const base64Data = matches ? matches[2] : b64String;

  return Buffer.from(base64Data, 'base64');
};

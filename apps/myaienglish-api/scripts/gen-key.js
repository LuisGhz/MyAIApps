import crypto from 'crypto';

const generateKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

console.log('Generated JWT Secret Key:', generateKey());
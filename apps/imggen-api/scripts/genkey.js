import crypto from 'crypto';

const genKey = () => {
  const key = crypto.randomBytes(64).toString('hex');
  console.log('Generated Key:', key);
};

genKey();

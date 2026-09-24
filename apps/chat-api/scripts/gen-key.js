import crypto from 'node:crypto';


const genKey = (length = 64) => {
  const key = crypto.randomBytes(length).toString('hex');
  return key;
}

const jwtKey = genKey();
console.log('Generated JWT Key:', jwtKey);

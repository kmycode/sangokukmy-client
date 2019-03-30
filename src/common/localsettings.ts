
function isLocal(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export const HOST_ROOT_LOCAL =
  isLocal() ? 'http://localhost:5000/' : 'https://sangokukmy-api.kmycode.net/';

export const SERVER_SECRET_KEY =
  isLocal() ? 'abc' : process.env.SERVER_SECRET_KEY;

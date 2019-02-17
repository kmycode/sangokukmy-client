
function isLocal(): boolean {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

export const HOST_ROOT_LOCAL =
  isLocal() ? 'http://localhost:5000/' : 'https://sangokukmy-api.kmycode.net/';

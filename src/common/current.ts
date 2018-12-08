
/**
 * API認証に使うトークン
 */
export let authorizationToken = '';
export function setAuthorizationToken(token: string) {
  authorizationToken = token;
}

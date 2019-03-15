import * as api from '@/api/api';

/**
 * API認証に使うトークン
 */
export let authorizationToken = '';

/**
 * トークンの有効期限
 */
export let tokenExpirationTime = new Date();

export function setAuthorizationToken(token: api.AuthenticationData) {
  authorizationToken = token.accessToken;
  tokenExpirationTime = api.DateTime.toDate(token.expirationTime);
  localStorage.setItem('access-token', token.accessToken);
  localStorage.setItem('token-expiration', api.DateTime.toDate(token.expirationTime).toDateString());
}

function initializeCurrent() {
  const token = localStorage.getItem('access-token');
  const expiration = localStorage.getItem('token-expiration');
  if (token) {
    authorizationToken = token;
  }
  if (expiration) {
    try {
      tokenExpirationTime = new Date(Date.parse(expiration));
    } catch (ex) {
      tokenExpirationTime = new Date();
      authorizationToken = '';
    }
  }
}

initializeCurrent();

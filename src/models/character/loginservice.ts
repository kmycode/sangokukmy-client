import * as api from './../../api/api';
import * as current from '../../common/current';

export default class LoginService {

  public static async loginWithIdAndPasswordAsync(id: string, password: string): Promise<LoginResult> {
    if (id === '') {
      return LoginResult.emptyId;
    }
    if (password === '') {
      return LoginResult.emptyPassword;
    }
    try {
      const result = await api.Api.loginWithIdAndPassword(id, password);
      if (result.isSucceed) {
        current.setAuthorizationToken(result.accessToken);
        return LoginResult.succeed;
      } else {
        return LoginResult.wrongIdOrPassword;
      }
    } catch (ex) {
      return LoginResult.cannotConnect;
    }
  }

  private constructor() {}
}

export const enum LoginResult {
  succeed,
  cannotConnect,
  wrongIdOrPassword,
  emptyId,
  emptyPassword,
}

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
      current.setAuthorizationToken(result.accessToken);
      return LoginResult.succeed;
    } catch (ex) {
      switch (ex.data.code) {
        case api.ErrorCode.serverConnectionFailed:
        case api.ErrorCode.databaseError:
        case api.ErrorCode.internalError:
          return LoginResult.cannotConnect;
        case api.ErrorCode.loginCharacterNotFound:
          return LoginResult.wrongIdOrPassword;
        case api.ErrorCode.loginParameterIncorrect:
          return LoginResult.wrongIdOrPassword;
        default:
          return LoginResult.unknown;
      }
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
  unknown,
}

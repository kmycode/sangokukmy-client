import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import Enumerable from 'linq';
import * as current from '../common/current';
import * as def from '../common/definitions';

/**
 * エラーコード
 */
export enum ErrorCode {
  serverConnectionFailed = -1,
  succeed = 32767,
  internalError = 1,
  databaseError = 2,
  databaseTimeout = 3,
  lockFailed = 4,
  loginCharacterNotFound = 5,
  loginParameterMissing = 6,
  loginParameterIncorrect = 7,
  loginTokenIncorrect = 8,
}

/**
 * APIデータ
 */
class ApiData<T> {
  public constructor(public type: number,
                     public data: T) {}
}

/**
 * 月日・時刻
 */
export class DateTime {
  public static readonly typeId = 1;

  public constructor(public year: number,
                     public month: number,
                     public day: number,
                     public hours: number,
                     public minutes: number,
                     public seconds: number) {}
}

/**
 * エラー
 */
export class ApiError {
  public static readonly typeId = 7;
  public static readonly serverConnectionFailed = new ApiError(ErrorCode.serverConnectionFailed);

  public constructor(public code: number,
                     public data?: any) {}
}

/**
 * マップログの種類
 */
export class MapLogType {
  public static readonly typeId = 2;

  /**
   * 空のタイプ
   */
  public static empty = new MapLogType(-1, '', 'black');

  constructor(public id: number,
              public text: string,
              public color: string) {}
}

/**
 * デフォルトのマップログの種類
 */
export class MapLogTypes {

  /**
   * IDからログタイプを取得する
   * @param id ログタイプのID
   * @returns 指定したIDにあったログタイプ
   */
  public static fromId(id: number): MapLogType | null {
    const type = Enumerable.from(this.types).singleOrDefault((t) => t.id === id);
    return type || null;
  }

  private static types = [
    new MapLogType(1, 'イベント', 'red'),
  ];

  private constructor() {}

}

/**
 * マップログ
 */
export class MapLog {
  public static readonly typeId = 4;

  constructor(public id: number,
              public message: string,
              public type: MapLogType,
              public date: DateTime) {}
}

/**
 * 武将更新ログ
 */
export class CharacterUpdateLog {
  public static readonly typeId = 3;

  constructor(public id: number,
              public characterName: string,
              public date: DateTime) {}
}

/**
 * 認証データ
 */
export class AuthenticationData {
  public static readonly typeId = 6;

  constructor(public accessToken: string,
              public characterId: number,
              public expirationTime: DateTime) {}
}

export class Api {

  /**
   * IDとパスワードでログインする
   * @param id ID
   * @param password パスワード
   */
  public static async loginWithIdAndPassword(id: string, password: string): Promise<AuthenticationData> {
    try {
      const result = await axios.post<ApiData<AuthenticationData>>(def.API_HOST + 'authenticate', {
        id,
        password,
      });
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 武将更新ログを取得する
   *
   * GET    /api/v1/character/updatelog/{count}
   * @param count 取得する数
   * @returns ログの配列。countに入り切らなかった場合は、空の要素が入れられる
   */
  public static async getCharacterLogs(count: number): Promise<CharacterUpdateLog[]> {
    // dummy
    const result = new Array<CharacterUpdateLog>();
    for (let i = 0; i < count; i++) {
      result.push(new CharacterUpdateLog(i + 1, 'あすか', new DateTime(2018, 1, 1, 12, 0, 0)));
    }
    return result;
  }

//#region マップログ

  /**
   * マップログを取得する
   *
   * GET    /api/v1/maplog/{count}
   * @param count 取得する数
   * @returns マップログの配列。countに入り切らなかった場合は、空の要素が入れられる
   */
  public static async getMapLogs(count: number): Promise<MapLog[]> {
    // dummy
    const result = new Array<MapLog>();
    for (let i = 0; i < count; i++) {
      result.push(new MapLog(i + 1,
        'てすとろぐ',
        MapLogTypes.fromId(1) || MapLogType.empty,
        new DateTime(2018, 1, 1, 12, 0, 0)));
    }
    return result;
  }

  /*
   * マップログ（太字）を取得する
   *
   * GET    /api/v1/maplog/important/{count}
   */
  public static async getImportantMapLogs(count: number): Promise<MapLog[]> {
    // dummy
    const result = new Array<MapLog>();
    for (let i = 0; i < count; i++) {
      result.push(new MapLog(i + 1,
        'てすとろぐ（太字）',
        MapLogTypes.fromId(1) || MapLogType.empty,
        new DateTime(2018, 1, 1, 12, 0, 0)));
    }
    return result;
  }

//#endregion

  /**
   * 認証のときに利用するヘッダ
   */
  private static get authHeader(): AxiosRequestConfig {
    return {
      headers: {
        Authorization: current.authorizationToken,
      },
    };
  }

  private static pickException(ex: any) {
    if (ex.response) {
      return ex.response.data;
    } else {
      return { data: ApiError.serverConnectionFailed };
    }
  }

}

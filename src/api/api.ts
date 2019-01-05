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
  loginTokenEmpty = 9,
  internalDataNotFound = 10,
  commandTypeNotFound = 11,
  operationConflict = 12,
  debugModeOnlyError = 13,
  characterIconNotFoundError = 14,
  lackOfTownTechnologyForSoldier = 15,
  lackOfCommandParameter = 16,
}

/**
 * IDをもった要素
 */
export interface IIdentitiedEntity {
  id: number;
}

/**
 * APIデータ
 */
export class ApiData<T> {
  public constructor(public type: number,
                     public data: T) {}
}

/**
 * API配列データ
 */
export class ApiArrayData<T> {
  public constructor(public type: number,
                     public data: T[]) {}
}

/**
 * サーバからのシグナル
 */
export class ApiSignal {
  public static readonly typeId: number = 15;

  public constructor(public type: number = 0,
                     public data?: any) {}
}

/**
 * 月日・時刻
 */
export class DateTime {
  public static readonly typeId = 1;

  public static toFormatedString(date: DateTime): string {
    if (date !== undefined) {
      return date.year + '年' +
      date.month + '月' +
      date.day + '日 ' +
      date.hours + ':' +
      (date.minutes < 10 ? '0' : '') + date.minutes + ':' +
      (date.seconds < 10 ? '0' : '') + date.seconds;
    } else {
      return '???';
    }
  }

  public static toShortFormatedString(date: DateTime): string {
    if (date !== undefined) {
      return date.day + '日 ' +
      date.hours + ':' +
      (date.minutes < 10 ? '0' : '') + date.minutes;
    } else {
      return '???';
    }
  }

  public static toDate(date: DateTime): Date {
    return new Date(date.year, date.month - 1, date.day, date.hours, date.minutes, date.seconds);
  }

  public static fromDate(date: Date): DateTime {
    return new DateTime(date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds());
  }

  public constructor(public year: number = 0,
                     public month: number = 0,
                     public day: number = 0,
                     public hours: number = 0,
                     public minutes: number = 0,
                     public seconds: number = 0) {}

  public toString(): string {
    return DateTime.toFormatedString(this);
  }
}

/**
 * ゲーム内の月日
 */
export class GameDateTime {
  public static readonly typeId = 12;

  public static toFormatedString(date: GameDateTime): string {
    return date.year + '年' + date.month + '月';
  }

  public static toNumber(date: GameDateTime): number {
    return date.year * 12 + date.month - 1;
  }

  public static fromNumber(num: number): GameDateTime {
    return new GameDateTime(Math.floor(num / 12), num % 12 + 1);
  }

  public static toRealDate(date: GameDateTime): DateTime {
    // TODO
    return new DateTime(2018, 12, 1, 20, 0, 0);
  }

  public static addMonth(date: GameDateTime, add: number): GameDateTime {
    let year = date.year;
    let month = date.month + add;
    while (month > 12) {
      month -= 12;
      year++;
    }
    while (month < 1) {
      month += 12;
      year--;
    }
    return new GameDateTime(year, month);
  }

  public static nextMonth(date: GameDateTime): GameDateTime {
    return GameDateTime.addMonth(date, 1);
  }

  public constructor(public year: number = 0,
                     public month: number = 0) {}

  public toString(): string {
    return GameDateTime.toFormatedString(this);
  }
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
 * システムデータ
 */
export class SystemData {
  public static readonly typeId = 19;

  public constructor(public isDebug: boolean = false,
                     public period: number = 0,
                     public betaVersion: number = 0,
                     public gameDateTime: GameDateTime = new GameDateTime(0, 0),
                     public currentMonthStartDateTime: DateTime = new DateTime(0, 0, 0, 0, 0, 0)) {}
}

/**
 * マップログ
 */
export class MapLog implements IIdentitiedEntity {
  public static readonly typeId = 4;

  public static getEventType(log: MapLog): def.EventType | undefined {
    return Enumerable.from(def.EVENT_TYPES).firstOrDefault((et) => et.id === log.eventType);
  }

  constructor(public id: number,
              public isImportant: boolean,
              public eventType: number,
              public message: string,
              public gameDate: GameDateTime,
              public date: DateTime) {}
}

/**
 * 武将更新ログ
 */
export class CharacterUpdateLog implements IIdentitiedEntity {
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

/**
 * 武将
 */
export class Character implements IIdentitiedEntity {
  public static readonly typeId = 9;

  public static getClassName(chara: Character): string {
    const lank = Math.min(Math.floor(chara.classValue / def.NEXT_LANK), def.CLASS_NAMES.length);
    return def.CLASS_NAMES[lank];
  }

  public constructor(public id: number = 0,
                     public aliasId: string = '',
                     public name: string = '',
                     public countryId: number = 0,
                     public strong: number = 0,
                     public strongEx: number = 0,
                     public intellect: number = 0,
                     public intellectEx: number = 0,
                     public leadership: number = 0,
                     public leadershipEx: number = 0,
                     public popularity: number = 0,
                     public popularityEx: number = 0,
                     public soldierType: number = 0,
                     public soldierNumber: number = 0,
                     public proficiency: number = 0,
                     public money: number = 0,
                     public rice: number = 0,
                     public contribution: number = 0,
                     public classValue: number = 0,
                     public deleteTurn: number = 0,
                     public townId: number = 0,
                     public message: number = 0,
                     public lastUpdated: DateTime = new DateTime(),
                     public lastUpdatedGameDate: GameDateTime = new GameDateTime(),
                     public mainIcon?: CharacterIcon) {}
}

/**
 * 国のポスト
 */
export class CountryPost {
  public static readonly typeId = 20;

  public constructor(public type: number = 0,
                     public countryId: number = 0,
                     public characterId: number = 0,
                     public character: Character) {}
}

/**
 * 国
 */
export class Country {
  public static readonly typeId = 10;
  public static readonly default = new Country(-1, '無所属', 0);

  public constructor(public id: number = 0,
                     public name: string = '',
                     public colorId: number = 0,
                     public established: GameDateTime = new GameDateTime(),
                     public capitalTownId: number = 0,
                     public posts: CountryPost[] = [],
                     public lastMoneyIncomes?: number,
                     public lastRiceIncomes?: number) {}
}

export abstract class TownBase implements IIdentitiedEntity {
  public constructor(public id: number = 0,
                     public type: number = 0,
                     public countryId: number = 0,
                     public name: string = '',
                     public x: number = 0,
                     public y: number = 0,
                     public people: number = 0,
                     public agriculture: number = 0,
                     public agricultureMax: number = 0,
                     public commercial: number = 0,
                     public commercialMax: number = 0,
                     public technology: number = 0,
                     public technologyMax: number = 0,
                     public wall: number = 0,
                     public wallMax: number = 0,
                     public wallguard: number = 0,
                     public wallguardMax: number = 0,
                     public security: number = 0,
                     public ricePrice: number = 0) {}
}

/**
 * 都市
 */
export class Town extends TownBase implements IIdentitiedEntity {
  public static readonly typeId = 11;

  public static readonly default: Town = new Town(-1);

  public static readonly typeAgriculture = 1;
  public static readonly typeCommercial = 2;
  public static readonly typeFortress = 3;
  public static readonly typeLarge = 4;

  public static isScouted(town: TownBase): boolean {
    const scoutMethod = (town as ScoutedTown).scoutMethod;
    return scoutMethod !== undefined && scoutMethod !== 0;
  }
}

/**
 * 諜報された都市
 */
export class ScoutedTown extends TownBase implements IIdentitiedEntity {
  public static readonly typeId = 16;

  public scoutedTownId: number = 0;
  public scoutedCharacterId?: number;
  public scoutMethod?: number;
  public scoutedGameDateTime?: GameDateTime;

  public characters: Character[] = [];
  public defenders: Character[] = [];
}

/**
 * 武将のコマンドパラメータ
 */
export class CharacterCommandParameter {
  public constructor(public type: number,
                     public numberValue?: number,
                     public stringValue?: string) {}
}

/**
 * 武将のコマンド
 */
export class CharacterCommand {
  public static readonly typeId: number = 14;

  public static updateName(command: CharacterCommand) {
    const cmd = def.getCommandNameByType(command.type);
    if (cmd) {
      command.name = cmd.solve(command.parameters);
    } else {
      command.name = '';
    }
  }

  public constructor(public commandNumber: number = 0,
                     public characterId: number = 0,
                     public type: number = 0,
                     public name: string = '',
                     public parameters: CharacterCommandParameter[] = [],
                     public gameDate: GameDateTime = new GameDateTime(),
                     public date?: DateTime,
                     public isSelected?: boolean) {}
}

/**
 * 武将のアイコン
 */
export class CharacterIcon {
  public static readonly typeId = 18;
  public static readonly default: CharacterIcon = CharacterIcon.createDefault();

  public static isDefault(icon: CharacterIcon): boolean {
    if (icon.isNotDefaultPrivate) {
      return true;
    } else {
      return false;
    }
  }

  public static getUri(icon: CharacterIcon): string {
    if (icon.type === 2) {
      // アップロードされたアイコン
      return def.UPLOADED_ICONS_HOST + icon.fileName;
    } else if (icon.type === 3) {
      // Gravatar
      return icon.uri;
    } else {
      // デフォルトのアイコン
      return def.DEFAULT_ICONS_HOST + icon.fileName;
    }
  }

  public static getMain(icons: CharacterIcon[]): CharacterIcon | undefined {
    return Enumerable.from(icons).firstOrDefault((i) => i.isMain);
  }

  public static getMainOrFirst(icons: CharacterIcon[]): CharacterIcon | undefined {
    const main = CharacterIcon.getMain(icons);
    if (main) {
      return main;
    } else {
      return Enumerable.from(icons).firstOrDefault();
    }
  }

  public static getMainUri(icons: CharacterIcon[]): string {
    const main = CharacterIcon.getMain(icons);
    if (main) {
      return CharacterIcon.getUri(main);
    } else {
      if (icons.length > 0) {
        return CharacterIcon.getUri(icons[0]);
      } else {
        return CharacterIcon.getUri(CharacterIcon.default);
      }
    }
  }

  private static createDefault(): CharacterIcon {
    const icon = new CharacterIcon(0, 0, true, 1, '', '0.gif');
    icon.isNotDefaultPrivate = true;
    return icon;
  }

  private isNotDefaultPrivate?: boolean = false;

  public constructor(public id: number = 0,
                     public characterId: number = 0,
                     public isMain: boolean = false,
                     public type: number = 0,
                     public uri: string = '',
                     public fileName: string = '') {}
}

/**
 * 武将の更新ログ
 */
export class CharacterLog implements IIdentitiedEntity {
  public static readonly typeId = 13;

  public constructor(public id: number,
                     public message: string,
                     public date: DateTime,
                     public gameDate: GameDateTime) {}
}

/**
 * 手紙向けの武将データ
 */
export class CharacterChatData {
  public constructor(public id: number,
                     public name: string) {}
}

/**
 * 手紙
 */
export class ChatMessage implements IIdentitiedEntity {
  public static readonly typeId = 17;

  public static readonly typeSelfCountry = 1;
  public static readonly typeOtherCountry = 2;
  public static readonly typePrivate = 3;
  public static readonly typeUnit = 4;
  public static readonly typeTown = 5;
  public static readonly typeGlobal = 6;
  public static readonly typeSimpleBbs = 7;

  public constructor(public id: number,
                     public characterCountryId: number,
                     public type: number,
                     public message: string,
                     public posted: DateTime,
                     public character?: CharacterChatData,
                     public characterIcon?: CharacterIcon,
                     public typeData?: number,
                     public typeData2?: number) {}
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
   * 武将のすべてのコマンドを取得（欠番がある場合もあるので注意）
   */
  public static async getAllCommands(): Promise<{ commands: CharacterCommand[], secondsNextCommand: number }> {
    try {
      const result = await axios.get<{ commands: CharacterCommand[], secondsNextCommand: number }>
        (def.API_HOST + 'commands', this.authHeader);
      return result.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 武将のコマンドを設定
   * @param commands 入力するコマンド
   */
  public static async setCommands(commands: CharacterCommand[]) {
    try {
      await axios.put(def.API_HOST + 'commands', commands, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 武将のすべてのアイコンを取得
   */
  public static async getAllIcons(): Promise<CharacterIcon[]> {
    try {
      const result = await axios.get<ApiArrayData<CharacterIcon>>
        (def.API_HOST + 'icons', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 都市にいる武将をすべて取得
   */
  public static async getAllCharactersAtTown(townId: number): Promise<Character[]> {
    try {
      const result = await axios.get<ApiArrayData<Character>>
        (def.API_HOST + 'town/' + townId + '/characters', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 都市にいる守備武将をすべて取得
   */
  public static async getAllDefendersAtTown(townId: number): Promise<Character[]> {
    try {
      const result = await axios.get<ApiArrayData<Character>>
        (def.API_HOST + 'town/' + townId + '/defenders', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 現在いる都市を諜報
   */
  public static async scoutTown(): Promise<any> {
    try {
      await axios.post
        (def.API_HOST + 'town/scout', {}, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 国にいる武将をすべて取得
   */
  public static async getAllCharactersBelongsCountry(countryId: number): Promise<Character[]> {
    try {
      const result = await axios.get<ApiArrayData<Character>>
        (def.API_HOST + 'country/' + countryId + '/characters', this.authHeader);
      return result.data.data;
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 国の役職を設定
   * @param characterId 設定する相手のID
   * @param post 設定する役職ID
   */
  public static async setCountryPost(characterId: number, post: number): Promise<any> {
    try {
      await axios.put
        (def.API_HOST + 'country/posts', {
          type: post,
          characterId,
        }, this.authHeader);
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

  public static async postCountryChatMessage(mes: string, icon: CharacterIcon): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'chat/country', {
        message: mes,
        characterIconId: icon.id,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  public static async postGlobalChatMessage(mes: string, icon: CharacterIcon): Promise<any> {
    try {
      await axios.post(def.API_HOST + 'chat/global', {
        message: mes,
        characterIconId: icon.id,
      }, this.authHeader);
    } catch (ex) {
      throw Api.pickException(ex);
    }
  }

  /**
   * 認証のときに利用するヘッダ
   */
  private static get authHeader(): AxiosRequestConfig {
    return {
      headers: {
        Authorization: 'Bearer ' + current.authorizationToken,
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

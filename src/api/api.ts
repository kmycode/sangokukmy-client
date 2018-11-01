import axios from 'axios';
import Enumerable from 'linq';


/**
 * 月日・時刻
 */
export class DateTime {
  public constructor(public year: number,
                     public month: number,
                     public day: number,
                     public hours: number,
                     public minutes: number,
                     public seconds: number) {
  }
}

/**
 * マップログの種類
 */
export class MapLogType {

  /**
   * 空のタイプ
   */
  public static empty = new MapLogType(-1, '', 'black');

  constructor(public id: number,
              public text: string,
              public color: string) {
  }
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
  constructor(public id: number,
              public message: string,
              public type: MapLogType,
              public date: DateTime) {
  }
}

/**
 * 武将更新ログ
 */
export class CharacterUpdateLog {
  constructor(public id: number,
              public characterName: string,
              public date: DateTime) {
  }
}

export class Api {

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

}

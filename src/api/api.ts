import axios from 'axios';
import Enumerable from 'linq';


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
              public type: MapLogType) {
  }

  public toHtml(): string {
    return `<span style="color:${this.type.color}">【${this.type.text}】</span>${this.message}`;
  }
}

export class Api {

//#region マップログ

  /**
   * マップログを取得する
   *
   * GET    /api/v1/maplog
   * @param count 取得する数
   * @returns マップログの配列。countに入り切らなかった場合は、空の要素が入れられる
   */
  public static async getMapLogs(count: number): Promise<MapLog[]> {
    // dummy
    const result = new Array<MapLog>();
    for (let i = 0; i < count; i++) {
      result.push(new MapLog(i + 1, 'てすとろぐ', MapLogTypes.fromId(1) || MapLogType.empty));
    }
    return result;
  }

  /*
   * マップログ（太字）を取得する
   *
   * GET    /api/v1/maplog/important
   */
  public static async getImportantMapLogs(count: number): Promise<MapLog[]> {
    // dummy
    const result = new Array<MapLog>();
    for (let i = 0; i < count; i++) {
      result.push(new MapLog(i + 1, 'てすとろぐ（太字）', MapLogTypes.fromId(1) || MapLogType.empty));
    }
    return result;
  }

//#endregion

}

import * as api from '@/api/api';
import Enumerable from 'linq';

export const HOST_ROOT = 'http://localhost:5000/';

/**
 * APIサーバのホスト
 */
export const API_HOST = HOST_ROOT + 'api/v1/';

/**
 * デフォルトアイコンの置き場所
 */
export const DEFAULT_ICONS_HOST = HOST_ROOT + 'images/character-default-icons/';

/**
 * アップロードされたアイコンの置き場所
 */
export const UPLOADED_ICONS_HOST = HOST_ROOT + 'images/character-uploaded-icons/';

/**
 * 更新時間
 */
export const UPDATE_TIME = 600;

/**
 * 次の階級に上がるまでに必要な階級値
 */
export const NEXT_LANK = 1000;

/**
 * 兵種
 */
export class SoldierType {
  public constructor(public id: number,
                     public name: string,
                     public money?: number,
                     public attackPower?: string,
                     public defencePower?: string,
                     public description?: string) {}
}
export const SOLDIER_TYPES: SoldierType[] = [
  new SoldierType(1, '雑兵', 10, '0', '0'),
  new SoldierType(2, '禁兵', 10, '20', '20'),
  new SoldierType(100, '雑兵・禁兵', 10, '0', '0', 'このゲームにおける最弱の兵士。ただし、首都で徴兵した場合は禁兵が徴兵され、攻撃力・防御力に20のボーナスを得る'),
  new SoldierType(3, '軽歩兵', 100, '0', '0', '説明'),
  new SoldierType(4, '弓兵', 100, '0', '0', '説明'),
  new SoldierType(5, '軽騎兵', 100, '0', '0', '説明'),
  new SoldierType(6, '強弩兵', 100, '0', '0', '説明'),
  new SoldierType(7, '神鬼兵', 100, '0', '0', '説明'),
  new SoldierType(8, '重歩兵', 100, '0', '0', '説明'),
  new SoldierType(9, '重騎兵', 100, '0', '0', '説明'),
  new SoldierType(10, '智攻兵', 100, '0', '0', '説明'),
  new SoldierType(11, '連弩兵', 100, '0', '0', '説明'),
  new SoldierType(12, '壁守兵', 100, '0', '0', '説明'),
  new SoldierType(13, '衝車', 100, '0', '0', '説明'),
  new SoldierType(14, '井闌', 100, '0', '0', '説明'),
];

/**
 * 階級
 */
export const CLASS_NAMES: string[] = [
  '雑兵',
  '一兵卒',
  '兵副隊長',
  '兵隊長',
  '兵率長',
  '部隊長',
  '親衛隊',
  '親衛隊長',
  '護衛隊',
  '護衛隊長',
  '偏将軍',
  '安国将軍',
  '昭文将軍',
  '建武将軍',
  '車騎将軍',
  '五官中朗将',
  '大尉',
  '大司馬',
  '丞相',
  '大将軍',
  '皇帝',
];

/**
 * 都市の特化
 */
export const TOWN_TYPES: string[] = [
  '農業都市',
  '商業都市',
  '城塞都市',
  '大都市',
];

class CommandNameResolver {
  public constructor(public type: number,
                     private readonly format: string,
                     private readonly solver?: (format: string,
                                                parameters: api.CharacterCommandParameter[] | undefined) => string) {}

  public solve(parameters: api.CharacterCommandParameter[]): string {
    if (this.solver) {
      return this.solver(this.format, parameters);
    } else {
      return this.format;
    }
  }
}
export const COMMAND_NAMES: CommandNameResolver[] = [
  new CommandNameResolver(1, '農業開発'),
  new CommandNameResolver(2, '商業発展'),
  new CommandNameResolver(3, '技術開発'),
  new CommandNameResolver(4, '城壁強化'),
  new CommandNameResolver(5, '守兵増強'),
  new CommandNameResolver(6, '米施し'),
  new CommandNameResolver(7, '農地開拓'),
  new CommandNameResolver(8, '市場拡大'),
  new CommandNameResolver(9, '城壁増築'),
  new CommandNameResolver(10, '{0} を {1} 人徴兵', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const soldierType = p.firstOrDefault((pp) => pp.type === 1);
      const soldierNumber = p.firstOrDefault((pp) => pp.type === 2);
      if (!soldierType || !soldierNumber) {
        return 'エラー (10:2)';
      }

      const type = Enumerable.from(SOLDIER_TYPES).firstOrDefault((st) => st.id === soldierType.numberValue);
      if (type && soldierNumber.numberValue !== undefined) {
        return format.replace('{0}', type.name).replace('{1}', soldierNumber.numberValue.toString());
      } else {
        return 'エラー (10:3)';
      }
    } else {
      return 'エラー (10:1)';
    }
  }),
  new CommandNameResolver(12, '城の守備'),
  new CommandNameResolver(17, '%0% へ移動'),
  new CommandNameResolver(18, '{0} を強化', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const trainingType = p.firstOrDefault((pp) => pp.type === 1);
      if (!trainingType) {
        return 'エラー (18:2)';
      }

      let name: string;
      switch (trainingType.numberValue) {
        case 1:
          name = '武力';
          break;
        case 2:
          name = '知力';
          break;
        case 3:
          name = '統率';
          break;
        case 4:
          name = '人望';
          break;
        default:
          return 'エラー (18:3)';
      }

      return format.replace('{0}', name);
    } else {
      return 'エラー (18:1)';
    }
  }),
];
export function getCommandNameByType(type: number): CommandNameResolver | undefined {
  return Enumerable.from(COMMAND_NAMES)
                   .firstOrDefault((n) => n.type === type);
}

/**
 * イベントの種類
 */
export class EventType {
  public static readonly default: EventType = new EventType(0, 'ERR', 'black');

  public constructor(public id: number,
                     public name: string,
                     public color: string) {}
}
export const EVENT_TYPES: EventType[] = [
  new EventType(1, '収入', 'gold'),
];

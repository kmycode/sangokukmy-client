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
class SoldierType {
  public constructor(public id: number, public name: string, public attackPower?: string,
                     public defencePower?: string) {}
}
export const SOLDIER_TYPES: SoldierType[] = [
  new SoldierType(1, '雑兵'),
  new SoldierType(2, '禁兵'),
  new SoldierType(3, '軽歩兵'),
  new SoldierType(4, '弓兵'),
  new SoldierType(5, '軽騎兵'),
  new SoldierType(6, '強弩兵'),
  new SoldierType(7, '神鬼兵'),
  new SoldierType(8, '重歩兵'),
  new SoldierType(9, '重騎兵'),
  new SoldierType(10, '智攻兵'),
  new SoldierType(11, '連弩兵'),
  new SoldierType(12, '壁守兵'),
  new SoldierType(13, '衝車'),
  new SoldierType(14, '井闌'),
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
];
export function getCommandNameByType(type: number): CommandNameResolver | undefined {
  return Enumerable.from(COMMAND_NAMES)
                   .firstOrDefault((n) => n.type === type);
}

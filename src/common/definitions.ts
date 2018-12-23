
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

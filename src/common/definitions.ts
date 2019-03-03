import * as api from '@/api/api';
import Enumerable from 'linq';
import * as local from './localsettings';

export const HOST_ROOT = local.HOST_ROOT_LOCAL;

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
 * 更新を開始する年
 */
export const UPDATE_START_YEAR = 24;

/**
 * 戦闘解除ターン
 */
export const BATTLE_STOP_TURN = 288;

/**
 * 放置削除ターン
 */
export const CHARACTER_DELETE_TURN = 500;

/**
 * 次の階級に上がるまでに必要な階級値
 */
export const NEXT_LANK = 800;

/**
 * 国色の数
 */
export const COUNTRY_COLOR_NUM = 8;

/**
 * アイコン数
 */
export const DEFAULT_ICON_NUM = 98;

export const RICE_BUY_MAX = 10000;

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
  new SoldierType(2, '禁兵', 10, '15', '15'),
  new SoldierType(100, '雑兵・禁兵', 10, '0 / 10', '0 / 10', 'このゲームにおける最弱の兵士。ただし、首都で徴兵した場合は禁兵が徴兵され、攻撃力・防御力に10のボーナスを得る'),
  new SoldierType(3, '軽歩兵',  20, '10', '0', '軽装備の歩兵'),
  new SoldierType(4, '弓兵',    30, '0', '15', '弓を持った兵士'),
  new SoldierType(5, '軽騎兵',  50, '35', '10', '軽装備の騎兵'),
  new SoldierType(6, '強弩兵',  70, '10', '35', '弩を持った兵士'),
  new SoldierType(7, '神鬼兵',  100, '知力', '0', '攻撃力に知力が補正として加算される'),
  new SoldierType(8, '重歩兵',  125, '50', '30', '重装備の歩兵'),
  new SoldierType(9, '重騎兵',  150, '60', '40', '重装備の騎兵'),
  new SoldierType(10, '智攻兵', 175, '知力x0.8', '知力x0.4', '攻撃力、防御力、ともに知力が補正として加算される'),
  new SoldierType(11, '連弩兵', 200, '90', '30', '連弩を持った兵士'),
  new SoldierType(12, '壁守兵', 225, '0', '知力', '堅く守ることに特化した兵士。防御力に知力が補正として加算される'),
  new SoldierType(14, '井闌', 300, '0', '0', '対城壁・守兵・壁守兵の場合に限り、攻撃力に200のボーナスを得る'),
  new SoldierType(100, '守兵A', 32767, '0', '0', ''),
  new SoldierType(101, '守兵B', 32767, '0', '0', ''),
  new SoldierType(102, '守兵C', 32767, '0', '0', ''),
  new SoldierType(103, '守兵D', 32767, '0', '0', ''),
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
  new CommandNameResolver(11, '兵士訓練'),
  new CommandNameResolver(12, '城の守備'),
  new CommandNameResolver(13, '%0% へ侵攻'),
  new CommandNameResolver(14, '集合'),
  new CommandNameResolver(15, '%読込中% を登用'),
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
  new CommandNameResolver(19, '米売買', (_, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const type = p.firstOrDefault((pp) => pp.type === 1);
      const assets = p.firstOrDefault((pp) => pp.type === 2);
      const result = p.firstOrDefault((pp) => pp.type === 3);
      if (!type || !assets) {
        return 'エラー (19:2)';
      }
      if (!type.numberValue || !assets.numberValue) {
        return 'エラー (19:3)';
      }
      if (type.numberValue !== 1 && type.numberValue !== 2) {
        return 'エラー (19:4)';
      }

      if (!result || result.numberValue === undefined) {
        return type.numberValue === 1 ? '金 ' + assets.numberValue + ' を米に交換' :
                                        '米 ' + assets.numberValue + ' を金に交換';
      } else {
        return type.numberValue === 1 ? '金 ' + assets.numberValue + ' → 米 ' + result.numberValue :
                                        '米 ' + assets.numberValue + ' → 金 ' + result.numberValue;
      }
    } else {
      return 'エラー (19:1)';
    }
  }),
  new CommandNameResolver(23, '仕官'),
  new CommandNameResolver(30, '緊急米施し'),
  new CommandNameResolver(31, '都市施設強化'),
  new CommandNameResolver(32, '国家施設強化'),
  new CommandNameResolver(33, '研究所強化'),
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
  new EventType(2, 'イベント', '#c3c'),
  new EventType(3, '同盟破棄', 'red'),
  new EventType(4, '開戦', 'red'),
  new EventType(5, '同盟締結', 'dodgerblue'),
  new EventType(6, '宣戦布告', 'red'),
  new EventType(7, '相討', '#55f'),
  new EventType(8, '引分', '#55f'),
  new EventType(9, '敗北', '#55f'),
  new EventType(10, '勝利', '#55f'),
  new EventType(11, '支配', 'blue'),
  new EventType(12, '滅亡', 'red'),
  new EventType(13, '統一', 'red'),
  new EventType(14, 'リセット', 'red'),
  new EventType(15, '新規', 'dodgerblue'),
  new EventType(16, '建国', '#008'),
  new EventType(17, '仕官', '#008'),
  new EventType(18, '放置', 'black'),
  new EventType(19, '派遣', '#800'),
  new EventType(20, '帰還', '#800'),
  new EventType(21, '帰順', '#008'),
  new EventType(22, '仕官', '#008'),
  new EventType(23, '異民族', '#088'),
  new EventType(24, '農民反乱', '#088'),
  new EventType(25, '攻略', '#080'),
];

/**
 * 国の役職
 */
export class CountryPostType {
  public constructor(public id: number,
                     public name: string) {}
}
export const COUNTRY_POSTS: CountryPostType[] = [
  new CountryPostType(0, '一般'),
  new CountryPostType(1, '君主'),
  new CountryPostType(2, '軍師'),
  new CountryPostType(3, '大将軍'),
  new CountryPostType(4, '騎兵将軍'),
  new CountryPostType(5, '弓将軍'),
  new CountryPostType(6, '護衛将軍'),
  new CountryPostType(7, '将軍'),
];

/**
 * 同盟状態
 */
export class CountryAllianceStatus {
  public constructor(public id: number,
                     public name: string) {}
}
export const COUNTRY_ALLIANCE_STATUSES: CountryAllianceStatus[] = [
  new CountryAllianceStatus(-1, '自国'),
  new CountryAllianceStatus(0, '同盟関係なし'),
  new CountryAllianceStatus(1, '同盟協議中'),       // 自分が打診している
  new CountryAllianceStatus(2, '同盟協議決裂'),
  new CountryAllianceStatus(3, '同盟中'),
  new CountryAllianceStatus(4, '破棄猶予中'),
  new CountryAllianceStatus(5, '破棄済'),
  new CountryAllianceStatus(6, '同盟修正協議中'),

  new CountryAllianceStatus(101, '同盟協議中'),     // 自分が打診されている
  new CountryAllianceStatus(106, '同盟修正協議中'),  // 自分が打診されている
];

/**
 * 戦争状態
 */
export class CountryWarStatus {
  public constructor(public id: number,
                     public name: string) {}
}
export const COUNTRY_WAR_STATUSES: CountryWarStatus[] = [
  new CountryWarStatus(0, '戦争関係なし'),
  new CountryWarStatus(1, '交戦中'),
  new CountryWarStatus(2, '停戦協議中'),
  new CountryWarStatus(3, '停戦'),
  new CountryWarStatus(4, '開戦前'),
];

/**
 * 攻略状態
 */
export class TownWarStatus {
  public constructor(public id: number,
                     public name: string) {}
}
export const TOWN_WAR_STATUSES: TownWarStatus[] = [
  new TownWarStatus(0, '戦争関係なし'),
  new TownWarStatus(1, '開戦前'),
  new TownWarStatus(2, '攻略中'),
  new TownWarStatus(3, '交戦終了'),
];

export class BuildingType {
  public constructor(public id: number,
                     public name: string) {}
}
/**
 * 都市施設
 */
export const TOWN_BUILDINGS: BuildingType[] = [
  new BuildingType(0, '都市施設なし'),
  new BuildingType(1, '堤防'),
  new BuildingType(2, '蝗害対策'),
  new BuildingType(3, '診療所'),
  new BuildingType(4, '建築詰所'),
  new BuildingType(5, '経済評論'),
  new BuildingType(6, '道場'),
  new BuildingType(7, '弁論の場'),
  new BuildingType(8, '兵舎'),
  new BuildingType(9, '憩いの泉'),
  new BuildingType(10, '城壁開放'),
];
/**
 * 国家施設
 */
export const COUNTRY_BUILDINGS: BuildingType[] = [
  new BuildingType(0, '国家施設なし'),
];
/**
 * 研究所
 */
export const COUNTRY_LABORATORIES: BuildingType[] = [
  new BuildingType(0, '研究所なし'),
];

import * as api from '@/api/api';
import Enumerable from 'linq';
import * as local from './localsettings';

export const HOST_ROOT = local.HOST_ROOT_LOCAL;

export const SERVER_SECRET_KEY = local.SERVER_SECRET_KEY;

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
export const NEXT_LANK = 1200;

/**
 * 国色の数
 */
export const COUNTRY_COLOR_NUM = 11;

/**
 * アイコン数
 */
export const DEFAULT_ICON_NUM = 98;

export const RICE_BUY_MAX = 20000;

export const PAY_SAFE_MAX = 100000;

/**
 * 兵種
 */
export class SoldierType {
  public isCustom: boolean = false;
  public customId: number = -1;

  public constructor(public id: number = 0,
                     public name: string = '',
                     public money: number = 0,
                     public technology: number = 0,
                     public attackPower?: string,
                     public defencePower?: string,
                     public description?: string) {}
}
export const SOLDIER_TYPES: SoldierType[] = [
  new SoldierType(1, '雑兵', 1, 0, '0', '0'),
  new SoldierType(2, '禁兵', 1, 0, '15', '15'),
  new SoldierType(500, '雑兵・禁兵', 1, 0, '0 / 10', '0 / 10', '最弱の兵士。首都で徴兵した場合は禁兵となり、攻撃力・防御力に補正を得る'),
  new SoldierType(3, '軽歩兵',  2, 100, '10', '0', '軽装備の歩兵'),
  new SoldierType(4, '弓兵',    3, 200,  '0', '15', '弓を持った兵士'),
  new SoldierType(5, '軽騎兵',  5, 300, '35', '10', '軽装備の騎兵'),
  new SoldierType(6, '強弩兵',  7, 400, '10', '35', '弩を持った兵士'),
  new SoldierType(7, '神鬼兵',  10, 500, '知力', '0', '攻撃力に知力が補正として加算される'),
  new SoldierType(8, '重歩兵',  12, 600, '50', '30', '重装備の歩兵'),
  new SoldierType(9, '重騎兵',  15, 700, '60', '40', '重装備の騎兵'),
  new SoldierType(10, '智攻兵', 17, 800, '知力x0.8', '知力x0.4', '攻撃力、防御力、ともに知力が補正として加算される'),
  new SoldierType(11, '連弩兵', 20, 900, '90', '30', '連弩を持った兵士'),
  new SoldierType(12, '壁守兵', 22, 999, '0', '知力', '堅く守ることに特化した兵士。防御力に知力が補正として加算される'),
  new SoldierType(14, '井闌', 30, 500, '0', '0', '対城壁・守兵・壁守兵の場合に限り、攻撃力に200のボーナスを得る'),
  new SoldierType(15, 'カスタム', 0, 0, '0', '0', 'カスタム兵種'),
  new SoldierType(17, '異民族兵A', 32767, 32767, '0', '0', ''),
  new SoldierType(18, '異民族兵B', 32767, 32767, '0', '0', ''),
  new SoldierType(19, '異民族兵C', 32767, 32767, '0', '0', ''),
  new SoldierType(100, '守兵A', 32767, 32767, '0', '0', ''),
  new SoldierType(101, '守兵B', 32767, 32767, '0', '0', ''),
  new SoldierType(102, '守兵C', 32767, 32767, '0', '0', ''),
  new SoldierType(103, '守兵D', 32767, 32767, '0', '0', ''),
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
      const isCustom = p.firstOrDefault((pp) => pp.type === 3);
      if (!soldierType || !soldierNumber || !isCustom) {
        return 'エラー (10:2)';
      }

      if (isCustom.numberValue === 0) {
        const type = Enumerable.from(SOLDIER_TYPES).firstOrDefault((st) => st.id === soldierType.numberValue);
        if (type && soldierNumber.numberValue !== undefined) {
          return format.replace('{0}', type.name).replace('{1}', soldierNumber.numberValue.toString());
        } else {
          return 'エラー (10:3)';
        }
      } else {
        if (soldierNumber.numberValue) {
          return format.replace('{0}', '%0%').replace('{1}', soldierNumber.numberValue.toString());
        } else {
          return 'エラー (10:4)';
        }
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
  new CommandNameResolver(34, '金 {0} を国庫納入', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const money = p.firstOrDefault((pp) => pp.type === 1);
      if (!money || !money.numberValue) {
        return 'エラー (34:2)';
      }
      return format.replace('{0}', money.numberValue.toString());
    } else {
      return 'エラー (34:1)';
    }
  }),
  new CommandNameResolver(35, '国庫から %読込中% へ金 {1} を搬出', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const money = p.firstOrDefault((pp) => pp.type === 2);
      if (!money || !money.numberValue) {
        return 'エラー (35:2)';
      }
      return format.replace('{1}', money.numberValue.toString());
    } else {
      return 'エラー (35:1)';
    }
  }),
  new CommandNameResolver(38, '兵種 %0% を研究'),
  new CommandNameResolver(39, '{1} 政務官を雇用', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const type = p.firstOrDefault((pp) => pp.type === 1);
      if (!type || !type.numberValue) {
        return 'エラー (39:2)';
      }
      return format.replace('{1}', type.numberValue === api.Character.aiSecretaryPatroller ? '仁官' :
                                   type.numberValue === api.Character.aiSecretaryUnitGather ? '集合官' :
                                   type.numberValue === api.Character.aiSecretaryPioneer ? '農商官' : '不明');
    } else {
      return 'エラー (39:1)';
    }
  }),
  new CommandNameResolver(40, '政務官 %読込中% を %部隊% へ配属'),
  new CommandNameResolver(41, '政務官 %読込中% を解任'),
  new CommandNameResolver(44, '政策開発'),
  new CommandNameResolver(45, '%0% へ斥候派遣'),
  new CommandNameResolver(46, '%0% の斥候を解雇'),
  new CommandNameResolver(47, '政務官 %読込中% を %0% へ配属'),
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
  new EventType(26, '焼討', '#2a4'),
  new EventType(27, '扇動', '#2a4'),
  new EventType(28, '雇用', '#800'),
  new EventType(29, '解任', '#800'),
  new EventType(30, '削除', 'black'),
  new EventType(31, '削除', 'black'),
  new EventType(32, '政策', '#2a4'),
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
  new CountryPostType(8, '君主（不在）'),
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
  public static get default(): BuildingType {
    return new BuildingType(0, '');
  }

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
  new BuildingType(10, '城門開放'),
  new BuildingType(11, '修復拠点'),
  new BuildingType(12, '屯所'),
  new BuildingType(13, '災害対策拠点'),
  new BuildingType(14, '太守府'),
  new BuildingType(15, '蛮族の家'),
];
/**
 * 国家施設
 */
export const COUNTRY_BUILDINGS: BuildingType[] = [
  new BuildingType(0, '国家施設なし'),
  new BuildingType(1, '国庫'),
  new BuildingType(2, '諜報府'),
  new BuildingType(3, '斡旋所'),
  new BuildingType(4, '兵種研究所'),
  new BuildingType(5, '政務庁'),
];
/**
 * 研究所
 */
export const COUNTRY_LABORATORIES: BuildingType[] = [
  new BuildingType(0, '研究所なし'),
];

/**
 * 政策
 */
export class CountryPolicyType {
  public constructor(public id: number = 0,
                     public point: number = 0,
                     public name: string = '',
                     public description: string = '') {}
}
export const COUNTRY_POLICY_TYPES: CountryPolicyType[] = [
  new CountryPolicyType(1, 4000, '貯蔵', '国庫が利用可能になる。国庫最高 +100万'),
  new CountryPolicyType(2, 4000, '密偵', '諜報府が利用可能になる。斥候 +2名'),
  new CountryPolicyType(3, 4000, '兵種開発', '兵種研究所が利用可能になる'),
  new CountryPolicyType(4, 4000, '人材開発', '政務庁が利用可能になる。政務官 +1名'),
  new CountryPolicyType(5, 2000, '経済評論', '蝗害、疫病の被害をなくし、豊作、市場の効果を上げる'),
  new CountryPolicyType(6, 4000, '災害対策', '洪水、地震の被害をなくす'),
  new CountryPolicyType(7, 4000, '賊の監視', '賊の被害を未然に防ぐ'),
];

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
export const UPLOADED_HISTORICAL_ICONS_HOST = HOST_ROOT + 'images/character-historical-uploaded-icons/';

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
export const COUNTRY_COLOR_NUM = 18;

/**
 * アイコン数
 */
export const DEFAULT_ICON_NUM = 98;

export const RICE_BUY_MAX = 10000;

export const PAY_SAFE_MAX = 100000;

/**
 * 兵種
 */
export class SoldierType {
  public isCustom: boolean = false;
  public customId: number = -1;

  public constructor(public id: number = 0,
                     public kind: number = 0,
                     public name: string = '',
                     public money: number = 0,
                     public technology: number = 0,
                     public attackPower?: string,
                     public defencePower?: string,
                     public description?: string,
                     public requestedPolicyType?: number,
                     public isNeedResource?: boolean,
                     public requestedItemType?: number) {}
}
export const SOLDIER_TYPES: SoldierType[] = [
  new SoldierType(1, 0, '剣兵', 1, 0, '0', '0'),
  new SoldierType(2, 0, '禁兵', 1, 0, '15', '15'),
  new SoldierType(500, 0, '剣兵・禁兵', 1, 0, '0 / 10', '0 / 10', '最弱の兵士。首都で徴兵した場合は禁兵となり、攻撃力・防御力に補正を得る'),
  new SoldierType(3, 0, '軽戟兵',  2, 100, '10', '0', '軽装備の戟兵'),
  new SoldierType(4, 0, '弓兵',    3, 200, '0', '10', '弓を持った兵士'),
  new SoldierType(5, 0, '軽騎兵',  5, 300, '30', '10', '軽装備の騎兵'),
  new SoldierType(6, 0, '強弩兵',  7, 400, '10', '30', '弩を持った兵士'),
  new SoldierType(7, 1, '神鬼兵',  10, 500, '武力', '0', '基礎能力として武力の代わりに知力を用いた兵種。武力が攻撃力に補正として加算される'),
  new SoldierType(8, 0, '重戟兵',  12, 600, '50', '30', '重装備の戟兵'),
  new SoldierType(9, 0, '重騎兵',  15, 700, '60', '40', '重装備の騎兵'),
  new SoldierType(10, 0, '智攻兵', 17, 32767, '知力x0.8', '知力x0.4', '攻撃力、防御力、ともに知力が補正として加算される'),
  new SoldierType(11, 0, '連弩兵', 20, 800, '90', '40', '連弩を持った兵士', undefined, true, 63),
  new SoldierType(26, 0, '青洲兵', 25, 900, '90', '70', '青洲出身の強力な兵士', undefined, true, 64),
  new SoldierType(27, 0, '象兵', 5, 999, '0', '0', '象に乗った兵士。突撃に秀でる', undefined, true, 67),
  new SoldierType(28, 0, '藤甲兵', 5, 999, '0', '140', '藤で作った強力な鎧を装備した兵士', undefined, true, 68),
  new SoldierType(12, 0, '壁守兵', 14, 999, '0', '知力', '堅く守ることに特化した兵士。防御力に知力が補正として加算される'),
  new SoldierType(14, 2, '井闌', 30, 500, '0 / 壁200', '0 / 壁100', '対城壁・壁守兵の場合に限り補正を得る'),
  new SoldierType(15, 0, 'カスタム', 0, 0, '0', '0', 'カスタム兵種'),
  new SoldierType(17, 0, '異民族兵A', 32767, 32767, '0', '0', ''),
  new SoldierType(18, 0, '異民族兵B', 32767, 32767, '0', '0', ''),
  new SoldierType(19, 0, '異民族兵C', 32767, 32767, '0', '0', ''),
  new SoldierType(20, 0, '賊兵A', 32767, 32767, '0', '0', ''),
  new SoldierType(21, 0, '賊兵B', 32767, 32767, '0', '0', ''),
  new SoldierType(22, 0, '賊兵C', 32767, 32767, '0', '0', ''),
  new SoldierType(23, 1, '文官雑兵', 2, 32767, '0', '0', '武力の代わりに知力が使用される雑兵'),
  new SoldierType(24, 1, '文官重騎兵', 18, 900, '60', '40', '基礎能力として武力の代わりに知力を用いた兵種。武官の重騎兵と同等の補正を持つ'),
  new SoldierType(25, 3, '義勇兵', 10, 200, '0', '0', '正義を振り翳せば従ってくれるちょろい愚民たち。基礎能力として人望を用いる', 30),
  new SoldierType(100, 0, '守兵A', 32767, 32767, '0', '0', ''),
  new SoldierType(101, 0, '守兵B', 32767, 32767, '0', '0', ''),
  new SoldierType(102, 0, '守兵C', 32767, 32767, '0', '0', ''),
  new SoldierType(103, 0, '守兵D', 32767, 32767, '0', '0', ''),
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
                                   type.numberValue === api.Character.aiSecretaryPioneer ? '農商官' :
                                   type.numberValue === api.Character.aiSecretaryUnitLeader ? '部隊長' : '不明');
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
  new CommandNameResolver(48, '陣形 {0} を獲得', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const formationType = p.firstOrDefault((pp) => pp.type === 1);
      if (!formationType) {
        return 'エラー (48:2)';
      }
      const type = Enumerable.from(FORMATION_TYPES).firstOrDefault((f) => f.id === formationType.numberValue);
      if (!type) {
        return 'エラー (48:3)';
      }
      return format.replace('{0}', type.name);
    } else {
      return 'エラー (48:1)';
    }
  }),
  new CommandNameResolver(49, '陣形を {0} に変更', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const formationType = p.firstOrDefault((pp) => pp.type === 1);
      if (!formationType) {
        return 'エラー (49:2)';
      }
      const type = Enumerable.from(FORMATION_TYPES).firstOrDefault((f) => f.id === formationType.numberValue);
      if (!type) {
        return 'エラー (49:3)';
      }
      return format.replace('{0}', type.name);
    } else {
      return 'エラー (49:1)';
    }
  }),
  new CommandNameResolver(50, '{0} を購入', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const itemType = p.firstOrDefault((pp) => pp.type === 1);
      if (!itemType) {
        return 'エラー (50:2)';
      }
      const type = Enumerable.from(CHARACTER_ITEM_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (50:3)';
      }
      return format.replace('{0}', type.name);
    } else {
      return 'エラー (50:1)';
    }
  }),
  new CommandNameResolver(51, '{0} を売却', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const itemType = p.firstOrDefault((pp) => pp.type === 1);
      if (!itemType) {
        return 'エラー (51:2)';
      }
      const type = Enumerable.from(CHARACTER_ITEM_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (51:3)';
      }
      return format.replace('{0}', type.name);
    } else {
      return 'エラー (51:1)';
    }
  }),
  new CommandNameResolver(52, '{0} を %読込中% に譲渡', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const itemType = p.firstOrDefault((pp) => pp.type === 1);
      if (!itemType) {
        return 'エラー (52:2)';
      }
      const type = Enumerable.from(CHARACTER_ITEM_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (52:3)';
      }
      return format.replace('{0}', type.name);
    } else {
      return 'エラー (52:1)';
    }
  }),
  new CommandNameResolver(53, '陣形研究'),
  new CommandNameResolver(54, '都市巡回'),
  new CommandNameResolver(55, '都市投資'),
  new CommandNameResolver(56, '{0} を使用', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const itemType = p.firstOrDefault((pp) => pp.type === 1);
      if (!itemType) {
        return 'エラー (56:2)';
      }
      const type = Enumerable.from(CHARACTER_ITEM_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (56:3)';
      }
      return format.replace('{0}', type.name);
    } else {
      return 'エラー (56:1)';
    }
  }),
  new CommandNameResolver(57, '{0} を生産', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const itemType = p.firstOrDefault((pp) => pp.type === 1);
      if (!itemType) {
        return 'エラー (57:2)';
      }
      const type = Enumerable.from(CHARACTER_ITEM_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (57:3)';
      }
      return format.replace('{0}', type.name);
    } else {
      return 'エラー (57:1)';
    }
  }),
  new CommandNameResolver(58, '農民呼寄'),
  new CommandNameResolver(59, '農民避難'),
  new CommandNameResolver(60, '合同訓練'),
  new CommandNameResolver(61, '偵察'),
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
  new EventType(19, '派遣', '#9400D3'),
  new EventType(20, '帰還', '#9400D3'),
  new EventType(21, '帰順', '#008'),
  new EventType(22, '仕官', '#008'),
  new EventType(23, '異民族', '#088'),
  new EventType(24, '農民反乱', '#088'),
  new EventType(25, '攻略', '#080'),
  new EventType(26, '焼討', '#2a4'),
  new EventType(27, '扇動', '#2a4'),
  new EventType(28, '雇用', '#800'),
  new EventType(29, '解任', '#800'),
  new EventType(30, '解雇', '#800'),
  new EventType(31, '削除', 'black'),
  new EventType(32, '政策', '#2a4'),
  new EventType(33, '蛮族', '#088'),
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
  new BuildingType(16, '宮殿'),
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
                     public description: string = '',
                     public subjectAppear?: (exists: api.CountryPolicy[]) => boolean,
                     public canGet: boolean = true) {}
}
export const COUNTRY_POLICY_TYPES: CountryPolicyType[] = [
  new CountryPolicyType(20, 2000, '郡県制', '大都市につき政策ポイント +5'),
  new CountryPolicyType(17, 3000, '農業国家', '農業都市につき政策ポイント +3。首都の下敷きが農業都市の場合追加 +3',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 20)),
  new CountryPolicyType(18, 3000, '商業国家', '商業都市につき政策ポイント +3。首都の下敷きが商業都市の場合追加 +3',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 20)),
  new CountryPolicyType(19, 3000, '城塞国家', '城塞都市につき政策ポイント +3。首都の下敷きが城塞都市の場合追加 +3',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 20)),

  new CountryPolicyType(5, 4000, '経済論', '蝗害、疫病の被害を軽減し、豊作、市場の効果を上げる'),
  new CountryPolicyType(1, 4000, '貯蔵', '国庫が利用可能になる。国庫最高 +100万',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 5)),
  new CountryPolicyType(25, 3000, '徴収', '国庫納入する収入余剰最大 +2000',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 1)),
  new CountryPolicyType(27, 2000, '増給', '武将収入の階級加算 +50',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 25)),
  new CountryPolicyType(10, 2000, '地下貯蔵', '地下に財産を貯蔵する。国庫最高 +100万',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 27)),
  new CountryPolicyType(26, 4000, '壁に耳', '国庫納入する収入余剰の最大 x2',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 10)),
  new CountryPolicyType(11, 2000, '胃の中', '人間の胃の中に袋に入った粉状の財産を貯蔵する。国庫最高 +100万',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 26)),
  new CountryPolicyType(36, 4000, '障子に目', '国庫納入する収入余剰の最大 x2',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 11)),
  new CountryPolicyType(12, 3000, '血管の中', '人間の血管の中に細かく砕いた財産を貯蔵する。国庫最高 +100万',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 36)),
  new CountryPolicyType(6, 3000, '災害対策', '洪水、地震の被害を軽減する',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 5)),
  new CountryPolicyType(28, 2000, '復興支援', '洪水、地震発生時、民忠 +10、都市につき政策ポイント +30',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 6)),

  new CountryPolicyType(4, 3000, '人材開発', '政務庁が利用可能になる。政務官 +1名'),
  new CountryPolicyType(14, 1500, '武官国家', '武官数につき毎ターン政策ポイント +2',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 4)),
  new CountryPolicyType(15, 2000, '文官国家', '文官数につき毎ターン政策ポイント +4',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 14)),
  new CountryPolicyType(33, 3000, '号令', '政務官部隊長が雇用可能',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 15)),
  new CountryPolicyType(16, 2000, '人情国家', '仁官数につき毎ターン政策ポイント +8',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 33)),
  new CountryPolicyType(24, 3000, '施設連携', '強化系都市施設効果 +7',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 16)),
  new CountryPolicyType(34, 2000, '採用策', '政務官 +1',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 24)),
  new CountryPolicyType(35, 2000, '武官の肇', '取得から 144 ターン武力と知力の高い方を内政に使用。文官国家をブースト',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 14)),
  new CountryPolicyType(2, 4000, '密偵', '諜報府が利用可能になる。斥候 +2名'),

  new CountryPolicyType(7, 3000, '賊の監視', '賊の被害を未然に防ぐ'),
  new CountryPolicyType(13, 2000, '賊の殲滅', '賊発生時、都市につき政策ポイント +30',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 7)),
  new CountryPolicyType(29, 2000, '正義とは', '義賊の効果増大',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 13)),
  new CountryPolicyType(31, 4000, '攻城', '井闌1小隊あたり徴兵コスト -50',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 29)),
  new CountryPolicyType(30, 3000, '檄', '義勇兵が徴兵可能',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 31)),
  new CountryPolicyType(32, 4000, '衝車常備', '戦闘時、攻城属性を除き、常に城壁攻撃力 +60',
    (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 30)),

  new CountryPolicyType(37, 0, '胡人徴発', '重騎兵の徴兵コスト /2', undefined, false),
];

/**
 * 陣形
 */
export class FormationType {
  public constructor(public id: number = 0,
                     public point: number = 0,
                     public name: string = '',
                     public descriptions: string[] = [],
                     public subjectAppear?: (exists: api.Formation[]) => boolean,
                     public canGet: boolean = true,
                     public nextLevel: number[] = []) {}
}
export const FORMATION_TYPES: FormationType[] = [
  new FormationType(0, 0, '通常', ['効果なし',
                                  '攻撃力 +4',
                                  '攻撃力 +8',
                                  '攻撃力 +16',
                                  '攻撃力 +32'],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(1, 500, '魚鱗', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(2, 500, '蜂矢', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(3, 500, '錐行', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(4, 500, '鶴翼', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(5, 500, '方円', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(6, 500, '衡軛', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(7, 500, '偃月', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(8, 500, '雁行', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(9, 500, '長蛇', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
  new FormationType(10,500, '攻城', ['',
                                    '',
                                    '',
                                    '',
                                    ''],
                        undefined, false, [1000, 2000, 5000, 8000]),
];

/**
 * アイテム
 */
export class CharacterItemType {
  public constructor(public id: number = 0,
                     public money: number = 0,
                     public name: string = '',
                     public description: string = '',
                     public canSell: boolean = true,
                     public canHandOver: boolean = true,
                     public canUse: boolean = false,
                     public isResource: boolean = false,
                     public defaultResource: number = 0) {}
}
export const CHARACTER_ITEM_TYPES: CharacterItemType[] = [
  new CharacterItemType(1, 5000, '槍', '武力 +1'),
  new CharacterItemType(2, 5000, '戟', '武力 +1'),
  new CharacterItemType(3, 5000, '弓', '武力 +1'),
  new CharacterItemType(4, 5000, '大金槌', '武力 +1'),
  new CharacterItemType(5, 15000, '三尖両刃刀', '武力 +3'),
  new CharacterItemType(6, 15000, '鎖鉄球', '武力 +3'),
  new CharacterItemType(7, 15000, '麒麟牙', '武力 +3'),
  new CharacterItemType(8, 15000, '流星槌', '武力 +3'),
  new CharacterItemType(9, 15000, '金蛇剣', '武力 +3'),
  new CharacterItemType(10, 28000, '飛燕', '武力 +5'),
  new CharacterItemType(11, 28000, '古錠刀', '武力 +5'),
  new CharacterItemType(12, 28000, '柳葉刀', '武力 +5'),
  new CharacterItemType(13, 28000, '鳳嘴刀', '武力 +5'),
  new CharacterItemType(14, 55000, '蚩尤砕', '武力 +10'),
  new CharacterItemType(15, 55000, '玄鉄剣', '武力 +10'),
  new CharacterItemType(16, 55000, '碧銘剣', '武力 +10'),
  new CharacterItemType(17, 55000, '青紅の剣', '武力 +10'),
  new CharacterItemType(18, 55000, '倚天剣', '武力 +10'),
  new CharacterItemType(19, 78000, '雌雄一対の剣', '武力 +15', false),
  new CharacterItemType(20, 78000, '竜胆', '武力 +15', false),
  new CharacterItemType(21, 78000, '青龍堰月刀', '武力 +15', false),
  new CharacterItemType(22, 105000, '方天画戟', '武力 +20', false),
  new CharacterItemType(23, 105000, '神龍の剣', '武力 +20', false),
  new CharacterItemType(24, 5000, '平蛮指掌図', '知力 +1'),
  new CharacterItemType(25, 5000, '太平妖術の書', '知力 +1'),
  new CharacterItemType(26, 15000, '墨子', '知力 +3'),
  new CharacterItemType(27, 15000, '六韜', '知力 +3'),
  new CharacterItemType(28, 28000, '西蜀地形図', '知力 +5'),
  new CharacterItemType(29, 28000, '遁甲天書', '知力 +5'),
  new CharacterItemType(30, 28000, '孫子の兵法書', '知力 +5'),
  new CharacterItemType(31, 55000, '青嚢書', '知力 +10'),
  new CharacterItemType(32, 55000, '孟徳新書', '知力 +10'),
  new CharacterItemType(33, 78000, '兵法二十四編', '知力 +15'),
  new CharacterItemType(34, 105000, '信仰新書', '知力 +20'),
  new CharacterItemType(35, 28000, '十六国春秋', '知力 +5'),
  new CharacterItemType(36, 28000, '春秋左氏伝', '知力 +5'),
  new CharacterItemType(37, 55000, '呂氏春秋', '知力 +10'),
  new CharacterItemType(38, 55000, '呉越春秋', '知力 +10'),
  new CharacterItemType(39, 78000, '戦国策', '知力 +15', false),
  new CharacterItemType(40, 78000, '史記', '知力 +15', false),
  new CharacterItemType(41, 105000, '三国志', '知力 +20', false),
  new CharacterItemType(42, 36000, '傷寒論', '人望 +10'),
  new CharacterItemType(43, 55000, '易経', '統率 +10'),
  new CharacterItemType(44, 55000, '書経', '統率 +10'),
  new CharacterItemType(45, 55000, '詩経', '統率 +10'),
  new CharacterItemType(46, 55000, '楽経', '統率 +10'),
  new CharacterItemType(47, 55000, '礼記', '統率 +10'),
  new CharacterItemType(48, 10000, '茶', '使用で金 +100k', false, true, true),
  new CharacterItemType(49, 10000, '青釉穀倉罐', '使用で金 +100k', false, true, true),
  new CharacterItemType(50, 10000, '酒杯', '使用で金 +100k', false, true, true),
  new CharacterItemType(51, 20000, '算盤', '使用で金 +200k', false, true, true),
  new CharacterItemType(52, 20000, '呂氏鏡', '使用で金 +200k', false, true, true),
  new CharacterItemType(53, 30000, '博山炉', '使用で金 +300k', false, true, true),
  new CharacterItemType(54, 30000, '金象嵌の壺', '使用で金 +300k', false, true, true),
  new CharacterItemType(55, 30000, '玉龍紋璧', '使用で金 +300k', false, true, true),
  new CharacterItemType(56, 50000, '九錫', '使用で金 +500k', false, true, true),
  new CharacterItemType(57, 200000, '和氏の璧', '使用で金 +2M', false, true, true),
  new CharacterItemType(58, 5000000, '中行説の霊', '使用で全ての中立異民族が敵対化。異民族なければ出現', false, false, true),
  new CharacterItemType(59, 18, '装備戟', '（資源）重戟兵徴兵費 -30%', true, true, false, true, 1000),
  new CharacterItemType(60, 18, '装備馬', '（資源）重騎兵徴兵費 -30%', true, true, false, true, 1000),
  new CharacterItemType(61, 100000, '四民月令', '統率 +20', false),
  new CharacterItemType(62, 100000, '論語', '人望 +20', false),
  new CharacterItemType(63, 20, '装備連弩', '（資源）連弩兵徴兵可能', true, true, false, true, 1000),
  new CharacterItemType(64, 24, '青洲槍', '（資源）青洲兵徴兵可能', true, true, false, true, 1000),
  new CharacterItemType(65, 22, '装備良戟', '（資源）重戟兵徴兵費 -60%', true, true, false, true, 1000),
  new CharacterItemType(66, 22, '装備良馬', '（資源）重騎兵徴兵費 -60%', true, true, false, true, 1000),
  new CharacterItemType(67, 22, '象', '（資源）象兵徴兵可能', true, true, false, true, 1000),
  new CharacterItemType(68, 26, '藤甲', '（資源）藤甲兵徴兵可能', true, true, false, true, 1000),
  new CharacterItemType(69, 8, '練兵', '（資源）徴兵時訓練値下限 60', true, true, false, true, 1000),
  new CharacterItemType(70, 11, '精鋭兵', '（資源）徴兵時訓練値下限 100', true, true, false, true, 1000),
];

/**
 * 技能
 */
export class CharacterSkillType {
  public constructor(public id: number = 0,
                     public name: string = '',
                     public description: string = '',
                     public point: number = 0,
                     public subjectAppear?: (exists: api.CharacterSkill[]) => boolean) {}
}
export const CHARACTER_SKILL_TYPES: CharacterSkillType[] = [
  new CharacterSkillType(1, '武家 Lv.1', '毎月武力Ex +7', 0, (_) => false),
  new CharacterSkillType(2, '武家 Lv.2', '攻撃力 +20', 10, (skills) => skills.some((s) => s.type === 1)),
  new CharacterSkillType(3, '武家 Lv.3', '徴兵に必要な金 -15%', 10, (skills) => skills.some((s) => s.type === 2)),
  new CharacterSkillType(4, '武家 Lv.4', '攻撃力 +20、突撃確率 +2%、突撃威力 +80', 10, (skills) => skills.some((s) => s.type === 3)),
  new CharacterSkillType(5, '武家 Lv.5', 'コマンド 都市巡回、戦闘が 1 ターンで終了時の連戦確率 +80%', 10, (skills) => skills.some((s) => s.type === 4)),
  new CharacterSkillType(6, '官吏 Lv.1', '毎月知力Ex +7', 0, (_) => false),
  new CharacterSkillType(7, '官吏 Lv.2', '内政効果 +40%', 10, (skills) => skills.some((s) => s.type === 6)),
  new CharacterSkillType(8, '官吏 Lv.3', '内政効果 +40%', 10, (skills) => skills.some((s) => s.type === 7)),
  new CharacterSkillType(9, '官吏 Lv.4', '護衛属性含む兵種使用時、攻撃力 +20、防御力 +40', 10, (skills) => skills.some((s) => s.type === 8)),
  new CharacterSkillType(10, '官吏 Lv.5', '政策開発時、未取得政策ブースト確率 +5%。コマンド 都市巡回', 10, (skills) => skills.some((s) => s.type === 9)),
  new CharacterSkillType(11, '商人 Lv.1', 'アイテム上限 +2', 0, (_) => false),
  new CharacterSkillType(12, '商人 Lv.2', '米売買上限 +5000、貢献 +15', 11, (skills) => skills.some((s) => s.type === 11)),
  new CharacterSkillType(13, '商人 Lv.3', 'アイテム購入価格 -20%、内政時出現 +0.4%、アイテム上限 +2', 10, (skills) => skills.some((s) => s.type === 12)),
  new CharacterSkillType(14, '商人 Lv.4', 'コマンド 都市投資', 10, (skills) => skills.some((s) => s.type === 13)),
  new CharacterSkillType(15, '商人 Lv.5', '米売買上限 +3000', 9, (skills) => skills.some((s) => s.type === 14)),
  new CharacterSkillType(16, '技師 Lv.1', '攻撃力 +30', 0, (_) => false),
  new CharacterSkillType(17, '技師 Lv.2', 'コマンド 資源生産、装備良戟・装備良馬生産可能', 8, (skills) => skills.some((s) => s.type === 16)),
  new CharacterSkillType(18, '技師 Lv.3', '装備連弩生産可能', 9, (skills) => skills.some((s) => s.type === 17)),
  new CharacterSkillType(19, '技師 Lv.4', 'アイテム上限 +3', 11, (skills) => skills.some((s) => s.type === 18)),
  new CharacterSkillType(20, '技師 Lv.5', '青洲槍生産可能', 12, (skills) => skills.some((s) => s.type === 19)),
  new CharacterSkillType(21, '胡人 Lv.1', '毎月武力Ex +7', 0, (_) => false),
  new CharacterSkillType(22, '胡人 Lv.2', '騎兵属性使用時に限り攻撃力 +30', 6, (skills) => skills.some((s) => s.type === 21)),
  new CharacterSkillType(23, '胡人 Lv.3', '異民族と戦闘時に限り攻撃力 +100', 9, (skills) => skills.some((s) => s.type === 22)),
  new CharacterSkillType(24, '胡人 Lv.4', 'コマンド 農民避難、農民呼寄', 12, (skills) => skills.some((s) => s.type === 23)),
  new CharacterSkillType(25, '胡人 Lv.5', 'コマンド 胡人交易、象・藤甲生産可能', 8, (skills) => skills.some((s) => s.type === 24)),
  new CharacterSkillType(26, '農民 Lv.1', '政策によらず義勇兵雇用可能', 0, (_) => false),
  new CharacterSkillType(27, '農民 Lv.2', 'コマンド 精鋭検査、練兵生産可能', 8, (skills) => skills.some((s) => s.type === 26)),
  new CharacterSkillType(28, '農民 Lv.3', '米施し効果 +80%', 8, (skills) => skills.some((s) => s.type === 27)),
  new CharacterSkillType(29, '農民 Lv.4', 'コマンド 農民避難、農民呼寄', 7, (skills) => skills.some((s) => s.type === 28)),
  new CharacterSkillType(30, '農民 Lv.5', '精鋭兵生産可能', 12, (skills) => skills.some((s) => s.type === 29)),
];

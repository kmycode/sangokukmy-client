// tslint:disable:max-line-length

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
export const UPDATE_START_YEAR = 12;

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
                     public attribute: number = 0,
                     public name: string = '',
                     public money: number = 0,
                     public technology: number = 0,
                     public attackPower?: string,
                     public defencePower?: string,
                     public description?: string,
                     public requestedPolicyType?: number,
                     public isNeedResource?: boolean,
                     public requestedItemType?: number,
                     public requestedSkillType?: number | number[],
                     public requestedTownType?: number | number[],
                     public requestedSubBuildingType?: number | number[]) {}
}
export const SOLDIER_TYPES: SoldierType[] = [
  new SoldierType(1, 0, 4, '剣兵', 1, 0, '0', '0'),
  new SoldierType(2, 0, 4, '禁兵', 1, 0, '10', '10'),
  new SoldierType(500, 0, 4, '剣兵・禁兵', 1, 0, '0 / 10', '0 / 10', '最弱の兵士。首都で徴兵した場合は禁兵となり、わずかな補正を得る'),
  new SoldierType(3, 0, 4, '軽戟兵', 6, 200, '30', '30', '低級兵種。騎に強く弩に弱い'),
  new SoldierType(33, 0, 4, '戟兵', 12, 500, '60', '60', '中級兵種。騎に強く弩に弱い'),
  new SoldierType(8, 0, 4, '重戟兵', 18, 800, '90', '90', '高級兵種。騎に強く弩に弱い'),
  new SoldierType(26, 0, 4, '青洲兵', 35, 1200, '120', '120', '最高級兵種。騎に強く弩に弱い', undefined, true, 64),
  new SoldierType(30, 0, 5, '軽騎兵', 6, 200, '30', '30', '低級兵種。弩に強く戟に弱い'),
  new SoldierType(5, 0, 5, '騎兵', 12, 500, '60', '60', '中級兵種。弩に強く戟に弱い'),
  new SoldierType(9, 0, 5, '重騎兵', 18, 800, '90', '90', '高級兵種。弩に強く戟に弱い'),
  new SoldierType(38, 0, 5, '戦車兵', 35, 1200, '120', '120', '最高級兵種。弩に強く戟に弱い', undefined, true, 77),
  new SoldierType(4, 0, 6, '弓兵', 6, 200, '30', '30', '低級兵種。戟に強く騎に弱い'),
  new SoldierType(45, 0, 6, '弩兵', 12, 500, '60', '60', '中級兵種。戟に強く騎に弱い'),
  new SoldierType(6, 0, 6, '強弩兵', 18, 800, '90', '90', '高級兵種。戟に強く騎に弱い'),
  new SoldierType(11, 0, 6, '連弩兵', 35, 1200, '120', '120', '最高級兵種。戟に強く騎に弱い', undefined, true, 63),
  new SoldierType(13, 0, 2, '衝車', 16, 500, '0', '0', '対城壁に特化'),
  new SoldierType(14, 0, 2, '井闌', 26, 600, '0', '0', '対城壁に特化。衝車より強い'),
  new SoldierType(35, 0, 2, '投石器', 40, 600, '0', '0', '対城壁に特化。井闌より強い'),
  new SoldierType(32, 0, 2, '祈祷兵', 20, 800, '0', '0', '低級兵種。陣形の相性により大きな攻撃力を得る'),
  new SoldierType(34, 0, 4, '槍兵', 12, 500, '30', '30', '低級兵種'),
  new SoldierType(31, 0, 4, '投石兵', 10, 600, '50', '50', '中級兵種'),
  new SoldierType(36, 0, 5, '槍騎兵', 10, 600, '50', '50', '中級兵種。弩に強く戟に弱い'),
  new SoldierType(37, 0, 6, '弓騎兵', 10, 600, '50', '50', '中級兵種。戟に強く騎に弱い'),
  new SoldierType(27, 0, 5, '象兵', 22, 800, '0', '0', '突撃に大きな補正', undefined, true, 67),
  new SoldierType(28, 0, 4, '藤甲兵', 22, 800, '0', '180', '高い防御力を持つ', undefined, true, 68),
  new SoldierType(23, 1, 4, '梓叡兵', 6, 300, '0', '0', '文官向けの最弱の兵種'),
  new SoldierType(7, 1, 4, '梓歩兵',  16, 600, '60', '60', '文官向けの兵種。騎に強く弩に弱い'),
  new SoldierType(24, 1, 5, '梓馬兵', 16, 600, '60', '60', '文官向けの兵種。弩に強く戟に弱い'),
  new SoldierType(42, 1, 6, '梓弓兵', 16, 600, '60', '60', '文官向けの兵種。戟に強く騎に弱い'),
  new SoldierType(29, 1, 2, '梓琴兵', 23, 600, '0', '0', '文官向けの兵種', undefined, undefined, undefined, 50),
  new SoldierType(43, 1, 6, '梓弩兵', 33, 1300, '70', '70', '文官向けの兵種。戟に強く騎に弱い', undefined, undefined, undefined, 50),
  new SoldierType(44, 1, 4, '工作兵', 20, 1000, '0', '0', '文官向けの兵種'),
  new SoldierType(12, 1, 7, '壁守兵', 20, 1000, '0', '110', '文官向けの兵種。高い防御力を持つ'),
  new SoldierType(25, 3, 4, '義勇兵', 8, 300, '0', '0', '仁官向けの最弱の兵種', 30),
  new SoldierType(39, 3, 4, '義戈兵', 12, 400, '30', '10', '仁官向けの兵種。連戦に補正', undefined, undefined, undefined, 51),
  new SoldierType(40, 3, 5, '義殲兵', 12, 300, '60', '-20', '仁官向けの兵種。防御を犠牲に、少しの突撃補正', undefined, undefined, undefined, 52),
  new SoldierType(41, 3, 2, '投擲器', 36, 700, '80', '-40', '仁官向けの兵種。防御を犠牲に、城壁攻撃に特化', undefined, undefined, undefined, 53),

  new SoldierType(15, 0, 0, 'カスタム', 0, 0, '0', '0', 'カスタム兵種'),
  new SoldierType(17, 0, 0, '異民族兵A', 32767, 32767, '0', '0', ''),
  new SoldierType(18, 0, 0, '異民族兵B', 32767, 32767, '0', '0', ''),
  new SoldierType(19, 0, 0, '異民族兵C', 32767, 32767, '0', '0', ''),
  new SoldierType(20, 0, 0, '賊兵A', 32767, 32767, '0', '0', ''),
  new SoldierType(21, 0, 0, '賊兵B', 32767, 32767, '0', '0', ''),
  new SoldierType(22, 0, 0, '賊兵C', 32767, 32767, '0', '0', ''),
  new SoldierType(100, 0, 0, '守兵A', 32767, 32767, '0', '0', ''),
  new SoldierType(101, 0, 0, '守兵B', 32767, 32767, '0', '0', ''),
  new SoldierType(102, 0, 0, '守兵C', 32767, 32767, '0', '0', ''),
  new SoldierType(103, 0, 0, '守兵D', 32767, 32767, '0', '0', ''),
  new SoldierType(104, 0, 0, '守兵E', 32767, 32767, '0', '0', ''),
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
  'なし',
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
                                   type.numberValue === api.Character.aiSecretaryUnitLeader ? '部隊長' :
                                   type.numberValue === api.Character.aiSecretaryScouter ? '斥候' : '不明');
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
      const resourceSize = p.firstOrDefault((pp) => pp.type === 4);
      if (!itemType) {
        return 'エラー (50:2)';
      }
      const type = Enumerable.from(CHARACTER_ITEM_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (50:3)';
      }
      if (type.isResource && !resourceSize) {
        return 'エラー (50:4)';
      }
      if (!type.isResource) {
        return format.replace('{0}', type.name);
      } else {
        return format.replace('{0}', type.name + ' ' + resourceSize.numberValue);
      }
    } else {
      return 'エラー (50:1)';
    }
  }),
  new CommandNameResolver(51, '{0} を売却', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const itemType = p.firstOrDefault((pp) => pp.type === 1);
      const resourceSize = p.firstOrDefault((pp) => pp.type === 3);
      if (!itemType) {
        return 'エラー (51:2)';
      }
      const type = Enumerable.from(CHARACTER_ITEM_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (51:3)';
      }
      if (type.isResource && !resourceSize) {
        return 'エラー (51:4)';
      }
      if (!type.isResource) {
        return format.replace('{0}', type.name);
      } else {
        return format.replace('{0}', type.name + ' ' + resourceSize.numberValue);
      }
    } else {
      return 'エラー (51:1)';
    }
  }),
  new CommandNameResolver(52, '{0} を %読込中% に譲渡', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const itemType = p.firstOrDefault((pp) => pp.type === 1);
      const resourceSize = p.firstOrDefault((pp) => pp.type === 4);
      if (!itemType) {
        return 'エラー (52:2)';
      }
      const type = Enumerable.from(CHARACTER_ITEM_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (52:3)';
      }
      if (!type.isResource) {
        return format.replace('{0}', type.name);
      } else if (resourceSize) {
        return format.replace('{0}', type.name + ' ' + resourceSize.numberValue);
      } else {
        return 'エラー (52:4)';
      }
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
  new CommandNameResolver(61, '%0% を偵察'),
  new CommandNameResolver(62, '探索'),
  new CommandNameResolver(63, '{0} を建設', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const itemType = p.firstOrDefault((pp) => pp.type === 1);
      if (!itemType) {
        return 'エラー (63:2)';
      }
      const type = Enumerable.from(TOWN_SUB_BUILDING_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (63:3)';
      }
      return format.replace('{0}', type.name);
    } else {
      return 'エラー (63:1)';
    }
  }),
  new CommandNameResolver(64, '{0} を撤去', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const itemType = p.firstOrDefault((pp) => pp.type === 1);
      if (!itemType) {
        return 'エラー (64:2)';
      }
      const type = Enumerable.from(TOWN_SUB_BUILDING_TYPES).firstOrDefault((f) => f.id === itemType.numberValue);
      if (!type) {
        return 'エラー (64:3)';
      }
      return format.replace('{0}', type.name);
    } else {
      return 'エラー (64:1)';
    }
  }),
  new CommandNameResolver(65, '静養'),
  new CommandNameResolver(66, '別動隊を雇用'),
  new CommandNameResolver(67, '[%読込中%] {1}{2} %0%', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const action = p.firstOrDefault((pp) => pp.type === 2);
      if (!action) {
        return 'エラー (67:2)';
      }
      const actionName = action.numberValue === 0 ? ' なし' :
        action.numberValue === 1 ? ' 内政' :
        action.numberValue === 2 ? ' 守備' :
        action.numberValue === 3 ? ' 攻撃' :
        action.numberValue === 4 ? ' 遊撃' : '';
      const soldierType = p.firstOrDefault((pp) => pp.type === 3);
      let soldierTypeName = '';
      if (soldierType) {
        soldierTypeName = soldierType.numberValue === 0 ? ' 標準' :
          soldierType.numberValue === 1 ? ' 戟兵' :
          soldierType.numberValue === 2 ? ' 騎兵' :
          soldierType.numberValue === 3 ? ' 弩兵' : '';
      }
      return format.replace('{1}', actionName).replace('{2}', soldierTypeName);
    } else {
      return 'エラー (67:1)';
    }
  }),
  new CommandNameResolver(68, '別動隊 %読込中% を削除'),
  new CommandNameResolver(69, '下野'),
  new CommandNameResolver(70, '{0} を現在都市の {1} に建設', (format, params) => {
    if (params) {
      const p = Enumerable.from(params);
      const directionOptional = p.firstOrDefault((pp) => pp.type === 1);
      const townTypeOptional = p.firstOrDefault((pp) => pp.type === 2);
      if (!directionOptional) {
        return 'エラー (70:2)';
      }
      const direction = directionOptional.numberValue;
      if (!direction) {
        return 'エラー (70:3)';
      }
      if (!townTypeOptional) {
        return 'エラー (70:4)';
      }
      const townType = townTypeOptional.numberValue;
      if (!townType) {
        return 'エラー (70:5)';
      }
      const dirs = ['', '左上', '上', '右上', '左', '右', '左下', '下', '右下'];

      return format.replace('{0}', TOWN_TYPES[townType]).replace('{1}', dirs[direction]);
    } else {
      return 'エラー (70:1)';
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
  new EventType(28, '雇用', '#9400D3'),
  new EventType(29, '解任', '#9400D3'),
  new EventType(30, '解雇', '#9400D3'),
  new EventType(31, '削除', 'black'),
  new EventType(32, '政策', '#2a4'),
  new EventType(33, '蛮族', '#088'),
  new EventType(34, '停戦', 'purple'),
  new EventType(35, '割譲', 'blue'),
  new EventType(36, '降伏', 'red'),
  new EventType(37, '玉璽', 'darkorange'),
  new EventType(38, '解雇', 'purple'),
  new EventType(39, '下野', 'purple'),
  new EventType(40, '都市建設', 'green'),
  new EventType(41, '購入', 'blue'),
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
  new CountryPostType(9, '建築官'),
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
  new CountryWarStatus(0, '戦争関係なし'),        // 配列内インデクス固定
  new CountryWarStatus(999, 'バトルロワイヤル'),  // 配列内インデクス固定
  new CountryWarStatus(1, '交戦中'),
  new CountryWarStatus(2, '停戦請願中'),
  new CountryWarStatus(102, '停戦協議中'),
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
  new BuildingType(17, '住宅'),
  new BuildingType(18, '鋳金所'),
  new BuildingType(19, '訓練施設'),
  new BuildingType(20, '陣'),
  new BuildingType(21, '増築拠点'),
  new BuildingType(22, '数寄屋'),
  new BuildingType(23, '小学'),
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
                     public category: number = 0,
                     public subjectAppear?: (exists: api.CountryPolicy[]) => boolean,
                     public specialGetSubject: string = '',
                     public canGet: boolean = true,
                     public availableDuring: number = 0) {}
}
export const COUNTRY_POLICY_TYPES: CountryPolicyType[] = [
  new CountryPolicyType(20, 2000, '郡県制', '大都市につき政策ポイント +5', 0),
  new CountryPolicyType(17, 3000, '農業国家', '農業都市につき政策ポイント +3。首都の下敷きが農業都市の場合追加 +3',
    0, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 20)),
  new CountryPolicyType(18, 3000, '商業国家', '商業都市につき政策ポイント +3。首都の下敷きが商業都市の場合追加 +3',
    0, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 20)),
  new CountryPolicyType(19, 3000, '城塞国家', '城塞都市につき政策ポイント +3。首都の下敷きが城塞都市の場合追加 +3',
    0, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 20)),

  new CountryPolicyType(5, 4000, '経済論', '蝗害、疫病の被害を軽減し、豊作、市場の効果を上げる', 1),
  new CountryPolicyType(1, 4000, '貯蔵', '国庫が利用可能になる。国庫最高 +100万',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 5)),
  new CountryPolicyType(25, 3000, '徴収', '国庫納入する収入余剰最大 +2000',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 1)),
  new CountryPolicyType(27, 2000, '増給', '武将収入の階級加算 +50',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 25)),
  new CountryPolicyType(10, 2000, '地下貯蔵', '地下に財産を貯蔵する。国庫最高 +100万',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 27)),
  new CountryPolicyType(26, 4000, '壁に耳', '国庫納入する収入余剰の最大 x2',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 10)),
  new CountryPolicyType(11, 2000, '胃の中', '人間の胃の中に袋に入った粉状の財産を貯蔵する。国庫最高 +100万',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 26)),
  new CountryPolicyType(36, 4000, '障子に目', '国庫納入する収入余剰の最大 x2',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 11)),
  new CountryPolicyType(12, 3000, '血管の中', '人間の血管の中に細かく砕いた財産を貯蔵する。国庫最高 +100万',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 36)),
  new CountryPolicyType(6, 3000, '災害対策', '洪水、地震の被害を軽減する',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 5)),
  new CountryPolicyType(28, 2000, '復興支援', '洪水、地震発生時、民忠 +10、都市につき政策ポイント +30',
    1, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 6)),

  new CountryPolicyType(4, 3000, '人材開発', '政務官ポイント +2', 2),
  new CountryPolicyType(14, 1500, '武官国家', '武官数につき毎ターン政策ポイント +2',
    2, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 4)),
  new CountryPolicyType(15, 2000, '文官国家', '文官数につき毎ターン政策ポイント +4',
    2, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 14)),
  new CountryPolicyType(2, 3000, '密偵', '政務官斥候が雇用可能、政務官ポイント +1',
    2, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 15)),
  new CountryPolicyType(33, 3000, '号令', '政務官部隊長が雇用可能',
    2, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 2)),
  new CountryPolicyType(16, 2000, '人情国家', '仁官数につき毎ターン政策ポイント +8',
    2, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 33)),
  new CountryPolicyType(24, 3000, '施設連携', '強化系都市施設効果 +7',
    2, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 16)),
  new CountryPolicyType(34, 2000, '採用策', '政務官ポイント +1',
    2, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 24)),
  new CountryPolicyType(35, 5000, '武官の肇', '取得から 144 ターン武力と知力の高い方を内政に使用。文官国家をブースト',
    3, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 14),
    '武官国家 を取得', undefined, 144),
  new CountryPolicyType(38, 20000, '武官の肇／弐', '取得から 144 ターン武力と知力の高い方を内政に使用',
    3, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 35),
    undefined, undefined, 144),
  new CountryPolicyType(39, 80000, '武官の肇／参', '取得から 144 ターン武力と知力の高い方を内政に使用',
    3, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 38),
    undefined, undefined, 144),
  new CountryPolicyType(40, 240000, '武官の肇／肆', '取得から 144 ターン武力と知力の高い方を内政に使用',
    3, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 39),
    undefined, undefined, 144),
  new CountryPolicyType(41, 50000, '国民総動員', '取得と同時に全武将の兵士数、訓練がMAX、陣形経験値 +5000',
    3, undefined, undefined, undefined, 288),
  new CountryPolicyType(42, 180000, '国民総動員／弐', '取得と同時に全武将の兵士数、訓練がMAX、陣形経験値 +5000',
    3, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 41),
    undefined, undefined, 288),
  new CountryPolicyType(43, 100000, '城壁作業員総動員', '取得と同時に全都市の技術、城壁がMAX',
    3, undefined, undefined, undefined, 576),
  new CountryPolicyType(44, 250000, '城壁作業員総動員／弐', '取得と同時に全都市の技術、城壁がMAX',
    3, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 43),
    undefined, undefined, 576),
  new CountryPolicyType(45, 50000, '緊縮財政', '取得と同時に全武将の金 +200k',
    3, undefined, undefined, undefined, 288),
  new CountryPolicyType(46, 150000, '緊縮財政／弐', '取得と同時に全武将の金 +200k',
    3, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 45),
    undefined, undefined, 288),

  new CountryPolicyType(7, 3000, '賊の監視', '賊の被害を未然に防ぐ', 4),
  new CountryPolicyType(13, 2000, '賊の殲滅', '賊発生時、都市につき政策ポイント +30',
    4, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 7)),
  new CountryPolicyType(29, 2000, '正義とは', '義賊の効果増大',
    4, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 13)),
  new CountryPolicyType(31, 4000, '攻城', '井闌1小隊あたり徴兵コスト -50',
    4, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 29)),
  new CountryPolicyType(30, 3000, '檄', '義勇兵が徴兵可能',
    4, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 31)),
  new CountryPolicyType(47, 3000, '城内拡張', 'すべての都市の敷地 +1',
    4, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 30)),
  new CountryPolicyType(32, 4000, '衝車常備', '戦闘時、攻城属性を除き、常に城壁攻撃力 +60',
    4, (ps) => ps.some((p) => p.status === api.CountryPolicy.statusAvailable && p.type === 47)),

  new CountryPolicyType(37, 0, '胡人徴発', '重騎兵の徴兵コスト /2', 3, undefined,
    '異民族を滅亡せしめる', false),
];

/**
 * 陣形
 */
export class FormationType {
  public constructor(public id: number = 0,
                     public name: string = '',
                     public descriptions: string[] = [],
                     public type: string = '',
                     public subjectAppear?: (exists: api.Formation[]) => boolean,
                     public canGet: boolean = true,
                     public nextLevel: number[] = []) {}
}
export const FORMATION_TYPES: FormationType[] = [
  new FormationType(0, '通常', ['効果なし',
                               '攻撃力 +4',
                               '攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +32'],
                        '無', undefined, false, [1000, 3000, 6000, 10000]),
  new FormationType(1, '魚鱗', ['攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +32、属性防御力 +16、突撃確率 +16%、突撃攻撃力 +40',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +48、属性防御力 +32、突撃確率 +16%、突撃攻撃力 +40、連戦確率 +4%'],
                        '水', undefined, true, [1000, 2000, 5000, 8000]),
  new FormationType(2, '蜂矢', ['攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16',
                               '攻撃力 +32、防御力 +16、属性攻撃力 +48、属性防御力 +16、突撃確率 +8%、突撃攻撃力 +80',
                               '攻撃力 +32、防御力 +16、属性攻撃力 +60、属性防御力 +16、突撃確率 +12%、突撃攻撃力 +120'],
                        '火', undefined, true, [1000, 2000, 5000, 8000]),
  new FormationType(3, '錐行', ['攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +32、属性防御力 +16、突撃確率 +16%、突撃攻撃力 +40',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +48、属性防御力 +32、突撃確率 +16%、突撃攻撃力 +40、連戦確率 +4%'],
                        '金', undefined, true, [1000, 2000, 5000, 8000]),
  new FormationType(4, '鶴翼', ['攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +32、属性防御力 +16、突撃確率 +16%、突撃攻撃力 +40',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +48、属性防御力 +32、突撃確率 +16%、突撃攻撃力 +40、連戦確率 +4%'],
                        '火', undefined, true, [1000, 2000, 5000, 8000]),
  new FormationType(5, '方円', ['攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性防御力 +60、突撃確率 +1%、突撃攻撃力 +40',
                               '攻撃力 +16、防御力 +32、属性防御力 +96、突撃確率 +4%、突撃攻撃力 +40、突撃防御力 +80、連戦確率 +2%'],
                        '木', undefined, true, [1000, 2000, 5000, 8000]),
  new FormationType(6, '衡軛', ['攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +32、属性防御力 +16、突撃確率 +16%、突撃攻撃力 +40',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +48、属性防御力 +32、突撃確率 +16%、突撃攻撃力 +40、連戦確率 +4%'],
                        '土', undefined, true, [1000, 2000, 5000, 8000]),
  new FormationType(7, '偃月', ['攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16、属性防御力 +8、突撃確率 +14%、突撃攻撃力 +28',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +32、属性防御力 +16、突撃確率 +20%、突撃攻撃力 +48、連戦確率 +4%'],
                        '水', undefined, true, [1000, 2000, 5000, 8000]),
  new FormationType(8, '雁行', ['攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +32、属性防御力 +16、突撃確率 +16%、突撃攻撃力 +40',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +48、属性防御力 +32、突撃確率 +16%、突撃攻撃力 +40、連戦確率 +4%'],
                        '木', undefined, true, [1000, 2000, 5000, 8000]),
  new FormationType(9, '長蛇', ['攻撃力 +8',
                               '攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +16、属性防御力 +16、突撃確率 +3%、突撃攻撃力 +40、連戦確率 +12%',
                               '攻撃力 +16、防御力 +16、属性攻撃力 +32、属性防御力 +32、突撃確率 +4%、突撃攻撃力 +40、連戦確率 +20%'],
                        '土', undefined, true, [1000, 2000, 5000, 8000]),
  new FormationType(10, '攻城', ['攻撃力 +8',
                                '攻撃力 +16',
                                '攻撃力 +16、防御力 +16、城壁攻撃力 +32',
                                '攻撃力 +16、防御力 +16、城壁攻撃力 +72、 城壁防御力 +24、突撃確率 +16%、突撃攻撃力 +40',
                                '攻撃力 +16、防御力 +16、城壁攻撃力 +120、城壁防御力 +60、突撃確率 +16%、突撃攻撃力 +40、連戦確率 +4%'],
                        '金', undefined, true, [1000, 2000, 5000, 8000]),
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
                     public defaultResource: number = 0,
                     public isResourceItem: boolean = false) {}
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
  new CharacterItemType(33, 78000, '兵法二十四編', '知力 +15', false),
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
  new CharacterItemType(58, 500000, '中行説の霊', '使用で全ての中立異民族が敵対化。異民族なければ出現', false, false, true),
  new CharacterItemType(59, 18, '装備戟', '重戟兵徴兵費 -30%', true, true, false, true, 1000),
  new CharacterItemType(60, 18, '装備馬', '重騎兵／梓馬兵徴兵費 -30%', true, true, false, true, 1000),
  new CharacterItemType(61, 100000, '四民月令', '統率 +20', false),
  new CharacterItemType(62, 100000, '論語', '人望 +20', false),
  new CharacterItemType(63, 20, '連弩装備', '連弩兵徴兵可能', true, true, false, true, 1000),
  new CharacterItemType(64, 24, '青洲槍', '青洲兵徴兵可能', true, true, false, true, 1000),
  new CharacterItemType(65, 22, '装備良戟', '重戟兵徴兵費 -60%', true, true, false, true, 1000),
  new CharacterItemType(66, 22, '装備良馬', '重騎兵／梓馬兵徴兵費 -60%', true, true, false, true, 1000),
  new CharacterItemType(67, 22, '象', '象兵徴兵可能', true, true, false, true, 1000),
  new CharacterItemType(68, 22, '藤甲', '藤甲兵徴兵可能', true, true, false, true, 1000),
  new CharacterItemType(69, 8, '練兵', '徴兵時訓練値下限 60', true, true, false, true, 1000),
  new CharacterItemType(70, 11, '精鋭兵', '徴兵時訓練値下限 100', true, true, false, true, 1000),
  new CharacterItemType(71, 48000, '兵法書', '使用で陣形経験値 +500', true, true, true),
  new CharacterItemType(72, 55000, '私撰書', '知力 +15'),
  new CharacterItemType(73, 48000, '注釈書', '使用で知力経験値 +2222', true, true, true),
  new CharacterItemType(74, 500000, '胡人の証', '所持した状態で経営国家、異民族に仕官可能。仕官で消費', false, true, false),
  new CharacterItemType(75, 20, '重戟装備', '重戟兵徴兵費用 -50%', true, true, false, true, 1000),
  new CharacterItemType(76, 20, '重騎装備', '重騎兵徴兵費用 -50%', true, true, false, true, 1000),
  new CharacterItemType(77, 22, '戦車', '戦車兵徴兵可能', true, true, false, true, 1000),
  new CharacterItemType(78, 18, '歩兵装備', '歩兵徴兵費用 -30%', true, true, false, true, 1000),
  new CharacterItemType(79, 18, '騎兵装備', '騎兵徴兵費用 -30%', true, true, false, true, 1000),
  new CharacterItemType(80, 18, '弩', '弩兵徴兵費用 -30%', true, true, false, true, 1000),
  new CharacterItemType(81, 80000, '技能書', '使用で技能ポイント +72', true, true, true),
  new CharacterItemType(82, 500000, '黄巾の旗', '使用で即時黄巾出現、全面戦争開始', false, false, true),
  new CharacterItemType(83, 20, '強弩装備', '強弩兵徴兵費用 -50%', true, true, false, true, 1000),
  new CharacterItemType(84, 10000, '時の番人', '静養コマンド使用可能。使用で資源 1 消費', true, true, false, true, 10, true),
  new CharacterItemType(85, 30, '武神（仮）', '戦闘時攻撃力 +40。戦闘ターン 1 につき資源 1 消費', true, true, false, true, 100),
  new CharacterItemType(86, 500000, '真実の鏡', '使用で本物の玉璽を持っている国が判明（武将ログに出力）', false, false, true),
  new CharacterItemType(87, 500000, '城の設計図', '都市建設コマンド使用可能。使用で消費', false, true),
  new CharacterItemType(88, 500000, '都市計画書', '使用で都市敷地最大 +1', false, true, true),
  new CharacterItemType(89, 500000, '大都市計画書', '使用で都市敷地最大 +3', false, true, true),
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
  new CharacterSkillType(2, '武家 Lv.2', '攻撃力 +20、コマンド 都市巡回', 320, (skills) => skills.some((s) => s.type === 1)),
  new CharacterSkillType(3, '武家 Lv.3', '徴兵に必要な金 -15%', 400, (skills) => skills.some((s) => s.type === 2)),
  new CharacterSkillType(4, '武家 Lv.4', '攻撃力 +20、突撃確率 +2%、突撃威力 +120', 320, (skills) => skills.some((s) => s.type === 3)),
  new CharacterSkillType(5, '武家 Lv.5', '戦闘が 1 ターンで終了時の連戦確率 +80%', 360, (skills) => skills.some((s) => s.type === 4)),
  new CharacterSkillType(6, '官吏 Lv.1', '毎月知力Ex +7', 0, (_) => false),
  new CharacterSkillType(7, '官吏 Lv.a2', '非戦時中内政効果 +50%、コマンド 都市巡回', 320, (skills) => skills.some((s) => s.type === 6) && !skills.some((s) => s.type === 57)),
  new CharacterSkillType(57, '官吏 Lv.b2', '戦時中内政効果 +40%、コマンド 都市巡回', 320, (skills) => skills.some((s) => s.type === 6) && !skills.some((s) => s.type === 7)),
  new CharacterSkillType(8, '官吏 Lv.a3', '非戦時中内政効果 +50%、政策開発時、未取得政策ブースト確率 +5%', 320,
    (skills) => skills.some((s) => s.type === 7 || s.type === 57) && !skills.some((s) => s.type === 54)),
  new CharacterSkillType(54, '官吏 Lv.b3', '戦時中内政効果 +40%、政策開発時、未取得政策ブースト確率 +5%', 320,
    (skills) => skills.some((s) => s.type === 7 || s.type === 57) && !skills.some((s) => s.type === 8)),
  new CharacterSkillType(9, '官吏 Lv.4', '歩兵属性含む兵種使用時、攻撃力 +20、防御力 +50', 360, (skills) => skills.some((s) => s.type === 8 || s.type === 54)),
  new CharacterSkillType(10, '官吏 Lv.5', '壁属性含む兵種使用時、混乱 +5%、毎月知力Ex +11', 400, (skills) => skills.some((s) => s.type === 9)),
  new CharacterSkillType(11, '商人 Lv.1', 'アイテム上限 +2、米売買時貢献 +15', 0, (_) => false),
  new CharacterSkillType(12, '商人 Lv.2', 'コマンド 都市投資', 280, (skills) => skills.some((s) => s.type === 11)),
  new CharacterSkillType(13, '商人 Lv.3', '米売買上限 +10000', 360, (skills) => skills.some((s) => s.type === 12)),
  new CharacterSkillType(14, '商人 Lv.a4', 'アイテム上限 +2、内政時出現 +8%', 400, (skills) => !skills.some((s) => s.type === 55) && skills.some((s) => s.type === 13)),
  new CharacterSkillType(15, '商人 Lv.a5', 'アイテム上限 +2、アイテム購入価格 -20%', 360, (skills) => skills.some((s) => s.type === 14)),
  new CharacterSkillType(55, '商人 Lv.b4', '米売買上限 +10000', 400, (skills) => !skills.some((s) => s.type === 14) && skills.some((s) => s.type === 13)),
  new CharacterSkillType(56, '商人 Lv.b5', '建築物 商業組合', 360, (skills) => skills.some((s) => s.type === 55)),
  new CharacterSkillType(16, '技師 Lv.1', '攻撃力 +30', 0, (_) => false),
  new CharacterSkillType(17, '技師 Lv.2', 'コマンド 資源生産、歩兵装備、騎兵装備、弩生産可能', 360, (skills) => skills.some((s) => s.type === 16)),
  new CharacterSkillType(18, '技師 Lv.3', '技術開発で武力を使用可能', 360, (skills) => skills.some((s) => s.type === 17)),
  new CharacterSkillType(19, '技師 Lv.4', 'アイテム上限 +2', 360, (skills) => skills.some((s) => s.type === 18)),
  new CharacterSkillType(20, '技師 Lv.5', '青洲槍、戦車、連弩装備生産可能', 320, (skills) => skills.some((s) => s.type === 19)),
  new CharacterSkillType(26, '胡人 Lv.1', '毎月武力Ex +7', 0, (_) => false),
  new CharacterSkillType(27, '胡人 Lv.2', '騎兵属性使用時に限り攻撃力 +30', 240, (skills) => skills.some((s) => s.type === 26)),
  new CharacterSkillType(28, '胡人 Lv.3', '城壁攻撃力60、城壁防御力30', 360, (skills) => skills.some((s) => s.type === 27)),
  new CharacterSkillType(29, '胡人 Lv.4', 'コマンド 胡人交易、象・藤甲生産可能', 320, (skills) => skills.some((s) => s.type === 28)),
  new CharacterSkillType(30, '胡人 Lv.5', 'コマンド 農民避難、農民呼寄', 480, (skills) => skills.some((s) => s.type === 29)),
  new CharacterSkillType(31, '農家 Lv.1', '政策によらず義勇兵雇用可能', 0, (_) => false),
  new CharacterSkillType(32, '農家 Lv.2', 'コマンド 精鋭検査、練兵生産可能', 320, (skills) => skills.some((s) => s.type === 31)),
  new CharacterSkillType(33, '農家 Lv.a3', '米施し効果 +80%', 320, (skills) => !skills.some((s) => s. type === 51) && skills.some((s) => s.type === 32)),
  new CharacterSkillType(34, '農家 Lv.a4', 'コマンド 農民避難、農民呼寄', 280, (skills) => skills.some((s) => s.type === 33)),
  new CharacterSkillType(35, '農家 Lv.a5', '精鋭兵生産可能', 480, (skills) => skills.some((s) => s.type === 34)),
  new CharacterSkillType(51, '農家 Lv.b3', '義戈兵徴兵可能', 320, (skills) => !skills.some((s) => s. type === 33) && skills.some((s) => s.type === 32)),
  new CharacterSkillType(52, '農家 Lv.b4', '義殲兵徴兵可能', 280, (skills) => skills.some((s) => s.type === 51)),
  new CharacterSkillType(53, '農家 Lv.b5', '投擲器生産可能', 480, (skills) => skills.some((s) => s.type === 52)),
  new CharacterSkillType(36, '兵家 Lv.1', '獲得可能な陣形 +2', 0, (_) => false),
  new CharacterSkillType(37, '兵家 Lv.2', 'コマンド 合同訓練', 400, (skills) => skills.some((s) => s.type === 36)),
  new CharacterSkillType(38, '兵家 Lv.3', '攻撃力 +40、突撃確率 +10%、突撃攻撃力 +80', 320, (skills) => skills.some((s) => s.type === 37)),
  new CharacterSkillType(39, '兵家 Lv.4', 'コマンド 書物執筆、兵法書生産可能', 280, (skills) => skills.some((s) => s.type === 38)),
  new CharacterSkillType(40, '兵家 Lv.5', '連戦確率 +10%', 400, (skills) => skills.some((s) => s.type === 39)),
  new CharacterSkillType(41, '学者 Lv.1', '毎ターン知力 +7', 0, (_) => false),
  new CharacterSkillType(42, '学者 Lv.2', '内政効果 +40%', 240, (skills) => skills.some((s) => s.type === 41)),
  new CharacterSkillType(43, '学者 Lv.3', 'コマンド 書物執筆、註釈書生産可能', 480, (skills) => skills.some((s) => s.type === 42)),
  new CharacterSkillType(44, '学者 Lv.4', '私撰書生産可能、アイテム上限 +1', 400, (skills) => skills.some((s) => s.type === 43)),
  new CharacterSkillType(45, '学者 Lv.5', 'コマンド 偵察', 280, (skills) => skills.some((s) => s.type === 44)),
  new CharacterSkillType(46, '参謀 Lv.1', '毎ターン知力 +7', 0, (_) => false),
  new CharacterSkillType(47, '参謀 Lv.2', '攻撃力 +20、コマンド 偵察', 320, (skills) => skills.some((s) => s.type === 46)),
  new CharacterSkillType(48, '参謀 Lv.3', '防御力 +20、同士討ち確率 +2％', 400, (skills) => skills.some((s) => s.type === 47)),
  new CharacterSkillType(49, '参謀 Lv.4', '突撃確率 +2%、突撃攻撃力 +60、混乱確率 +4%', 320, (skills) => skills.some((s) => s.type === 48)),
  new CharacterSkillType(50, '参謀 Lv.5', '兵種 梓琴兵・梓弩兵、戦闘が１ターンで終了時の連戦確率 +50%', 360, (skills) => skills.some((s) => s.type === 49)),
];

/**
 * 建築物
 */
export class TownSubBuildingType {
  public constructor(public id: number = 0,
                     public name: string = '',
                     public size: number = 0,
                     public buildDuring: number = 0,
                     public money: number = 0,
                     public description: string = '',
                     public needSkill: number | number[] = 0) {}
}
export const TOWN_SUB_BUILDING_TYPES: TownSubBuildingType[] = [
  new TownSubBuildingType(1, '農地', 1, 12, 10000, '農業最大 +500'),
  new TownSubBuildingType(2, '市場', 1, 12, 10000, '商業最大 +500'),
  new TownSubBuildingType(3, '工房', 2, 12, 20000, '技術最大 +300'),
  // new TownSubBuildingType(4, '大規模工房', 2, 10000, '投石器徴兵可。出身 技師、兵家、参謀 が必要'),
  new TownSubBuildingType(5, '集落', 2, 12, 10000, '人口最大 +10000。人望 100 が必要'),
  new TownSubBuildingType(6, '城塞', 2, 24, 25000, '城壁最大 +500。武力 100 が必要'),
  new TownSubBuildingType(7, '商業組合', 1, 48, 50000, '毎年 1 , 7 月、国庫に金 4000 〜 8000。技能が必要', 56),
  new TownSubBuildingType(8, '破壊所', 2, 24, 30000, '隣接する戦争相手都市で 2 ヶ月に 1 回城壁 -7'),
  new TownSubBuildingType(9, '扇動所', 2, 24, 30000, '隣接する戦争相手都市で 2 ヶ月に 1 回民忠 -2、農民 -100'),
  new TownSubBuildingType(10, '防衛拠点', 2, 36, 30000, '隣接する戦争相手都市建築物から受ける自都市被害 -66%'),
];

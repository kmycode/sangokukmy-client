/* tslint:disable:member-ordering */

import ArrayUtil from '@/models/common/arrayutil';
import CancellableAsyncStack from '@/models/common/cancellableasyncstack';
import * as api from '@/api/api';
import Enumerable from 'linq';
import * as def from '@/common/definitions';
import { StatusParameter,
  NoRangeStatusParameter,
  RangedStatusParameter,
  TextStatusParameter,
  CharacterIconStatusParameter,
  TwinNoRangeAndRangedStatusParameter,
  NoRangeDelayStatusParameter,
} from '@/models/status/statusparameter';

export default class StatusStore {
  public hasInitialized: boolean = false;
  public systemData: api.SystemData = new api.SystemData();
  public countries: api.Country[] = [];
  public country: api.Country = api.Country.default;  // 自分の所属しない国が入る場合がある
  public policies: api.CountryPolicy[] = [];
  public wars: api.CountryWar[] = [];
  public alliances: api.CountryAlliance[] = [];
  public towns: api.TownBase[] = [];
  public town: api.TownBase = new api.Town(-1);           // 自分の所在しない都市が入る場合がある
  public townWars: api.TownWar[] = [];
  public subBuildings: api.TownSubBuilding[] = [];
  public character: api.Character = new api.Character(-1);  // 常に自分が入る
  public characters: api.Character[] = [];
  public defenders: api.TownDefender[] = [];
  public units: api.Unit[] = [];
  public reinforcements: api.Reinforcement[] = [];
  public formations: api.Formation[] = [];
  public items: api.CharacterItem[] = [];
  public skills: api.CharacterSkill[] = [];
  public commandComments: api.CommandComment[] = [];
  public otherCharacterCommands: api.CharacterCommand[] = [];
  public mutes: api.Mute[] = [];
  public muteKeyword: api.MuteKeyword = new api.MuteKeyword('');
  public account: api.Account = new api.Account(-1);
  public aiCharacters: api.AiCharacterManagement[] = [];
  public delayEffects: api.DelayEffect[] = [];
}

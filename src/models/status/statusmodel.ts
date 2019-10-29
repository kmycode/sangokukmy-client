/* tslint:disable:member-ordering */

import ArrayUtil from '@/models/common/arrayutil';
import CancellableAsyncStack from '@/models/common/cancellableasyncstack';
import Streaming from '@/api/streaming';
import ApiStreaming from '@/api/apistreaming';
import * as api from '@/api/api';
import Enumerable from 'linq';
import * as def from '@/common/definitions';
import * as current from '@/common/current';
import { StatusParameter,
  NoRangeStatusParameter,
  RangedStatusParameter,
  TextStatusParameter,
  CharacterIconStatusParameter,
  TwinNoRangeAndRangedStatusParameter,
  NoRangeDelayStatusParameter,
  TwinTextAndRangedStatusParameter,
  LargeTextStatusParameter,
} from '@/models/status/statusparameter';
import ChatMessageContainer from '@/models/status/chatmessagecontainer';
import CommandList from '@/models/status/commandlist';
import Vue from 'vue';
import NotificationService from '@/services/notificationservice';
import ThreadBbs from '@/models/status/threadbbs';
import OnlineModel from '@/models/status/onlinemodel';
import StatusStore from '@/models/status/statusstore';
import UnitModel from '@/models/status/unitmodel';
import ValueUtil from '@/models/common/ValueUtil';
import SoldierTypeModel from '@/models/status/soldiertypemodel';
import VueRouter from 'vue-router';

export default class StatusModel {
  public gameDate: api.GameDateTime = new api.GameDateTime();
  public countryParameters: StatusParameter[] = [];
  public scoutedTowns: api.ScoutedTown[] = [];
  public townParameters: StatusParameter[] = [];
  public characterParameters: StatusParameter[] = [];
  public characterIcons: api.CharacterIcon[] = [];
  public mapLogs: api.MapLog[] = [];
  public characterLogs: api.CharacterLog[] = [];
  public townCharacters: api.Character[] = [];
  public townDefenders: api.Character[] = [];
  public loadedTownCharacters: api.Character[] = [];
  public loadedTownDefenders: api.Character[] = [];
  public countryCharacters: api.Character[] = [];
  public leaderUnit: api.Unit = new api.Unit(-1);
  public oppositionCharacters: api.Character[] = [];

  public newAllianceData: api.CountryAlliance = new api.CountryAlliance();
  public newWarData: api.CountryWar = new api.CountryWar();
  public countryCommandersMessage: api.CountryMessage = new api.CountryMessage();
  public countrySolicitationMessage: api.CountryMessage = new api.CountryMessage();
  public countryUnifiedMessage: api.CountryMessage = new api.CountryMessage();

  public get isLoading(): boolean {
    return this.isCommandInputing || this.isUpdatingTownCharacters
      || this.isUpdatingTownDefenders || this.isUpdatingCountryCharacters || this.isScouting
      || this.isAppointing || this.isSendingAlliance || this.isSendingWar
      || this.isLoadingMoreMapLogs || this.countryChat.isLoading || this.globalChat.isLoading
      || this.privateChat.isLoading || this.isUpdatingOppositionCharacters
      || this.isUpdatingCountrySettings || this.isUpdatingPolicies || this.isUpdatingFormations
      || this.isUpdatingSkills || this.isUpdatingItems;
  }
  public isUpdatingTownCharacters: boolean = false;
  public isUpdatingTownDefenders: boolean = false;
  public isUpdatingCountryCharacters: boolean = false;
  public isUpdatingCountrySettings: boolean = false;
  public isUpdatingReinforcement: boolean = false;
  public isUpdatingOppositionCharacters: boolean = false;
  public isUpdatingPrivateSettings: boolean = false;
  public isUpdatingPolicies: boolean = false;
  public isUpdatingFormations: boolean = false;
  public isUpdatingItems: boolean = false;
  public isUpdatingSkills: boolean = false;
  public isScouting: boolean = false;
  public isAppointing: boolean = false;
  public isSendingAlliance: boolean = false;
  public isSendingWar: boolean = false;
  public isSendingTownWar: boolean = false;
  public isLoadingMoreMapLogs: boolean = false;
  public hasLoadAllMapLogs: boolean = false;
  public isLoadingMoreCharacterLogs: boolean = false;
  public hasLoadAllCharacterLogs: boolean = false;

  private $router?: () => any;

  // #region Store and Compat Properties

  public store: StatusStore = new StatusStore();

  public get systemData(): api.SystemData {
    return this.store.systemData;
  }

  public get character(): api.Character {
    return this.store.character;
  }

  public get countries(): api.Country[] {
    return this.store.countries;
  }

  public get country(): api.Country {
    return this.store.country;
  }

  public get towns(): api.Town[] {
    return this.store.towns;
  }

  public get town(): api.Town {
    return this.store.town;
  }

  public get units(): api.Unit[] {
    return this.store.units;
  }

  // #endregion

  // #region Properties

  private get characterIcon(): api.CharacterIcon {
    const icon = api.CharacterIcon.getMainOrFirst(this.characterIcons);
    if (icon) {
      return icon;
    } else {
      return api.CharacterIcon.default;
    }
  }

  public get characterTown(): api.Town {
    // 自分が所在している都市
    return this.getTown(this.character.townId);
  }

  public get countryColor(): number {
    // 選択中の国の国色
    return this.getCountry(this.country.id).colorId;
  }

  public get townCountryColor(): number {
    // 選択中の都市の国色
    return this.getCountry(this.town.countryId).colorId;
  }

  public get countryPolicies(): api.CountryPolicy[] {
    // 選択中の国の政策
    return Enumerable.from(this.store.policies)
      .where((p) => p.countryId === this.country.id)
      .toArray();
  }

  public get characterCountryPolicyTypes(): def.CountryPolicyType[] {
    // 選択中の国の政策
    return Enumerable.from(this.store.policies)
      .where((p) => p.countryId === this.character.countryId)
      .select((p) => Enumerable.from(def.COUNTRY_POLICY_TYPES).firstOrDefault((pp) => pp.id === p.type))
      .toArray();
  }

  public get formations(): api.Formation[] {
    // 陣形
    const fs = this.store.formations;
    if (!Enumerable.from(fs).any((f) => f.type === 0)) {
      const fss = Array.from(fs);
      fss.unshift(new api.Formation(-1, this.character.id, 0, 1, 0));
      return fss;
    }
    return fs;
  }

  public get characterTownCountryColor(): number {
    // 自分が滞在している都市の国色
    return this.getCountry(this.characterTown.countryId).colorId;
  }

  public get characterCountry(): api.Country {
    // 自分の所属する国
    return this.getCountry(this.character.countryId);
  }

  public get characterCountryColor(): number {
    // 自分の所属する国の国色
    return this.getCountry(this.character.countryId).colorId;
  }

  public get townCharactersForData(): api.Character[] {
    return Enumerable
      .from(this.store.characters)
      .where((c) => c.townId === this.store.town.id)
      .toArray();
  }

  public get characterItems(): api.CharacterItem[] {
    return Enumerable
      .from(this.store.items)
      .where((i) => (i.status === api.CharacterItem.statusCharacterHold ||
                     i.status === api.CharacterItem.statusCharacterPending) &&
                    i.characterId === this.character.id)
      .toArray();
  }

  public get townItems(): api.CharacterItem[] {
    return Enumerable
      .from(this.store.items)
      .where((i) => i.status === api.CharacterItem.statusTownOnSale &&
                    i.townId === this.town.id)
      .toArray();
  }

  public get characterTownItems(): api.CharacterItem[] {
    return Enumerable
      .from(this.store.items)
      .where((i) => i.status === api.CharacterItem.statusTownOnSale &&
                    i.townId === this.character.townId)
      .toArray();
  }

  public get characterItemsMax(): number {
    let max = 4;
    const skills = this.characterSkills;

    if (skills.some((s) => s.type === 11)) {
      max += 2;
    }
    if (skills.some((s) => s.type === 13)) {
      max += 2;
    }
    if (skills.some((s) => s.type === 19)) {
      max += 3;
    }
    if (skills.some((s) => s.type === 44)) {
      max += 3;
    }

    return max;
  }

  public get nextItemShuffleYear(): number {
    const year = this.gameDate.year - (this.gameDate.year % 12) + 4;
    if (year > this.gameDate.year) {
      return year;
    }
    return year + 12;
  }

  public get characterSkills(): api.CharacterSkill[] {
    return Enumerable
      .from(this.store.skills)
      .where((i) => i.characterId === this.character.id)
      .toArray();
  }

  public get characterRiceBuyMax(): number {
    let max = def.RICE_BUY_MAX;
    if (this.characterSkills.some((s) => s.type === 12)) {
      max += 5000;
    }
    if (this.characterSkills.some((s) => s.type === 15)) {
      max += 8000;
    }
    return max;
  }

  public get countrySecretaries(): api.Character[] {
    return Enumerable
      .from(this.countryCharacters)
      .where((c) => c.aiType === api.Character.aiSecretaryPatroller ||
                    c.aiType === api.Character.aiSecretaryUnitGather ||
                    c.aiType === api.Character.aiSecretaryPioneer ||
                    c.aiType === api.Character.aiSecretaryUnitLeader ||
                    c.aiType === api.Character.aiSecretaryScouter)
      .toArray();
  }

  public get characterCountryLastTownWar(): api.TownWar | undefined {
    // 自国最後の攻略
    return Enumerable.from(this.store.townWars)
      .where((tw) => tw.requestedCountryId === this.character.countryId)
      .orderByDescending((tw) => api.GameDateTime.toNumber(tw.gameDate))
      .firstOrDefault();
  }

  public get characterCountryTownWarStatus(): def.TownWarStatus {
    const last = Enumerable.from(this.store.townWars)
      .orderByDescending((tw) => api.GameDateTime.toNumber(tw.gameDate))
      .firstOrDefault((tw) => tw.requestedCountryId === this.character.countryId);
    if (last) {
      const status = Enumerable.from(def.TOWN_WAR_STATUSES)
        .firstOrDefault((s) => s.id === last.status);
      if (status) {
        return status;
      }
    }
    return def.TOWN_WAR_STATUSES[0];
  }

  public get characterCountryWarWorstStatus(): def.CountryWarStatus {
    const war = Enumerable
      .from(this.store.wars)
      .where((w) => w.requestedCountryId === this.character.countryId ||
                    w.insistedCountryId === this.character.countryId)
      .where((w) => w.status === api.CountryWar.statusAvailable ||
                    w.status === api.CountryWar.statusInReady ||
                    w.status === api.CountryWar.statusStopRequesting)
      .orderBy((w) => w.status)
      .firstOrDefault();
    if (war) {
      return Enumerable.from(def.COUNTRY_WAR_STATUSES).first((s) => s.id === war.status);
    } else {
      return def.COUNTRY_WAR_STATUSES[0];
    }
  }

  public get countryAlliance(): api.CountryAlliance | undefined {
    // 現在選択中の国と自分の国の同盟
    return Enumerable
      .from(this.store.alliances)
      .firstOrDefault((ca) => api.CountryDipromacy.isEqualCountry(ca, this.country.id, this.character.countryId));
  }

  public get countryWar(): api.CountryWar | undefined {
    // 現在選択中の国と自分の国の戦争
    return Enumerable
      .from(this.store.wars)
      .firstOrDefault((ca) => api.CountryDipromacy.isEqualCountry(ca, this.country.id, this.character.countryId));
  }

  public get countryAllianceStatus(): def.CountryAllianceStatus {
    // 自分の国との同盟関係
    let status = 0;
    const myCountry = this.getCountry(this.character.countryId);
    if (myCountry.id === this.country.id) {
      status = -1;
    } else {
      const alliance = Enumerable
        .from(this.store.alliances)
        .firstOrDefault((ca) => api.CountryDipromacy.isEqualCountry(ca, this.country.id, myCountry.id));
      if (alliance) {
        if (alliance.status === api.CountryAlliance.statusRequesting) {
          // 自分が打診したか、されてるかでデータを変える
          status = alliance.requestedCountryId === this.characterCountry.id ? 1 : 101;
        } else {
          status = alliance.status;
        }
      } else {
        status = 0;
      }
    }

    const statusObj = Enumerable.from(def.COUNTRY_ALLIANCE_STATUSES)
                                .firstOrDefault((s) => s.id === status);
    if (statusObj) {
      return statusObj;
    } else {
      return def.COUNTRY_ALLIANCE_STATUSES[0];
    }
  }

  public get countryWarStatus(): def.CountryWarStatus {
    // 自分の国との戦争関係
    let status = 0;
    const myCountry = this.getCountry(this.character.countryId);
    if (myCountry.id === this.country.id) {
      status = -1;
    } else {
      const war = Enumerable
        .from(this.store.wars)
        .firstOrDefault((ca) => api.CountryDipromacy.isEqualCountry(ca, this.country.id, myCountry.id));
      if (war) {
        status = war.status;
      } else {
        status = 0;
      }
    }

    const statusObj = Enumerable.from(def.COUNTRY_WAR_STATUSES)
                                .firstOrDefault((s) => s.id === status);
    if (statusObj) {
      return statusObj;
    } else {
      return def.COUNTRY_WAR_STATUSES[0];
    }
  }

  public get readyForReinforcement(): boolean {
    return !Enumerable.from(this.store.reinforcements)
      .any((r) => r.status === api.Reinforcement.statusActive);
  }

  public get characterTownRiceTrend(): number {
    return api.Town.getRiceTrend(this.characterTown);
  }

  public characterTownRiceToMoneyPrice(assets: number = def.RICE_BUY_MAX): number {
    return api.Town.getRiceToMoneyPrice(this.characterTown, assets);
  }

  public characterTownMoneyToRicePrice(assets: number = def.RICE_BUY_MAX): number {
    return api.Town.getMoneyToRicePrice(this.characterTown, assets);
  }

  public get secretaryMaxValue(): number {
    // 自国の政務官の最大
    return Enumerable.from(this.store.policies)
      .where((p) => p.countryId === this.character.countryId)
      .count((p) => p.type === 4 || p.type === 34);
  }

  public get currentSecretaryPoint(): number {
    return Enumerable.from(this.store.characters)
      .where((c) => c.countryId === this.character.countryId)
      .sum((c) => c.aiType === api.Character.aiSecretaryPatroller ? 1 :
                  c.aiType === api.Character.aiSecretaryPioneer ? 1 :
                  c.aiType === api.Character.aiSecretaryUnitGather ? 1 :
                  c.aiType === api.Character.aiSecretaryUnitLeader ? 1 :
                  c.aiType === api.Character.aiSecretaryScouter ? 1 : 0);
  }

  public get canSecretaryUnitLeader(): boolean {
    return Enumerable.from(this.store.policies)
      .where((p) => p.countryId === this.character.countryId)
      .any((p) => p.type === 33 && p.status === api.CountryPolicy.statusAvailable);
  }

  public get canSecretaryScouter(): boolean {
    return Enumerable.from(this.store.policies)
      .where((p) => p.countryId === this.character.countryId)
      .any((p) => p.type === 2 && p.status === api.CountryPolicy.statusAvailable);
  }

  public get safeMaxValue(): number {
    // 自国の金庫の最大容量
    return Enumerable.from(this.store.policies)
      .where((p) => p.countryId === this.character.countryId)
      .count((p) => p.type === 1 || p.type === 10 || p.type === 11 || p.type === 12) * 100_0000;
  }

  public get soldierLaboratorySize(): number {
    // 兵種研究所の強さ
    return 1;
  }

  public get selectableSoldierTypes(): def.SoldierType[] {
    const types: def.SoldierType[] = [];
    Enumerable.from(def.SOLDIER_TYPES).orderBy((t) => t.technology).forEach((t) => {
      if (t.id !== 1 && t.id !== 2 && t.id !== 15) {
        if (this.characterTown.countryId === this.character.countryId) {
          if (t.technology <= this.characterTown.technology) {
            if (t.requestedPolicyType) {
              const can = Enumerable
                .from(this.store.policies)
                .where((p) => p.countryId === this.character.countryId)
                .any((p) => p.status === api.CountryPolicy.statusAvailable && p.type === t.requestedPolicyType);
              const can2 = Enumerable
                .from(this.store.skills)
                .any((s) => s.status === api.CharacterSkill.statusAvailable && s.type === 31);
              if (can || can2) {
                types.push(t);
              }
            } else {
              types.push(t);
            }
          }
        } else {
          if (t.technology === 0) {
            types.push(t);
          }
        }
      }
    });
    Enumerable
      .from(this.store.soldierTypes)
      .where((t) => t.status === api.CharacterSoldierType.statusAvailable)
      .orderBy((t) => api.CharacterSoldierType.getTechnology(t))
      .forEach((t) => {
        if (this.characterTown.countryId === this.character.countryId) {
          const technology = api.CharacterSoldierType.getTechnology(t);
          if (technology <= this.characterTown.technology) {
            const type = new def.SoldierType(
              10000 + t.id,
              0,
              t.name,
              api.CharacterSoldierType.getMoney(t),
              technology);
            type.description = api.CharacterSoldierType.getDescription(t);
            type.isCustom = true;
            type.customId = t.id;
            types.push(type);
          }
        }
      });
    return types;
  }

  public get selectableResearchSoldierTypes(): def.SoldierType[] {
    const types: def.SoldierType[] = [];
    Enumerable
      .from(this.store.soldierTypes)
      .where((t) => t.status === api.CharacterSoldierType.statusInDraft ||
                    t.status === api.CharacterSoldierType.statusResearching)
      .orderBy((t) => api.CharacterSoldierType.getTechnology(t))
      .forEach((t) => {
        const type = new def.SoldierType(
          10000 + t.id,
          0,
          t.name,
          api.CharacterSoldierType.getMoney(t),
          api.CharacterSoldierType.getTechnology(t));
        type.description = api.CharacterSoldierType.getDescription(t);
        type.isCustom = true;
        type.customId = t.id;
        types.push(type);
      });
    return types;
  }

  // #endregion

  // #region Streaming

  public onCreate($router: () => any) {
    this.onlines.beginWatch();
    this.$router = $router;

    ApiStreaming.status.onAuthenticationFailed = () => {
      if (this.$router) {
        this.$router().push('home');
      }
    };

    ApiStreaming.status.clearEvents();
    ApiStreaming.status.on<api.SystemData>(
      api.SystemData.typeId,
      (obj) => this.updateSystemData(obj));
    ApiStreaming.status.on<api.GameDateTime>(
      api.GameDateTime.typeId,
      (obj) => this.updateGameDate(obj));
    ApiStreaming.status.on<api.Town>(
      api.Town.typeId,
      (obj) => this.updateTown(obj));
    ApiStreaming.status.on<api.TownDefender>(
      api.TownDefender.typeId,
      (obj) => this.onTownDefenderReceived(obj));
    ApiStreaming.status.on<api.TownSubBuilding>(
      api.TownSubBuilding.typeId,
      (obj) => this.onTownSubBuildingReceived(obj));
    ApiStreaming.status.on<api.ScoutedTown>(
      api.ScoutedTown.typeId,
      (obj) => this.updateScoutedTown(obj));
    ApiStreaming.status.on<api.Country>(
      api.Country.typeId,
      (obj) => this.updateCountry(obj));
    ApiStreaming.status.on<api.CountryAlliance>(
      api.CountryAlliance.typeId,
      (obj) => this.updateCountryAlliance(obj));
    ApiStreaming.status.on<api.CountryWar>(
      api.CountryWar.typeId,
      (obj) => this.updateCountryWar(obj));
    ApiStreaming.status.on<api.TownWar>(
      api.TownWar.typeId,
      (obj) => this.updateTownWar(obj));
    ApiStreaming.status.on<api.CountryPost>(
      api.CountryPost.typeId,
      (obj) => this.updateCountryPost(obj));
    ApiStreaming.status.on<api.Character>(
      api.Character.typeId,
      (obj) => this.updateCharacter(obj));
    ApiStreaming.status.on<api.MapLog>(
      api.MapLog.typeId,
      (obj) => this.addMapLog(obj));
    ApiStreaming.status.on<api.CharacterLog>(
      api.CharacterLog.typeId,
      (obj) => this.addCharacterLog(obj));
    ApiStreaming.status.on<api.CharacterCommand>(
      api.CharacterCommand.typeId,
      (obj) => this.commands.updateCommand(obj));
    ApiStreaming.status.on<api.ApiSignal>(
      api.ApiSignal.typeId,
      (obj) => this.onReceiveSignal(obj));
    ApiStreaming.status.on<api.ChatMessage>(
      api.ChatMessage.typeId,
      (obj) => this.onReceiveChatMessage(obj));
    ApiStreaming.status.on<api.ThreadBbsItem>(
      api.ThreadBbsItem.typeId,
      (obj) => this.onBbsItemReceived(obj));
    ApiStreaming.status.on<api.CharacterOnline>(
      api.CharacterOnline.typeId,
      (obj) => this.onlines.onOnlineDataReceived(obj));
    ApiStreaming.status.on<api.Reinforcement>(
      api.Reinforcement.typeId,
      (obj) => this.onReinforcementReceived(obj));
    ApiStreaming.status.on<api.CountryMessage>(
      api.CountryMessage.typeId,
      (obj) => this.onCountryMessageReceived(obj));
    ApiStreaming.status.on<api.CharacterSoldierType>(
      api.CharacterSoldierType.typeId,
      (obj) => this.soldierTypes.onItemReceived(obj));
    ApiStreaming.status.on<api.Formation>(
      api.Formation.typeId,
      (obj) => this.onFormationReceived(obj));
    ApiStreaming.status.on<api.CharacterItem>(
      api.CharacterItem.typeId,
      (obj) => this.onCharacterItemReceived(obj));
    ApiStreaming.status.on<api.CharacterSkill>(
      api.CharacterSkill.typeId,
      (obj) => this.onCharacterSkillReceived(obj));
    ApiStreaming.status.on<api.CommandComment>(
      api.CommandComment.typeId,
      (obj) => this.onCommandCommentReceived(obj));
    ApiStreaming.status.on<api.CountryPolicy>(
      api.CountryPolicy.typeId,
      (obj) => this.onCountryPolicyReceived(obj));
    ApiStreaming.status.onBeforeReconnect = () => {
      this.store.character.id = -1;
      this.store.hasInitialized = false;
      this.commands.reset();
    };
    ApiStreaming.status.start();
  }

  public onDestroy() {
    ApiStreaming.status.onBeforeReconnect = undefined;
    ApiStreaming.status.stop();
    this.commands.dispose();
    this.onlines.dispose();
  }

  // #endregion

  // #region ApiSignal

  private onReceiveSignal(signal: api.ApiSignal) {
    if (signal.type === 1) {
      // 武将が更新された
      const data = signal.data as { gameDate: api.GameDateTime, secondsNextCommand: number };

      // この時点で新しい武将データは通知されていないので、自前で更新時刻を加算する
      const lastUpdated = api.DateTime.toDate(this.character.lastUpdated);
      lastUpdated.setSeconds(lastUpdated.getSeconds() + def.UPDATE_TIME);

      this.commands.onExecutedCommand(data.gameDate, api.DateTime.fromDate(lastUpdated), data.secondsNextCommand);
    } else if (signal.type === 2) {
      // 年月が進んだ
      this.updateGameDate(signal.data as api.GameDateTime);
    } else if (signal.type === 3) {
      // 能力が上昇した
      const type = signal.data.type as number;
      const name = type === 1 ? '武力' : type === 2 ? '知力' : type === 3 ? '統率' : type === 4 ? '人望' : undefined;
      if (name) {
        NotificationService.attributeUp.notifyWithParameter(name, signal.data.value);
      } else {
        NotificationService.invalidStatus.notifyWithParameter('能力上昇signal.data.type');
      }
    } else if (signal.type === 4) {
      // 初期データを送信し終えた
      this.store.hasInitialized = true;
      this.countryThreadBbs.sortThreads();
      this.globalThreadBbs.sortThreads();
      this.countryChat.isUnread =
        this.privateChat.isUnread =
        this.globalChat.isUnread =
        this.global2Chat.isUnread =
        this.promotions.isUnread =
        this.countryThreadBbs.isUnread =
        this.globalThreadBbs.isUnread = false;
      this.updateCharacter(this.character);
      this.commands.initialize(this.character.lastUpdatedGameDate, this.character.lastUpdated);
    } else if (signal.type === 5) {
      // 部隊が解散された
      NotificationService.belongsUnitRemoved.notify();
    } else if (signal.type === 6) {
      // 部隊が集合された
      NotificationService.belongsUnitGathered.notify();
    } else if (signal.type === 7) {
      // リセットされた
      if (this.$router) {
        this.$router().push('home');
        NotificationService.reseted.notify();
      } else {
        location.href = './home';
      }
    } else if (signal.type === 8) {
      // 守備中に戦闘があった
      const notify = signal.data.isWin ? NotificationService.defenderWon : NotificationService.defenderLose;
      notify.notifyWithParameter(signal.data.townName, signal.data.targetName);
    } else if (signal.type === 9) {
      // CommandCommentの受信・更新が完了した
      this.commands.updateCommandListInformations();
      NotificationService.commandCommentUpdated.notify();
    }
  }

  // #endregion

  // #region GameDate

  private initializeGameDate(date: api.GameDateTime) {
    this.gameDate = date;
    this.newWarData.startGameDate = api.GameDateTime.addMonth(date, 12 * 12);
    this.commands.preInitialize(date);
  }

  private updateGameDate(date: api.GameDateTime) {
    if (api.GameDateTime.toNumber(this.gameDate) === -1) {
      this.initializeGameDate(date);
    } else {
      this.gameDate = date;
    }
  }

  private updateSystemData(data: api.SystemData) {
    this.store.systemData = data;
    this.updateGameDate(data.gameDateTime);
  }

  // #endregion

  // #region Town

  private updateTown(town: api.Town) {
    ArrayUtil.addItem(this.towns, town);

    // 現在表示中の都市を更新
    if (this.town.id < 0) {
      if (this.character.id >= 0 && town.id === this.character.townId) {
        this.selectTown(town.id);
      }
    } else if (this.town.id === town.id) {
      this.selectTown(town.id);
    }

    // 国の首都を更新
    if (this.country.id >= 0 && this.country.capitalTownId === town.id) {
      (Enumerable.from(this.countryParameters).first((cp) => cp.name === '首都') as TextStatusParameter)
        .value = town.name;
    }
  }

  private updateScoutedTown(town: api.ScoutedTown) {
    town.id = town.scoutedTownId;
    ArrayUtil.addItem(this.scoutedTowns, town);

    if (this.town.id === town.id) {
      this.selectTown(town.id);
    }
  }

  private onTownDefenderReceived(defender: api.TownDefender) {
    this.store.defenders = Enumerable.from(this.store.defenders)
      .where((d) => d.characterId !== defender.characterId)
      .toArray();
    if (defender.status === api.TownDefender.statusAvailable) {
      ArrayUtil.addItem(this.store.defenders, defender);
    }
    this.setTown(this.store.town);
  }

  public selectTown(townId: number) {
    const town = ArrayUtil.find(this.towns, townId);
    if (town) {
      if (town.countryId !== this.character.countryId) {
        const scoutedTown = ArrayUtil.find(this.scoutedTowns, townId);
        if (town.id !== this.character.townId) {
          // 他国で、かつ自分がいる都市でなければ、諜報データがあるか確認
          if (scoutedTown) {
            this.townCharacters = scoutedTown.characters;
            this.townDefenders = scoutedTown.defenders;
            this.loadedTownCharacters = scoutedTown.characters;
            this.loadedTownDefenders = scoutedTown.defenders;
            scoutedTown.countryId = town.countryId;
            if (scoutedTown.subBuildings) {
              scoutedTown.subBuildings.forEach((s) => {
                s.townId = townId;
                ArrayUtil.addItem(this.store.subBuildings, s);
              });
            }
            this.setTown(scoutedTown);
          } else {
            this.setTown(town);
          }
        } else {
          // 他国で、かつ自分がいる都市であれば、諜報年月だけを設定
          if (scoutedTown) {
            (town as api.ScoutedTown).scoutedGameDateTime = scoutedTown.scoutedGameDateTime;
          }
          this.setTown(town);
        }
      } else {
        this.setTown(town);
      }

      // 国情報も変える
      this.setCountry(this.getCountry(this.town.countryId));
    }
  }

  private setTown(town: api.Town) {
    this.store.town = town;
    if (!api.Town.isScouted(town)) {
      this.updateTownCharacterAndDefenders();
    }
    this.townParameters = this.getTownParameters(town);
    Vue.set(this.town, 'scoutedGameDateTime', (this.town as any).scoutedGameDateTime);
  }

  private updateTownCharacterAndDefenders() {
    if (this.town.countryId === this.character.countryId || this.town.id === this.character.townId) {
      this.townCharacters = this.store.characters.filter((c) => c.townId === this.town.id && c.id >= 0);
      this.townDefenders = Enumerable
        .from(this.store.defenders.filter((c) => c.townId === this.town.id))
        .select((c) => Enumerable.from(this.store.characters).firstOrDefault((cc) => cc.id === c.characterId))
        .where((c) => c !== undefined && c !== null)
        .toArray();
    } else {
      this.townCharacters = [];
      this.townDefenders = [];
    }
  }

  private getTownParameters(town: api.Town): StatusParameter[] {
    const isScouted = api.Town.isScouted(town);
    const country = this.getCountry(town.countryId);
    const ps: StatusParameter[] = [];
    ps.push(new TextStatusParameter('国', country.name));
    ps.push(new TextStatusParameter('特化', def.TOWN_TYPES[town.type - 1]));
    if (town.ricePrice !== undefined) {
      ps.push(new NoRangeStatusParameter('相場', Math.round(town.ricePrice * 1000) / 1000));
      ps.push(new NoRangeStatusParameter('農民', town.people));
      ps.push(new RangedStatusParameter('民忠', town.security, 100));
      ps.push(new RangedStatusParameter('農業', town.agriculture, town.agricultureMax));
      ps.push(new RangedStatusParameter('商業', town.commercial, town.commercialMax));
      ps.push(new RangedStatusParameter('技術', town.technology, town.technologyMax));
      ps.push(new RangedStatusParameter('城壁', town.wall, town.wallMax));
    }

    const townBuilding = Enumerable
      .from(def.TOWN_BUILDINGS)
      .firstOrDefault((b) => b.id === town.townBuilding);
    if (townBuilding && townBuilding.id) {
      if (town.ricePrice !== undefined) {
        ps.push(new TwinTextAndRangedStatusParameter(
          '都市施設', townBuilding.name, '耐久', town.townBuildingValue, 2000));
      } else {
        ps.push(new TextStatusParameter('都市施設', townBuilding.name));
      }
    }

    let subBuildingSize = 0;
    const subBuildingSizeMax = town.type === api.Town.typeLarge ? 4 : town.type === api.Town.typeFortress ? 3 : 2;
    const buffer: StatusParameter[] = [];
    this.store.subBuildings.filter((s) => s.townId === town.id && s.status).forEach((s) => {
      const info = def.TOWN_SUB_BUILDING_TYPES.find((si) => si.id === s.type);
      if (info) {
        if (s.status === api.TownSubBuilding.statusUnderConstruction) {
          buffer.push(new TextStatusParameter('建設中', info.name, 'information'));
        } else if (s.status === api.TownSubBuilding.statusRemoving) {
          buffer.push(new TextStatusParameter('撤去中', info.name, 'warning'));
        } else if (s.status === api.TownSubBuilding.statusAvailable) {
          buffer.push(new TextStatusParameter('建築物', info.name));
        }
        subBuildingSize += info.size;
      }
    });
    ps.push(new RangedStatusParameter('敷地', subBuildingSize, subBuildingSizeMax));
    buffer.forEach((b) => ps.push(b));

    if (town.countryId === this.character.countryId ||
        town.id === this.character.townId ||
        isScouted) {
      ps.push(new NoRangeStatusParameter('滞在', this.townCharacters.length));
      ps.push(new NoRangeStatusParameter('守備', this.townDefenders.length));
    }
    return ps;
  }

  private getTown(townId: number): api.Town {
    const town = ArrayUtil.find(this.towns, townId);
    if (town) {
      return town;
    }
    return api.Town.default;
  }

  public updateTownCharacters() {
    this.isUpdatingTownCharacters = true;
    api.Api.getAllCharactersAtTown(this.town.id)
      .then((characters) => {
        characters.forEach((c) => {
          if (c.commands) {
            c.commands.forEach((cc) => {
              this.commands.inputer.updateCommandName(cc);
            });
          }
        });
        this.loadedTownCharacters = characters;
      })
      .catch(() => {
        NotificationService.getTownCharactersFailed.notify();
      })
      .finally(() => {
        this.isUpdatingTownCharacters = false;
      });
  }

  public updateTownDefenders() {
    this.isUpdatingTownDefenders = true;
    api.Api.getAllDefendersAtTown(this.town.id)
      .then((characters) => {
        this.loadedTownDefenders = characters;
      })
      .catch(() => {
        NotificationService.getTownCharactersFailed.notify();
      })
      .finally(() => {
        this.isUpdatingTownDefenders = false;
      });
  }

  public scoutTown() {
    this.isScouting = true;
    api.Api.scoutTown()
      .then(() => {
        NotificationService.scouted.notifyWithParameter(this.characterTown.name);
      })
      .catch(() => {
        NotificationService.scoutFailed.notifyWithParameter(this.characterTown.name);
      })
      .finally(() => {
        this.isScouting = false;
      });
  }

  private onTownSubBuildingReceived(item: api.TownSubBuilding) {
    ArrayUtil.addItem(this.store.subBuildings, item);
    if (this.town.id === item.townId) {
      this.setTown(this.town);
    }
  }

  // #endregion

  // #region Country

  private updateCountry(country: api.Country) {

    let isUpdateRequested = false;
    const old = ArrayUtil.find(this.countries, country.id);

    if (old) {
      // 役職リストが欠損していることがあるので、既存のデータで補う
      if (!country.posts || country.posts.length === 0) {
        country.posts = old.posts;
      }

      // 収入データが欠損していることがあればｒｙ
      if (country.lastMoneyIncomes === undefined && this.character.countryId === country.id) {
        country.lastMoneyIncomes = old.lastMoneyIncomes;
        country.lastRiceIncomes = old.lastRiceIncomes;
        country.safeMoney = old.safeMoney;
        country.policyPoint = old.policyPoint;
      }

      // 滅亡処理
      if (!old.hasOverthrown && country.hasOverthrown) {
        this.store.wars = Enumerable
          .from(this.store.wars)
          .where((w) => w.requestedCountryId !== country.id && w.insistedCountryId !== country.id)
          .toArray();
        this.store.alliances = Enumerable
          .from(this.store.alliances)
          .where((a) => a.requestedCountryId !== country.id && a.insistedCountryId !== country.id)
          .toArray();
        isUpdateRequested = true;
        this.commands.updateCommandListInformations();
      }
    }

    // APIから入ってこない可能性のあるデータを、空の配列で埋める
    if (country.posts === undefined) {
      country.posts = [];
    }

    // 配列のデータを更新
    ArrayUtil.addItem(this.countries, country);

    // 現在表示している都市、武将の国であれば、国名を更新する
    if (country.id === this.town.countryId) {
      const townParameter = Enumerable.from(this.townParameters).firstOrDefault((tp) => tp.name === '国');
      if (townParameter) {
        (townParameter as TextStatusParameter).value = country.name;
      }
    }
    if (country.id === this.character.countryId) {
      const characterParameter = Enumerable.from(this.characterParameters).firstOrDefault((cp) => cp.name === '国');
      if (characterParameter) {
        (characterParameter as TextStatusParameter).value = country.name;
      }
    }

    if (((this.country.id < 0 && country.id === this.character.countryId) || country.id === this.country.id) ||
        isUpdateRequested) {
      this.setCountry(country);
    }
  }

  private setCountry(country: api.Country) {
    this.store.country = country;
    this.countryParameters = this.getCountryParameters(country);
  }

  private getCountryParameters(country: api.Country): StatusParameter[] {
    const ps: StatusParameter[] = [];
    const capital = this.getTown(country.capitalTownId);
    ps.push(new TextStatusParameter('首都', capital.name));
    if (country.id > 0 &&
        country.lastMoneyIncomes !== undefined &&
        country.lastRiceIncomes !== undefined &&
        country.safeMoney !== undefined) {
      ps.push(new NoRangeStatusParameter('政策ポイント', country.policyPoint));
      ps.push(new NoRangeStatusParameter('金収入', country.lastMoneyIncomes));
      ps.push(new NoRangeStatusParameter('米収入', country.lastRiceIncomes));
      ps.push(new LargeTextStatusParameter('国庫残高', ValueUtil.getNumberWithUnit(country.safeMoney)));
    }
    Enumerable
      .from(this.store.alliances)
      .where((ca) => ca.insistedCountryId === country.id || ca.requestedCountryId === country.id)
      .forEach((ca) => {
        const status = Enumerable.from(def.COUNTRY_ALLIANCE_STATUSES).firstOrDefault((cat) => cat.id === ca.status);
        if (status) {
          const targetCountryId = ca.requestedCountryId === country.id ? ca.insistedCountryId : ca.requestedCountryId;
          const targetCountry = ArrayUtil.find(this.store.countries, targetCountryId);
          if (targetCountry) {
            const type = ca.status === api.CountryAlliance.statusAvailable ? 'succeed' :
              ca.status === api.CountryAlliance.statusInBreaking ? 'warning' :
              ca.status === api.CountryAlliance.statusBroken ? 'warning' :
              ca.status === api.CountryAlliance.statusRequesting ? 'primary' :
              'information';
            ps.push(new TextStatusParameter(status.name, targetCountry.name, type));
          }
        }
      });
    Enumerable
      .from(this.store.wars)
      .where((cw) => cw.insistedCountryId === country.id || cw.requestedCountryId === country.id)
      .forEach((cw) => {
        const status = Enumerable.from(def.COUNTRY_WAR_STATUSES).firstOrDefault((cwt) => cwt.id === cw.status);
        if (status) {
          const targetCountryId = cw.requestedCountryId === country.id ? cw.insistedCountryId : cw.requestedCountryId;
          const targetCountry = ArrayUtil.find(this.store.countries, targetCountryId);
          if (targetCountry) {
            const type = cw.status === api.CountryWar.statusAvailable ? 'danger' :
                        cw.status === api.CountryWar.statusInReady ? 'warning' :
                        cw.status === api.CountryWar.statusStopRequesting ? 'primary' :
                        'information';
            ps.push(new TextStatusParameter(status.name, targetCountry.name, type));
          }
        }
      });

    // 役職
    if (country.id > 0 && country.posts) {
      Enumerable.from(country.posts).orderBy((p) => p.type).forEach((p) => {
        const postType = Enumerable.from(def.COUNTRY_POSTS).firstOrDefault((cp) => cp.id === p.type);
        if (postType) {
          let characterName = '';
          if (!p.character) {
            const chara = ArrayUtil.find(this.store.characters, p.characterId);
            if (chara) {
              characterName = chara.name;
            }
          } else {
            characterName = p.character.name;
          }
          ps.push(new TextStatusParameter(postType.name, characterName));
        }
      });
    }

    return ps;
  }

  private getCountry(countryId: number): api.Country {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country) {
      return country;
    }
    return api.Country.default;
  }

  public updateCountryCharacters(countryId: number = this.country.id) {
    this.isUpdatingCountryCharacters = true;
    api.Api.getAllCharactersBelongsCountry(countryId)
      .then((characters) => {
        characters.forEach((c) => {
          if (c.commands) {
            c.commands.forEach((cc) => {
              this.commands.inputer.updateCommandName(cc);
            });
          }
        });
        this.countryCharacters = characters;
      })
      .catch(() => {
        NotificationService.getCountryCharactersFailed.notify();
      })
      .finally(() => {
        this.isUpdatingCountryCharacters = false;
      });
  }

  public updateCharacterCountryCharacters() {
    this.updateCountryCharacters(this.character.countryId);
  }

  private onCountryChanged() {
    this.countryChat.clear();
    api.Api.getCountryChatMessage()
      .then((messages) => {
        messages.forEach((message) => {
          this.countryChat.append(message);
        });
      })
      .catch(() => {
        NotificationService.getChatFailed.notify();
      });
    api.Api.getCountryBbsItems()
      .then((items) => {
        this.countryThreadBbs.reset(items);
      })
      .catch(() => {
        NotificationService.countryBbsLoadFailed.notify();
      });
    if (!this.character.countryId) {
      NotificationService.countryOverthrown.notify();
    } else {
      NotificationService.countryChanged.notify();
    }
  }

  // #endregion

  // #region CountryMessage

  private onCountryMessageReceived(message: api.CountryMessage) {
    if (message.type === api.CountryMessage.typeCommanders) {
      // 指令
      this.countryCommandersMessage = message;
      if (this.store.hasInitialized && message.writerCharacterName !== this.store.character.name) {
        NotificationService.countryCommandersMessageUpdated.notify();
      }
    } else if (message.type === api.CountryMessage.typeSolicitation &&
               message.countryId === this.store.character.countryId) {
      // 新規登録者勧誘文
      this.countrySolicitationMessage = message;
    } else if (message.type === api.CountryMessage.typeUnified &&
               message.countryId === this.store.character.countryId) {
      this.countryUnifiedMessage = message;
    }
  }

  public updateCountryCommandersMessage(message: string) {
    this.isUpdatingCountrySettings = true;
    api.Api.setCountryMessage(message, api.CountryMessage.typeCommanders)
      .then(() => {
        NotificationService.countryCommandersMessageSet.notify();
      })
      .catch(() => {
        NotificationService.countryCommandersMessageSetFailed.notify();
      })
      .finally(() => {
        this.isUpdatingCountrySettings = false;
      });
  }

  public updateCountryUnifiedMessage(message: string) {
    this.isUpdatingCountrySettings = true;
    api.Api.setCountryMessage(message, api.CountryMessage.typeUnified)
      .then(() => {
        NotificationService.countryUnifiedMessageUpdated.notify();
      })
      .catch(() => {
        NotificationService.countryUnifiedMessageUpdateFailed.notify();
      })
      .finally(() => {
        this.isUpdatingCountrySettings = false;
      });
  }

  public updateCountrySolicitationMessage(message: string) {
    this.isUpdatingCountrySettings = true;
    api.Api.setCountryMessage(message, api.CountryMessage.typeSolicitation)
      .then(() => {
        NotificationService.countrySolicitationMessageSet.notify();
      })
      .catch((ex) => {
        if (ex.data.code === api.ErrorCode.numberRangeError) {
          NotificationService.countrySolicitationMessageSetFailedBecauseTooLong
            .notifyWithParameter(ex.data.data.current, ex.data.data.max);
        } else {
          NotificationService.countrySolicitationMessageSetFailed.notify();
        }
      })
      .finally(() => {
        this.isUpdatingCountrySettings = false;
      });
  }

  // #endregion

  // #region CountryPost

  private updateCountryPost(post: api.CountryPost) {
    const country = ArrayUtil.find(this.countries, post.countryId);
    if (country) {
      if (!country.posts) {
        Vue.set(country, 'posts', []);
      }

      country.posts = Enumerable.from(country.posts)
        .where((p) => p.characterId !== post.characterId)
        .toArray();
      if (post.type !== 0) {
        // 任命
        ArrayUtil.addItemUniquely(country.posts, post, (p) => p.type);
      }

      if (this.country.id === country.id) {
        this.setCountry(country);
      }
    }

    if (post.countryId === this.character.countryId && post.characterId === this.character.id) {
      if (post.type !== 0) {
        // 自分が任命された
        const postType = Enumerable.from(def.COUNTRY_POSTS).firstOrDefault((p) => p.id === post.type);
        if (postType) {
          NotificationService.selfAppointed.notifyWithParameter(postType.name);
        }
      } else {
        // 自分が解任された
        NotificationService.selfDismissed.notify();
      }
    }
  }

  public setCountryPost(characterId: number, post: number) {
    const postType = Enumerable.from(def.COUNTRY_POSTS).firstOrDefault((p) => p.id === post);
    if (postType) {
      this.isAppointing = true;
      api.Api.setCountryPost(characterId, post)
        .then(() => {
          NotificationService.appointed.notifyWithParameter(postType.name);
        })
        .catch(() => {
          NotificationService.appointFailed.notifyWithParameter(postType.name);
        })
        .finally(() => {
          this.isAppointing = false;
        });
    }
  }

  public getPostName(post: number): string {
    return ValueUtil.getPostName(post);
  }

  // #endregion

  // #region CountryPermissions

  public get canAppoint(): boolean {
    // 自分が任命権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  public get canSafeOut(): boolean {
    // 自分が国庫搬出権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  public get canSecretary(): boolean {
    // 自分が政務官任命権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  public get canCommandComment(): boolean {
    // 自分がコマンドコメント権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  public get canSubBuilding(): boolean {
    // 自分が建築物権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2 ||
                                                          p.type === 3 || p.type === 9));
  }

  public get canDiplomacy(): boolean {
    // 自分が外交権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  public get canPolicy(): boolean {
    // 自分が政策権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  public get canCountrySetting(): boolean {
    // 自分が国の設定を行う権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2 || p.type === 3));
  }

  public get canCountrySettingExceptForCommands(): boolean {
    // 自分が国の設定を行う権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  public get canCountryUnifiedMessage(): boolean {
    // 自分が国の設定を行う権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && p.type === 1);
  }

  public get canRemoveAllCountryBbsItems(): boolean {
    // 自分が会議室の全書き込み削除権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  // #endregion

  // #region CountryDiplomacies

  private updateCountryAlliance(alliance: api.CountryAlliance) {
    this.updateCountryDiplomacies(alliance, this.store.alliances, (val) => this.store.alliances = val);

    // 自国に関係することなら通知する
    if (this.store.hasInitialized &&
        (alliance.requestedCountryId === this.character.countryId ||
         alliance.insistedCountryId === this.character.countryId)) {
      const targetCountry = alliance.requestedCountryId === this.character.countryId ?
        this.getCountry(alliance.insistedCountryId) : this.getCountry(alliance.requestedCountryId);
      if (alliance.status === api.CountryAlliance.statusAvailable) {
        NotificationService.allianceCompleted.notifyWithParameter(targetCountry.name);
      } else if (alliance.status === api.CountryAlliance.statusDismissed) {
        NotificationService.allianceRejected.notifyWithParameter(targetCountry.name);
      } else if (alliance.status === api.CountryAlliance.statusInBreaking) {
        NotificationService.allianceStartBreaking.notifyWithParameter(targetCountry.name);
      } else if (alliance.status === api.CountryAlliance.statusBroken) {
        NotificationService.allianceBroken.notifyWithParameter(targetCountry.name);
      }
    }
  }

  private updateCountryWar(war: api.CountryWar) {
    this.updateCountryDiplomacies(war, this.store.wars, (val) => this.store.wars = val);

    // 自国に関係することなら通知する
    if (this.store.hasInitialized &&
      (war.requestedCountryId === this.character.countryId ||
       war.insistedCountryId === this.character.countryId)) {
      const targetCountry = war.requestedCountryId === this.character.countryId ?
        this.getCountry(war.insistedCountryId) : this.getCountry(war.requestedCountryId);
      if (war.status === api.CountryWar.statusAvailable) {
        NotificationService.warStart.notifyWithParameter(targetCountry.name);
      } else if (war.status === api.CountryWar.statusInReady) {
        NotificationService.warInReady.notifyWithParameter(
          targetCountry.name,
          api.GameDateTime.toFormatedString(war.startGameDate));
      }
      this.commands.updateCommandListInformations();
    }
  }

  private updateTownWar(war: api.TownWar) {
    war.town = this.getTown(war.townId);
    this.updateCountryDiplomacies(war, this.store.townWars, (val) => this.store.townWars = val);

    // 自国に関係することなら通知する
    if (this.store.hasInitialized &&
      war.status === api.TownWar.statusInReady &&
      (war.requestedCountryId === this.character.countryId ||
       war.insistedCountryId === this.character.countryId)) {
      if (this.character.countryId === war.requestedCountryId) {
        NotificationService.townWarSentByMyCountry.notifyWithParameter(
          api.GameDateTime.toFormatedString(war.gameDate), war.town.name);
        this.commands.updateCommandListInformations();
      } else if (this.character.countryId === war.insistedCountryId) {
        NotificationService.townWarSentByOtherCountry.notifyWithParameter(
          api.GameDateTime.toFormatedString(war.gameDate),
          war.requestedCountry.name,
          war.town.name);
        this.commands.updateCommandListInformations();
      }
    }
  }

  private updateCountryDiplomacies<T extends api.CountryDipromacy>(
       diplomacy: T,
       items: T[],
       itemsSetter: (newItems: T[]) => void) {

    const newArray = items
        .filter((d) => !api.CountryDipromacy
                           .isEqualCountry(d, diplomacy.insistedCountryId, diplomacy.requestedCountryId));
    newArray.push(diplomacy);
    itemsSetter(newArray);
  }

  public setAlliance() {
    const countryA = this.country.id;
    const countryB = this.character.countryId;
    const status = this.newAllianceData.status;

    const old = Enumerable
      .from(this.store.alliances)
      .firstOrDefault((ca) => api.CountryDipromacy.isEqualCountry(ca, countryA, countryB));
    if (old && old.status === status) {
      NotificationService.allianceFailedBecauseSameStatus.notifyWithParameter(this.country.name);
      return;
    }

    const alliance = new api.CountryAlliance();
    alliance.status = status;
    alliance.requestedCountryId = countryB;
    alliance.insistedCountryId = countryA;
    if (!old ||
      old.status === api.CountryAlliance.statusNone ||
      old.status === api.CountryAlliance.statusBroken ||
      old.status === api.CountryAlliance.statusDismissed) {
      alliance.breakingDelay = this.newAllianceData.breakingDelay;
      alliance.isPublic = this.newAllianceData.isPublic;
    } else {
      alliance.breakingDelay = old.breakingDelay;
      alliance.isPublic = old.isPublic;
    }

    this.isSendingAlliance = true;
    api.Api.setCountryAlliance(alliance)
      .then(() => {
        NotificationService.allianced.notify();
      })
      .catch((ex) => {
        NotificationService.allianceFailed.notify();
      })
      .finally(() => {
        this.isSendingAlliance = false;
      });
  }

  public setWar() {
    const countryA = this.country.id;
    const countryB = this.character.countryId;
    const status = this.newWarData.status;

    const old = Enumerable
      .from(this.store.wars)
      .firstOrDefault((ca) => api.CountryDipromacy.isEqualCountry(ca, countryA, countryB));
    if (old && old.status === status) {
      NotificationService.warFailedBecauseSameStatus.notifyWithParameter(this.country.name);
      return;
    }

    const war = new api.CountryWar();
    war.status = status;
    war.requestedCountryId = countryB;
    war.insistedCountryId = countryA;
    if (!old || old.status === api.CountryWar.statusStoped) {
      war.startGameDate = this.newWarData.startGameDate;
    } else {
      war.startGameDate = old.startGameDate;
    }

    this.isSendingWar = true;
    api.Api.setCountryWar(war)
      .then(() => {
        NotificationService.warSent.notify();
      })
      .catch((ex) => {
        NotificationService.warFailed.notify();
      })
      .finally(() => {
        this.isSendingWar = false;
      });
  }

  public setTownWar() {
    this.isSendingTownWar = true;
    api.Api.setTownWar(this.town.id)
      .then(() => {
        NotificationService.townWarSent.notifyWithParameter(
          api.GameDateTime.toFormatedString(api.GameDateTime.nextMonth(this.gameDate)),
          this.town.name);
      })
      .catch(() => {
        NotificationService.townWarFailed.notifyWithParameter(this.town.name);
      })
      .finally(() => {
        this.isSendingTownWar = false;
      });
  }

  private onReinforcementReceived(reinforcement: api.Reinforcement) {
    if (reinforcement.characterId === this.store.character.id) {
      ArrayUtil.addItemUniquely(this.store.reinforcements,
                                reinforcement,
                                (r) => r.characterId + '-' + r.requestedCountryId);
      if (this.store.hasInitialized) {
        if (reinforcement.status === api.Reinforcement.statusRequesting) {
          NotificationService.reinforcementRequested.notifyWithParameter(
            this.getCountry(reinforcement.requestedCountryId).name);
        } else if (reinforcement.status === api.Reinforcement.statusRequestCanceled) {
          NotificationService.reinforcementCanceled.notifyWithParameter(
            this.getCountry(reinforcement.requestedCountryId).name);
        }
      }
    } else if (this.country.id === reinforcement.characterCountryId ||
               this.country.id === reinforcement.requestedCountryId) {
      const countryCharacter = Enumerable
        .from(this.countryCharacters)
        .firstOrDefault((c) => c.id === reinforcement.characterId);
      if (countryCharacter) {
        countryCharacter.reinforcement = reinforcement;
      }
    }
  }

  public setReinforcementStatus(character: api.Character, status: number, targetCountry?: number) {
    if (this.isUpdatingCountryCharacters || this.isUpdatingReinforcement) {
      return;
    }
    if (status === api.Reinforcement.statusRequesting) {
      this.isUpdatingCountryCharacters = true;
      api.Api.setReinforcementStatus(status, character.id, this.store.country.id)
        .then(() => {
          NotificationService.requestReinforcementSucceed.notifyWithParameter(character.name);
        })
        .catch(() => {
          NotificationService.requestReinforcementFailed.notify();
        })
        .finally(() => {
          this.isUpdatingCountryCharacters = false;
        });
    } else if (status === api.Reinforcement.statusRequestCanceled) {
      this.isUpdatingCountryCharacters = true;
      api.Api.setReinforcementStatus(status, character.id, this.store.country.id)
        .then(() => {
          NotificationService.cancelReinforcementSucceed.notifyWithParameter(character.name);
        })
        .catch(() => {
          NotificationService.cancelReinforcementFailed.notify();
        })
        .finally(() => {
          this.isUpdatingCountryCharacters = false;
        });
    } else if (status === api.Reinforcement.statusRequestDismissed && targetCountry) {
      this.isUpdatingReinforcement = true;
      api.Api.setReinforcementStatus(status, character.id, targetCountry)
        .then(() => {
          NotificationService.dismissReinforcementSucceed
            .notifyWithParameter(this.getCountry(targetCountry).name);
        })
        .catch(() => {
          NotificationService.dismissReinforcementFailed.notify();
        })
        .finally(() => {
          this.isUpdatingReinforcement = false;
        });
    } else if (status === api.Reinforcement.statusActive && targetCountry) {
      this.isUpdatingReinforcement = true;
      api.Api.setReinforcementStatus(status, character.id, targetCountry)
        .then(() => {
          NotificationService.applyReinforcementSucceed
            .notifyWithParameter(this.getCountry(targetCountry).name);
        })
        .catch(() => {
          NotificationService.applyReinforcementFailed.notify();
        })
        .finally(() => {
          this.isUpdatingReinforcement = false;
        });
    } else if (status === api.Reinforcement.statusReturned) {
      this.isUpdatingReinforcement = true;
      api.Api.setReinforcementStatus(status, character.id, this.character.countryId)
        .then(() => {
          NotificationService.returnReinforcementSucceed.notify();
        })
        .catch(() => {
          NotificationService.returnReinforcementFailed.notify();
        })
        .finally(() => {
          this.isUpdatingReinforcement = false;
        });
    } else if (status === api.Reinforcement.statusSubmited) {
      this.isUpdatingReinforcement = true;
      api.Api.setReinforcementStatus(status, character.id, this.character.countryId)
        .then(() => {
          NotificationService.submitReinforcementSucceed.notifyWithParameter(this.characterCountry.name);
        })
        .catch(() => {
          NotificationService.submitReinforcementFailed.notify();
        })
        .finally(() => {
          this.isUpdatingReinforcement = false;
        });
    }
  }

  // #endregion

  // #region CountryPolicies

  private onCountryPolicyReceived(policy: api.CountryPolicy) {
    ArrayUtil.addItemUniquely(this.store.policies, policy, (p) => '' + p.countryId + ',' + p.type);

    if (this.store.hasInitialized && policy.countryId === this.character.countryId) {
      const info = Enumerable.from(def.COUNTRY_POLICY_TYPES).firstOrDefault((p) => p.id === policy.type);
      if (info) {
        if (policy.status === api.CountryPolicy.statusAvailable) {
          NotificationService.policyAdded.notifyWithParameter(info.name);
        } else if (policy.status === api.CountryPolicy.statusBoosted) {
          NotificationService.policyBoosted.notifyWithParameter(info.name);
        }
      }
    }
  }

  public addPolicy(policy: number) {
    const info = Enumerable.from(def.COUNTRY_POLICY_TYPES).firstOrDefault((p) => p.id === policy);
    if (!info) {
      NotificationService.addPolicyFailed.notifyWithParameter('(名称不明)');
      return;
    }

    this.isUpdatingPolicies = true;
    api.Api.addCountryPolicy(policy)
      .then(() => {
        NotificationService.addPolicy.notifyWithParameter(info.name);
      })
      .catch((ex) => {
        if (ex.data.code === api.ErrorCode.meaninglessOperationError) {
          NotificationService.addPolicyFailedBecauseOfDuplicate.notifyWithParameter(info.name);
        } else if (ex.data.code === api.ErrorCode.invalidOperationError) {
          NotificationService.addPolicyFailedBecauseOfLackOfPoints.notifyWithParameter(info.name);
        } else {
          NotificationService.addPolicyFailed.notifyWithParameter(info.name);
        }
      })
      .finally(() => {
        this.isUpdatingPolicies = false;
      });
  }

  // #endregion

  // #region Character

  private initializeCharacter(character: api.Character) {
    this.store.character = character;

    // アイコンを初期化
    api.Api.getAllIcons()
      .then((icons) => {
        ArrayUtil.replace(this.characterIcons, icons);

        const storeCharacter = ArrayUtil.find(this.store.characters, character.id);
        if (storeCharacter) {
          storeCharacter.mainIcon = api.CharacterIcon.getMainOrFirst(icons);
        }
      })
      .catch(() => {
        NotificationService.getIconsFailed.notify();
      });
  }

  private updateCharacter(character: api.Character) {
    if (character.id <= 0) {
      return;
    }

    if (!character.hasRemoved) {
      ArrayUtil.addItem(this.store.characters, character);
    } else {
      this.store.characters = this.store.characters.filter((c) => c.id !== character.id);
      this.store.defenders = this.store.defenders.filter((c) => c.characterId !== character.id);
    }
    this.store.characters = this.store.characters.filter((c) => c.id >= 0);

    if (this.character.id <= 0) {
      this.initializeCharacter(character);
    } else if (character.id !== this.character.id) {
      this.setTown(this.store.town);
      return;
    } else {
      if (this.character.countryId !== character.countryId) {
        this.store.character = character;
        this.onCountryChanged();
      } else {
        this.store.character = character;
      }
    }

    character.mainIcon = api.CharacterIcon.getMainOrFirst(this.characterIcons);
    this.characterParameters = this.getCharacterParameters(character);

    // 現在表示中の都市が設定されていなければ、現在の武将の都市を設定
    if (this.town.id < 0) {
      const currentTown = ArrayUtil.find(this.towns, character.townId);
      if (currentTown) {
        this.store.town = currentTown;
      }
    }
  }

  public updatePrivateMessage(message: string) {
    this.isUpdatingPrivateSettings = true;
    api.Api.setPrivateMessage(message)
      .then(() => {
        NotificationService.privateMessageUpdated.notify();
      })
      .catch((ex) => {
        if (ex.data) {
          if (ex.data.code === api.ErrorCode.numberRangeError) {
            NotificationService.privateMessageUpdateFailedBecauseTooLong
              .notifyWithParameter(ex.data.data.current, ex.data.data.max);
          } else {
            NotificationService.privateMessageUpdateFailed.notify();
          }
        } else {
          NotificationService.privateMessageUpdateFailed.notify();
        }
      })
      .finally(() => {
        this.isUpdatingPrivateSettings = false;
      });
  }

  private getCharacterParameters(character: api.Character): StatusParameter[] {
    const country = this.getCountry(character.countryId);
    const ps: StatusParameter[] = [];
    ps.push(new TextStatusParameter('国', country.name));
    ps.push(new TwinNoRangeAndRangedStatusParameter('武力', character.strong, 'EX', character.strongEx, 1000));
    ps.push(new TwinNoRangeAndRangedStatusParameter('知力', character.intellect, 'EX', character.intellectEx, 1000));
    ps.push(new TwinNoRangeAndRangedStatusParameter('統率', character.leadership, 'EX', character.leadershipEx, 1000));
    ps.push(new TwinNoRangeAndRangedStatusParameter('人望', character.popularity, 'EX', character.popularityEx, 1000));
    ps.push(new NoRangeStatusParameter('金', character.money));
    ps.push(new NoRangeStatusParameter('米', character.rice));
    ps.push(new NoRangeStatusParameter('貢献', character.contribution));
    ps.push(new NoRangeStatusParameter('階級値', character.classValue));
    ps.push(new TextStatusParameter('階級', api.Character.getClassName(character)));
    if (character.soldierType !== 15) {
      const soldierType = Enumerable.from(def.SOLDIER_TYPES).firstOrDefault((st) => st.id === character.soldierType);
      if (soldierType) {
        ps.push(new TextStatusParameter('兵種', soldierType.name));
      } else {
        ps.push(new TextStatusParameter('兵種', def.SOLDIER_TYPES[0].name));
      }
    } else {
      const soldierType = Enumerable
        .from(this.store.soldierTypes)
        .firstOrDefault((st) => st.id === character.characterSoldierTypeId);
      if (soldierType) {
        ps.push(new TextStatusParameter('兵種', soldierType.name));
      } else {
        ps.push(new TextStatusParameter('兵種', def.SOLDIER_TYPES[0].name));
      }
    }
    ps.push(new RangedStatusParameter('兵士小隊', character.soldierNumber, character.leadership));
    ps.push(new RangedStatusParameter('訓練', character.proficiency, 100));
    const formation = Enumerable.from(def.FORMATION_TYPES).firstOrDefault((f) => f.id === character.formationType);
    let formationData = Enumerable
      .from(this.store.formations).firstOrDefault((f) => f.type === character.formationType);
    if (!formationData) {
      formationData = new api.Formation(-1, character.id, character.formationType, 1, 0);
    }
    if (formation) {
      ps.push(new TextStatusParameter('陣形', formation.name));
      if (formationData.level <= formation.nextLevel.length) {
        ps.push(new TwinNoRangeAndRangedStatusParameter('陣形レベル', formationData.level,
          'EX', formationData.experience, formation.nextLevel[formationData.level - 1]));
      } else {
        ps.push(new NoRangeStatusParameter('陣形レベル', formationData.level));
      }
    }
    ps.push(new NoRangeStatusParameter('陣形ポイント', character.formationPoint));
    ps.push(new NoRangeStatusParameter('技能ポイント', character.skillPoint));
    ps.push(new RangedStatusParameter(
      'アイテム',
      Enumerable.from(this.characterItems)
        .where((i) => i.status === api.CharacterItem.statusCharacterHold)
        .count((i) => {
          const info = Enumerable.from(def.CHARACTER_ITEM_TYPES).firstOrDefault((ii) => ii.id === i.type);
          if (info) {
            return !info.isResource;
          }
          return true;
        }),
      this.characterItemsMax));
    ps.push(new NoRangeStatusParameter(
      '保留中アイテム',
      Enumerable.from(this.characterItems).count((i) => i.status === api.CharacterItem.statusCharacterPending)));
    return ps;
  }

  public updateOppositionCharacters() {
    if (!this.isUpdatingOppositionCharacters) {
      this.isUpdatingOppositionCharacters = true;
      api.Api.getAllCharactersBelongsCountry(0)
        .then((charas) => {
          this.oppositionCharacters = charas;
        })
        .catch(() => {
          NotificationService.getCountryCharactersFailed.notify();
        })
        .finally(() => {
          this.isUpdatingOppositionCharacters = false;
        });
    }
  }

  // #endregion

  // #region CharacterIcon

  public addCharacterIcon(icon: api.CharacterIcon) {
    if (this.isUpdatingPrivateSettings) {
      return;
    }
    this.isUpdatingPrivateSettings = true;
    api.Api.addCharacterIcon(icon.type, icon.fileName, icon.file)
      .then((i) => {
        if (icon.isAvailable) {
          ArrayUtil.addItem(this.characterIcons, i);
        }
        NotificationService.addedIcon.notify();
      })
      .catch(() => {
        NotificationService.addIconFailed.notify();
      })
      .finally(() => {
        this.isUpdatingPrivateSettings = false;
      });
  }

  public setMainCharacterIcon(iconId: number) {
    if (this.isUpdatingPrivateSettings) {
      return;
    }
    this.isUpdatingPrivateSettings = true;
    api.Api.setMainCharacterIcon(iconId)
      .then(() => {
        this.characterIcons.forEach((i) => {
          if (i.id !== iconId) {
            i.isMain = false;
          } else {
            i.isMain = true;
          }
        });
        NotificationService.setMainIcon.notify();
      })
      .catch(() => {
        NotificationService.setMainIconFailed.notify();
      })
      .finally(() => {
        this.isUpdatingPrivateSettings = false;
      });
  }

  public deleteCharacterIcon(iconId: number) {
    if (this.isUpdatingPrivateSettings) {
      return;
    }
    this.isUpdatingPrivateSettings = true;
    api.Api.deleteCharacterIcon(iconId)
      .then(() => {
        this.characterIcons = Enumerable.from(this.characterIcons).where((c) => c.id !== iconId).toArray();
        NotificationService.deletedIcon.notify();
      })
      .catch(() => {
        NotificationService.deleteIconFailed.notify();
      })
      .finally(() => {
        this.isUpdatingPrivateSettings = false;
      });
  }

  // #endregion

  // #region CharacterSoldierType

  public soldierTypes = new SoldierTypeModel(this.store);

  // #endregion

  // #region Formation

  private onFormationReceived(formation: api.Formation) {
    ArrayUtil.addItemUniquely(this.store.formations, formation, (f) => f.type);

    if (formation.type === this.character.formationType) {
      this.updateCharacter(this.character);
    }
  }

  public changeFormation(formation: number) {
    if (formation === this.character.formationType ||
        !Enumerable.from(this.store.formations).any((f) => f.type === formation)) {
      return;
    }

    const info = Enumerable.from(def.FORMATION_TYPES).firstOrDefault((f) => f.id === formation);
    if (!info) {
      return;
    }

    this.isUpdatingFormations = true;
    api.Api.changeFormation(formation)
      .then(() => {
        NotificationService.formationChanged.notifyWithParameter(info.name);
      })
      .catch(() => {
        NotificationService.formationChangeFailed.notifyWithParameter(info.name);
      })
      .finally(() => {
        this.isUpdatingFormations = false;
      });
  }

  // #endregion

  // #region CharacterItem

  private itemNotificationLock: number = 0;

  private onCharacterItemReceived(item: api.CharacterItem) {
    const info = Enumerable.from(def.CHARACTER_ITEM_TYPES).firstOrDefault((i) => i.id === item.type);
    const old = ArrayUtil.find(this.store.items, item.id);
    if (old && this.store.hasInitialized &&
      old.status === api.CharacterItem.statusCharacterHold && old.characterId === this.character.id &&
      (item.status !== api.CharacterItem.statusCharacterHold || item.characterId !== this.character.id)) {
      if (info) {
        NotificationService.itemReleased.notifyWithParameter(info.name);
        this.updateCharacter(this.character);
      }
    }

    ArrayUtil.addItem(this.store.items, item);

    if (this.store.hasInitialized && item.characterId === this.character.id && info) {
      if (!this.isUpdatingItems && this.itemNotificationLock <= 0) {
        if (item.status === api.CharacterItem.statusCharacterHold &&
          (!old || old.status !== item.status)) {
          NotificationService.itemGot.notifyWithParameter(info.name);
          this.updateCharacter(this.character);
        } else if (item.status === api.CharacterItem.statusCharacterPending &&
          (!old || old.status !== item.status)) {
          NotificationService.itemPending.notifyWithParameter(info.name);
        }
      } else {
        this.itemNotificationLock--;
      }
    }
  }

  public addCharacterItem(item: number, itemId: number, status: number) {
    if (!this.isUpdatingItems) {
      this.isUpdatingItems = true;
      this.itemNotificationLock++;
      api.Api.addCharacterItem(item, itemId, status)
        .then(() => {
          if (status === api.CharacterItem.statusCharacterHold) {
            NotificationService.itemGotByPending.notify();
          } else {
            NotificationService.itemReleasedByPending.notify();
          }
        })
        .catch((ex) => {
          if (ex.data.code === api.ErrorCode.notMoreItemsError) {
            NotificationService.itemGetFailedByPendingBecauseOfMax.notify();
          } else {
            NotificationService.itemGetFailedByPending.notify();
          }
          this.itemNotificationLock--;
        })
        .finally(() => {
          this.isUpdatingItems = false;
        });
    }
  }

  // #endregion

  // #region CharacterSkill

  private onCharacterSkillReceived(item: api.CharacterSkill) {
    const info = Enumerable.from(def.CHARACTER_SKILL_TYPES).firstOrDefault((i) => i.id === item.type);
    ArrayUtil.addItem(this.store.skills, item);

    if (this.store.hasInitialized &&
        item.status === api.CharacterSkill.statusAvailable &&
        item.characterId === this.character.id) {
      if (info) {
        NotificationService.skillGot.notifyWithParameter(info.name);
      }
    }
  }

  public addSkill(skill: number) {
    if (!this.isUpdatingSkills) {
      this.isUpdatingSkills = true;
      api.Api.addSkill(skill)
        .then(() => {
          NotificationService.skillGetSucceed.notify();
        })
        .catch(() => {
          NotificationService.skillGetFailed.notify();
        })
        .finally(() => {
          this.isUpdatingSkills = false;
        });
    }
  }

  // #endregion

  // #region Command

  public commands: CommandList = new CommandList(this.store);

  public get isCommandInputing(): boolean {
    return this.commands.inputer.isInputing;
  }

  private onCommandCommentReceived(item: api.CommandComment) {
    ArrayUtil.addItemUniquely(this.store.commandComments, item, (obj) => api.GameDateTime.toNumber(obj.gameDate));
  }

  // #endregion

  // #region Unit

  public unitModel = new UnitModel(this.store);

  // #endregion

  // #region Logs

  private addMapLog(log: api.MapLog) {
    ArrayUtil.addLog(this.mapLogs, log);
  }

  public loadOldMapLogs() {
    if (this.isLoadingMoreMapLogs || this.hasLoadAllMapLogs) {
      return;
    }
    this.isLoadingMoreMapLogs = true;
    api.Api.getMapLog(this.mapLogs[this.mapLogs.length - 1].id, 50)
      .then((logs) => {
        if (logs.length > 0) {
          Enumerable.from(logs).reverse().forEach((log) => {
            ArrayUtil.addItem(this.mapLogs, log);
          });
        } else {
          this.hasLoadAllMapLogs = true;
        }
      })
      .catch(() => {
        NotificationService.loadMapLogFailed.notify();
      })
      .finally(() => {
        this.isLoadingMoreMapLogs = false;
      });
  }

  private addCharacterLog(log: api.CharacterLog) {
    ArrayUtil.addLog(this.characterLogs, log);
  }

  public loadOldCharacterLogs() {
    if (this.isLoadingMoreCharacterLogs || this.hasLoadAllCharacterLogs) {
      return;
    }
    this.isLoadingMoreCharacterLogs = true;
    api.Api.getCharacterLog(this.characterLogs[this.characterLogs.length - 1].id, 50)
      .then((logs) => {
        if (logs.length > 0) {
          Enumerable.from(logs).reverse().forEach((log) => {
            ArrayUtil.addItem(this.characterLogs, log);
          });
        } else {
          this.hasLoadAllCharacterLogs = true;
        }
      })
      .catch(() => {
        NotificationService.loadCharacterLogFailed.notify();
      })
      .finally(() => {
        this.isLoadingMoreCharacterLogs = false;
      });
  }

  // #endregion

  // #region ChatMessage

  public countryChat: ChatMessageContainer<api.Country>
    = new ChatMessageContainer(
      this.store,
      (mes, icon, sendTo) => {
        if (!icon) {
          icon = this.characterIcon;
        }
        if (sendTo) {
          return api.Api.postOtherCountryChatMessage(mes, icon, sendTo);
        } else {
          return api.Api.postCountryChatMessage(mes, icon);
        }},
      (id) => api.Api.getCountryChatMessage(id, 50));

  public globalChat: ChatMessageContainer<any>
    = new ChatMessageContainer(
      this.store,
      (mes, icon) => api.Api.postGlobalChatMessage(mes, icon || this.characterIcon, 0),
      (id) => api.Api.getGlobalChatMessage(id, 50, 0));

  public global2Chat: ChatMessageContainer<any>
    = new ChatMessageContainer(
      this.store,
      (mes, icon) => api.Api.postGlobalChatMessage(mes, icon || this.characterIcon, 1),
      (id) => api.Api.getGlobalChatMessage(id, 50, 1));

  public privateChat: ChatMessageContainer<api.Character>
    = new ChatMessageContainer(
      this.store,
      (mes, icon, sendTo) => {
        if (!icon) {
          icon = this.characterIcon;
        }
        if (sendTo) {
          return api.Api.postPrivateChatMessage(mes, icon, sendTo);
        } else {
          throw new Error();
        }},
      (id) => api.Api.getPrivateChatMessage(id, 50), true);

  public promotions: ChatMessageContainer<any>
    = new ChatMessageContainer(
      this.store,
      () => { throw new Error(); },
      async () => [], true);

  private onReceiveChatMessage(message: api.ChatMessage) {
    if (message.type === api.ChatMessage.typeSelfCountry ||
        message.type === api.ChatMessage.typeOtherCountry) {
      // 自国宛
      this.countryChat.append(message);
    } else if (message.type === api.ChatMessage.typeGlobal) {
      // 全国宛
      if (message.typeData === 0) {
        this.globalChat.append(message);
      } else if (message.typeData === 1) {
        this.global2Chat.append(message);
      }
    } else if (message.type === api.ChatMessage.typePrivate) {
      // 個宛
      this.privateChat.append(message);
      if (message.character && message.character.id !== this.character.id && this.store.hasInitialized) {
        NotificationService.chatPrivateReceived.notifyWithParameter(message.character.name);
      }
    } else if (message.type === api.ChatMessage.typePromotion ||
               message.type === api.ChatMessage.typePromotionAccepted ||
               message.type === api.ChatMessage.typePromotionRefused ||
               message.type === api.ChatMessage.typePromotionDenied) {
      // 登用
      this.promotions.append(message);
      if (this.store.hasInitialized) {
        if (message.type === api.ChatMessage.typePromotion &&
          message.character &&
          message.character.id !== this.character.id) {
          NotificationService.promotionReceived.notifyWithParameter(message.character.name);
        } else if (message.character && message.character.id === this.character.id) {
          if (message.type === api.ChatMessage.typePromotionAccepted) {
            NotificationService.myPromotionAccepted.notifyWithParameter(message.receiverName);
          } else if (message.type === api.ChatMessage.typePromotionRefused) {
            NotificationService.myPromotionRefused.notifyWithParameter(message.receiverName);
          }
        }
      }
    }
  }

  // #endregion

  // #region ThreadBbs

  public countryThreadBbs = new ThreadBbs();
  public globalThreadBbs = new ThreadBbs();

  private onBbsItemReceived(item: api.ThreadBbsItem) {
    if (item.type === api.ThreadBbsItem.typeCountryBbs) {
      this.countryThreadBbs.onItemReceived(item);
    } else if (item.type === api.ThreadBbsItem.typeGlobalBbs) {
      this.globalThreadBbs.onItemReceived(item);
    }
  }

  // #endregion

  // #region Online

  public onlines = new OnlineModel();

  public logout() {
    api.Api.logout();
    current.setAuthorizationToken(new api.AuthenticationData('', 0, new api.DateTime()));
  }

  // #endregion
}

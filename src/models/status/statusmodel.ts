/* tslint:disable:member-ordering */

import ArrayUtil from '@/models/common/arrayutil';
import CancellableAsyncStack from '@/models/common/cancellableasyncstack';
import Streaming from '@/api/streaming';
import ApiStreaming from '@/api/apistreaming';
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
import ChatMessageContainer from '@/models/status/chatmessagecontainer';
import CommandList from '@/models/status/commandlist';
import Vue from 'vue';
import NotificationService from '@/services/notificationservice';
import ThreadBbs from './threadbbs';

export default class StatusModel {
  public hasInitialized: boolean = false;

  public gameDate: api.GameDateTime = new api.GameDateTime();
  public countries: api.Country[] = [];
  public country: api.Country = api.Country.default;  // 自分の所属しない国が入る場合がある
  public countryParameters: StatusParameter[] = [];
  public towns: api.TownBase[] = [];
  public scoutedTowns: api.ScoutedTown[] = [];
  public town: api.TownBase = new api.Town(-1);           // 自分の所在しない都市が入る場合がある
  public townParameters: StatusParameter[] = [];
  public character: api.Character = new api.Character(-1);  // 常に自分が入る
  public characterParameters: StatusParameter[] = [];
  public characterIcons: api.CharacterIcon[] = [];
  public mapLogs: api.MapLog[] = [];
  public characterLogs: api.CharacterLog[] = [];
  public townCharacters: api.Character[] = [];
  public townDefenders: api.Character[] = [];
  public countryCharacters: api.Character[] = [];
  public units: api.Unit[] = [];
  public leaderUnit: api.Unit = new api.Unit(-1);

  public allianceBreakingDelay: number = 0;
  public allianceIsPublic: boolean = false;
  public warStartDate: api.GameDateTime = new api.GameDateTime();

  private townCharacterLoadTask: CancellableAsyncStack<any> = new CancellableAsyncStack<any>();
  private townDefenderLoadTask: CancellableAsyncStack<any> = new CancellableAsyncStack<any>();

  public get isLoading(): boolean {
    return this.isCommandInputing || this.isPostingChat || this.isUpdatingTownCharacters
      || this.isUpdatingTownDefenders || this.isUpdatingCountryCharacters || this.isScouting
      || this.isAppointing || this.isSendingAlliance || this.isSendingWar || this.isUpdatingUnit
      || this.isLoadingMoreMapLogs || this.countryChat.isLoading || this.globalChat.isLoading
      || this.privateChat.isLoading;
  }
  public isUpdatingTownCharacters: boolean = false;
  public isUpdatingTownDefenders: boolean = false;
  public isUpdatingCountryCharacters: boolean = false;
  public isScouting: boolean = false;
  public isAppointing: boolean = false;
  public isSendingAlliance: boolean = false;
  public isSendingWar: boolean = false;
  public isUpdatingUnit: boolean = false;
  public isLoadingMoreMapLogs: boolean = false;
  public hasLoadAllMapLogs: boolean = false;

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

  public get characterDeleteTurn(): number {
    // 放置削除ターン
    return def.CHARACTER_DELETE_TURN - this.character.deleteTurn;
  }

  public get isShowDeleteTurn(): boolean {
    return this.character.deleteTurn > 0 && def.UPDATE_START_YEAR <= this.gameDate.year;
  }

  public get countryColor(): number {
    // 選択中の国の国色
    return this.getCountry(this.country.id).colorId;
  }

  public get townCountryColor(): number {
    // 選択中の都市の国色
    return this.getCountry(this.town.countryId).colorId;
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

  public get countryAlliance(): api.CountryAlliance | undefined {
    // 現在選択中の国と自分の国の同盟
    return Enumerable
      .from(this.country.alliances)
      .firstOrDefault((ca) => api.CountryDipromacy.isEqualCountry(ca, this.country.id, this.character.countryId));
  }

  public get countryWar(): api.CountryWar | undefined {
    // 現在選択中の国と自分の国の戦争
    return Enumerable
      .from(this.country.wars)
      .firstOrDefault((ca) => api.CountryDipromacy.isEqualCountry(ca, this.country.id, this.character.countryId));
  }

  public get countryAllianceStatus(): def.CountryAllianceStatus {
    // 自分の国との同盟関係
    let status = 0;
    const myCountry = this.getCountry(this.character.countryId);
    if (myCountry.id === this.country.id) {
      status = -1;
    } else if (this.country.alliances) {
      const alliance = Enumerable
        .from(this.country.alliances)
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
    } else if (this.country.wars) {
      const war = Enumerable
        .from(this.country.wars)
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

  public unitMemberCharacters(unit: api.Unit): api.Character[] {
    // 部隊のメンバの武将リスト
    return Enumerable.from(unit.members)
      .select((um) => um.character)
      .toArray();
  }

  // #endregion

  // #region Streaming

  public onCreate() {
    ApiStreaming.status.clearEvents();
    ApiStreaming.status.on<api.GameDateTime>(
      api.GameDateTime.typeId,
      (obj) => this.updateGameDate(obj));
    ApiStreaming.status.on<api.Town>(
      api.Town.typeId,
      (obj) => this.updateTown(obj));
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
      (obj) => this.countryThreadBbs.onItemReceived(obj));
    ApiStreaming.status.start();
  }

  public onDestroy() {
    ApiStreaming.status.stop();
    this.commands.dispose();
  }

  // #endregion

  // #region ApiSignal

  private onReceiveSignal(signal: api.ApiSignal) {
    if (signal.type === 1) {
      // 武将が更新された
      const data = signal.data as { gameDate: api.GameDateTime, secondsNextCommand: number };
      this.commands.onExecutedCommand(data.gameDate, this.character.lastUpdated, data.secondsNextCommand);
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
      this.hasInitialized = true;
      this.countryThreadBbs.sortThreads();
    } else if (signal.type === 5) {
      // 部隊が解散された
      NotificationService.belongsUnitRemoved.notify();
    } else if (signal.type === 6) {
      // 部隊が集合された
      NotificationService.belongsUnitGathered.notify();
    } else if (signal.type === 7) {
      // リセットされた
      location.reload();
    }
  }

  // #endregion

  // #region GameDate

  private initializeGameDate(date: api.GameDateTime) {
    this.gameDate = date;
    this.warStartDate = date;
    this.commands.preInitialize(date);
  }

  private updateGameDate(date: api.GameDateTime) {
    if (api.GameDateTime.toNumber(this.gameDate) === -1) {
      this.initializeGameDate(date);
    } else {
      this.gameDate = date;
    }
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
    this.town = town;
    this.townParameters = this.getTownParameters(town);
    Vue.set(this.town, 'scoutedGameDateTime', (this.town as any).scoutedGameDateTime);
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
      ps.push(new RangedStatusParameter('守兵', town.wallguard, town.wallguardMax));
    }
    if (town.id === this.character.townId || town.countryId === this.character.countryId) {
      const countParam = new NoRangeDelayStatusParameter('滞在');
      const defParam = new NoRangeDelayStatusParameter('守備');
      ps.push(countParam);
      ps.push(defParam);

      this.townCharacterLoadTask.then = (charas) => {
        countParam.value = charas.length;
        countParam.isLoading = false;
      };
      this.townCharacterLoadTask.push(async () => {
        return api.Api.getAllCharactersAtTown(town.id);
      });
      this.townDefenderLoadTask.then = (defenders) => {
        defParam.value = defenders.length;
        defParam.isLoading = false;
      };
      this.townDefenderLoadTask.push(async () => {
        return api.Api.getAllDefendersAtTown(town.id);
      });
    } else if (isScouted) {
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
        this.townCharacters = characters;
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
        this.townDefenders = characters;
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

  // #endregion

  // #region Country

  private updateCountry(country: api.Country) {

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
      }

      // 同盟データがｒｙ
      if (!country.alliances || country.alliances.length === 0) {
        country.alliances = old.alliances;
      }
      if (!country.wars || country.wars.length === 0) {
        country.wars = old.wars;
      }
    }

    // APIから入ってこない可能性のあるデータを、空の配列で埋める
    if (country.posts === undefined) {
      country.posts = [];
    }
    if (country.alliances === undefined) {
      country.alliances = [];
    }
    if (country.wars === undefined) {
      country.wars = [];
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

    if ((this.country.id < 0 && country.id === this.character.countryId) || country.id === this.country.id) {
      this.setCountry(country);
    }
  }

  private setCountry(country: api.Country) {
    this.country = country;
    this.countryParameters = this.getCountryParameters(country);
  }

  private getCountryParameters(country: api.Country): StatusParameter[] {
    const ps: StatusParameter[] = [];
    const capital = this.getTown(country.capitalTownId);
    ps.push(new TextStatusParameter('国名', country.name));
    ps.push(new TextStatusParameter('首都', capital.name));
    if (country.id > 0 && country.lastMoneyIncomes !== undefined && country.lastRiceIncomes !== undefined) {
      ps.push(new NoRangeStatusParameter('金収入', country.lastMoneyIncomes));
      ps.push(new NoRangeStatusParameter('米収入', country.lastRiceIncomes));
    }
    if (country.alliances) {
      country.alliances.forEach((ca, index) => {
        const status = Enumerable.from(def.COUNTRY_ALLIANCE_STATUSES).firstOrDefault((cat) => cat.id === ca.status);
        if (status) {
          const targetCountry = ca.requestedCountryId === country.id ? ca.insistedCountry : ca.requestedCountry;
          ps.push(new TextStatusParameter(index + '-' + status.name, targetCountry.name));
        }
      });
    }
    if (country.wars) {
      country.wars.forEach((cw, index) => {
        const status = Enumerable.from(def.COUNTRY_WAR_STATUSES).firstOrDefault((cwt) => cwt.id === cw.status);
        if (status) {
          const targetCountry = cw.requestedCountryId === country.id ? cw.insistedCountry : cw.requestedCountry;
          ps.push(new TextStatusParameter(index + '-' + status.name, targetCountry.name));
        }
      });
    }

    // 役職
    if (country.id > 0 && country.posts) {
      Enumerable.from(country.posts).orderBy((p) => p.type).forEach((p) => {
        const postType = Enumerable.from(def.COUNTRY_POSTS).firstOrDefault((cp) => cp.id === p.type);
        if (postType) {
          ps.push(new TextStatusParameter(postType.name, p.character.name));
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

  public updateCountryCharacters() {
    this.isUpdatingCountryCharacters = true;
    api.Api.getAllCharactersBelongsCountry(this.country.id)
      .then((characters) => {
        this.countryCharacters = characters;
      })
      .catch(() => {
        NotificationService.getCountryCharactersFailed.notify();
      })
      .finally(() => {
        this.isUpdatingCountryCharacters = false;
      });
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

  // #endregion

  // #region CountryPermissions

  public get canAppoint(): boolean {
    // 自分が任命権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  public get canDiplomacy(): boolean {
    // 自分が外交権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  public get canRemoveAllCountryBbsItems(): boolean {
    // 自分が会議室の全書き込み削除権限を持つか
    return Enumerable.from(this.getCountry(this.character.countryId).posts)
      .any((p) => p.characterId === this.character.id && (p.type === 1 || p.type === 2));
  }

  // #endregion

  // #region CountryDiplomacies

  private updateCountryAlliance(alliance: api.CountryAlliance) {
    this.updateCountryDiplomacies(alliance, (c) => c.alliances, (c, val) => c.alliances = val);

    // 自国に関係することなら通知する
    if (this.hasInitialized &&
        (alliance.requestedCountryId === this.character.countryId ||
         alliance.insistedCountryId === this.character.countryId)) {
      const targetCountry = alliance.requestedCountryId === this.character.countryId ?
        alliance.insistedCountry : alliance.requestedCountry;
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
    this.updateCountryDiplomacies(war, (c) => c.wars, (c, val) => c.wars = val);

    // 自国に関係することなら通知する
    if (this.hasInitialized &&
      (war.requestedCountryId === this.character.countryId ||
       war.insistedCountryId === this.character.countryId)) {
      const targetCountry = war.requestedCountryId === this.character.countryId ?
        war.insistedCountry : war.requestedCountry;
      if (war.status === api.CountryWar.statusAvailable) {
        NotificationService.warStart.notifyWithParameter(targetCountry.name);
      } else if (war.status === api.CountryWar.statusInReady) {
        NotificationService.warInReady.notifyWithParameter(
          targetCountry.name,
          api.GameDateTime.toFormatedString(war.startGameDate));
      }
    }
  }

  private updateCountryDiplomacies<T extends api.CountryDipromacy>(
       diplomacy: T,
       itemsProperty: (country: api.Country) => T[],
       itemsSetter: (country: api.Country, newItems: T[]) => void) {
    const countries = [this.getCountry(diplomacy.requestedCountryId), this.getCountry(diplomacy.insistedCountryId)];
    diplomacy.requestedCountry = countries[0];
    diplomacy.insistedCountry = countries[1];

    Enumerable.from(countries).where((c) => c.id > 0).forEach((country) => {
      const items = itemsProperty(country);

      // 古いのを消す
      const newItems = Enumerable
        .from(items)
        .where((ca) => !api.CountryDipromacy
                          .isEqualCountry(ca, diplomacy.requestedCountryId, diplomacy.insistedCountryId))
        .toArray();

      // 新しいのを追加する
      newItems.push(diplomacy);

      // 保存
      itemsSetter(country, newItems);
    });
  }

  public setAlliance(status: number) {
    const countryA = this.country.id;
    const countryB = this.character.countryId;

    const old = Enumerable
      .from(this.characterCountry.alliances)
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
      alliance.breakingDelay = this.allianceBreakingDelay;
      alliance.isPublic = this.allianceIsPublic;
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

  public setWar(status: number) {
    const countryA = this.country.id;
    const countryB = this.character.countryId;

    const old = Enumerable
      .from(this.characterCountry.wars)
      .firstOrDefault((ca) => api.CountryDipromacy.isEqualCountry(ca, countryA, countryB));
    if (old && old.status === status) {
      NotificationService.warFailedBecauseSameStatus.notifyWithParameter(this.country.name);
      return;
    }

    const war = new api.CountryWar();
    war.status = status;
    war.requestedCountryId = countryB;
    war.insistedCountryId = countryA;
    if (!old) {
      war.startGameDate = this.warStartDate;
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

  // #endregion

  // #region Character

  private initializeCharacter(character: api.Character) {
    this.character = character;

    // アイコンを初期化
    api.Api.getAllIcons()
      .then((icons) => {
        ArrayUtil.replace(this.characterIcons, icons);
      })
      .catch(() => {
        NotificationService.getIconsFailed.notify();
      });

    // コマンドを初期化
    this.commands.initialize(character.lastUpdatedGameDate, character.lastUpdated);
  }

  private updateCharacter(character: api.Character) {
    if (this.character.id !== character.id) {
      this.initializeCharacter(character);
    } else {
      if (this.character.countryId !== character.countryId) {
        this.character = character;
        this.onCountryChanged();
      } else {
        this.character = character;
      }
    }
    this.characterParameters = this.getCharacterParameters(character);

    // 現在表示中の都市が設定されていなければ、現在の武将の都市を設定
    if (this.town.id < 0) {
      const currentTown = ArrayUtil.find(this.towns, character.townId);
      if (currentTown) {
        this.town = currentTown;
      }
    }
  }

  private getCharacterParameters(character: api.Character): StatusParameter[] {
    const country = this.getCountry(character.countryId);
    const ps: StatusParameter[] = [];
    ps.push(new CharacterIconStatusParameter('アイコン', this.characterIcons));
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
    const soldierType = Enumerable.from(def.SOLDIER_TYPES).firstOrDefault((st) => st.id === character.soldierType);
    if (soldierType) {
      ps.push(new TextStatusParameter('兵種', soldierType.name));
    } else {
      ps.push(new TextStatusParameter('兵種', def.SOLDIER_TYPES[0].name));
    }
    ps.push(new RangedStatusParameter('兵士', character.soldierNumber, character.leadership));
    ps.push(new RangedStatusParameter('訓練', character.proficiency, 100));
    return ps;
  }

  // #endregion

  // #region Command

  public commands: CommandList = new CommandList(() => this.towns);

  public get isCommandInputing(): boolean {
    return this.commands.inputer.isInputing;
  }

  // #endregion

  // #region Unit

  public updateUnits() {
    this.isUpdatingUnit = true;
    api.Api.getUnits()
      .then((units) => {
        this.units = units;
        units.forEach((u) => {
          const leader = Enumerable.from(u.members)
            .firstOrDefault((um) => um.post === api.UnitMember.postLeader);
          if (leader) {
            u.leader = leader;
          }
        });

        // 自分が所属している部隊と、隊長かどうかを調べて反映する
        let currentUnitPost = api.UnitMember.postNormal;
        const currentUnit = Enumerable.from(units)
          .firstOrDefault((u) => {
            const member = Enumerable.from(u.members)
              .firstOrDefault((um) => um.characterId === this.character.id);
            if (member) {
              currentUnitPost = member.post;
              return true;
            } else {
              return false;
            }
          });

        this.leaderUnit = new api.Unit(-1);
        if (currentUnit) {
          if (currentUnitPost === api.UnitMember.postLeader) {
            this.leaderUnit = currentUnit;
          }
          Vue.set(currentUnit, 'isSelected', true);
        }
      })
      .catch(() => {
        NotificationService.unitLoadFailed.notify();
      })
      .finally(() => {
        this.isUpdatingUnit = false;
      });
  }

  public toggleUnit(unit: api.Unit) {
    const isSelected: boolean = !unit.isSelected;
    this.isUpdatingUnit = true;

    if (isSelected) {
      let isSucceed = false;
      api.Api.joinUnit(unit.id)
        .then(() => {
          NotificationService.unitJoined.notifyWithParameter(unit.name);
          this.units.forEach((u) => { Vue.set(u, 'isSelected', false); });
          Vue.set(unit, 'isSelected', true);
          isSucceed = true;
        })
        .catch((ex) => {
          if (ex.data.code === api.ErrorCode.unitJoinLimitedError) {
            NotificationService.unitJoinFailedBecauseLimited.notifyWithParameter(unit.name);
          } else if (ex.data.code === api.ErrorCode.invalidOperationError) {
            NotificationService.unitJoinFailedBecauseLeader.notifyWithParameter(unit.name);
          } else if (ex.data.code === api.ErrorCode.meaninglessOperationError) {
            NotificationService.unitJoinFailedBecauseCurrentUnit.notifyWithParameter(unit.name);
          } else {
            NotificationService.unitJoinFailed.notifyWithParameter(unit.name);
          }
        })
        .finally(() => {
          this.isUpdatingUnit = false;
          if (isSucceed) {
            this.updateUnits();
          }
        });
    } else {
      let isSucceed = false;
      api.Api.leaveUnit()
        .then(() => {
          NotificationService.unitLeft.notifyWithParameter(unit.name);
          Vue.set(unit, 'isSelected', false);
          isSucceed = true;
        })
        .catch((ex) => {
          if (ex.data.code === api.ErrorCode.invalidOperationError) {
            NotificationService.unitLeaveFailedBecauseLeader.notifyWithParameter(unit.name);
          } else {
            NotificationService.unitLeaveFailed.notifyWithParameter(unit.name);
          }
        })
        .finally(() => {
          this.isUpdatingUnit = false;
          if (isSucceed) {
            this.updateUnits();
          }
        });
    }
  }

  public createUnit() {
    if (this.leaderUnit.id < 0) {
      this.isUpdatingUnit = true;
      let isSucceed = false;
      api.Api.createUnit(this.leaderUnit)
        .then(() => {
          NotificationService.unitCreated.notifyWithParameter(this.leaderUnit.name);
          isSucceed = true;
        })
        .catch((ex) => {
          if (ex.data.code === api.ErrorCode.lackOfNameParameterError) {
            NotificationService.unitCreateFailedBecauseLackOfParameters.notify();
          } else {
            NotificationService.unitCreateFailed.notifyWithParameter(this.leaderUnit.name);
          }
        })
        .finally(() => {
          this.isUpdatingUnit = false;
          if (isSucceed) {
            this.updateUnits();
          }
        });
    }
  }

  public updateLeaderUnit() {
    if (this.leaderUnit.id >= 0) {
      this.isUpdatingUnit = true;
      let isSucceed = false;
      api.Api.updateUnit(this.leaderUnit.id, this.leaderUnit)
        .then(() => {
          NotificationService.unitUpdated.notifyWithParameter(this.leaderUnit.name);
          isSucceed = true;
        })
        .catch(() => {
          NotificationService.unitUpdateFailed.notifyWithParameter(this.leaderUnit.name);
        })
        .finally(() => {
          this.isUpdatingUnit = false;
          if (isSucceed) {
            this.updateUnits();
          }
        });
    }
  }

  public removeLeaderUnit() {
    if (this.leaderUnit.id >= 0) {
      this.isUpdatingUnit = true;
      let isSucceed = false;
      api.Api.removeUnit(this.leaderUnit.id)
        .then(() => {
          NotificationService.unitRemoved.notifyWithParameter(this.leaderUnit.name);
          isSucceed = true;
        })
        .catch(() => {
          NotificationService.unitRemoveFailed.notifyWithParameter(this.leaderUnit.name);
        })
        .finally(() => {
          this.isUpdatingUnit = false;
          if (isSucceed) {
            this.updateUnits();
          }
        });
    }
  }

  // #endregion

  // #region Logs

  private addMapLog(log: api.MapLog) {
    ArrayUtil.addLog(this.mapLogs, log, 50);
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
    ArrayUtil.addLog(this.characterLogs, log, 50);
  }

  // #endregion

  // #region ChatMessage

  public countryChat: ChatMessageContainer<api.Country>
    = new ChatMessageContainer(
      (mes, sendTo) => {
        if (sendTo) {
          return api.Api.postOtherCountryChatMessage(mes, this.characterIcon, sendTo);
        } else {
          return api.Api.postCountryChatMessage(mes, this.characterIcon);
        }},
      (id) => api.Api.getCountryChatMessage(id, 50));

  public globalChat: ChatMessageContainer<any>
    = new ChatMessageContainer(
      (mes) => api.Api.postGlobalChatMessage(mes, this.characterIcon),
      (id) => api.Api.getGlobalChatMessage(id, 50));

  public privateChat: ChatMessageContainer<api.Character>
    = new ChatMessageContainer(
      (mes, sendTo) => {
        if (sendTo) {
          return api.Api.postPrivateChatMessage(mes, this.characterIcon, sendTo);
        } else {
          throw new Error();
        }},
      (id) => api.Api.getPrivateChatMessage(id, 50));

  public get isPostingChat(): boolean {
    return this.countryChat.isPosting || this.globalChat.isPosting || this.privateChat.isPosting;
  }

  private onReceiveChatMessage(message: api.ChatMessage) {
    if (message.type === api.ChatMessage.typeSelfCountry ||
        message.type === api.ChatMessage.typeOtherCountry) {
      // 自国宛
      this.countryChat.append(message);
    } else if (message.type === api.ChatMessage.typeGlobal) {
      // 全国宛
      this.globalChat.append(message);
    } else if (message.type === api.ChatMessage.typePrivate) {
      // 個宛
      this.privateChat.append(message);
      if (message.character && message.character.id !== this.character.id && this.hasInitialized) {
        NotificationService.chatPrivateReceived.notifyWithParameter(message.character.name);
      }
    }
  }

  // #endregion

  // #region ThreadBbs

  public countryThreadBbs = new ThreadBbs();

  // #endregion
}

/* tslint:disable:member-ordering */

import ArrayUtil from '@/models/common/arrayutil';
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
import Vue from 'vue';
import NotificationService from '@/services/notificationservice';

enum CommandSelectMode {
  /**
   * 置き換え
   */
  replace = 0,
  /**
   * OR
   */
  mode_or = 1,
  /**
   * AND
   */
  mode_and = 2,
  /**
   * XOR
   */
  mode_xor = 3,
}

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
  public commands: api.CharacterCommand[] = [];
  public commandSelectMode: CommandSelectMode = CommandSelectMode.mode_or;
  public secondsOfNextCommand: number = 0;
  public mapLogs: api.MapLog[] = [];
  public characterLogs: api.CharacterLog[] = [];
  public countryChatMessages: api.ChatMessage[] = [];
  public globalChatMessages: api.ChatMessage[] = [];
  public chatPostMessage: string = '';
  public townCharacters: api.Character[] = [];
  public townDefenders: api.Character[] = [];
  public countryCharacters: api.Character[] = [];
  public units: api.Unit[] = [];
  public leaderUnit: api.Unit = new api.Unit(-1);

  public allianceBreakingDelay: number = 0;
  public allianceIsPublic: boolean = false;
  public warStartDate: api.GameDateTime = new api.GameDateTime();

  private timers: number[] = [];

  public get isLoading(): boolean {
    return this.isCommandInputing || this.isPostingChat || this.isUpdatingTownCharacters
      || this.isUpdatingTownDefenders || this.isUpdatingCountryCharacters || this.isScouting
      || this.isAppointing || this.isSendingAlliance || this.isSendingWar || this.isUpdatingUnit;
  }
  public isCommandInputing: boolean = false;
  public isPostingChat: boolean = false;
  public isUpdatingTownCharacters: boolean = false;
  public isUpdatingTownDefenders: boolean = false;
  public isUpdatingCountryCharacters: boolean = false;
  public isScouting: boolean = false;
  public isAppointing: boolean = false;
  public isSendingAlliance: boolean = false;
  public isSendingWar: boolean = false;
  public isUpdatingUnit: boolean = false;

  private isInitializedCommands = false;

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
      (obj) => this.updateCommand(obj));
    ApiStreaming.status.on<api.ApiSignal>(
      api.ApiSignal.typeId,
      (obj) => this.onReceiveSignal(obj));
    ApiStreaming.status.on<api.ChatMessage>(
      api.ChatMessage.typeId,
      (obj) => this.addChatMessage(obj));
    ApiStreaming.status.start();

    this.timers.push(setInterval(() => { this.secondsOfNextCommand--; }, 1000));
  }

  public onDestroy() {
    ApiStreaming.status.stop();
    this.timers.forEach((id) => { clearInterval(id); });
  }

  // #region ApiSignal

  private onReceiveSignal(signal: api.ApiSignal) {
    if (signal.type === 1) {
      // 武将が更新された
      const data = signal.data as { gameDate: api.GameDateTime, secondsNextCommand: number };
      this.onExecutedCommand(data.gameDate, data.secondsNextCommand);
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
    } else if (signal.type === 5) {
      // 部隊が解散された
      NotificationService.belongsUnitRemoved.notify();
    } else if (signal.type === 6) {
      // 部隊が集合された
      NotificationService.belongsUnitGathered.notify();
    }
  }

  // #endregion

  // #region GameDate

  private initializeGameDate(date: api.GameDateTime) {
    this.gameDate = date;
    this.warStartDate = date;
    this.preInitializeCommands();
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
      api.Api.getAllCharactersAtTown(town.id)
        .then((charas) => {
          countParam.value = charas.length;
          countParam.isLoading = false;
        });
      api.Api.getAllDefendersAtTown(town.id)
        .then((defenders) => {
          defParam.value = defenders.length;
          defParam.isLoading = false;
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

  // #region CountryDiplomacies

  private updateCountryAlliance(alliance: api.CountryAlliance) {
    this.updateCountryDiplomacies(alliance, (c) => c.alliances, (c, val) => c.alliances = val);

    // 自国に関係することなら通知する
    if (this.hasInitialized &&
        alliance.requestedCountryId === this.character.countryId ||
        alliance.insistedCountryId === this.character.countryId) {
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
      war.requestedCountryId === this.character.countryId ||
      war.insistedCountryId === this.character.countryId) {
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
        .where((ca) => ca.id < diplomacy.id &&
                       !api.CountryDipromacy
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
    if (!old) {
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
    this.initializeCommands();
  }

  private updateCharacter(character: api.Character) {
    if (this.character.id !== character.id) {
      this.initializeCharacter(character);
    } else {
      this.character = character;
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

  private preInitializeCommands() {
    // 武将データ入手前のコマンド一覧初期化

    let gamedate = this.gameDate;

    for (let i = 0; i < 200; i++) {
      this.commands.push({ commandNumber: i + 1, name: '取得中...', gameDate: gamedate } as api.CharacterCommand);
      gamedate = api.GameDateTime.nextMonth(gamedate);
    }

    if (this.character.id >= 0) {
      this.initializeCommands();
    }
  }

  private initializeCommands() {
    // 武将データ入手後のコマンド一覧初期化

    // コマンド更新時間を初期化
    const date = api.DateTime.toDate(this.character.lastUpdated);
    this.commands.forEach((c) => {
      date.setSeconds(date.getSeconds() + def.UPDATE_TIME);
      Vue.set(c, 'date', api.DateTime.fromDate(date));
    });

    // APIからコマンドを取得して、コマンドリストに反映
    if (this.isInitializedCommands) {
      return;
    }
    this.isInitializedCommands = true;
    api.Api.getAllCommands().then((cmd) => {

      // コマンドに設定していた仮のテキスト、年月を削除
      let month = api.GameDateTime.nextMonth(this.character.lastUpdatedGameDate);
      this.commands.forEach((c) => {
        c.name = '';
        c.gameDate = month;
        month = api.GameDateTime.nextMonth(month);
      });

      // 次のコマンド実行までの秒数を更新
      this.secondsOfNextCommand = cmd.secondsNextCommand;

      // サーバに保存されているコマンドを画面表示に反映
      cmd.commands.forEach((c) => {
        const already = ArrayUtil.findUniquely(
          this.commands,
          api.GameDateTime.toNumber(c.gameDate),
          (cc) => api.GameDateTime.toNumber(cc.gameDate));
        if (already) {
          c.commandNumber = already.commandNumber;
          c.date = already.date;
          this.updateCommandName(c);
          ArrayUtil.addItemUniquely(this.commands, c, (cc) => api.GameDateTime.toNumber(cc.gameDate));
        }
      });
    })
    .catch(() => {
      NotificationService.getCommandListFailed.notify();
    });
  }

  private updateCommand(command: api.CharacterCommand) {
    ArrayUtil.addItemUniquely(this.commands, command, (c) => api.GameDateTime.toNumber(c.gameDate));
  }

  public inputCommand(commandType: number) {
    this.inputCommandPrivate(commandType);
  }

  public inputSoldierCommand(commandType: number, soldierType: number, soldierNumber: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, soldierType),
                        new api.CharacterCommandParameter(2, soldierNumber));
    });
  }

  public inputMoveCommand(commandType: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, this.town.id));
    });
  }

  public inputTrainingCommand(commandType: number, trainingType: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, trainingType));
    });
  }

  private inputCommandPrivate(commandType: number, setParams?: (c: api.CharacterCommand) => void) {
    const selectCommands = Enumerable.from(this.commands).where((c) => c.isSelected === true).toArray();
    if (selectCommands.length > 0) {
      this.isCommandInputing = true;
      selectCommands.forEach((c) => {
        c.type = commandType;
        c.parameters = [];
        if (setParams) {
          setParams(c);
        }
      });
      api.Api.setCommands(selectCommands)
        .then(() => {
          selectCommands.forEach((c) => {
            this.updateCommandName(c);
            c.isSelected = false;
          });
          NotificationService.inputCommandsSucceed.notifyWithParameter(selectCommands[0].name);
        })
        .catch((ex) => {
          if (ex.data.code === api.ErrorCode.lackOfTownTechnologyForSoldier) {
            NotificationService.inputCommandsFailedBecauseLackOfSoldierTechnology.notify();
          } else {
            NotificationService.inputCommandsFailed.notify();
          }
        })
        .finally(() => {
          this.isCommandInputing = false;
        });
    } else {
      NotificationService.inputCommandsFailedBecauseCommandNotSelected.notify();
    }
  }

  public selectSingleCommand(command: api.CharacterCommand) {
    if (this.commandSelectMode === CommandSelectMode.replace) {
      this.clearAllCommandSelections();
      Vue.set(command, 'isSelected', true);
    } else if (this.commandSelectMode === CommandSelectMode.mode_and) {
      Vue.set(command, 'isSelected', true);
    } else {
      Vue.set(command, 'isSelected', !command.isSelected);
    }
  }

  public selectMultipleCommand(lastCommand: api.CharacterCommand) {
    const selected = Enumerable.from(this.commands)
      .reverse()
      .skipWhile((c) => c.commandNumber !== lastCommand.commandNumber)
      .takeWhile((c) => c.isSelected !== true)
      .toArray();
    if (this.commandSelectMode === CommandSelectMode.replace) {
      this.clearAllCommandSelections();
    }
    selected.forEach((c) => Vue.set(c, 'isSelected', true));

    // 置き換えモードで、一番最初のコマンドの選択が解除されるので
    if (this.commandSelectMode === CommandSelectMode.replace) {
      const first = Enumerable.from(this.commands)
        .takeWhile((c) => c.isSelected !== true)
        .lastOrDefault();
      if (first) {
        Vue.set(first, 'isSelected', true);
      }
    }
  }

  public selectAllCommands() {
    this.commands.forEach((c) => {
      this.selectCommandWithSelectMode(c, true);
    });
  }

  public selectEvenCommands() {
    this.commands.forEach((c, index) => {
      this.selectCommandWithSelectMode(c, index % 2 === 0);
    });
  }

  public selectOddCommands() {
    this.commands.forEach((c, index) => {
      this.selectCommandWithSelectMode(c, index % 2 === 1);
    });
  }

  private selectCommandWithSelectMode(command: api.CharacterCommand, value: boolean) {
    let isSelected = command.isSelected;

    if (this.commandSelectMode === CommandSelectMode.replace) {
      isSelected = value;
    } else if (this.commandSelectMode === CommandSelectMode.mode_or) {
      isSelected = isSelected || value;
    } else if (this.commandSelectMode === CommandSelectMode.mode_and) {
      isSelected = isSelected && value;
    } else if (this.commandSelectMode === CommandSelectMode.mode_xor) {
      isSelected = isSelected !== value;
    } else {
      NotificationService.invalidStatus.notifyWithParameter('commandSelectMode:' + this.commandSelectMode);
    }

    Vue.set(command, 'isSelected', isSelected);
  }

  public clearAllCommandSelections() {
    Enumerable.from(this.commands).where((c) => c.isSelected === true).forEach((c) => {
      c.isSelected = false;
    });
  }

  public onExecutedCommand(date: api.GameDateTime, secondsNextCommand: number) {
    const dateNumber = api.GameDateTime.toNumber(date);
    const cmds = Enumerable.from(this.commands);
    const executed = cmds.where((c) => api.GameDateTime.toNumber(c.gameDate) <= dateNumber).toArray();
    let lastMonth = api.GameDateTime.addMonth(date, this.commands.length);

    // 実行されたコマンドを取得
    const command = ArrayUtil.findUniquely(this.commands, dateNumber, (c) => api.GameDateTime.toNumber(c.gameDate));

    // コマンドを削除
    this.commands = cmds.except(executed).toArray();

    // 末尾に空のコマンドを追加
    let commandNumber = cmds.any() ? cmds.last().commandNumber : 1;
    const addCount = executed.length;
    for (let i = 0; i < addCount; i++) {
      this.commands.push({
        commandNumber,
        name: '',
        gameDate: lastMonth } as api.CharacterCommand);
      lastMonth = api.GameDateTime.nextMonth(lastMonth);
      commandNumber++;
    }

    // コマンド番号を整形
    const commandDate = api.DateTime.toDate(this.character.lastUpdated);
    this.commands.forEach((cmd, index) => {
      commandDate.setSeconds(commandDate.getSeconds() + def.UPDATE_TIME);
      cmd.commandNumber = index + 1;
      cmd.date = api.DateTime.fromDate(commandDate);
    });

    // 次回更新までの秒数を設定
    this.secondsOfNextCommand = secondsNextCommand;

    // 通知
    if (command && command.type !== undefined && command.type !== 0) {
      this.updateCommandName(command);
      NotificationService.commandExecuted.notifyWithParameter(command.name);
    } else {
      NotificationService.emptyCommandExecuted.notify();
    }
  }

  private updateCommandName(command: api.CharacterCommand) {
    api.CharacterCommand.updateName(command);

    // ステータス画面のデータがないと更新できない特殊なコマンドは、こっちのほうで名前を変える
    if (command.type === 17 || command.type === 13) {
      // 移動、戦争
      const targetTownId = Enumerable.from(command.parameters).firstOrDefault((cp) => cp.type === 1);
      if (targetTownId && targetTownId.numberValue) {
        const town = this.getTown(targetTownId.numberValue);
        command.name = command.name.replace('%0%', town.name);
      } else {
        command.name = 'エラー (' + command.type + ':A)';
      }
    }
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

  private addCharacterLog(log: api.CharacterLog) {
    ArrayUtil.addLog(this.characterLogs, log, 50);
  }

  // #endregion

  // #region ChatMessage

  private addChatMessage(message: api.ChatMessage) {
    if (message.type === api.ChatMessage.typeSelfCountry) {
      // 自国宛
      ArrayUtil.addLog(this.countryChatMessages, message);
    } else if (message.type === api.ChatMessage.typeGlobal) {
      // 全国宛
      ArrayUtil.addLog(this.globalChatMessages, message);
    }
  }

  public postCountryChat() {
    this.postChat((message, icon) => api.Api.postCountryChatMessage(message, icon));
  }

  public postGlobalChat() {
    this.postChat((message, icon) => api.Api.postGlobalChatMessage(message, icon));
  }

  private postChat(apiFunc: (message: string, icon: api.CharacterIcon) => Promise<any>) {
    const icon = api.CharacterIcon.getMainOrFirst(this.characterIcons);
    if (icon) {
      this.isPostingChat = true;
      apiFunc(this.chatPostMessage, icon)
        .then(() => {
          this.chatPostMessage = '';
        })
        .catch(() => {
          NotificationService.postChatFailed.notify();
        })
        .finally(() => {
          this.isPostingChat = false;
        });
    }
  }

  // #endregion
}

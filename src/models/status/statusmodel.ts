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
  public gameDate: api.GameDateTime = new api.GameDateTime();
  public countries: api.Country[] = [];
  public country: api.Country = api.Country.default;  // 自分の所属しない国が入る場合がある
  public countryParameters: StatusParameter[] = [];
  public towns: api.TownBase[] = [];
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

  private timers: number[] = [];

  public get isLoading(): boolean {
    return this.isCommandInputing || this.isPostingChat;
  }
  public isCommandInputing: boolean = false;
  public isPostingChat: boolean = false;

  private isInitializedCommands = false;

  public get townCountryColor(): number {
    return this.getCountry(this.town.countryId).colorId;
  }

  public get characterCountryColor(): number {
    return this.getCountry(this.character.countryId).colorId;
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
    }
  }

  // #endregion

  // #region GameDate

  private initializeGameDate(date: api.GameDateTime) {
    this.gameDate = date;
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
        this.setTown(town);
      }
    } else if (this.town.id === town.id) {
      this.setTown(town);
    }
  }

  private updateScoutedTown(town: api.ScoutedTown) {
    ArrayUtil.addItem(this.towns, town);
  }

  public selectTown(townId: number) {
    const town = ArrayUtil.find(this.towns, townId);
    if (town) {
      this.setTown(town);
    }
  }

  private setTown(town: api.Town) {
    this.town = town;
    this.townParameters = this.getTownParameters(town);
  }

  private getTownParameters(town: api.Town): StatusParameter[] {
    const isScouted = api.Town.isScouted(town);
    const isMyCountryTown = town.countryId === this.character.countryId;
    const country = this.getCountry(town.countryId);
    const ps: StatusParameter[] = [];
    ps.push(new TextStatusParameter('国', country.name));
    ps.push(new TextStatusParameter('特化', def.TOWN_TYPES[town.type - 1]));
    if (isScouted) {
      const scoutedTown = town as api.ScoutedTown;
      ps.push(new TextStatusParameter('諜報', api.GameDateTime.toFormatedString(scoutedTown.scoutedGameDateTime!)));
    }
    if (isScouted || isMyCountryTown) {
      ps.push(new NoRangeStatusParameter('相場', town.ricePrice));
      ps.push(new NoRangeStatusParameter('農民', town.people));
      ps.push(new RangedStatusParameter('民忠', town.security, 100));
      ps.push(new RangedStatusParameter('農業', town.agriculture, town.agricultureMax));
      ps.push(new RangedStatusParameter('商業', town.commercial, town.commercialMax));
      ps.push(new RangedStatusParameter('技術', town.technology, town.technologyMax));
      ps.push(new RangedStatusParameter('城壁', town.wall, town.wallMax));
      ps.push(new RangedStatusParameter('守兵', town.wallguard, town.wallguardMax));
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

  // #endregion

  // #region Country

  private updateCountry(country: api.Country) {
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

    if (this.country.id < 0 && country.id === this.character.countryId) {
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
    return ps;
  }

  private getCountry(countryId: number): api.Country {
    const country = ArrayUtil.find(this.countries, countryId);
    if (country) {
      return country;
    }
    return api.Country.default;
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
          api.CharacterCommand.updateName(c);
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
    const selectCommands = Enumerable.from(this.commands).where((c) => c.isSelected === true).toArray();
    if (selectCommands.length > 0) {
      this.isCommandInputing = true;
      selectCommands.forEach((c) => {
        c.type = commandType;
      });
      api.Api.setCommands(selectCommands)
        .then(() => {
          selectCommands.forEach((c) => {
            api.CharacterCommand.updateName(c);
            c.isSelected = false;
          });
          NotificationService.inputCommandsSucceed.notifyWithParameter(selectCommands[0].name);
        })
        .catch(() => {
          NotificationService.inputCommandsFailed.notify();
        })
        .finally(() => {
          this.isCommandInputing = false;
        });
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
      api.CharacterCommand.updateName(command);
      NotificationService.commandExecuted.notifyWithParameter(command.name);
    } else {
      NotificationService.emptyCommandExecuted.notify();
    }
  }

  // #endregion

  // #region Logs

  private addMapLog(log: api.MapLog) {
    if (!log.isImportant) {
      ArrayUtil.addLog(this.mapLogs, log, 50);
    }
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

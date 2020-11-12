
import * as api from '@/api/api';
import Enumerable from 'linq';
import * as def from '@/common/definitions';
import ArrayUtil from '@/models/common/arrayutil';
import Vue from 'vue';
import NotificationService from '@/services/notificationservice';
import CommandInputer from './commandinputer';
import StatusStore from './statusstore';

export default class CommandList {
  public inputer: CommandInputer = new CommandInputer(this.store);
  public secondsOfNextCommand: number = 0;
  private isInitialized: boolean = false;
  private timer: number = 0;
  private timerDate: Date = new Date();
  private lastUpdatedGameDateForUpdate?: api.GameDateTime;
  private lastUpdatedForUpdate?: api.DateTime;

  public get commands(): api.CharacterCommand[] {
    this.inputer.commands.forEach((c) => c.characterId = this.store.character.id);
    return this.inputer.commands;
  }

  public get canReligion(): boolean {
    return this.store.systemData.ruleSet !== api.SystemData.ruleSetSimpleBattle;
  }

  public get canUseCountrySafe(): boolean {
    // 国庫を使えるか
    return this.isPolicyEnabled(api.CountryPolicy.typeStorage);
  }

  public get canUseCountrySoldier(): boolean {
    // 兵種研究を使えるか
    return this.isPolicyEnabled(api.CountryPolicy.typeSoldierDevelopment);
  }

  public get canUseCountrySecretary(): boolean {
    // 政務官を使えるか
    return this.isPolicyEnabled(api.CountryPolicy.typeHumanDevelopment);
  }

  public get isFewRemaining(): boolean {
    // コマンドの残りが少ない
    return this.restTurns < 50;
  }

  public get canInputTownPatrol(): boolean {
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 2 || s === 7 || s === 57);
  }

  public get canInputTownInvent(): boolean {
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 12);
  }

  public get canInputGenerateItem(): boolean {
    // 資源製造
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 17);
  }

  public get canInputGenerateItem2(): boolean {
    // 胡人交易
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 29);
  }

  public get canInputGenerateItem3(): boolean {
    // 精鋭検査
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 32);
  }

  public get canInputGenerateItem4(): boolean {
    // 書物執筆
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 38 || s === 43);
  }

  public get canInputIncreasePeople(): boolean {
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 30 || s === 34);
  }

  public get canInputDecreasePeople(): boolean {
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 30 || s === 34);
  }

  public get canInputSoldierTrainingAll(): boolean {
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 37);
  }

  public get canInputSpy(): boolean {
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 45 || s === 47);
  }

  public get canInputChangeTime(): boolean {
    const items = this.store.items.filter((i) => i.characterId === this.store.character.id &&
                                                 i.status === api.CharacterItem.statusCharacterHold);
    return items.some((i) => i.type === 84);
  }

  public get canInputCreateTown(): boolean {
    const items = this.store.items.filter((i) => i.characterId === this.store.character.id &&
                                                 i.status === api.CharacterItem.statusCharacterHold);
    return items.some((i) => i.type === 87);
  }

  public get canInputMissionary(): boolean {
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 58 || s === 63 || s === 68);
  }

  public get canInputMissionarySelf(): boolean {
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 58 || s === 63 || s === 68);
  }

  public get canInputOppress(): boolean {
    const skills = this.store.skills.filter((s) => s.characterId === this.store.character.id).map((s) => s.type);
    return skills.some((s) => s === 61 || s === 66 || s === 71);
  }

  public get canInputSkillPointTraining(): boolean {
    return this.store.character.countryId === 0 &&
      !this.commands.filter((c) => c.isSelected === true).some((c) => c.gameDate.year >= 36);
  }

  public get isCountryCharacter(): boolean {
    return this.store.character.countryId !== 0;
  }

  public get canSetRegularly(): boolean {
    const commands = this.inputer.commands.filter((c) => c.isSelected === true && c.canSelect === true);
    return commands.length === 1 && (commands[0].type === 57 || commands[0].type === 55);
  }

  public get restTurns(): number {
    // 残りターン数
    let turns = 0;
    const cmds = Enumerable.from(this.inputer.commands)
      .where((c) => c.type !== undefined && c.type !== 0)
      .orderBy((c) => c.commandNumber)
      .toArray();
    for (turns = 0; turns < cmds.length; turns++) {
      if (cmds[turns].commandNumber !== turns + 1) {
        return turns;
      }
    }
    return turns;
  }

  public constructor(private store: StatusStore) {
    this.timer = setInterval(() =>
      this.secondsOfNextCommand = Math.floor((this.timerDate.getTime() - new Date().getTime()) / 1000)
      , 1000);
  }

  public reset() {
    this.isInitialized = false;
    this.preInitialize(new api.GameDateTime(0, 1));
  }

  public preInitialize(gamedate: api.GameDateTime) {
    // 武将データ入手前のコマンド一覧初期化
    this.inputer.commands = [];
    for (let i = 0; i < 300; i++) {
      this.inputer.commands.push({
        commandNumber: i + 1,
        name: '取得中...',
        gameDate: gamedate,
        canSelect: false } as api.CharacterCommand);
      gamedate = api.GameDateTime.nextMonth(gamedate);
    }
  }

  public initialize(lastUpdatedGameDate: api.GameDateTime, lastUpdated: api.DateTime) {
    // 武将データ入手後のコマンド一覧初期化
    if (this.commands.length <= 0) {
      this.preInitialize(lastUpdatedGameDate);
    }

    let month = api.GameDateTime.nextMonth(lastUpdatedGameDate);
    if (month.year < def.UPDATE_START_YEAR) {
      month = new api.GameDateTime(def.UPDATE_START_YEAR, 1);
    }

    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;

    // APIからコマンドを取得して、コマンドリストに反映
    api.Api.getAllCommands().then((cmd) => {

      // コマンドに設定していた仮のテキスト、年月を削除
      this.commands.forEach((c) => {
        c.name = '';
        c.gameDate = month;
        c.canSelect = true;
        month = api.GameDateTime.nextMonth(month);
      });

      // コマンドリストの年月を改めて設定し直す
      this.updateCommandTimeAndNumber(lastUpdatedGameDate, lastUpdated);

      // 次のコマンド実行までの秒数を更新
      this.updateSecondsNextCommand(cmd.secondsNextCommand, month);

      // サーバに保存されているコマンドを画面表示に反映
      cmd.commands.forEach((c) => {
        const already = ArrayUtil.findUniquely(
          this.commands,
          api.GameDateTime.toNumber(c.gameDate),
          (cc) => api.GameDateTime.toNumber(cc.gameDate));
        if (already) {
          c.commandNumber = already.commandNumber;
          c.date = already.date;
          c.canSelect = true;
          c.event = already.event;
          c.eventMessage = already.eventMessage;
          this.inputer.updateCommandName(c);
          ArrayUtil.addItemUniquely(this.commands, c, (cc) => api.GameDateTime.toNumber(cc.gameDate));
        }
      });
    })
    .catch(() => {
      NotificationService.getCommandListFailed.notify();
    });
  }

  public dispose() {
    clearInterval(this.timer);
  }

  public updateCommand(command: api.CharacterCommand) {
    ArrayUtil.addItemUniquely(this.commands, command, (c) => api.GameDateTime.toNumber(c.gameDate));
    this.updateCommandListInformations();
  }

  public onExecutedCommand(date: api.GameDateTime, lastUpdated: api.DateTime, secondsNextCommand: number) {
    const dateNumber = api.GameDateTime.toNumber(date);
    const cmds = Enumerable.from(this.commands);
    const executed = cmds.where((c) => api.GameDateTime.toNumber(c.gameDate) <= dateNumber).toArray();
    let lastMonth = api.GameDateTime.addMonth(date, this.commands.length);
    const nextMonth = api.GameDateTime.nextMonth(date);

    // 実行されたコマンドを取得
    const command = ArrayUtil.findUniquely(this.commands, dateNumber, (c) => api.GameDateTime.toNumber(c.gameDate));

    // コマンドを削除
    this.inputer.commands = cmds.except(executed).toArray();

    // 末尾に空のコマンドを追加
    const lastCommand = cmds.last();
    let commandNumber = cmds.any() ? lastCommand.commandNumber : 1;
    const addCount = executed.length;
    for (let i = 0; i < addCount; i++) {
      this.commands.push({
        commandNumber,
        name: '',
        gameDate: lastMonth,
        canSelect: lastCommand.canSelect } as api.CharacterCommand);
      lastMonth = api.GameDateTime.nextMonth(lastMonth);
      commandNumber++;
    }

    // 次回更新までの秒数を設定
    this.updateSecondsNextCommand(secondsNextCommand, nextMonth);

    // コマンド番号を整形
    this.updateCommandTimeAndNumber(date, lastUpdated);

    // 通知
    if (date.year >= def.UPDATE_START_YEAR) {
      if (command && command.type !== undefined && command.type !== 0) {
        this.inputer.updateCommandName(command);
        NotificationService.commandExecuted.notifyWithParameter(
          command.name.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, ''));
      } else {
        NotificationService.emptyCommandExecuted.notify();
      }
    }
  }

  public updateCommandListInformations() {
    if (this.lastUpdatedForUpdate && this.lastUpdatedGameDateForUpdate) {
      this.updateCommandTimeAndNumber(this.lastUpdatedGameDateForUpdate, this.lastUpdatedForUpdate);
    }
  }

  private updateSecondsNextCommand(secondsNextCommand: number, nextMonth: api.GameDateTime) {
    let skipMonthCount = 0;
    if (nextMonth.year < def.UPDATE_START_YEAR) {
      // 更新開始年以前の表示
      const newMonth = new api.GameDateTime(def.UPDATE_START_YEAR, 1);
      skipMonthCount = api.GameDateTime.toNumber(newMonth) - api.GameDateTime.toNumber(nextMonth);
    }
    this.timerDate = new Date();
    this.timerDate.setSeconds(
      this.timerDate.getSeconds() + secondsNextCommand + skipMonthCount * def.UPDATE_TIME);
  }

  private updateCommandTimeAndNumber(lastUpdatedGameDate: api.GameDateTime, lastUpdated: api.DateTime) {
    this.lastUpdatedGameDateForUpdate = lastUpdatedGameDate;
    this.lastUpdatedForUpdate = lastUpdated;

    let month = api.GameDateTime.nextMonth(lastUpdatedGameDate);
    let skipMonthCount = 0;
    if (month.year < def.UPDATE_START_YEAR) {
      // 更新開始以降のコマンドのみを表示する
      const newMonth = new api.GameDateTime(def.UPDATE_START_YEAR, 1);
      skipMonthCount = api.GameDateTime.toNumber(newMonth) - api.GameDateTime.toNumber(month);
      month = newMonth;
    }

    const myWars = Enumerable
      .from(this.store.wars)
      .where((w) => w.insistedCountryId === this.store.character.countryId ||
                    w.requestedCountryId === this.store.character.countryId)
      .where((w) => w.status === api.CountryWar.statusInReady ||
                    w.status === api.CountryWar.statusAvailable ||
                    w.status === api.CountryWar.statusStopRequesting)
      .toArray();
    const firstWarStart = api.GameDateTime.toNumber(Enumerable
      .from(myWars)
      .orderBy((w) => api.GameDateTime.toNumber(w.startGameDate))
      .select((w) => w.startGameDate)
      .firstOrDefault(undefined, new api.GameDateTime(32767, 1)));
    const myTownWars = Enumerable
      .from(this.store.townWars)
      .where((w) => w.insistedCountryId === this.store.character.countryId ||
                    w.requestedCountryId === this.store.character.countryId)
      .where((w) => w.status === api.TownWar.statusInReady ||
                    w.status === api.TownWar.statusAvailable)
      .toArray();

    // コマンド更新時間を初期化
    const commandDate = api.DateTime.toDate(lastUpdated);
    commandDate.setSeconds(commandDate.getSeconds() + skipMonthCount * def.UPDATE_TIME);
    this.commands.forEach((cmd, index) => {
      commandDate.setSeconds(commandDate.getSeconds() + def.UPDATE_TIME);

      cmd.commandNumber = index + 1;
      cmd.gameDate = month;
      Vue.set(cmd, 'date', api.DateTime.fromDate(commandDate));

      const numMonth = api.GameDateTime.toNumber(month);
      let event = api.CharacterCommand.eventNone;
      let eventMessage = '';
      if (numMonth > firstWarStart || this.store.systemData.isBattleRoyaleMode) {
        event = api.CharacterCommand.eventWaring;
      }
      const startWars = myWars.filter((w) => api.GameDateTime.toNumber(w.startGameDate) === numMonth);
      if (startWars.length > 0) {
        event = api.CharacterCommand.eventWarStart;
        const names = startWars.map((w) => {
          const targetCountryId = w.insistedCountryId === this.store.character.countryId ?
            w.requestedCountryId : w.insistedCountryId;
          const targetCountry = ArrayUtil.find(this.store.countries, targetCountryId);
          if (targetCountry) {
            return targetCountry.name;
          } else {
            return '不明';
          }
        }).join(', ');
        eventMessage = names + ' と開戦';
      }
      const townWars = myTownWars.filter((w) => api.GameDateTime.toNumber(w.gameDate) === numMonth);
      if (townWars.length > 0) {
        event = api.CharacterCommand.eventTownWar;
        const names = townWars.map((w) => {
          const town = ArrayUtil.find(this.store.towns, w.townId);
          if (town) {
            if (w.requestedCountryId === this.store.character.countryId) {
              return town.name;
            } else {
              return '(被)' + town.name;
            }
          } else {
            return '不明';
          }
        }).join(', ');
        eventMessage = names + ' の攻略';
      }
      if (month.year === def.BATTLE_STOP_TURN / 12 + def.UPDATE_START_YEAR && month.month === 1) {
        event = api.CharacterCommand.eventBattleStart;
        if (eventMessage) {
          eventMessage += ' / 戦闘解除';
        } else {
          eventMessage = '戦闘解除';
        }
      }

      const comment = this.store.commandComments
        .find((c) => c.gameDate.year === month.year && c.gameDate.month === month.month);
      if (comment && comment.message) {
        event = api.CharacterCommand.eventCustomMessage;
        if (eventMessage) {
          eventMessage += ' / ' + comment.message;
        } else {
          eventMessage = comment.message;
        }
      }
      if (this.store.systemData.isWaitingReset) {
        if (numMonth === api.GameDateTime.toNumber(this.store.systemData.resetGameDateTime)) {
          event = api.CharacterCommand.eventReset;
          eventMessage = 'リセット';
        } else if (numMonth > api.GameDateTime.toNumber(this.store.systemData.resetGameDateTime)) {
          event = api.CharacterCommand.eventAfterReset;
          eventMessage = '';
        }
      }

      Vue.set(cmd, 'event', event);
      Vue.set(cmd, 'eventMessage', eventMessage);

      month = api.GameDateTime.nextMonth(month);
    });
  }

  private isPolicyEnabled(id: number): boolean {
    return Enumerable.from(this.store.policies)
      .where((p) => p.countryId === this.store.character.countryId && p.status === api.CountryPolicy.statusAvailable)
      .any((p) => p.type === id);
  }
}

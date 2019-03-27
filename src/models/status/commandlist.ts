
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

  public get commands(): api.CharacterCommand[] {
    return this.inputer.commands;
  }

  public get canUseCountrySafe(): boolean {
    // 国庫を使えるか
    return Enumerable.from(this.store.towns)
      .any((t) => t.countryId === this.store.character.countryId &&
                  t.countryBuilding === api.Town.countryBuildingSafe);
  }

  public get canUseCountrySpy(): boolean {
    // 諜報府を使えるか
    return Enumerable.from(this.store.towns)
      .any((t) => t.countryId === this.store.character.countryId &&
                  t.countryBuilding === api.Town.countryBuildingSpy);
  }

  public get canUseCountryWork(): boolean {
    // 職業斡旋を使えるか
    return Enumerable.from(this.store.towns)
      .any((t) => t.countryId === this.store.character.countryId &&
                  t.countryBuilding === api.Town.countryBuildingWork);
  }

  public get canUseCountrySoldier(): boolean {
    // 兵種研究を使えるか
    return Enumerable.from(this.store.towns)
      .any((t) => t.countryId === this.store.character.countryId &&
                  t.countryBuilding === api.Town.countryBuildingSoldier);
  }

  public get canUseCountrySecretary(): boolean {
    // 政務官を使えるか
    return Enumerable.from(this.store.towns)
      .any((t) => t.countryId === this.store.character.countryId &&
                  t.countryBuilding === api.Town.countryBuildingSecretary);
  }

  public get isFewRemaining(): boolean {
    // コマンドの残りが少ない
    return Enumerable.from(this.inputer.commands)
      .where((c) => c.commandNumber <= 50 && c.type !== 0)
      .count() < 50;
  }

  public constructor(private store: StatusStore) {
    this.timer = setInterval(() => { this.secondsOfNextCommand--; }, 1000);
  }

  public reset() {
    this.isInitialized = false;
    this.preInitialize(new api.GameDateTime(0, 1));
  }

  public preInitialize(gamedate: api.GameDateTime) {
    // 武将データ入手前のコマンド一覧初期化
    this.inputer.commands = [];
    for (let i = 0; i < 200; i++) {
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
        NotificationService.commandExecuted.notifyWithParameter(command.name);
      } else {
        NotificationService.emptyCommandExecuted.notify();
      }
    }
  }

  private updateSecondsNextCommand(secondsNextCommand: number, nextMonth: api.GameDateTime) {
    let skipMonthCount = 0;
    if (nextMonth.year < def.UPDATE_START_YEAR) {
      // 更新開始年以前の表示
      const newMonth = new api.GameDateTime(def.UPDATE_START_YEAR, 1);
      skipMonthCount = api.GameDateTime.toNumber(newMonth) - api.GameDateTime.toNumber(nextMonth);
    }
    this.secondsOfNextCommand = secondsNextCommand + skipMonthCount * def.UPDATE_TIME;
  }

  private updateCommandTimeAndNumber(lastUpdatedGameDate: api.GameDateTime, lastUpdated: api.DateTime) {
    let month = api.GameDateTime.nextMonth(lastUpdatedGameDate);
    let skipMonthCount = 0;
    if (month.year < def.UPDATE_START_YEAR) {
      // 更新開始以降のコマンドのみを表示する
      const newMonth = new api.GameDateTime(def.UPDATE_START_YEAR, 1);
      skipMonthCount = api.GameDateTime.toNumber(newMonth) - api.GameDateTime.toNumber(month);
      month = newMonth;
    }

    // コマンド更新時間を初期化
    const commandDate = api.DateTime.toDate(lastUpdated);
    commandDate.setSeconds(commandDate.getSeconds() + skipMonthCount * def.UPDATE_TIME);
    this.commands.forEach((cmd, index) => {
      commandDate.setSeconds(commandDate.getSeconds() + def.UPDATE_TIME);
      cmd.commandNumber = index + 1;
      Vue.set(cmd, 'date', api.DateTime.fromDate(commandDate));
    });
  }
}

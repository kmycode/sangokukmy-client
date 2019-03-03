/* tslint:disable:member-ordering */

import * as api from '@/api/api';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';
import Vue from 'vue';
import ArrayUtil from '../common/arrayutil';
import StatusStore from './statusstore';

export enum CommandSelectMode {
  /**
   * 置き換え
   */
  replace = 0,
  /**
   * OR
   */
  mode_or = 1,
}

export default class CommandInputer {
  public commands: api.CharacterCommand[] = [];
  public commandSelectMode: CommandSelectMode = CommandSelectMode.mode_or;
  public isInputing = false;

  public get canInput(): boolean {
    return Enumerable.from(this.commands).any((c) => c.isSelected === true);
  }

  public constructor(private store: StatusStore) {}

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
      c.parameters.push(new api.CharacterCommandParameter(1, this.store.town.id));
    });
  }

  public inputTrainingCommand(commandType: number, trainingType: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, trainingType));
    });
  }

  public inputPromotionCommand(commandType: number, targetId: number, message: string) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, targetId));
      c.parameters.push(new api.CharacterCommandParameter(2, undefined, message));
    });
  }

  public inputRiceCommand(commandType: number, type: number, assets: number) {
    this.inputCommandPrivate(commandType, (c) => {
      const result = type === 1 ? api.Town.getMoneyToRicePrice(this.store.town, assets) :
                                  api.Town.getRiceToMoneyPrice(this.store.town, assets);
      c.parameters.push(new api.CharacterCommandParameter(1, type));
      c.parameters.push(new api.CharacterCommandParameter(2, assets));
      c.parameters.push(new api.CharacterCommandParameter(3, result));
    });
  }

  private inputCommandPrivate(commandType: number, setParams?: (c: api.CharacterCommand) => void) {
    const selectCommands = Enumerable.from(this.commands).where((c) => c.isSelected === true).toArray();
    if (selectCommands.length > 0) {
      this.isInputing = true;
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

          // サーバが設定したコマンドパラメータ取得の必要があるものをとってくる
          if (commandType === 19) {
            // 米売買
            api.Api.getCommands(Enumerable.from(selectCommands).select((c) => c.gameDate).toArray())
              .then((commands) => {
                Enumerable
                  .from(commands)
                  .join(selectCommands,
                        (c) => api.GameDateTime.toNumber(c.gameDate),
                        (c) => api.GameDateTime.toNumber(c.gameDate),
                        (n, o) => { return { oldCommand: o, newCommand: n, }; })
                  .forEach((data) => {
                    data.oldCommand.parameters = data.newCommand.parameters;
                    this.updateCommandName(data.oldCommand);
                  });
              });
          }
        })
        .catch((ex) => {
          if (ex.data.code === api.ErrorCode.lackOfTownTechnologyForSoldier) {
            NotificationService.inputCommandsFailedBecauseLackOfSoldierTechnology.notify();
          } else {
            NotificationService.inputCommandsFailed.notify();
          }
        })
        .finally(() => {
          this.isInputing = false;
        });
    } else {
      NotificationService.inputCommandsFailedBecauseCommandNotSelected.notify();
    }
  }

  public selectSingleCommand(command: api.CharacterCommand) {
    if (!command.canSelect) {
      return;
    }
    if (this.commandSelectMode === CommandSelectMode.replace) {
      this.clearAllCommandSelections();
      Vue.set(command, 'isSelected', true);
    } else {
      Vue.set(command, 'isSelected', !command.isSelected);
    }
  }

  public selectMultipleCommand(lastCommand: api.CharacterCommand) {
    if (!lastCommand.canSelect) {
      return;
    }
    const selected = Enumerable.from(this.commands)
      .where((c) => c.canSelect === true)
      .reverse()
      .skipWhile((c) => c.commandNumber !== lastCommand.commandNumber)
      .takeWhile((c) => c.isSelected !== true)
      .toArray();
    if (this.commandSelectMode === CommandSelectMode.replace) {
      this.clearAllCommandSelections();
    }
    selected.filter((c) => c.canSelect).forEach((c) => Vue.set(c, 'isSelected', true));

    // 置き換えモードで、一番最初のコマンドの選択が解除されるので選択しなおす
    if (this.commandSelectMode === CommandSelectMode.replace) {
      const first = Enumerable.from(this.commands)
        .takeWhile((c) => c.isSelected !== true)
        .lastOrDefault();
      if (first && first.canSelect) {
        Vue.set(first, 'isSelected', true);
      }
    }
  }

  public selectAllCommands() {
    this.commands.filter((c) => c.canSelect).forEach((c) => {
      this.selectCommandWithSelectMode(c, true);
    });
  }

  public selectEvenCommands() {
    this.commands.filter((c) => c.canSelect).forEach((c, index) => {
      this.selectCommandWithSelectMode(c, c.commandNumber % 2 === 1);
    });
  }

  public selectOddCommands() {
    this.commands.filter((c) => c.canSelect).forEach((c, index) => {
      this.selectCommandWithSelectMode(c, c.commandNumber % 2 === 0);
    });
  }

  public previewAxbCommands(a: number, b: number) {
    if (a === 0) {
      return;
    }
    this.commands.filter((c) => c.canSelect).forEach((c, index) => {
      Vue.set(c, 'isPreview', c.commandNumber >= b && c.commandNumber % a === b % a);
    });
  }

  public removePreviews() {
    this.commands.forEach((c) => {
      Vue.set(c, 'isPreview', false);
    });
  }

  public selectAxbCommands(a: number, b: number) {
    if (a === 0) {
      return;
    }
    this.commands.filter((c) => c.canSelect).forEach((c, index) => {
      this.selectCommandWithSelectMode(c, c.commandNumber >= b && c.commandNumber % a === b % a);
    });
  }

  public setRanged(isRanged: boolean) {
    this.commands.forEach((c) => {
      const selected = c.isSelected;
      Vue.set(c, 'isSelected', isRanged ? false : c.canSelect);
      Vue.set(c, 'canSelect', isRanged ? selected : true);
    });
  }

  private selectCommandWithSelectMode(command: api.CharacterCommand, value: boolean) {
    if (!command.canSelect) {
      return;
    }

    let isSelected = command.isSelected;

    if (this.commandSelectMode === CommandSelectMode.replace) {
      isSelected = value;
    } else if (this.commandSelectMode === CommandSelectMode.mode_or) {
      isSelected = isSelected || value;
    } else {
      NotificationService.invalidStatus.notifyWithParameter('commandSelectMode:' + this.commandSelectMode);
    }

    if (command.isSelected !== undefined) {
      command.isSelected = isSelected;
    } else {
      Vue.set(command, 'isSelected', isSelected);
    }
  }

  public clearAllCommandSelections() {
    Enumerable
      .from(this.commands)
      .where((c) => c.isSelected === true && c.canSelect === true)
      .forEach((c) => {
        c.isSelected = false;
      });
  }

  public updateCommandName(command: api.CharacterCommand) {
    api.CharacterCommand.updateName(command);

    // ステータス画面のデータがないと更新できない特殊なコマンドは、こっちのほうで名前を変える
    if (command.type === 17 || command.type === 13) {
      // 移動、戦争
      const targetTownId = Enumerable.from(command.parameters).firstOrDefault((cp) => cp.type === 1);
      if (targetTownId && targetTownId.numberValue) {
        const town = ArrayUtil.find(this.store.towns, targetTownId.numberValue);
        command.name = command.name.replace('%0%', town ? town.name : 'ERR[' + targetTownId.numberValue + ']');
      } else {
        command.name = 'エラー (' + command.type + ':A)';
      }
    } else if (command.type === 15) {
      // サーバからデータを取ってこないとデータがわからない特殊なコマンドは、こっちのほうで名前を変える
      // 登用
      const targetCharacterId = Enumerable.from(command.parameters).firstOrDefault((cp) => cp.type === 1);
      if (targetCharacterId && targetCharacterId.numberValue) {
        api.Api.getCharacter(targetCharacterId.numberValue)
          .then((chara) => {
            command.name = command.name.replace('%読込中%', chara.name);
          })
          .catch(() => {
            command.name = 'エラー (' + command.type + ':B)';
          });
      } else {
        command.name = 'エラー (' + command.type + ':A)';
      }
    }
  }
}

/* tslint:disable:member-ordering */

import * as api from '@/api/api';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';
import Vue from 'vue';
import ArrayUtil from '../common/arrayutil';

export enum CommandSelectMode {
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

export default class CommandInputer {
  public commands: api.CharacterCommand[] = [];
  public commandSelectMode: CommandSelectMode = CommandSelectMode.mode_or;
  public isInputing = false;

  public constructor(private getTowns: () => api.Town[]) {}

  public inputCommand(commandType: number) {
    this.inputCommandPrivate(commandType);
  }

  public inputSoldierCommand(commandType: number, soldierType: number, soldierNumber: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, soldierType),
                        new api.CharacterCommandParameter(2, soldierNumber));
    });
  }

  public inputMoveCommand(commandType: number, town: api.Town) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, town.id));
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
    } else if (this.commandSelectMode === CommandSelectMode.mode_and) {
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
      this.selectCommandWithSelectMode(c, index % 2 === 0);
    });
  }

  public selectOddCommands() {
    this.commands.filter((c) => c.canSelect).forEach((c, index) => {
      this.selectCommandWithSelectMode(c, index % 2 === 1);
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
        const town = ArrayUtil.find(this.getTowns(), targetTownId.numberValue);
        command.name = command.name.replace('%0%', town ? town.name : 'ERR[' + targetTownId.numberValue + ']');
      } else {
        command.name = 'エラー (' + command.type + ':A)';
      }
    }
  }
}
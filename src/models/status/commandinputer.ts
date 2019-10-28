/* tslint:disable:member-ordering */

import * as api from '@/api/api';
import * as def from '@/common/definitions';
import Enumerable from 'linq';
import NotificationService from '@/services/notificationservice';
import Vue from 'vue';
import ArrayUtil from '@/models/common/arrayutil';
import StatusStore from './statusstore';

export default class CommandInputer {
  public commands: api.CharacterCommand[] = [];
  public isInputing = false;

  public get canInput(): boolean {
    return Enumerable.from(this.commands).any((c) => c.isSelected === true);
  }

  public constructor(private store: StatusStore) {}

  public setCommandComments(message: string) {
    const selectCommands = Enumerable.from(this.commands).where((c) => c.isSelected === true).toArray();
    if (selectCommands.length > 0) {
      this.isInputing = true;
      const messages: api.CommandComment[] = [];
      selectCommands.forEach((c) => {
        messages.push(new api.CommandComment(0, c.gameDate, message));
      });
      api.Api.setCommandComments(messages)
        .then(() => {
          NotificationService.commandCommentUpdateSucceed.notify();
          selectCommands.forEach((c) => {
            c.isSelected = false;
          });
        }).catch(() => {
          NotificationService.commandCommentUpdateFailed.notify();
        }).finally(() => {
          this.isInputing = false;
        });
    } else {
      NotificationService.inputCommandsFailedBecauseCommandNotSelected.notify();
    }
  }

  public inputCommand(commandType: number) {
    this.inputCommandPrivate(commandType);
  }

  public inputSoldierCommand(commandType: number, soldierType: number, soldierNumber: number, isCustom: boolean) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, soldierType === 500 ? 1 : soldierType),
                        new api.CharacterCommandParameter(2, soldierNumber),
                        new api.CharacterCommandParameter(3, isCustom ? 1 : 0));
    });
  }

  public inputSoldierResearchCommand(commandType: number, soldierType: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, soldierType));
    });
  }

  public inputMoveCommand(commandType: number, townId?: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, townId || this.store.town.id));
    });
  }

  public inputTrainingCommand(commandType: number, trainingType: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, trainingType));
    });
  }

  public inputTownSubBuildingCommand(commandType: number, type: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, type));
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

  public inputSafeInCommand(commandType: number, money: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, money));
    });
  }

  public inputSafeOutCommand(commandType: number, charaId: number, money: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, charaId));
      c.parameters.push(new api.CharacterCommandParameter(2, money));
    });
  }

  public inputSecretaryAddCommand(commandType: number, type: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, type));
    });
  }

  public inputSecretaryCommand(commandType: number, id: number, unitId: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, id));
      c.parameters.push(new api.CharacterCommandParameter(2, unitId));
    });
  }

  public inputSecretaryMoveCommand(commandType: number, id: number, townId?: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, id));
      c.parameters.push(new api.CharacterCommandParameter(2, townId || this.store.town.id));
    });
  }

  public inputSecretaryRemoveCommand(commandType: number, id: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, id));
    });
  }

  public inputFormationCommand(commandType: number, id: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, id));
    });
  }

  public inputItemCommand(commandType: number, id: number, itemId: number) {
    const info = Enumerable.from(def.CHARACTER_ITEM_TYPES).firstOrDefault((i) => i.id === id);
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, id));
      if (info && info.isResource) {
        c.parameters.push(new api.CharacterCommandParameter(commandType === 50 ? 3 : 2, itemId));
      }
    });
  }

  public inputHandOverItemCommand(commandType: number, id: number, itemId: number, target: number) {
    const info = Enumerable.from(def.CHARACTER_ITEM_TYPES).firstOrDefault((i) => i.id === id);
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, id));
      c.parameters.push(new api.CharacterCommandParameter(2, target));
      if (info && info.isResource) {
        c.parameters.push(new api.CharacterCommandParameter(3, itemId));
      }
    });
  }

  public inputGenerateItemCommand(commandType: number, id: number) {
    this.inputCommandPrivate(commandType, (c) => {
      c.parameters.push(new api.CharacterCommandParameter(1, id));
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
      this.sendCommands(selectCommands, () => {
        NotificationService.inputCommandsSucceed.notifyWithParameter(selectCommands[0].name);
      });
    } else {
      NotificationService.inputCommandsFailedBecauseCommandNotSelected.notify();
    }
  }

  private sendCommands(commands: api.CharacterCommand[], onSucceed?: () => void) {
    api.Api.setCommands(commands)
      .then(() => {
        commands.forEach((c) => {
          this.updateCommandName(c);
          c.isSelected = false;
        });
        if (onSucceed) {
          onSucceed();
        }

        // サーバが設定したコマンドパラメータ取得の必要があるものをとってくる
        // この部分は、コマンド入力した時にのみ呼び出される。更新時には呼び出されないので大丈夫
        const cmd19 = Enumerable.from(commands).where((c) => c.type === 19).select((c) => c.gameDate).toArray();
        if (cmd19.length > 0) {
          // 米売買
          api.Api.getCommands(cmd19)
            .then((cmds) => {
              Enumerable
                .from(cmds)
                .join(commands,
                      (c) => api.GameDateTime.toNumber(c.gameDate),
                      (c) => api.GameDateTime.toNumber(c.gameDate),
                      // tslint:disable-next-line:arrow-return-shorthand
                      (n, o) => { return { oldCommand: o, newCommand: n }; })
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
        } else if (ex.data.code === api.ErrorCode.numberRangeError) {
          NotificationService.inputCommandsFailedBecauseTooLong
            .notifyWithParameter(ex.data.data.current, ex.data.data.max);
        } else {
          NotificationService.inputCommandsFailed.notify();
        }
      })
      .finally(() => {
        this.isInputing = false;
      });
  }

  public selectSingleCommand(command: api.CharacterCommand) {
    if (!command.canSelect) {
      return;
    }

    Vue.set(command, 'isSelected', !command.isSelected);
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
    selected.filter((c) => c.canSelect).forEach((c) => Vue.set(c, 'isSelected', true));
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

    const isSelected = command.isSelected || value;

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

  public insertCommands() {
    this.editCommands(true, false);
  }

  public removeCommands() {
    this.editCommands(false, false);
  }

  public loopCommands() {
    this.editCommands(false, true);
  }

  private editCommands(isInsert: boolean, isLoop: boolean) {
    let count = 0;
    let countAfterSelection = 0;
    let isCounting = false;
    const pushCommands: api.CharacterCommand[] = [];
    let selectedCommands: api.CharacterCommand[] = [];
    const commands = Enumerable
      .from(this.commands)
      .where((c) => c.canSelect === true)
      .skipWhile((c) => c.isSelected !== true)
      .toArray();

    commands.forEach((c) => {
      if (c.isSelected) {
        if (!isCounting) {
          count = 0;
          isCounting = true;
          selectedCommands = [];
        }
        count++;
        if (isInsert || isLoop) {
          selectedCommands.push(api.CharacterCommand.clone(c));
        }
      } else {
        if (isCounting) {
          isCounting = false;
          countAfterSelection = 0;
          if (isInsert) {
            for (let j = 0; j < count; j++) {
              const cmd = new api.CharacterCommand();
              pushCommands.push(cmd);
              this.updateCommandName(cmd);
            }
          }
          selectedCommands.forEach((sc) => {
            pushCommands.push(sc);
          });
        }
        if (count > 0 && isLoop) {
          pushCommands.push(api.CharacterCommand.clone(selectedCommands[countAfterSelection % count]));
        } else {
          pushCommands.push(api.CharacterCommand.clone(c));
        }
        countAfterSelection++;
      }
    });

    for (let i = pushCommands.length; i < commands.length; i++) {
      const cmd = new api.CharacterCommand();
      pushCommands.push(cmd);
      this.updateCommandName(cmd);
    }

    Enumerable.from(commands).zip(pushCommands, (a, b) => {
      return { old: a, new: b };
    }).forEach((es) => {
      es.new.commandNumber = es.old.commandNumber;
      es.new.date = es.old.date;
      es.new.gameDate = es.old.gameDate;
      es.new.event = es.old.event;
      es.new.eventMessage = es.old.eventMessage;
      es.new.canSelect = es.old.canSelect;
      this.updateCommandName(es.new);
    });

    this.isInputing = true;
    this.sendCommands(pushCommands, () => {
      const newCommands = Enumerable
        .from(pushCommands)
        .concat(this.commands.filter((c) => !commands.some((cc) => cc.commandNumber === c.commandNumber)))
        .orderBy((c) => c.commandNumber)
        .distinct((c) => c.commandNumber)
        .take(200)
        .toArray();
      if (newCommands.length < 200) {
        for (let i = newCommands.length; i < 200; i++) {
          const cmd = api.CharacterCommand.clone(this.commands[i]);
          cmd.type = 0;
          cmd.parameters = [];
          this.updateCommandName(cmd);
          newCommands.push(cmd);
        }
      }
      this.commands = newCommands;

      if (isInsert) {
        NotificationService.commandInserted.notify();
      } else if (isLoop) {
        NotificationService.commandLooped.notify();
      } else {
        NotificationService.commandRemoved.notify();
      }
    });
  }

  public updateCommandName(command: api.CharacterCommand) {
    api.CharacterCommand.updateName(command);

    // ステータス画面のデータがないと更新できない特殊なコマンドは、こっちのほうで名前を変える
    if (command.type === 17 || command.type === 13 || command.type === 45 || command.type === 46 ||
        command.type === 47 || command.type === 61) {
      // 都市データ（移動、戦争、偵察）
      const paramTypeId = command.type === 47 ? 2 : 1;
      const targetTownId = Enumerable.from(command.parameters).firstOrDefault((cp) => cp.type === paramTypeId);
      if (targetTownId && targetTownId.numberValue) {
        const town = ArrayUtil.find(this.store.towns, targetTownId.numberValue);
        command.name = command.name.replace('%0%', town ? town.name : 'ERR[' + targetTownId.numberValue + ']');
      } else {
        command.name = 'エラー (' + command.type + ':A)';
      }
    }
    if (command.type === 10 || command.type === 38) {
      // カスタム兵種（徴兵、兵種研究）
      const isCustom = Enumerable.from(command.parameters).firstOrDefault((cp) => cp.type === 3);
      if (command.type === 38 || (isCustom && isCustom.numberValue === 1)) {
        const typeId = Enumerable.from(command.parameters).firstOrDefault((cp) => cp.type === 1);
        if (typeId && typeId.numberValue) {
          const type = Enumerable
            .from(this.store.soldierTypes)
            .concat(this.store.soldierTypeCaches)
            .firstOrDefault((t) => t.id === typeId.numberValue);
          if (type) {
            command.name = command.name.replace('%0%', type.name);
          } else {
            if (command.type === 10) {
              // 徴兵
              api.Api.getSoldierType(typeId.numberValue)
                .then((t) => {
                  command.name = command.name.replace('%0%', t.name);
                  this.store.soldierTypeCaches.push(t);
                })
                .catch(() => {
                  command.name = 'エラー (' + command.type + ':C)';   // Bは欠番
                });
            } else {
              // 自分のじゃない研究中の兵種は常に取得できない
              command.name = '兵種研究';
            }
          }
        } else {
          command.name = 'エラー (' + command.type + ':A)';
        }
      }
    }
    if (command.type === 15 || command.type === 35 || command.type === 40 || command.type === 41 ||
        command.type === 47 || command.type === 52) {
      // サーバからデータを取ってこないとデータがわからない特殊なコマンドは、こっちのほうで名前を変える
      // 登用、国庫搬出、政務官削除、配属

      // 政務官配属（部隊名）
      if (command.type === 40) {
        const targetUnitId = Enumerable.from(command.parameters).firstOrDefault((cp) => cp.type === 2);
        if (targetUnitId && targetUnitId.numberValue) {
          const unit = Enumerable.from(this.store.units).firstOrDefault((u) => u.id === targetUnitId.numberValue);
          if (unit) {
            command.name = command.name.replace('%部隊%', unit.name);
          } else {
            api.Api.getUnit(targetUnitId.numberValue)
              .then((u) => {
                command.name = command.name.replace('%部隊%', u.name);
              })
              .catch(() => {
                command.name = 'エラー (' + command.type + ':AB)';
              });
          }
        } else {
          command.name = 'エラー (' + command.type + ':AA)';
          return;
        }
      }

      // 武将名をロード
      const paramType = command.type === 52 ? 2 : 1;
      const targetCharacterId = Enumerable.from(command.parameters).firstOrDefault((cp) => cp.type === paramType);
      if (targetCharacterId && targetCharacterId.numberValue) {
        const chara = Enumerable
          .from(this.store.characters)
          .firstOrDefault((c) => c.id === targetCharacterId.numberValue);
        if (chara) {
          command.name = command.name.replace('%読込中%', chara.name);
        } else {
          api.Api.getCharacter(targetCharacterId.numberValue)
            .then((chara2) => {
              command.name = command.name.replace('%読込中%', chara2.name);
            })
            .catch(() => {
              command.name = 'エラー (' + command.type + ':B)';
            });
        }
      } else {
        command.name = 'エラー (' + command.type + ':A)';
      }
    }
  }
}

import ArrayUtil from '@/models/common/arrayutil';
import CancellableAsyncStack from '@/models/common/cancellableasyncstack';
import * as api from '@/api/api';
import Enumerable from 'linq';
import * as def from '@/common/definitions';
import StatusStore from './statusstore';
import Vue from 'vue';
import NotificationService from '@/services/notificationservice';
import CommandList from './commandlist';

export default class UnitModel {

  public leaderUnit: api.Unit = new api.Unit(-1);
  public countryCharacters: api.Character[] = [];
  private isUpdatingUnit: boolean = false;
  private isUpdatingCountryCharacters: boolean = false;

  public get isUpdating(): boolean {
    return this.isUpdatingUnit || this.isUpdatingCountryCharacters;
  }

  public get units(): api.Unit[] {
    return this.store.units;
  }

  public get countries(): api.Country[] {
    return this.store.countries;
  }

  public get characters(): api.Character[] {
    return this.store.characters;
  }

  public get otherCharacterCommands(): api.CharacterCommand[] {
    return this.store.otherCharacterCommands;
  }

  public constructor(private store: StatusStore, public commands: CommandList) {}

  public updateUnits(cb?: () => void) {
    this.isUpdatingUnit = true;
    api.Api.getUnits()
      .then((units) => {
        this.store.units = units;
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
              .firstOrDefault((um) => um.characterId === this.store.character.id);
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

        // コールバック
        if (cb) {
          cb();
        }

        // 自分の部隊の武将を更新
        this.updateMyUnitCharacters();
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
      // 部隊から抜ける
      let isSucceed = false;
      api.Api.joinUnit(unit.id)
        .then(() => {
          NotificationService.unitJoined.notifyWithParameter(unit.name);
          this.store.units.forEach((u) => { Vue.set(u, 'isSelected', false); });
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
      // 部隊に入る
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
          } else if (ex.data.code === api.ErrorCode.numberRangeError) {
            if (ex.data.data.name === 'name') {
              NotificationService.unitCreateFailedBecauseNameTooLong
                .notifyWithParameter(this.leaderUnit.name, ex.data.data.current, ex.data.data.max);
            } else {
              NotificationService.unitCreateFailedBecauseMessageTooLong
                .notifyWithParameter(this.leaderUnit.name, ex.data.data.current, ex.data.data.max);
            }
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
        .catch((ex) => {
          if (ex.data.code === api.ErrorCode.numberRangeError) {
            if (ex.data.data.name === 'name') {
              NotificationService.unitUpdateFailedBecauseNameTooLong
                .notifyWithParameter(this.leaderUnit.name, ex.data.data.current, ex.data.data.max);
            } else {
              NotificationService.unitUpdateFailedBecauseMessageTooLong
                .notifyWithParameter(this.leaderUnit.name, ex.data.data.current, ex.data.data.max);
            }
          } else {
            NotificationService.unitUpdateFailed.notifyWithParameter(this.leaderUnit.name);
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

  public changeLeaderUnitLeader(newLeaderId: number) {
    if (this.leaderUnit.id >= 0) {
      this.isUpdatingUnit = true;
      let isSucceed = false;
      api.Api.changeUnitLeader(this.leaderUnit.id, newLeaderId)
        .then(() => {
          NotificationService.unitLeaderChanged.notifyWithParameter(this.leaderUnit.name);
          isSucceed = true;
        })
        .catch(() => {
          NotificationService.unitLeaderChangeFailed.notifyWithParameter(this.leaderUnit.name);
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

  private updateMyUnitCharacters() {
    if (this.leaderUnit && this.leaderUnit.id > 0) {
      this.countryCharacters = this.leaderUnit.members
        .map((m) => m.character)
        .filter((c) => c.aiType === api.Character.aiHuman);
      return;
    }
  }
}

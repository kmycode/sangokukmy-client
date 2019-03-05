import * as api from '@/api/api';
import Enumerable from 'linq';
import * as def from '@/common/definitions';
import ArrayUtil from '../common/arrayutil';
import NotificationService from '@/services/notificationservice';

export default class SoldierTypeModel {
  public types: api.CharacterSoldierType[] = [];
  public isUpdating: boolean = false;
  public lastReceived: api.CharacterSoldierType = new api.CharacterSoldierType();

  public onItemReceived(item: api.CharacterSoldierType) {
    ArrayUtil.addItem(this.types, item);
    this.lastReceived = item;
  }

  public save(item: api.CharacterSoldierType, callback: () => void) {
    this.isUpdating = true;
    const func = !item.id ? api.Api.addSoldierType(item) : api.Api.updateSoldierType(item);
    func
      .then(() => {
        NotificationService.soldierTypeUpdated.notifyWithParameter(item.name);
        callback();
      })
      .catch(() => {
        NotificationService.soldierTypeUpdateFailed.notifyWithParameter(item.name);
      })
      .finally(() => {
        this.isUpdating = false;
      });
  }
}

import * as api from '@/api/api';
import Enumerable from 'linq';
import * as def from '@/common/definitions';
import ArrayUtil from '../common/arrayutil';
import NotificationService from '@/services/notificationservice';
import StatusStore from './statusstore';

export default class SoldierTypeModel {
  public isUpdating: boolean = false;

  public get types(): api.CharacterSoldierType[] {
    return this.store.soldierTypes;
  }

  public constructor(private store: StatusStore) {}

  public onItemReceived(item: api.CharacterSoldierType) {
    ArrayUtil.addItem(this.types, item);
  }

  public save(item: api.CharacterSoldierType, callback: (result: api.CharacterSoldierType) => void) {
    this.isUpdating = true;
    const func = !item.id ? api.Api.addSoldierType(item) : api.Api.updateSoldierType(item);
    func
      .then((result) => {
        NotificationService.soldierTypeUpdated.notifyWithParameter(item.name);
        callback(result);
      })
      .catch(() => {
        NotificationService.soldierTypeUpdateFailed.notifyWithParameter(item.name);
      })
      .finally(() => {
        this.isUpdating = false;
      });
  }
}

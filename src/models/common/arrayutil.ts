import { Vue } from 'vue-property-decorator';
import * as api from '@/api/api';

export default class ArrayUtil {

  public static addItem<T extends api.IIdentitiedEntity>(items: T[], item: T) {
    this.addItemUniquely(items, item, (obj) => obj.id);
  }

  public static addItemUniquely<T>(items: T[], item: T, key: (obj: T) => any) {
    let i = -1;
    const addingKey = key(item);
    items.some((o, index) => {
      if (key(o) === addingKey) {
        i = index;
        return true;
      }
      return false;
    });
    if (i >= 0) {
      Vue.set(items, i, item);
    } else {
      items.push(item);
    }
  }

  public static addLog<T>(items: T[], item: T, maxLength: number) {
    items.unshift(item);
    while (maxLength < items.length) {
      items.pop();
    }
  }

  public static find<T extends api.IIdentitiedEntity>(items: T[], id: number): T | undefined {
    for (const item of items) {
      if (item.id === id) {
        return item;
      }
    }
    return undefined;
  }

  public static findUniquely<T>(items: T[], id: number, key: (obj: T) => number): T | undefined {
    for (const item of items) {
      if (key(item) === id) {
        return item;
      }
    }
    return undefined;
  }

  private constructor() {}

}

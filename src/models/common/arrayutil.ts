import { Vue } from 'vue-property-decorator';
import * as api from '@/api/api';
import Enumerable from 'linq';

export default class ArrayUtil {

  public static addItem<T extends api.IIdentitiedEntity>(items: T[], item: T): T | undefined {
    return this.addItemUniquely(items, item, (obj) => obj.id);
  }

  public static addItemUniquely<T>(items: T[], item: T, key: (obj: T) => any): T | undefined {
    let i = -1;
    let old: T | undefined;
    const addingKey = key(item);
    items.some((o, index) => {
      if (key(o) === addingKey) {
        i = index;
        return true;
      }
      return false;
    });
    if (i >= 0) {
      old = items[i];
      Vue.set(items, i, item);
    } else {
      items.push(item);
      old = undefined;
    }
    return old;
  }

  public static addLog<T extends api.IIdentitiedEntity>(items: T[], item: T, maxLength: number = -1) {
    if (!ArrayUtil.find(items, item.id)) {
      items.unshift(item);
      if (maxLength >= 0) {
        while (maxLength < items.length) {
          items.pop();
        }
      }
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

  public static replace<T>(items: T[], newItems: T[]) {
    Enumerable.range(0, items.length).forEach(() => {
      items.pop();
    });
    newItems.forEach((item) => {
      items.push(item);
    });
  }

  private constructor() {}

}

import { Vue } from 'vue-property-decorator';

export default class ArrayUtil {

  public static addItem<T>(items: T[], item: T, maxLength: number) {
    items.unshift(item);
    while (maxLength < items.length) {
      items.pop();
    }
  }

  public static addUniquelyItem<T>(items: T[], item: T, identity: (obj: T) => number) {
    const itemIdentity = identity(item);
    let i = -1;
    items.some((o, index) => {
      if (identity(o) === itemIdentity) {
        i = index;
        return true;
      }
      return false;
    });
    console.dir(item);
    console.log(i);
    if (i >= 0) {
      Vue.set(items, i, item);
    } else {
      items.push(item);
    }
  }

  private constructor() {}

}

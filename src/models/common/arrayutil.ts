export default class ArrayUtil {

  public static addItem<T>(items: T[], item: T, maxLength: number) {
    items.unshift(item);
    while (maxLength < items.length) {
      items.pop();
    }
  }

  private constructor() {}

}

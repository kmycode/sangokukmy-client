import Enumerable from 'linq';
import * as def from '@/common/definitions';

export default class ValueUtil {
  public static getPostName(post: number): string {
    const p = Enumerable.from(def.COUNTRY_POSTS)
      .firstOrDefault((pp) => pp.id === post);
    if (p) {
      return p.name;
    } else {
      return '役職不明';
    }
  }

  public static getNumberWithUnit(num: number): string {
    if (num < 1000) {
      return num.toString();
    } else {
      const val = Number(num / 1000).toPrecision(3);
      const unit = num < 1000000 ? 'k' : num < 1000000000 ? 'M' : 'G';
      return val + unit;
    }
  }
}

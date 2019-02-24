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
}

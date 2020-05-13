import * as api from '@/api/api';
import ArrayUtil from '../common/arrayutil';
import Enumerable from 'linq';

export default class ThreadBbs {
  public threads: api.ThreadBbsItem[] = [];
  public isUnread: boolean = false;
  private isOpenPrivate: boolean = false;
  private isUnreadQueue = false;
  private lastReadId: number = 0;

  public get isOpen(): boolean {
    return this.isOpenPrivate;
  }

  public set isOpen(value: boolean) {
    if (value) {
      this.isUnreadQueue = this.isUnread;
      this.isUnread = false;
    }
    this.isOpenPrivate = value;
  }

  public get lastItemId(): number {
    if (this.threads.length) {
      const messages = Enumerable
        .from(this.threads)
        .concat(Enumerable.from(this.threads).selectMany((t) => t.children ? t.children : []))
        .orderByDescending((t) => t.id);
      const first = messages.firstOrDefault();
      if (first) {
        return first.id;
      }
    }
    return 0;
  }

  public constructor(private setRead?: ((id: number) => any)) {
    if (this.setRead) {
      window.setInterval(() => {
        const lastId = this.lastItemId;
        if (this.setRead && this.threads.length > 0 &&
            (this.isUnreadQueue || (this.isOpen && this.lastReadId !== lastId))) {
          this.setRead(lastId);
          this.isUnreadQueue = this.isUnread;
          this.lastReadId = lastId;
        }
      }, 8000);
    }
  }

  public onItemReceived(item: api.ThreadBbsItem) {

    // APIから来ないデータを設定しておく（undefinedにしない）
    item.isOpen = true;

    if (!item.isRemove) {
      // 追加
      if (!item.parentId) {
        // スレッド
        const thread = ArrayUtil.find(this.threads, item.id);
        if (!thread) {
          if (!item.children) {
            item.children = [];
          }
          this.threads.unshift(item);
        }
      } else {
        // レス
        const thread = ArrayUtil.find(this.threads, item.parentId);
        if (thread) {
          const child = ArrayUtil.find(thread.children, item.id);
          if (!child) {
            thread.children.unshift(item);
          }
        }
      }
      if (!this.isOpen) {
        this.isUnread = true;
      }
    } else {
      // 削除
      if (!item.parentId) {
        // スレッド
        const thread = ArrayUtil.find(this.threads, item.id);
        if (thread) {
          this.threads.splice(this.threads.indexOf(thread), 1);
        }
      } else {
        // レス
        const thread = ArrayUtil.find(this.threads, item.parentId);
        if (thread) {
          const child = ArrayUtil.find(thread.children, item.id);
          if (child) {
            thread.children.splice(thread.children.indexOf(child), 1);
          }
        }
      }
    }
  }

  public reset(items: api.ThreadBbsItem[]) {
    items.forEach((item) => {
      this.onItemReceived(item);
    });
  }

  public sortThreads() {
    this.threads = Enumerable
      .from(this.threads)
      .orderByDescending((t) => api.DateTime.toDate(this.getThreadNewestItem(t).written))
      .toArray();
  }

  private getThreadNewestItem(thread: api.ThreadBbsItem): api.ThreadBbsItem {
    if (thread.children && thread.children.length > 0) {
      return thread.children[0];
    } else {
      return thread;
    }
  }
}

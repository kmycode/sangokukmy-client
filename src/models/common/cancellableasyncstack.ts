
/**
 * 複数の同じ操作を何度も繰り返さず、「現在進行中の操作」と、
 * 「一番最後に要求された操作」の２つのみを保持し実行するクラス
 */
export default class CancellableAsyncStack<T> {

  public then?: (obj: T) => void;
  public catch?: (obj: any) => void;
  public finally?: () => void;
  public currentThen?: (obj: T) => void;
  public currentCatch?: (obj: any) => void;
  public currentFinally?: () => void;

  private doing?: () => Promise<T>;
  private next?: () => Promise<T>;

  /**
   * 操作をプッシュする。現在進行中の操作がなければ実行し、
   * 進行中であれば次の操作として保持する
   * @param process 操作
   */
  public push(process: () => Promise<T>) {
    if (!this.doing) {
      this.next = process;
      this.call();
    } else {
      this.next = process;
    }
  }

  private call() {
    if (this.next) {
      const n = this.next;
      this.doing = this.next;
      this.next = undefined;
      this.currentThen = this.then;
      this.currentCatch = this.catch;
      this.currentFinally = this.finally;
      n()
        .then((obj) => {
          if (this.currentThen) { this.currentThen(obj); }
        })
        .catch((obj) => {
          if (this.currentCatch) { this.currentCatch(obj); }
        })
        .finally(() => {
          if (this.currentFinally) { this.currentFinally(); }
          this.doing = undefined;
          this.call();
        });
    }
  }

}

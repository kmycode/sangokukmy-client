
export default class EventObjectWithParam<T> {
  public constructor(public onFire: (param: T) => void) {}

  public fire(param: T) {
    this.onFire(param);
  }
}

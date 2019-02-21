
export default class EventObject {
  public constructor(private ev: () => void) {}

  public fire() {
    this.ev();
  }
}

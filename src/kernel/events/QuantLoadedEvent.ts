export default class QuantLoadedEvent extends Event {
  static get LOADED(): string {
    return 'quantLoaded';
  }
  public QuantName: string;
}

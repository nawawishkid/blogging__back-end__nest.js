export class SessionNotFoundException extends Error {
  constructor(msg?) {
    super(msg);
    this.name = SessionNotFoundException.name;
  }
}

export class UserNotFoundException extends Error {
  constructor(msg?) {
    super(msg);
    this.name = UserNotFoundException.name;
  }
}

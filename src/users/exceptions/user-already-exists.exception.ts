export class UserAlreadyExistsException extends Error {
  constructor(msg?) {
    super(msg);
    this.name = UserAlreadyExistsException.name;
  }
}

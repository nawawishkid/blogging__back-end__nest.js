export class DuplicatedCustomFieldException extends Error {
  constructor(msg?) {
    super(msg);
    this.name = DuplicatedCustomFieldException.name;
  }
}

export class DuplicatedCustomFieldValueException extends Error {
  constructor(msg?) {
    super(msg);

    this.name = DuplicatedCustomFieldValueException.name;
  }
}

export class CustomFieldNotFoundException extends Error {
  constructor(msg?) {
    super(msg);
    this.name = CustomFieldNotFoundException.name;
  }
}

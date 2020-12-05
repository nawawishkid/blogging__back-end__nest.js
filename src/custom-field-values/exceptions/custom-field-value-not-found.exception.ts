export class CustomFieldValueNotFoundException extends Error {
  constructor(msg?) {
    super(msg);

    this.name = CustomFieldValueNotFoundException.name;
  }
}

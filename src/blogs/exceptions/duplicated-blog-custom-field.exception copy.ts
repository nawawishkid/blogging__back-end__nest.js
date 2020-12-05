export class DuplicatedBlogCustomFieldException extends Error {
  constructor(msg?) {
    super(msg);
    this.name = DuplicatedBlogCustomFieldException.name;
  }
}

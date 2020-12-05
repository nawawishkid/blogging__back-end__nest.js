export class BlogNotFoundException extends Error {
  constructor(msg?) {
    super(msg);
    this.name = BlogNotFoundException.name;
  }
}

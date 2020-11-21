export class IncorrectPasswordException extends Error {
  constructor() {
    super(`Incorrect password`);
  }
}

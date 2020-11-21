export class EmailNotFoundException extends Error {
  constructor(email) {
    super(`User with email '${email}' could not be found`);
  }
}

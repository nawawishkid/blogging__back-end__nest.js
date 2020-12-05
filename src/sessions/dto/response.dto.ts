import { Session } from '../entities/session.entity';

export class CreateSessionResponseDto {
  createdSession: Session;
}

export class UpdateSessionResponseDto {
  updatedSession: Session;
}

export class FindAllSessionsResponseDto {
  sessions: Session[];
}

export class FindOneSessionResponseDto {
  session: Session;
}

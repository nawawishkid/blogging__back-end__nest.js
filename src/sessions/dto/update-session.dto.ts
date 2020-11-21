import { IsBoolean, IsNumber, IsObject, IsOptional } from 'class-validator';
import { SessionData } from 'express-session';

export interface ExpressSessionDataDto extends SessionData {
  [key: string]: any;
}

export class UpdateSessionDto {
  @IsObject()
  data: ExpressSessionDataDto;

  @IsOptional()
  @IsBoolean()
  isRevoked?: boolean;

  @IsOptional()
  @IsNumber()
  userId?: number;
}

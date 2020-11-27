import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsDefined,
  IsEmpty,
  IsInt,
  IsNotEmptyObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Cookie, SessionData } from 'express-session';

export interface IExpressSessionDataDto extends SessionData {
  [key: string]: any;
}
export class ValidateableCookie extends Cookie {
  @IsInt()
  originalMaxAge: number;

  @IsDate()
  expires?: Date;
}
export class ExpressSessionDataDto implements IExpressSessionDataDto {
  @IsDefined()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => ValidateableCookie)
  cookie: ValidateableCookie;
  [key: string]: any;
}

export class UpdateSessionDto {
  // @ValidateNested()
  // @Type(() => ExpressSessionDataDto)
  // data: ExpressSessionDataDto;
  // data?: Record<any, any>;
  @IsEmpty()
  data?: Record<any, any>;

  @IsEmpty()
  id?: string;

  @IsOptional()
  @IsBoolean()
  isRevoked?: boolean;

  @IsOptional()
  @IsInt()
  userId?: number;
}

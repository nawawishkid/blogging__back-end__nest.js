import { IsBoolean, IsNumber, IsObject, IsOptional } from 'class-validator';

type ExpressSessionDataDto = {
  cookie: {
    _expires: number;
    [key: string]: any;
  };
};

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

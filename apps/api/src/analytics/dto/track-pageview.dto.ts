import { IsString, MaxLength, MinLength } from 'class-validator';

export class TrackPageviewDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  path: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  visitorId: string;
}

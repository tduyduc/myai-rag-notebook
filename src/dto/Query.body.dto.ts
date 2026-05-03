import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, MinLength } from 'class-validator';

export class QueryBodyDto {
  @ApiProperty({ type: String, minLength: 1 })
  @MinLength(1)
  text!: string;

  @ApiProperty({ required: false, nullable: true, type: String, minLength: 1 })
  @IsOptional()
  @MinLength(1)
  category: string | null | undefined;
}

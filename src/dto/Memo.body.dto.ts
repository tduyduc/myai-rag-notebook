import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, MinLength } from 'class-validator';

export class MemoBodyDto {
  @ApiProperty({ type: String, minLength: 1 })
  @MinLength(1)
  text!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    type: 'array',
    items: { type: 'string', minLength: 1 },
  })
  @IsOptional()
  @IsArray()
  @MinLength(1, { each: true })
  categories: readonly string[] | null | undefined;
}

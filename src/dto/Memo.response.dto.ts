import { ApiProperty } from '@nestjs/swagger';

export class MemoResponseDto {
  @ApiProperty({ type: String })
  text!: string;

  @ApiProperty({ type: 'array', items: { type: 'string' } })
  categories!: readonly string[];
}

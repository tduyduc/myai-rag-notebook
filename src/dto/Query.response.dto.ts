import { ApiProperty } from '@nestjs/swagger';

export class QueryResponseDto {
  @ApiProperty({ type: String })
  response!: string;
}

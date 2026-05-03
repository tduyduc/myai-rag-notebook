import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  RequestMethod,
  Sse,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { from, type Observable } from 'rxjs';
import { AppService } from './app.service.js';
import { MemoBodyDto } from './dto/Memo.body.dto.js';
import { MemoResponseDto } from './dto/Memo.response.dto.js';
import { QueryBodyDto } from './dto/Query.body.dto.js';
import { QueryResponseDto } from './dto/Query.response.dto.js';

@Controller()
@ApiTags('App')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/memo')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ type: MemoResponseDto })
  async memo(@Body() body: MemoBodyDto): Promise<MemoResponseDto> {
    return this.appService.memo(body);
  }

  @Post('/query')
  @ApiResponse({ type: QueryResponseDto })
  async query(@Body() body: QueryBodyDto): Promise<QueryResponseDto> {
    return this.appService.query(body);
  }

  @Sse('/query/sse', { method: RequestMethod.POST })
  @ApiResponse({
    description: 'An event stream of strings.',
    content: {
      'text/event-stream': {
        schema: { type: 'string' },
      },
    },
  })
  queryStreamed(@Body() body: QueryBodyDto): Observable<string> {
    return from<AsyncGenerator<string, void, unknown>>(
      this.appService.queryStreamed(body),
    );
  }
}

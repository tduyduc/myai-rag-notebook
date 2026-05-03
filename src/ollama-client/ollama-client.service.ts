import { Injectable, type OnModuleDestroy } from '@nestjs/common';
import { Ollama, type ChatRequest } from 'ollama';
import { Profiler } from '../profiler/profiler.injection-token.js';
import { OllamaClient } from './ollama-client.injection-token.js';

interface Abortable {
  abort(): void;
}

@Injectable()
export class OllamaClientService
  extends OllamaClient
  implements OnModuleDestroy
{
  private readonly baseUrl: string | undefined = process.env['OLLAMA_HOST'];

  private readonly chatModel: string =
    process.env['OLLAMA_CHAT_MODEL'] ??
    (() => {
      throw new Error(
        'No Ollama chat model has been set! Please set "OLLAMA_CHAT_MODEL" environment variable!',
      );
    })();

  private readonly embeddingModel: string =
    process.env['OLLAMA_EMBEDDING_MODEL'] ??
    (() => {
      throw new Error(
        'No Ollama embedding model has been set! Please set "OLLAMA_EMBEDDING_MODEL" environment variable!',
      );
    })();

  private readonly client = new Ollama({
    host: this.baseUrl,
  });

  private readonly abortables = new Set<Abortable>();

  constructor(private readonly profiler: Profiler) {
    super();
  }

  onModuleDestroy(): void {
    for (const abortable of this.abortables) {
      abortable.abort();
    }
    this.abortables.clear();
  }

  public override async query(request: ChatRequest): Promise<string> {
    const timeLabel = `Query: ${JSON.stringify(request.messages)}`;
    this.profiler.time(timeLabel);

    try {
      return (
        await this.client.chat({
          ...request,
          stream: false,
          model: this.chatModel,
        })
      ).message.content;
    } finally {
      this.profiler.timeEnd(timeLabel);
    }
  }

  public override async *stream(
    request: ChatRequest,
  ): AsyncGenerator<string, void, unknown> {
    const timeLabel = `Stream: ${JSON.stringify(request.messages)}`;
    this.profiler.time(timeLabel);

    try {
      const asyncIterator = await this.client.chat({
        ...request,
        stream: true,
        model: this.chatModel,
      });

      this.abortables.add(asyncIterator);

      try {
        for await (const part of asyncIterator) {
          yield part.message.content;
        }
      } finally {
        this.abortables.delete(asyncIterator);
      }
    } finally {
      this.profiler.timeEnd(timeLabel);
    }
  }

  public override async embed(
    text: string,
    dimensions: number,
  ): Promise<Float32Array> {
    const timeLabel = `Embedding: '${text}'`;
    this.profiler.time(timeLabel);

    try {
      return new Float32Array(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        (
          await this.client.embed({
            model: this.embeddingModel,
            input: text,
            dimensions,
          })
        ).embeddings[0]!,
      );
    } finally {
      this.profiler.timeEnd(timeLabel);
    }
  }
}

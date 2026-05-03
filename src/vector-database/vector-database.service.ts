import * as LanceDb from '@lancedb/lancedb';
import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import * as Arrow from 'apache-arrow';
import { ulid } from 'ulid';
import { OllamaClient } from '../ollama-client/ollama-client.injection-token.js';
import { Profiler } from '../profiler/profiler.injection-token.js';
import { isDefined } from '../utils/is-defined.js';
import type { VectorDatabaseEntry } from './interfaces.js';
import { VectorDatabase } from './vector-database.injection-token.js';

@Injectable()
export class VectorDatabaseService
  extends VectorDatabase
  implements OnModuleInit, OnModuleDestroy
{
  private static readonly EMBEDDINGS_DIMENSIONALITY = 768;
  private static readonly DEFAULT_TOP_K = 5;

  private db: LanceDb.Connection | undefined;
  private table: LanceDb.Table | undefined;

  constructor(
    private readonly profiler: Profiler,
    private readonly ollamaClient: OllamaClient,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    const tableName: string =
      process.env['LANCEDB_TABLE'] ??
      (() => {
        throw new Error(
          'No LanceDB table name has been set! Please set "LANCEDB_TABLE" environment variable!',
        );
      })();

    this.db = await LanceDb.connect(
      process.env['LANCEDB_PATH'] ??
        (() => {
          throw new Error(
            'No LanceDB path has been set! Please set "LANCEDB_PATH" environment variable!',
          );
        })(),
    );

    if (!(await this.db.tableNames()).includes(tableName)) {
      const schema: Arrow.Schema = new Arrow.Schema([
        new Arrow.Field(
          'id' satisfies keyof VectorDatabaseEntry,
          new Arrow.Utf8(),
          false,
        ),
        new Arrow.Field(
          'text' satisfies keyof VectorDatabaseEntry,
          new Arrow.Utf8(),
          false,
        ),
        new Arrow.Field(
          'vector' satisfies keyof VectorDatabaseEntry,
          new Arrow.FixedSizeList(
            VectorDatabaseService.EMBEDDINGS_DIMENSIONALITY,
            new Arrow.Field('item', new Arrow.Float32()),
          ),
          false,
        ),
        new Arrow.Field(
          'createdAt' satisfies keyof VectorDatabaseEntry,
          new Arrow.TimestampMillisecond('Etc/UTC'),
          false,
        ),
        new Arrow.Field(
          'categories' satisfies keyof VectorDatabaseEntry,
          new Arrow.List(new Arrow.Field('category', new Arrow.Utf8())),
          false,
        ),
      ]);

      this.table = await this.db.createEmptyTable(tableName, schema, {
        mode: 'create',
      });
    } else {
      this.table = await this.db.openTable(tableName);
    }
    this.table satisfies LanceDb.Table; // Assignment check
  }

  onModuleDestroy(): void {
    this.table?.close();
    this.db?.close();
  }

  public override async save(
    text: string,
    additionalOptions?: {
      id?: string;
      createdAt?: Date;
      categories?: readonly string[];
    },
  ): Promise<VectorDatabaseEntry> {
    if (!isDefined(this.table)) {
      throw new Error('Database is not ready!');
    }

    const timeLabel = `Memo: '${text}'`;
    this.profiler.time(timeLabel);

    try {
      const now = new Date();
      ulid(now.getTime());

      const vector = await this.ollamaClient.embed(
        text,
        VectorDatabaseService.EMBEDDINGS_DIMENSIONALITY,
      );

      const { id, createdAt, categories } = additionalOptions ?? {};

      const result = {
        id: id ?? ulid(now.getTime()),
        text,
        vector,
        createdAt: createdAt ?? now,
        categories: categories ?? [],
      } satisfies VectorDatabaseEntry;

      await this.table.add([result]);

      return result;
    } finally {
      this.profiler.timeEnd(timeLabel);
    }
  }

  public override async find(
    text: string,
    additionalOptions?: {
      limit?: number;
      category?: string;
    },
  ): Promise<VectorDatabaseEntry[]> {
    if (!isDefined(this.table)) {
      throw new Error('Database is not ready!');
    }

    const timeLabel = `Find: '${text}'`;
    this.profiler.time(timeLabel);

    try {
      const { limit, category } = additionalOptions ?? {};

      const vector = await this.ollamaClient.embed(
        text,
        VectorDatabaseService.EMBEDDINGS_DIMENSIONALITY,
      );

      const categoryMatchQuery = category
        ? new LanceDb.MatchQuery(
            category,
            'categories' satisfies keyof VectorDatabaseEntry,
            { fuzziness: 2 },
          )
        : undefined;

      const vectorQuery = this.table
        .vectorSearch(vector)
        .distanceType('cosine')
        .postfilter()
        .limit(limit ?? VectorDatabaseService.DEFAULT_TOP_K);

      if (isDefined(categoryMatchQuery)) {
        vectorQuery.fullTextSearch(categoryMatchQuery);
      }

      return await (vectorQuery.toArray() as Promise<VectorDatabaseEntry[]>);
    } finally {
      this.profiler.timeEnd(timeLabel);
    }
  }
}

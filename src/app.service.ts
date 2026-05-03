import { Injectable } from '@nestjs/common';
import { MemoBodyDto } from './dto/Memo.body.dto.js';
import { MemoResponseDto } from './dto/Memo.response.dto.js';
import { QueryBodyDto } from './dto/Query.body.dto.js';
import { QueryResponseDto } from './dto/Query.response.dto.js';
import { OllamaClient } from './ollama-client/ollama-client.injection-token.js';
import { VectorDatabase } from './vector-database/vector-database.injection-token.js';

@Injectable()
export class AppService {
  constructor(
    private readonly ollamaClient: OllamaClient,
    private readonly vectorDb: VectorDatabase,
  ) {}

  async memo({ text, categories }: MemoBodyDto): Promise<MemoResponseDto> {
    const result = await this.vectorDb.save(text, {
      categories: categories ?? [],
    });

    return {
      text: result.text,
      categories: result.categories,
    };
  }

  async query(body: QueryBodyDto): Promise<QueryResponseDto> {
    const response = await this.ollamaClient.query({
      messages: [
        { role: 'system', content: await this.createRagSystemPrompt(body) },
        { role: 'user', content: body.text },
      ],
    });

    return { response };
  }

  async *queryStreamed(
    body: QueryBodyDto,
  ): AsyncGenerator<string, void, unknown> {
    yield* this.ollamaClient.stream({
      messages: [
        { role: 'system', content: await this.createRagSystemPrompt(body) },
        { role: 'user', content: body.text },
      ],
    });
  }

  private async createRagSystemPrompt(body: QueryBodyDto): Promise<string> {
    const vectorDbResults = await this.vectorDb.find(body.text, {
      category: body.category ?? '',
    });

    return `
You are an assistant who answers queries based on the memos previously ingested by user.
Here's the knowledge base:

\`\`\`json
${JSON.stringify(
  vectorDbResults.map(({ id, text, createdAt, categories }) => ({
    id,
    text,
    createdAt,
    categories,
  })),
)}
\`\`\`

- Mirror the language of user query.
- Use EXCLUSIVELY the knowledge base above to answer the user query.
- Don't give follow-up questions (unless explicitly asked by user).
- If the knowledge base is empty or no answers can be made based on the knowledge base, answer that you don't know and suggest other queries that might successfully answer (if some clues can be found from the knowledge base).
`;
  }
}

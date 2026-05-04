import { Injectable } from '@nestjs/common';
import { MemoBodyDto } from './dto/Memo.body.dto.js';
import { MemoResponseDto } from './dto/Memo.response.dto.js';
import { QueryBodyDto } from './dto/Query.body.dto.js';
import { QueryResponseDto } from './dto/Query.response.dto.js';
import { OllamaClient } from './ollama-client/ollama-client.injection-token.js';
import { isDefined } from './utils/is-defined.js';
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
      categories: Array.from(result.categories).filter(isDefined),
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

    const notes = vectorDbResults
      .map(({ text, categories }) => {
        const categoryLabel = categories.length
          ? ` [categories: ${Array.from(categories).join(', ')}]`
          : '';

        return `- ${text}${categoryLabel}`;
      })
      .join('\n');

    return `
Answer the user's question using only the notes below.
Reply directly to the user's question.
Do not answer this instruction message.
Do not explain your reasoning.
Treat each note as a factual statement, even if the wording is not identical to the user's question.
If multiple notes are relevant, combine them into one concise answer.

---

Rules:
- Mirror the language of the user's question.
- If the notes do not contain the answer, say: "I don't know" (language mirrored).
- Do not ask follow-up questions unless the user explicitly asks for them.
- Keep the answer concise and factual.

---

Examples:
- Question: What is my favorite database?
  Notes:
  - My favorite database is LanceDB.
  Answer: Your favorite database is LanceDB.
- Question: What backend technologies do I use?
  Notes:
  - I build APIs with NestJS and Fastify.
  - I validate requests with class-validator.
  Answer: You use NestJS, Fastify, and class-validator.
- Question: Tôi thích lập trình với ngôn ngữ gì?
  Notes:
  - Tôi thích lập trình với TypeScript.
  Answer: Bạn thích lập trình với TypeScript.
- Question: 私の好きなフレームワークは何ですか？
  Notes:
  - My favorite framework is NestJS.
  Answer: あなたの好きなフレームワークはNestJSです。
- Question: What is the meaning of life?
  Notes:
  - No relevant notes found.
  Answer: I don't know.

---

Notes:
${notes || '- No relevant notes found.'}
`;
  }
}

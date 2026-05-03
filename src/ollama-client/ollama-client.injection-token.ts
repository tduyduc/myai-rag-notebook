import type { ChatRequest } from 'ollama';

export abstract class OllamaClient {
  /** Passes the prompt to the AI model (no streaming). */
  abstract query(
    request: Pick<ChatRequest, 'messages'> & Partial<ChatRequest>,
  ): Promise<string>;

  /** Passes the prompt to the AI model (streamed). */
  abstract stream(
    request: Pick<ChatRequest, 'messages'> & Partial<ChatRequest>,
  ): AsyncGenerator<string, void, unknown>;

  /** Generates text embeddings for the specified text. */
  abstract embed(text: string, dimensions: number): Promise<Float32Array>;
}

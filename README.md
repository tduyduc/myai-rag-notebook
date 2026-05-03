# "MyAI" RAG Notebook

A demonstration notebook for Retrieval-Augmented Generation (RAG).

## Features

### What's Included

- MIT-licensed project for learning and reuse in other projects
- TypeScript 7 Native Preview for faster build and type-check workflows
- Memo ingestion
- Memo retrieval and querying (including SSE streaming)
- Ollama for both chat generation and embeddings
- LanceDB for persistent vector storage and similarity search
- Abstract class-based dependency injection contracts
- Optional operation timing/profiling (enabled via environment variable)

### What's Not Included

- Memo listing (planned)
- Memo deletion (planned)
- Authentication
- Rate limiting

## Installation

Node.js 20+ is required to run this project. Latest LTS version is recommended.

```bash
# Copy environment variable files
$ cp --update=none .env.example .env
$ cp --update=none .env.shared.example .env.shared

# Install packages
$ npm ci
```

## Getting Started

```bash
# Starts Docker for background services
$ docker-compose up
```

To verify that Ollama is working, assuming that you've pulled the `gemma3:270m` model, run the following command:

```bash
curl http://localhost:11434/api/generate -X POST --data '{ "model": "gemma3:270m", "prompt": "Hello world!", "stream": false }'
```

To start the NestJS server, run:

```bash
# Start NestJS server only
npm run start

# Start NestJS server and watch file changes
npm run start:dev
```

Assuming that the NestJS application runs on port 3000, open `http://localhost:3000/api` to view the Swagger docs.

## CLI Usage

To ingest a memo, use the `memo` command. Categories are optional.

```bash
# Memo without categories
node myai memo 'I love NestJS!'
# Memo with categories
node myai memo 'I love NestJS!' --category programming --category coding
```

To query memos, use the `query` command. Category filtering is optional. Responses are streamed by default.

```bash
# Query without category
node myai query 'What do I love?'
# Query with category, explicit streaming flag
node myai query 'What do I love?' --category programming --stream
# Query, no streaming
node myai query 'What do I love?' --no-stream
```

## Contributions Welcome

Contributions are welcome and appreciated.

If you find a bug, have an idea, or want to improve the project, please open an issue first so we can discuss the best approach. Clear issue reports with reproduction steps, expected behavior, and actual behavior are especially helpful.

Pull requests are encouraged for bug fixes, improvements, and new features. Please keep PRs focused and include:

- A clear summary of what changed and why
- Related issue link (if applicable)
- Notes on testing performed

Before opening a PR, please make sure your changes follow the coding guidelines in this repository and do not introduce unrelated refactors.

Thanks for helping make this project better.

## Coding Guidelines

Most of the guidelines here are based on [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) and [TypeScript Coding Guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines) with a few project-specific adjustments. If a rule is not listed here, follow those two references.

### Names

- Use `PascalCase` for type names.
- Don't use `I` prefix for interface names.
- Use `PascalCase` for enums and `SCREAMING_SNAKE_CASE` for enum keys. Enum values are at the developer's discretion (preferably `camelCase`).
- [Names must be descriptive.](https://google.github.io/styleguide/tsguide.html#descriptive-names)
- Use whole words in names when possible.
- [Treat abbreviations as whole words,](https://google.github.io/styleguide/tsguide.html#camel-case) e.g. `XmlHttpRequest` instead of `XMLHTTPRequest`.
- Use `private` keyword for private properties/methods when possible. Avoid prefixes like `_`.

### Source Code Structure

- Don't export types or functions unless they need to be shared across multiple components.
- Limit symbol visibility as much as possible (i.e. internal methods should be marked as `private`).
- Use named exports. [Avoid default exports.](https://google.github.io/styleguide/tsguide.html#exports)
- Use JSDoc style comments for functions, interfaces, enums, and classes.
- Don't create container classes for static members. Use TypeScript namespaces, or export individual members instead.

### Types

- [Prefer `undefined`](https://github.com/sindresorhus/meta/discussions/7). Avoid `null` unless `undefined` and `null` intentionally carry different meanings.
- Use `Map` to store mappings with keys from user input. Don't use object literals `{}` for this purpose because they are unsafe.
  - [The pitfalls of using objects as maps in JavaScript](https://2ality.com/2012/01/objects-as-maps.html)
  - [The dangers of square bracket notation](https://github.com/eslint-community/eslint-plugin-security/blob/main/docs/the-dangers-of-square-bracket-notation.md)
- Prefer explicit checks over implicit Boolean coercion, e.g. prefer `if (!isDefined(value))` over `if (!value)`, so that falsy values e.g. `false`, `0` are handled correctly.
- Prefer nullish-coalescing operator `??` over logical OR operator `||` for assigning default values.
- Use `Number()` for numeric coercion. Don't use unary plus operator `+`, which is easy to miss.
- Represent Boolean parameters as an options object or an enum, except for obvious cases such as `this.setActive(true)`.
- [Prefer interfaces over type aliases.](https://google.github.io/styleguide/tsguide.html#prefer-interfaces)
- [Avoid `any` type.](https://google.github.io/styleguide/tsguide.html#any)
- Prefer `readonly T[]` for array values (especially function parameters) to mark the array as immutable during use.

### Style

- [Prefer function declarations for named functions,](https://google.github.io/styleguide/tsguide.html#function-declarations) especially for top-level functions.
- Always wrap loop and conditional bodies in curly braces. Statements on the same line are allowed to omit braces.
- Prefer `for..of` to iterate over arrays.

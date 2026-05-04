#!/usr/bin/env node

// @ts-check

// CLI tool for MyAI. Provides an interface to memo and query commands.

require('dotenv/config');

const ky = require('ky').default;
const { parseServerSentEvents } = require('parse-sse');

async function main() {
  /** @type {URL} */
  const host = new URL('http://localhost');
  host.port = process.env['PORT'] || '3000';

  const [commandLine, scriptName, command, ...otherArgs] = process.argv;

  const printUsage = () => {
    console.error(`USAGE:
${commandLine} ${scriptName} memo [--category <CATEGORY>]... <TEXT>
${commandLine} ${scriptName} query [--category <CATEGORY>] [--[no-]stream] <TEXT>
`);
  };

  switch (command) {
    case 'memo': {
      /** @type {string[]} */
      const categories = [];

      /** @type {string | undefined} */
      let awaitingNextArg = undefined;

      /** @type {boolean} */
      let isMultipleTextArgsSpecified = false;

      /** @type {string | undefined} */
      let text = undefined;

      for (const arg of otherArgs) {
        switch (arg) {
          case '--category':
            awaitingNextArg = arg;
            break;

          default:
            switch (awaitingNextArg) {
              case '--category':
                categories.push(arg);
                break;

              default:
                if (text) {
                  isMultipleTextArgsSpecified = true;
                  break;
                }
                text = arg;
                break;
            }
            awaitingNextArg = undefined;
            break;
        }
      }

      if (isMultipleTextArgsSpecified) {
        console.error('Multiple text arguments specified!');
        printUsage();
        break;
      }

      if (awaitingNextArg) {
        console.error(`Missing value for option: '${awaitingNextArg}'`);
        printUsage();
        break;
      }

      if (!text) {
        console.error('Missing text argument!');
        printUsage();
        break;
      }

      const url = new URL(host);
      url.pathname = '/api/memo';

      const requestBody = {
        text,
        categories,
      };
      const response = await ky.post(url, { json: requestBody });

      /** @type {import('./src/dto/Memo.response.dto').MemoResponseDto} */
      const jsonBody = await response.json();

      console.dir(jsonBody, { depth: Infinity });

      break;
    }

    case 'query': {
      /** @type {boolean} */
      let isStreamed = true;

      /** @type {string | undefined} */
      let awaitingNextArg = undefined;

      /** @type {boolean} */
      let isMultipleTextArgsSpecified = false;

      /** @type {string | undefined} */
      let text = undefined;

      /** @type {boolean} */
      let isMultipleCategoryArgsSpecified = false;

      /** @type {string | undefined} */
      let category = undefined;

      for (const arg of otherArgs) {
        switch (arg) {
          case '--stream':
            isStreamed = true;
            break;

          case '--no-stream':
            isStreamed = false;
            break;

          case '--category':
            awaitingNextArg = arg;
            break;

          default:
            switch (awaitingNextArg) {
              case '--category':
                if (category) {
                  isMultipleCategoryArgsSpecified = true;
                  break;
                }
                category = arg;
                break;

              default:
                if (text) {
                  isMultipleTextArgsSpecified = true;
                  break;
                }
                text = arg;
                break;
            }
            awaitingNextArg = undefined;
            break;
        }
      }

      if (isMultipleTextArgsSpecified) {
        console.error('Multiple text arguments specified!');
        printUsage();
        break;
      }

      if (isMultipleCategoryArgsSpecified) {
        console.error('Multiple category arguments specified!');
        printUsage();
        break;
      }

      if (awaitingNextArg) {
        console.error(`Missing value for option: '${awaitingNextArg}'`);
        printUsage();
        break;
      }

      if (!text) {
        console.error('Missing text argument!');
        printUsage();
        break;
      }

      const requestBody = {
        text,
        category,
      };

      if (isStreamed) {
        const url = new URL(host);
        url.pathname = '/api/query/sse';

        const response = await ky.post(url, { json: requestBody });
        for await (const event of parseServerSentEvents(response)) {
          process.stdout.write(event.data);
        }
      } else {
        const url = new URL(host);
        url.pathname = '/api/query';

        const response = await ky.post(url, { json: requestBody });

        /** @type {import('./src/dto/Query.response.dto').QueryResponseDto} */
        const jsonBody = await response.json();

        console.log(jsonBody.response);
      }

      break;
    }

    default:
      console.error(`Unknown command: '${command}'`);
      printUsage();
      break;
  }
}

void main();

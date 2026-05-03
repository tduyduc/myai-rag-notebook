#!/bin/bash

echo "Starting Ollama server..."
ollama serve &

sleep 5

echo "Pulling chat model: $OLLAMA_CHAT_MODEL"
ollama pull "$OLLAMA_CHAT_MODEL"

echo "Pulling embedding model: $OLLAMA_EMBEDDING_MODEL"
ollama pull "$OLLAMA_EMBEDDING_MODEL"

wait

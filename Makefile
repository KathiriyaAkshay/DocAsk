.PHONY: run dev seed generate-pdfs docker-up docker-down langfuse-up full-up

run: dev

dev:
	pnpm dev

seed:
	pnpm seed

generate-pdfs:
	pnpm generate-pdfs

setup:
	cp -n .env.example .env 2>/dev/null || true
	pnpm install
	pnpm generate-pdfs
	docker compose up -d chroma
	sleep 3
	pnpm seed

docker-up:
	docker compose up --build

docker-up-ollama:
	docker compose -f docker-compose.yml -f docker-compose.ollama.yml --profile docker-ollama up --build

docker-down:
	docker compose down

langfuse-up:
	docker compose -f docker-compose.langfuse.yml up -d

langfuse-down:
	docker compose -f docker-compose.langfuse.yml down

full-up:
	docker compose -f docker-compose.yml -f docker-compose.langfuse.yml up -d --build

full-down:
	docker compose -f docker-compose.yml -f docker-compose.langfuse.yml down

docker-seed:
	docker compose -f docker-compose.yml exec api node dist/seed.js

mcp-build:
	pnpm mcp:build

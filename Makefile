.PHONY: install dev build up down migrate seed lint format test clean

install:
	npm install

dev:
	docker compose up -d postgres redis
	npm run dev

build:
	npm run build

up:
	docker compose up -d --build

down:
	docker compose down

migrate:
	npx prisma migrate deploy

migrate-dev:
	npx prisma migrate dev

seed:
	npm run db:seed

lint:
	npm run lint

format:
	npm run format

test:
	npm run test --workspaces --if-present

clean:
	rm -rf node_modules apps/*/node_modules packages/*/node_modules apps/*/.next apps/*/dist packages/*/dist .turbo

db-studio:
	npm run db:studio

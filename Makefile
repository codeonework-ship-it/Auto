# AutoHub — convenience targets (requires Docker + Docker Compose)
.PHONY: help up down build logs ps restart backend web panel db-shell clean

help:
	@echo "AutoHub make targets:"
	@echo "  make up        - start the full stack (build if needed)"
	@echo "  make build     - build all images"
	@echo "  make down      - stop and remove containers"
	@echo "  make logs      - tail logs for all services"
	@echo "  make ps        - list running services"
	@echo "  make db-shell  - open psql on the Dev database"
	@echo "  make clean     - down + remove volumes (DESTROYS data)"

up:
	docker compose up -d --build

build:
	docker compose build

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

restart:
	docker compose restart

backend:
	docker compose up -d --build backend

web:
	docker compose up -d --build web-app

panel:
	docker compose up -d --build control-panel

db-shell:
	docker compose exec postgres psql -U automobiles -d AutomobilesDB_Dev

clean:
	docker compose down -v

.PHONY: test test-cov test-html verify dev start-services stop-services

test:
	PYTHONPATH=src uv run pytest

test-cov:
	PYTHONPATH=src uv run pytest --cov=src --cov-report=term-missing

test-html:
	PYTHONPATH=src uv run pytest --cov=src --cov-report=html

verify:
	PYTHONPATH=src uv run python src/verify_iam.py

prepare-dev:
	PYTHONPATH=src uv run python src/scripts/create_test_user.py

init-tenant:
	PYTHONPATH=src uv run python src/scripts/init_tenant.py $(if $(DB_URL),--db-url "$(DB_URL)",)

dev:
	uv run fastapi dev src/main.py

start-services:
	docker compose -f docker-compose.local.yml up -d

stop-services:
	docker compose -f docker-compose.local.yml down

# Database Migrations
migrate-create:
	@read -p "Enter migration message: " message; \
	PYTHONPATH=src uv run alembic revision --autogenerate -m "$$message"

migrate-apply:
	PYTHONPATH=src uv run alembic upgrade head

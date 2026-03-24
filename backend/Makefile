.PHONY: test test-cov test-html verify dev

test:
	PYTHONPATH=src uv run pytest

test-cov:
	PYTHONPATH=src uv run pytest --cov=src --cov-report=term-missing

test-html:
	PYTHONPATH=src uv run pytest --cov=src --cov-report=html

verify:
	PYTHONPATH=src uv run python src/verify_iam.py

dev:
	uv run fastapi dev src/main.py

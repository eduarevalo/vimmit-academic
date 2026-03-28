# Use a Python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Set the working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy the project files
COPY pyproject.toml uv.lock ./

# Install dependencies (without dev dependencies)
RUN uv sync --frozen --no-dev --no-install-project

# Copy the source code
COPY src ./src

# Install the project itself
RUN uv sync --frozen --no-dev

# Initialize the database with tenant data
RUN uv run python src/scripts/init_tenant.py

# Final stage
FROM python:3.12-slim-bookworm

WORKDIR /app

# Copy the environment (venv), source, and the initialized database
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /app/src /app/src
COPY --from=builder /app/test.db /app/test.db

# Set environment variables
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app/src"
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Run the application using fastapi run
CMD ["fastapi", "run", "src/main.py", "--port", "8080", "--host", "0.0.0.0"]

# Stage 1: Build stage
FROM python:3.12.10-slim AS builder

ENV DEBIAN_FRONTEND=noninteractive

# System setup
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        build-essential \
        libpq-dev \
        gcc \
        pkg-config \
        python3-dev \
        && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv
ADD https://astral.sh/uv/install.sh /uv-installer.sh
RUN sh /uv-installer.sh && rm /uv-installer.sh
ENV PATH="/root/.local/bin/:$PATH"

# Virtual environment
RUN uv venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Copy dependency files
COPY pyproject.toml requirements.lock ./

# Install dependencies
RUN uv pip install -r requirements.lock

# Stage 2: Runtime stage
FROM python:3.12.10-slim

# Environment setup
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/opt/venv/bin:$PATH"
ENV APP_HOME=/home/app

# Install only essential runtime dependencies
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    libpq5 \
    gettext && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Create non-root user and app directory
RUN useradd -m ubuntu
WORKDIR $APP_HOME

# Change ownership of the WORKDIR itself so the 'ubuntu' user can write to it
RUN chown ubuntu:ubuntu $APP_HOME

# Copy application code
COPY --chown=ubuntu:ubuntu . .

# Entrypoint setup
RUN chmod +x $APP_HOME/entrypoint.sh && \
    # Verify the script
    [ -f entrypoint.sh ] && \
    [ -x entrypoint.sh ] || exit 1

ENTRYPOINT ["/home/app/entrypoint.sh"]

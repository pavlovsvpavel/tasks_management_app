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
ENV STREAMLIT_SERVER_PORT=8501
ENV STREAMLIT_SERVER_HEADLESS=true
ENV STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

# Install only essential runtime dependencies
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
    libpq5 \
    gettext && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Create non-root user with secure defaults
RUN groupadd -r ubuntu && \
    useradd -r -g ubuntu -d $APP_HOME -s /bin/false ubuntu && \
    mkdir -p $APP_HOME && \
    chown ubuntu:ubuntu $APP_HOME

# Copy virtual environment from builder
COPY --from=builder --chown=appuser:appuser /opt/venv /opt/venv

WORKDIR $APP_HOME

# Copy application code
COPY --chown=ubuntu:ubuntu . .

# Configure Streamlit for reverse proxy
RUN mkdir -p /home/ubuntu/.streamlit && \
    echo "\n\
    [server]\n\
    port = 8501\n\
    address = '0.0.0.0'\n\
    baseUrlPath = '/admin_panel'\n\
    enableCORS = false\n\
    enableXsrfProtection = true\n\
    \n\
    [browser]\n\
    gatherUsageStats = false\n\
    " > /home/ubuntu/.streamlit/config.toml && \
    chown -R ubuntu:ubuntu /home/ubuntu/.streamlit

USER ubuntu

EXPOSE 8501

ENTRYPOINT ["streamlit", "run"]
CMD ["streamlit_admin.py", "--server.port=8501", "--server.address=0.0.0.0"]

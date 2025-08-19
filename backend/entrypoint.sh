#!/bin/sh
set -e

# Configurable defaults
WORKERS=${GUNICORN_WORKERS:-$((2 * $(nproc)))}

echo "----- Waiting for database to be ready -----"
python -m scripts.wait-for-db

echo "----- Applying database migrations -----"
alembic upgrade head

echo "----- Starting Gunicorn with $WORKERS workers -----"
exec gunicorn -k uvicorn.workers.UvicornWorker \
  --workers="$WORKERS" \
  --bind=0.0.0.0:8000 \
  --forwarded-allow-ips='*' \
  main:app


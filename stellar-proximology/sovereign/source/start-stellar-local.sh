#!/usr/bin/env sh
set -eu
python -m uvicorn human_design.web_api:app --host 127.0.0.1 --port "${STELLAR_PORT:-8787}"

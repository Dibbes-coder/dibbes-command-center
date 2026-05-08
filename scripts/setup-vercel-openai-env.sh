#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "OPENAI_API_KEY is required. Export it first, then rerun this script." >&2
  exit 1
fi

for target in production preview development; do
  echo "Adding OPENAI_API_KEY to Vercel ${target}..."
  printf '%s' "$OPENAI_API_KEY" | npx vercel env add OPENAI_API_KEY "$target"
done

if [[ -n "${OPENAI_MODEL:-}" ]]; then
  for target in production preview development; do
    echo "Adding OPENAI_MODEL to Vercel ${target}..."
    printf '%s' "$OPENAI_MODEL" | npx vercel env add OPENAI_MODEL "$target"
  done
fi

echo "Done. Redeploy Vercel so the new environment variables are available at runtime."

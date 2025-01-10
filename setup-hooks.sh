#!/bin/bash

HOOKS_DIR="$(pwd)/.githooks"
GIT_HOOKS_DIR="$(git rev-parse --show-toplevel)/.git/hooks"

echo "Installing Git hooks..."
for hook in $HOOKS_DIR/*; do
  hook_name=$(basename "$hook")
  ln -sf "$HOOKS_DIR/$hook_name" "$GIT_HOOKS_DIR/$hook_name"
  echo "Installed $hook_name"
done

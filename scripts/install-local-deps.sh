#!/bin/bash
set -euo pipefail

ROOT=$(cd -- "$(dirname "$0")/.." && pwd)
LIB_DIR="$ROOT/local_libs"
mkdir -p "$LIB_DIR"

PKGS=(
  tailwind-merge@2.5.2
  tailwindcss-animate@1.0.7
  class-variance-authority@0.7.0
  @radix-ui/react-slot@1.0.2
)

echo "Place downloaded tarballs here before running: $LIB_DIR"
for pkg in "${PKGS[@]}"; do
  echo "—— $pkg"
  name=$(echo "$pkg" | sed 's/@/-/g' | cut -d- -f2)
  tarball=$(ls "$LIB_DIR" 2>/dev/null | grep "$name" | head -n 1 || true)
  if [ -z "$tarball" ]; then
    echo "  [missing] please download $pkg to $LIB_DIR"
  else
    echo "  installing $tarball"
    npm install --prefer-offline "./local_libs/$tarball"
  fi
done

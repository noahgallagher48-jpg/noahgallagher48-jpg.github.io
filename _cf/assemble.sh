#!/usr/bin/env bash
# Builds the whole www.abba-photo.com tree for Cloudflare Pages.
# Cloudflare runs this on every push to main (build command: bash _cf/assemble.sh, output: _site).
# The site is this repo at the root plus each project repo at its own path, exactly as GitHub Pages served it.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/_site"
OWNER="noahgallagher48-jpg"
# Project repos that live under the domain. Add a repo here when a new one goes up.
PROJECTS="interlaken-campscapes camp-kingswood ramah-rockies-guide masliansky-neighborhood-session ceremony-is-medicine media-team-field-guide cyj-field-guide family-2026"

rm -rf "$OUT"; mkdir -p "$OUT"

# 1. This repo at the root. Working files stay out. GitHub Pages never served the _* folders here
#    (no .nojekyll), so they stay out too.
tar -C "$ROOT" -cf - \
  --exclude='./.git' --exclude='./.github' --exclude='./_site' --exclude='./_cf' --exclude='./functions' \
  --exclude='./_*' --exclude='*.md' --exclude='./build_sitemap.py' --exclude='./node_modules' --exclude='./.wrangler' \
  . | tar -C "$OUT" -xf -

# 2. Each project repo at its path.
for r in $PROJECTS; do
  if [ -n "${ABBA_REPO_CACHE:-}" ] && [ -d "$ABBA_REPO_CACHE/$r" ]; then
    mkdir -p "$OUT/$r"; tar -C "$ABBA_REPO_CACHE/$r" --exclude='./.git' -cf - . | tar -C "$OUT/$r" -xf -
  else
    git clone -q --depth 1 "https://github.com/$OWNER/$r.git" "$OUT/$r"
    rm -rf "$OUT/$r/.git"
  fi
  # Same Jekyll rule GitHub applied: without .nojekyll, _* paths at the repo root were never served.
  if [ ! -f "$OUT/$r/.nojekyll" ]; then find "$OUT/$r" -maxdepth 1 -name '_*' -exec rm -rf {} +; fi
  rm -f "$OUT/$r/.nojekyll"
done

# 3. Cloudflare's per-file limit is 25 MiB. Anything over it stays on GitHub; functions/[[path]].js fetches it from there.
find "$OUT" -type f -size +25M -print -delete | sed 's#^#over 25 MiB, left to the GitHub fallback: #'

# 4. Cloudflare's own files into the output.
cp "$ROOT/_cf/_routes.json" "$OUT/_routes.json"
cp "$ROOT/_cf/_headers" "$OUT/_headers"

echo "assembled: $(find "$OUT" -type f | wc -l) files, $(du -sm "$OUT" | cut -f1) MB"

#!/bin/bash

### ZEROth gh repo set-default
### FIRST update the version in
# manifest.json (apparently this is the only required one?)
# versions.json
# package.json

TAG="2.2.0"

npm run build
git add -A && git commit -m "version bump: $TAG"
git tag "$TAG"
git push origin HEAD:main
git push origin "$TAG"

# Release assets + artifact attestations: GitHub Actions (.github/workflows/release.yml)
# runs on this tag push. Edit release notes on GitHub after publish if you want detail.

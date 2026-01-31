#!/bin/bash

# Release script for lite-kit
# Usage: ./scripts/release.sh <version>
# Example: ./scripts/release.sh 1.1.0

set -e

# Colours
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Colour

# Check if version argument provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Version number required${NC}"
    echo "Usage: ./scripts/release.sh <version>"
    echo "Example: ./scripts/release.sh 1.1.0"
    exit 1
fi

VERSION=$1
TAG="v$VERSION"

# Validate version format (semver)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo -e "${RED}Error: Invalid version format. Use semver (e.g., 1.1.0)${NC}"
    exit 1
fi

echo -e "${YELLOW}Releasing lite-kit $TAG${NC}"
echo ""

# Check for uncommitted changes
if ! git diff --quiet || ! git diff --staged --quiet; then
    echo -e "${RED}Error: You have uncommitted changes. Commit or stash them first.${NC}"
    git status --short
    exit 1
fi

# Check we're on main branch
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo -e "${RED}Error: You must be on the main branch to release.${NC}"
    echo "Current branch: $BRANCH"
    exit 1
fi

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes...${NC}"
git pull origin main

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${RED}Error: Tag $TAG already exists.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci

# Build
echo -e "${YELLOW}Building...${NC}"
npm run build

# Update version in package.json
echo -e "${YELLOW}Updating package.json version to $VERSION...${NC}"
npm version $VERSION --no-git-tag-version

# Stage all changes (including dist)
echo -e "${YELLOW}Staging changes...${NC}"
git add -A

# Commit
echo -e "${YELLOW}Committing...${NC}"
git commit -m "chore: release $TAG"

# Tag
echo -e "${YELLOW}Creating tag $TAG...${NC}"
git tag $TAG

# Push
echo -e "${YELLOW}Pushing to origin...${NC}"
git push origin main
git push origin $TAG

echo ""
echo -e "${GREEN}Successfully released $TAG${NC}"
echo ""
echo "Next steps:"
echo "  1. Update CHANGELOG.md with release notes"
echo "  2. Create GitHub release at: https://github.com/litedesigns/lite-kit/releases/new?tag=$TAG"
echo ""
echo "To update dependent projects, change package.json:"
echo "  \"@litedesigns/lite-kit\": \"github:litedesigns/lite-kit#$TAG\""
echo "  Then run: npm install"

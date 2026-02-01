Release a new version of lite-kit

1. Check git status - ensure working directory is clean
2. Review recent commits since last tag to determine version bump:
   - `fix:` commits → patch (1.0.x)
   - `feat:` commits → minor (1.x.0)
   - Breaking changes → major (x.0.0)
3. Run: `npm run release <version>`
4. Output the commands to update consumer projects:

```bash
# Infinity
cd ~/Repos/infinity
yalc remove @litedesigns/lite-kit
npm install github:litedesigns/lite-kit#v<version>
git add package.json package-lock.json
git commit -m "chore: update lite-kit to v<version>"
git push

# Zest
cd ~/Repos/zest
yalc remove @litedesigns/lite-kit
npm install github:litedesigns/lite-kit#v<version>
git add package.json package-lock.json
git commit -m "chore: update lite-kit to v<version>"
git push
```

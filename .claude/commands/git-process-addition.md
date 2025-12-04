--
description: Automate git add and commit for modified/untracked files, grouped by type of change.
--

## Command Name

`git-auto-commit`

## Description

This command automates the following workflow:

1. Run linting to ensure code quality (e.g. `npm run lint`).
2. Ensure the project builds successfully (e.g. `npm run build`).
3. Run unit tests with coverage and ensure all files have at least **90% coverage**.
4. Verify that `README.md` is up to date with the current project state.
5. List all modified/untracked files that have not yet been pushed to the remote repository.
6. Group files by type of change (`feat`, `fix`, `hotfix`, `refactor`, etc.).
7. Run `git add` and `git commit` for each group, following conventional commit messages.
8. **Never run `git push`**. Pushing remains a manual step.

## Detailed Instructions

1. **Check linting:**

   ```bash
   npm run lint
   ```

   - If lint fails with **errors** (not warnings) → run `npm run lint:fix` to auto-fix.
   - If errors persist after fix → stop the process, display the error, and do not commit anything.
   - Warnings are acceptable and should not block the commit process.

2. **Check the build:**

   ```bash
   npm run build
   ```

   - If the build fails → stop the process, display the error, and do not commit anything.

3. **Run unit tests with coverage:**

   ```bash
   npm run test:coverage
   ```

   - All tests must pass → if any test fails, stop the process and display the error.
   - **Coverage requirement:** Each file must have at least **90% coverage** (lines, statements, branches, functions).
   - If coverage is below 90% for any file → stop the process and display which files need more tests.
   - Check the coverage report output to verify thresholds are met.

4. **Verify README.md is up to date:**

   - Check that the main `README.md` accurately reflects the current state of the project.
   - Verify the following sections are up to date:
     - **Environment Variables**: All variables from `.env.example` are documented
     - **NPM Scripts**: All scripts from `package.json` are listed
     - **Project Structure**: File/folder structure matches actual project
     - **API Endpoints**: All routes are documented
     - **Tech Stack**: Dependencies match `package.json`
   - If README is outdated → update it with accurate information before proceeding.

5. **List files to commit:**

   ```bash
   git status --porcelain
   ```

6. **Analyze changes and group by type:**
   - New feature → `feat: description`
   - Bug fix → `fix: description`
   - Urgent bug fix → `hotfix: description`
   - Code improvement without functional change → `refactor: description`
   - Style/formatting changes → `style: description`
   - Documentation → `docs: description`
   - Tests → `test: description`
   - Build/tooling → `chore: description`

7. **Create commits:**
   For each detected type:

   ```bash
   git add <list_of_files>
   git commit -m "feat: clear description"
   ```

   Example:

   ```bash
   git add src/components/Button.tsx src/pages/index.tsx
   git commit -m "feat: add new reusable Button component and update homepage"
   ```

8. **Never push automatically.**
   - Pushing to the remote must always be handled manually.

## Example Flow

```bash
npm run lint
# ✅ lint success (warnings only)

npm run build
# ✅ build success

npm run test:coverage
# ✅ all tests passed
# ✅ coverage: 94% statements, 91% branches, 100% functions, 93% lines

# Check README.md is up to date
# ✅ README reflects current project state

git add src/pages/dashboard.tsx
git commit -m "feat: add dashboard page"

git add src/components/Navbar.tsx
git commit -m "fix: correct navbar responsive behavior"
```

## Important Rules

- **NEVER mention AI, Claude, or Claude Code in commit messages.**
- Always check linting before building.
- Always check compilation before committing.
- Always run tests with coverage before committing.
- **Minimum 90% coverage** per file is required (lines, statements, branches, functions).
- Always verify README.md is up to date before committing.
- Always follow conventional commit standards (`type: description`).
- One commit per type of detected modification.
- Never push automatically.
- Lint warnings (like `no-console`) are acceptable; only errors block commits.

# Architecture & Best Practices

This document outlines the architectural decisions, coding standards, and best practices for the **Blue Archive Sensei no Enjo** project.

## 1. Project Structure

We follow a "Feature-First" or "Domain-Driven" modification of the standard React structure to keep related code together.

```
src/
├── assets/          # Static assets (images, SVGs)
├── components/      # Shared/Global UI components (Buttons, Inputs)
├── data/            # Data models, interfaces, and static data files
├── features/        # Feature-specific modules (e.g., TeamBuilder, Calculator)
│   └── student-list/ # Example feature
│       ├── StudentList.tsx
│       ├── StudentList.css
│       └── components/ # Sub-components specific to this feature
├── hooks/           # Custom React hooks (useFetch, useLocalStorage)
├── utils/           # Helper functions (math, string formatting)
└── App.tsx          # Main entry point and routing
```

*(Note: currently we are using a flatter structure in `src/components`, but we will migrate to `src/features` as the app grows.)*

## 2. Data Management (SchaleDB Integration)

*   **Single Source of Truth**: The `public/data/students.json` file is our local database.
*   **Immutability**: We do not modify this JSON file at runtime. It is only updated via the `scripts/update-students.cjs` script.
*   **Fetching**: Components should not import the JSON directly (which increases bundle size). Instead, use the `fetchStudents()` helper in `src/data/students.ts` to load it asynchronously.

## 3. Component Design

*   **Functional Components**: All components must be React Functional Components (`React.FC`).
*   **Props Interface**: Always define a TypeScript interface for props.
    ```typescript
    interface StudentCardProps {
      student: Student;
      onClick: (id: number) => void;
    }
    ```
*   **CSS Modules (Recommended)**: To avoid class name collisions, we prefer keeping styles local.
    *   *Current State*: We are using standard CSS files (`StudentList.css`).
    *   *Future Goal*: Migrate to CSS Modules (`StudentList.module.css`) or Tailwind CSS.

## 4. TypeScript Best Practices

*   **Strict Mode**: `strict: true` is enabled in `tsconfig.json`. Do not use `any`.
*   **Type Imports**: Use `import type { ... }` when importing interfaces to help the bundler remove unused code.
    ```typescript
    import type { Student } from '../data/students';
    ```
*   **Explicit Returns**: Define return types for complex functions to ensure predictability.

## 5. Performance

*   **Image Optimization**: Student images are fetched from SchaleDB's CDN. Always implement `loading="lazy"` and an `onError` fallback.
*   **Large Lists**: The student list contains 200+ items. If performance drops, implement **Virtualization** (e.g., `react-window`) to only render visible items.
*   **Code Splitting**: Future complex routes (like "Team Builder") should be lazy-loaded using `React.lazy`.

## 6. Git Workflow & Branching Strategy

We follow **Git Flow** to maintain a clean, organized development process with clear separation between production code, development work, and features.

### Branch Structure

| Branch Type | Naming Convention | Purpose | Source | Target |
|-------------|-------------------|---------|---------|---------|
| **Main** | `main` | Production-ready code | - | - |
| **Develop** | `develop` | Integration branch for features | `main` | `main` (via release) |
| **Feature** | `feature/feature-name` | New features | `develop` | `develop` |
| **Bugfix** | `bugfix/issue-description` | Bug fixes | `develop` | `develop` |
| **Hotfix** | `hotfix/critical-issue` | Critical production fixes | `main` | `main` & `develop` |
| **Release** | `release/v1.0.0` | Release preparation | `develop` | `main` & `develop` |

### Development Workflow

#### For Feature Development:
```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/add-student-filtering

# 3. Work on feature (commit regularly)
git add .
git commit -m "feat: add basic filtering functionality"

# 4. Keep updated with develop
git pull origin develop

# 5. Merge back to develop when complete
git checkout develop
git pull origin develop
git merge feature/add-student-filtering
git push origin develop

# 6. Delete feature branch
git branch -d feature/add-student-filtering
```

#### For Hotfixes:
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix the issue
git commit -m "fix: resolve critical login issue"

# 3. Merge to main and develop
git checkout main
git merge hotfix/critical-bug
git push origin main

git checkout develop
git merge hotfix/critical-bug
git push origin develop

# 4. Delete hotfix branch
git branch -d hotfix/critical-bug
```

### Commit Convention

We use **Conventional Commits** for consistent, meaningful commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that do not affect the meaning of the code
- `refactor:` - A code change that neither fixes a bug nor adds a feature
- `perf:` - A code change that improves performance
- `test:` - Adding missing tests or correcting existing tests
- `chore:` - Changes to the build process or auxiliary tools

**Examples:**
- `feat(students): add filtering by attack type`
- `fix(team-builder): resolve stats calculation error`
- `docs(readme): update installation instructions`
- `chore(deps): update react to v18.2.0`

### Branch Naming Guidelines

- Use lowercase with hyphens: `feature/add-search-filter`
- Be descriptive but concise: `bugfix/login-validation` not `bugfix/fix`
- Use prefixes consistently: `feature/`, `bugfix/`, `hotfix/`
- Include issue numbers when applicable: `feature/PROJ-123-add-export`

### Best Practices

- **Never commit directly to `main`**
- **Keep branches short-lived** - merge features within 1-2 weeks
- **Regular rebasing** - keep feature branches updated with develop
- **Clean merges** - use fast-forward merges when possible
- **Delete merged branches** - keep repository clean
- **Code reviews required** - all merges to develop/main need approval

## 7. Scripts

*   `npm run dev`: Starts local dev server.
*   `npm run build`: Type-checks and builds for production.
*   `npm run update-data`: (Proposed) Runs the node script to fetch fresh data from SchaleDB.

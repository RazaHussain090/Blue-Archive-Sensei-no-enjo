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

## 6. Git Workflow

*   **Branches**: Create a new branch for every feature or fix (e.g., `feature/team-builder`, `fix/search-bug`).
*   **Commits**: Use Conventional Commits style:
    *   `feat: ...` for new features
    *   `fix: ...` for bug fixes
    *   `docs: ...` for documentation
    *   `chore: ...` for maintenance (scripts, config)

## 7. Scripts

*   `npm run dev`: Starts local dev server.
*   `npm run build`: Type-checks and builds for production.
*   `npm run update-data`: (Proposed) Runs the node script to fetch fresh data from SchaleDB.

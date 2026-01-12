# Coding Guidelines

This document serves as the standard for writing code in the **Blue Archive Sensei no Enjo** project. Adhering to these guidelines ensures readability, maintainability, and consistency across the codebase.

## 1. General Principles

*   **KISS (Keep It Simple, Stupid)**: Avoid over-engineering. If a simple function does the job, don't create a complex class or hook.
*   **DRY (Don't Repeat Yourself)**: Extract repeated logic into helper functions or custom hooks.
*   **Comments**:
    *   **Do** comment *why* something is done if it's not obvious (e.g., "Filtering out unreleased students to prevent crashes").
    *   **Don't** comment *what* code does (e.g., `// Adds 1 to count` above `count + 1`).

## 2. React Components

### Naming
*   **Files**: PascalCase (e.g., `StudentList.tsx`, `TeamBuilder.tsx`).
*   **Components**: PascalCase (e.g., `const StudentList: React.FC = ...`).
*   **Folders**: PascalCase for component folders (e.g., `components/StudentCard/`).

### Structure
1.  **Imports**: Group imports in this order:
    1.  React / External Libraries
    2.  Internal Types / Data
    3.  Components
    4.  Utils / Hooks
    5.  Styles
2.  **Props**: Always destructure props for clarity.
3.  **Hooks**: Keep all hooks at the top of the component.
4.  **Render**: The JSX return statement should be the last part of the function.

**Example:**
```typescript
import React, { useState } from 'react';
import type { Student } from '../../data/types';
import { Card } from '../common/Card';
import './StudentList.css';

interface Props {
  students: Student[];
}

export const StudentList: React.FC<Props> = ({ students }) => {
  const [filter, setFilter] = useState('');

  // ... logic ...

  return (
    <div className="list">
      {/* ... JSX ... */}
    </div>
  );
};
```

## 3. TypeScript

*   **Strict Mode**: Always on. Avoid `any` at all costs.
*   **Explicit Types**:
    *   Use `interface` for object shapes (Props, Data Models).
    *   Use `type` for Unions or simple aliases.
*   **Event Handling**: Use React's built-in event types.
    *   `React.ChangeEvent<HTMLInputElement>`
    *   `React.FormEvent`

## 4. CSS / Styling

*   **Naming**: Use `kebab-case` for class names (e.g., `.student-card`, not `.studentCard`).
*   **Scoping**:
    *   If using plain CSS, prefix classes with the component name to avoid collisions (e.g., `.StudentList-container`).
    *   (Preferred) Use CSS Modules if possible in future refactors.
*   **Variables**: Use CSS variables for theme colors (defined in `index.css`) instead of hardcoding hex values.
    *   `color: var(--color-primary);`

## 5. File Organization (Feature-First)

Organize files by **feature**, not just file type.

**Bad:**
```
components/
  StudentList.tsx
  TeamBuilder.tsx
hooks/
  useStudentFilter.ts
  useTeamLogic.ts
```

**Good:**
```
features/
  students/
    components/
      StudentList.tsx
    hooks/
      useStudentFilter.ts
  team/
    components/
      TeamBuilder.tsx
    hooks/
      useTeamLogic.ts
```

## 6. Git & Commits

*   **Commit Messages**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
    *   `feat`: A new feature
    *   `fix`: A bug fix
    *   `docs`: Documentation only changes
    *   `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
    *   `refactor`: A code change that neither fixes a bug nor adds a feature
    *   `perf`: A code change that improves performance
    *   `test`: Adding missing tests or correcting existing tests
    *   `chore`: Changes to the build process or auxiliary tools and libraries such as documentation generation

**Example**: `feat(students): add filtering by attack type`

## 7. Performance Checklist

Before submitting a PR/Commit:
1.  **Unnecessary Re-renders**: Are huge lists re-rendering on every keystroke? (Use `React.memo` or debounce inputs).
2.  **Large Imports**: Are we importing a massive library for one small function?
3.  **Images**: Are images optimized and using `loading="lazy"`?

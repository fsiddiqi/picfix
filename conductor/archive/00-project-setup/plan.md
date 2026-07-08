# Plan: Project Setup & Scaffolding

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Initialize Project & Structure
- [x] Task 1.1: Initialize Expo React Native App
  - [x] 1.1.1 Run Expo init command with TypeScript template
  - [x] 1.1.2 Set up `.gitignore` to prevent committing build/dependencies/macOS cache files
- [x] Task 1.2: Create Directory Structure
  - [x] 1.2.1 Create folder `src/` at root
  - [x] 1.2.2 Create subfolders: `src/capture`, `src/processing`, `src/storage`, `src/albums`
- [x] Task 1.3: Formatting and Linting
  - [x] 1.3.1 Install ESLint and typescript-eslint for TS formatting config
  - [x] 1.3.2 Configure npm scripts: `lint`, `format`
- [x] **Verification checkpoint:** Manually run linter and verify typescript compile passes.

## Phase 2: Testing Infrastructure
- [x] Task 2.1: Configure Jest & Testing Library
  - [x] 2.1.1 Install `jest`, `jest-expo`, `@testing-library/react-native`, `@testing-library/jest-native`
  - [x] 2.1.2 Configure `jest.config.js` for TypeScript unit testing
- [x] Task 2.2: Add Headless Dummy Tests
  - [x] 2.2.1 Write pure function test in `src/processing/dummy.test.ts`
  - [x] 2.2.2 Write component render test in `src/capture/dummy.test.tsx`
- [x] Task 2.3: Integrate Test Scripts
  - [x] 2.3.1 Configure `npm run test` script in `package.json`
  - [x] 2.3.2 Run test suite and confirm both dummy tests pass headlessly
- [x] **Verification checkpoint:** Run `npm run test` and verify output is green.

## Definition of done
All acceptance criteria in `spec.md` map to a passing test or verification checkpoint. Status updated in `../../tracks.md`.

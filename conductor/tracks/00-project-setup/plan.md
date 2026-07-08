# Plan: Project Setup & Scaffolding

Status legend: `[ ]` pending, `[~]` in progress, `[x]` done

## Phase 1: Initialize Project & Structure
- [ ] Task 1.1: Initialize Expo React Native App
  - [ ] 1.1.1 Run Expo init command with TypeScript template
  - [ ] 1.1.2 Set up `.gitignore` to prevent committing build/dependencies/macOS cache files
- [ ] Task 1.2: Create Directory Structure
  - [ ] 1.2.1 Create folder `src/` at root
  - [ ] 1.2.2 Create subfolders: `src/capture`, `src/processing`, `src/storage`, `src/albums`
- [ ] Task 1.3: Formatting and Linting
  - [ ] 1.3.1 Install ESLint and GTS or standard TS formatting config
  - [ ] 1.3.2 Configure npm scripts: `lint`, `format`
- [ ] **Verification checkpoint:** Manually run linter and verify typescript compile passes.

## Phase 2: Testing Infrastructure
- [ ] Task 2.1: Configure Jest & Testing Library
  - [ ] 2.1.1 Install `jest`, `jest-expo`, `@testing-library/react-native`, `@testing-library/jest-native`
  - [ ] 2.1.2 Configure `jest.config.js` or `package.json` for Expo/TypeScript unit testing
- [ ] Task 2.2: Add Headless Dummy Tests
  - [ ] 2.2.1 Write pure function test in `src/processing/dummy.test.ts`
  - [ ] 2.2.2 Write component render test in `src/capture/dummy.test.tsx`
- [ ] Task 2.3: Integrate Test Scripts
  - [ ] 2.3.1 Configure `npm run test` script in `package.json`
  - [ ] 2.3.2 Run test suite and confirm both dummy tests pass headlessly
- [ ] **Verification checkpoint:** Run `npm run test` and verify output is green.

## Definition of done
All acceptance criteria in `spec.md` map to a passing test or verification checkpoint. Status updated in `../../tracks.md`.

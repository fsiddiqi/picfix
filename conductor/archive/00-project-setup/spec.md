# Spec: Project Setup & Scaffolding

## What & why
Initialize the codebase for the PicFix mobile application, establishing standard folders, configuring TypeScript, and setting up the testing/formatting environment. This provides a clean foundation for subsequent feature tracks and ensures a working TDD (Test-Driven Development) cycle.

## In scope
- Initialize React Native/Expo project with TypeScript in the workspace root.
- Establish clean architectural directory boundaries:
  - `src/capture/` (Camera UI only)
  - `src/processing/` (Pure CV processing/OpenCV wrapper)
  - `src/storage/` (SQLite database + filesystem access)
  - `src/albums/` (Album management and settings screens)
- Configure Jest and React Native Testing Library (`@testing-library/react-native`) for unit/component testing.
- Add standard code linter (ESLint) and formatter configuration.
- Implement a dummy test in each folder to verify Jest config is functional and running headlessly.

## Out of scope
- Implementing real camera preview UI -> handled in `01-scan-capture`
- Implementing OpenCV logic -> handled in `02-crop-and-correct`
- Implementing SQLite database creation -> handled in `03-album-management`

## Acceptance criteria
1. An Expo project with TypeScript template is initialized successfully in the root directory.
2. Running `npm run test` executes Jest headlessly and runs all tests.
3. Directory boundaries (`src/capture/`, `src/processing/`, `src/storage/`, `src/albums/`) are present.
4. ESLint/formatter runs successfully with no errors on the initial setup.
5. Dummy unit tests in `src/processing/` and component tests in `src/capture/` verify that both pure JS/TS logic and UI components can be unit tested without a device/simulator.

## Test approach
- Verify that Jest runs headlessly.
- Assert that basic dummy tests pass.
- Verify `package.json` contains tasks for linting, formatting, and testing.

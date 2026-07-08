# Product Guidelines

This document outlines the user experience, prose style, and design guidelines for the PicFix application.

## User Experience (UX) Principles
- **Speed Over Precision**: The target user is digitizing a large volume of photos. Actions like capturing, automatic cropping, and color correction should be extremely fast and require minimal manual confirmation.
- **Graceful Degradation**: If auto-detection or color-correction fails, degrade gracefully. Display a clear option for the user to manually crop or adjust, rather than crashing or showing technical error messages.
- **Offline First**: All core MVP features must work entirely offline. Do not introduce network latency or requirements for backend connectivity in Phase 1.

## Prose & Tone Guidelines
- **Simple & Clear**: Avoid jargon (e.g., use "auto-crop" instead of "homography transform", "fix colors" instead of "histogram equalization").
- **Encouraging**: Use encouraging, clean messaging for user prompts (e.g., "Scanning photo... done!").

## Design & Visual Standards
- **Clean Layouts**: Keep interfaces uncluttered. Use dark background styles for the capture preview to highlight physical photos.
- **Clear Badges**: Any photos needing manual adjustment must have a prominent "Needs Review" badge so the user can easily find and fix them.

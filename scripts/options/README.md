# Options Module Structure

The options page has been refactored into maintainable functional modules for better code organization and separation of concerns.

## Module Overview

### `index.ts` - Main Entry Point

- Orchestrates all modules
- Handles initialization and global event binding
- Minimal code, primarily for coordination

### `dom-utils.ts` - DOM Utilities

- Centralized DOM element selection
- Type-safe DOM references
- Reusable utility functions

### `custom-fields.ts` - Custom Fields Management

- CRUD operations for custom fields using pure functions
- Module-level state management
- Field rendering and validation
- Simple init function for setup

### `ai-interview.ts` - AI Interview System

- Interview question flow management
- AI bio generation with retry logic
- Chat interface handling
- Functional approach with module state

### `bio-manager.ts` - Bio Management

- Bio display modes (manual/AI/preview)
- Bio editing and acceptance
- Mode switching coordination
- Pure functions for bio operations

### `modal-manager.ts` - Modal Management

- Simple utility functions for modals
- Toast notifications
- No state, just pure functions

### `persona-manager.ts` - Persona Data Management

- Persona data collection and saving
- Profile loading and resetting
- Chrome storage integration
- Stateless functions

## Architecture Benefits

- **Functional Approach**: Uses functions instead of classes for simpler, more appropriate code
- **Module State**: State is contained within modules rather than class instances
- **Separation of Concerns**: Each module has a single responsibility
- **Maintainability**: Easier to locate and modify specific functionality
- **Testability**: Pure functions are easier to test than class methods
- **Performance**: No unnecessary object instantiation
- **Tree Shaking**: Better bundler optimization with function exports
- **Type Safety**: Strong TypeScript typing throughout all modules

## Why Functional vs OOP?

This use case is primarily **DOM manipulation and event handling** rather than complex object modeling. The functional approach is more appropriate because:

- No need for inheritance or polymorphism
- State is simple and module-scoped
- Functions are easier to reason about
- Better performance (no object instantiation overhead)
- More idiomatic for this type of UI scripting

## Debug Mode

The options page includes debug tools that can be enabled/disabled via environment variable:

### Enabling Debug Mode

**Option 1: Manual .env edit**

```bash
# In .env file
VITE_DEBUG_MODE=true
```

**Option 2: Using the toggle script**

```bash
# Turn debug mode on
node scripts/toggle-debug.js on

# Turn debug mode off
node scripts/toggle-debug.js off

# Check current status
node scripts/toggle-debug.js
```

### Debug Features

When debug mode is enabled:

- **Debug Tools Section**: Shows test buttons and debug output area
- **Verbose Logging**: Detailed console logs with emojis for easy identification
- **Test Bio Generation**: Button to test the AI bio generation directly
- **Clear Console**: Button to clear console logs
- **Error Details**: Enhanced error messages with debug information

### Debug Logging

The debug system provides context-aware logging:

- `🐛 [OPTIONS]` - Frontend debug logs
- `🐛 [BACKGROUND]` - Background script debug logs
- `🐛 [AI-INTERVIEW]` - AI interview specific logs

Debug logs are automatically filtered out in production builds when `VITE_DEBUG_MODE=false`.

# Chrome Extension Boilerplate

## Overview
A modern Chrome extension boilerplate using TypeScript and Vanilla JavaScript.

## Prerequisites
- Node.js (v14+)
- npm (v6+)

## Setup
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```

## Development
- Build the extension:
  ```
  npm run build
  ```
- Watch for changes:
  ```
  npm run watch
  ```

## Loading in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` directory

## Project Structure
- `src/`: TypeScript source files
  - `background.ts`: Background service worker
  - `content.ts`: Content script
  - `popup.ts`: Popup script
- `dist/`: Compiled JavaScript files
- `manifest.json`: Extension configuration

## Features
- TypeScript support
- Webpack bundling
- Manifest V3 compatible
- Basic extension structure

## Customization
Modify the source files to add your extension's specific functionality.

# Pace

A personal social steward app built with React, TypeScript, Vite, and Electron. This application provides a seamless experience across web and desktop platforms, featuring theme toggling and a modern UI.

## Description

Pace is designed as a personal social steward, helping users manage their social interactions and activities efficiently. It leverages the power of React for a responsive frontend, TypeScript for type safety, Vite for fast development, and Electron for cross-platform desktop support.

## Features

- **Cross-Platform Support**: Run as a web app or Electron desktop app.
- **Theme Toggling**: Switch between light and dark modes.
- **Modern UI**: Built with Tailwind CSS and Lucide React icons.
- **Hot Module Replacement (HMR)**: Fast development with Vite.

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Desktop**: Electron
- **Linting**: ESLint with TypeScript support

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd pace
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Development

- **Web App Only**:
  ```bash
  npm run dev-web-app
  ```

- **Electron App Only** (requires web app running):
  ```bash
  npm run dev-electron-app
  ```

- **Both Web and Electron Apps**:
  ```bash
  npm run dev-both-apps
  ```

### Building

- **Test Build**:
  ```bash
  npm run build-test
  ```

- **Release Build** (includes Electron packaging):
  ```bash
  npm run build-release
  ```

### Other Scripts

- **Lint Code**:
  ```bash
  npm run lint
  ```

- **Preview Build**:
  ```bash
  npm run preview
  ```

## Project Structure

- `src/`: Source code
  - `App.tsx`: Main app component
  - `main.tsx`: Entry point
  - `assets/`: Static assets
  - `lib/`: Utility functions
- `electron/`: Electron main and preload scripts
- `public/`: Public assets
- `dist-electron/`: Built Electron files

## Contributing

Contributions are welcome! Please ensure code follows the ESLint rules and includes appropriate TypeScript types.

## License

This project is private and not licensed for public use.

## Project Overview

This is a Next.js web application called "ArtContract" that helps artists create contracts automatically. It uses a wizard-like interface to guide the user through the process of creating a contract, and it uses AI to analyze the user's input and provide feedback. The application is built with Next.js, React, TypeScript, and Tailwind CSS. It also uses the OpenRouter API for its AI features.

## Building and Running

### Prerequisites

- Node.js
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/hwangtab/artcontract.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    ```bash
    cp .env.example .env.local
    ```
    Then, edit `.env.local` to add your OpenRouter API key.

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

### Running in Production

```bash
npm run start
```

### Testing

```bash
npm run test
```

## Development Conventions

### Code Style

- The project uses ESLint to enforce a consistent code style. You can run the linter with `npm run lint`.
- The project uses TypeScript for static type checking. You can run the type checker with `npm run type-check`.

### Testing

- The project uses Jest for testing. You can run the tests with `npm run test`.
- Test files are located in the `__tests__` directory and have the `.test.ts` or `.test.tsx` extension.

### Commits

- Commit messages should be clear and concise.
- Commits should be atomic and focus on a single change.

### Branches

- The `main` branch is the main development branch.
- Feature branches should be created from the `main` branch.
- Pull requests should be used to merge changes into the `main` branch.

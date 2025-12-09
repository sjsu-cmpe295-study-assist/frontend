# Notebook Application

A modern, AI-powered notebook application built with Next.js, featuring rich text editing, flashcard generation, and intelligent document processing. Inspired by Notion's clean design, this application provides a seamless experience for creating, organizing, and studying your notes.

## Features

### 📝 Notebook Management
- **Create Notebooks**: Generate notebooks from prompts, upload documents, or start with an empty notebook
- **Multiple Pages**: Organize content across multiple pages within each notebook
- **Search**: Quickly find notebooks and pages using the built-in search functionality
- **Organized View**: Notebooks are grouped by month and year for easy navigation

### ✍️ Rich Text Editor
- **Novel Editor Integration**: Powered by Novel, a modern rich text editor built on ProseMirror
- **Formatting Options**: 
  - Headings (H1, H2, H3)
  - Bullet and numbered lists
  - To-do lists
  - Blockquotes
  - Code blocks
  - Text formatting (bold, italic, underline, strikethrough)
- **Slash Commands**: Quick access to formatting options via `/` commands
- **Link Support**: Add and edit links seamlessly
- **Content Statistics**: View word count and estimated reading time

### 🤖 AI-Powered Features
- **Ask AI**: Select text and get AI-powered insights and answers
- **AI Chat**: Interactive chat interface for asking questions about your content
- **AI Notebook Generation**: Create notebooks from prompts with AI-generated content
- **Document Processing**: Upload documents and let AI extract and organize content

### 🎴 Flashcard System
- **Auto-Generation**: Create flashcards directly from your notebook content
- **Study Mode**: Review flashcards with question-answer format
- **Search**: Find flashcards by question or notebook title
- **Progress Tracking**: Track your learning progress

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Works seamlessly across different screen sizes
- **Notion-Inspired UI**: Clean, modern interface with familiar design patterns
- **Real-time Updates**: Changes are saved automatically as you type

### 🔐 Authentication
- Secure user authentication with JWT tokens
- Protected routes and API endpoints
- User profile management

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Rich Text Editor**: [Novel](https://novel.sh/) (ProseMirror-based)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- Backend API server running (see environment variables)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page (notebooks list)
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── notebooks/         # Notebook pages
│   │   └── [id]/
│   │       └── pages/
│   │           └── [pageId]/
│   └── flashcards/       # Flashcard management
├── components/            # React components
│   ├── editor/           # Rich text editor components
│   ├── sidebar/          # Sidebar components
│   └── ...
├── contexts/             # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and API clients
│   ├── api/             # API client functions
│   └── utils/           # Helper functions
└── stores/              # Zustand stores
    ├── authStore.ts
    ├── notebookStore.ts
    └── themeStore.ts
```

## Key Components

### Editor Components
- `PageEditor`: Main rich text editor component
- `NovelAskAI`: AI question interface
- `NovelMakeFlashCard`: Flashcard creation from content
- `NovelLinkSelector`: Link management
- `NovelNodeSelector`: Block type selector

### Notebook Components
- `NotebookCard`: Display notebook in grid view
- `NewNotebookModal`: Create new notebooks
- `Sidebar`: Navigation and notebook info
- `NotebookPagesList`: List of pages in a notebook

### Flashcard Components
- `FlashCardCard`: Display flashcard card
- `FlashCardPopover`: Flashcard study interface
- `FlashCardsPopover`: Manage flashcards from editor

## API Integration

The application communicates with a backend API. Key endpoints include:

- **Authentication**: `/auth/signup`, `/auth/login`, `/auth/me`
- **Notebooks**: `/notebooks` (CRUD operations)
- **Pages**: `/notebooks/{id}/pages` (CRUD operations)
- **Flashcards**: `/flashcards` (CRUD operations)

API client functions are located in `src/lib/api/`.

## State Management

The application uses Zustand for state management:

- **authStore**: User authentication state
- **notebookStore**: Notebooks and pages state
- **themeStore**: Theme preferences

## Development

### Code Style

- ESLint is configured for code quality
- TypeScript strict mode enabled
- Follow React best practices and Next.js conventions

### Running Linter

```bash
pnpm lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure code passes linting
4. Submit a pull request

## License

[Add your license here]

## Acknowledgments

- [Novel](https://novel.sh/) for the excellent rich text editor
- [Notion](https://www.notion.so/) for design inspiration
- [Radix UI](https://www.radix-ui.com/) for accessible components


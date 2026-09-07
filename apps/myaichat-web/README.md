# MyAIChat

A modern AI chat application built with Angular that enables users to interact with multiple AI models in real-time through a clean and intuitive interface.

## Key Features

- **Multi-Model AI Chat**: Interact with different AI models from various providers (OpenAI, Anthropic, Google, etc.)
- **Real-Time Streaming**: Server-Sent Events (SSE) for streaming AI responses
- **File Upload Support**: Attach and process files in conversations
- **Web Search Integration**: Enable AI models to search the web for up-to-date information
- **Image Generation**: Generate images directly within chat conversations
- **Conversation Management**: Create, view, and manage multiple chat sessions
- **Custom Prompts**: Save and reuse custom prompts for consistent interactions
- **User Authentication**: Secure JWT-based authentication with protected routes
- **Admin Panel**: Comprehensive dashboard for managing:
  - AI models and their configurations
  - User accounts and permissions
  - Model pricing and availability
- **Progressive Web App (PWA)**: Installable with offline support
- **Responsive Design**: Optimized for desktop and mobile devices

## Technologies Used

### Core Framework
- **Angular 20.3**: Modern web framework with standalone components and signals
- **TypeScript 5.9**: Type-safe development
- **RxJS 7.8**: Reactive programming for async operations

### State Management
- **NGXS 20.1**: State management with plugins for:
  - Router integration
  - Local storage persistence
  - Form state handling
  - Redux DevTools support

### UI/UX
- **Ng-Zorro-Antd 20.4**: Enterprise-class UI components
- **TailwindCSS 4.1**: Utility-first CSS framework
- **ngx-markdown 20.1**: Markdown rendering with syntax highlighting

### Testing
- **Vitest 3.2**: Fast unit testing framework
- **Testing Library Angular 18.1**: Component testing utilities

### Additional Features
- **JWT Decode**: Token handling for authentication
- **Angular Service Worker**: PWA capabilities
- **Marked 16.4**: Markdown parsing

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myaichat
```

2. Install dependencies:
```bash
npm install
```

3. Configure the environment:
   - Update `src/environments/environment.ts` with your API URL
   - Set up your backend API server

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200/`

## Usage

### Development
```bash
npm start          # Start development server
npm run build      # Build for production
npm run watch      # Build with watch mode
npm test           # Run unit tests
```

### Authentication
- Navigate to `/auth` to log in
- Admin users can access the admin panel at `/admin`

### Chat Features
- Create new conversations from the home page
- Select different AI models and configure parameters (temperature, max tokens)
- Upload files to include in your prompts
- Enable web search or image generation as needed
- Save frequently used prompts for quick access

### Admin Features
- Manage AI models: Add, edit, or remove available models
- Configure model parameters and pricing
- Manage user accounts and roles
- Monitor system usage and statistics

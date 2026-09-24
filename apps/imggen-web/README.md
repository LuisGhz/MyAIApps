# MyAIImg

An AI-powered image generation application with a chat-based interface, built with React and modern web technologies.

## Description

MyAIImg is a web application that allows users to generate images using AI models through an intuitive chat interface. The application supports multiple AI models (GPT and NanoBanana) and provides a seamless experience for creating and managing AI-generated images. With Auth0 integration for secure authentication and a responsive design powered by Ant Design and Tailwind CSS, users can interact with AI models to create custom images based on text prompts and uploaded files.

## Key Features

- **AI Image Generation**: Generate images using multiple AI models (GPT-based and NanoBanana)
- **Chat-Based Interface**: Conversational UI for natural interaction with AI models
- **File Upload Support**: Upload reference images to guide the AI generation process
- **Authentication**: Secure user authentication powered by Auth0
- **Model Configuration**: Customize generation parameters for different AI models
- **Generated Images Gallery**: View and manage previously generated images
- **Responsive Design**: Mobile-friendly interface that adapts to different screen sizes
- **Real-time State Management**: Efficient state handling with Zustand
- **Optimized Performance**: React Compiler integration for enhanced performance

## Technologies Used

### Frontend
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router 7** - Client-side routing
- **Ant Design 6** - UI component library
- **Tailwind CSS 4** - Utility-first CSS framework

### State Management & Data
- **Zustand** - Lightweight state management

### Authentication & Security
- **Auth0** - Authentication and authorization
- **JWT Decode** - Token handling

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting

### Deployment
- **Docker** - Containerization
- **Nginx** - Production web server
- **Bun** - JavaScript runtime and package manager

## Installation

### Prerequisites
- [Bun](https://bun.sh/) (v1.3.5 or higher)
- Node.js (for compatibility)
- Auth0 account for authentication setup

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myaiimg
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=<your-api-url>
   VITE_AUTH0_DOMAIN=<your-auth0-domain>
   VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
   VITE_AUTH0_AUDIENCE=<your-auth0-audience>
   ```

4. **Start the development server**
   ```bash
   bun dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## Usage

### Development

Start the development server with hot reload:
```bash
bun dev
```

### Build

Create a production build:
```bash
bun run build
```

### Preview Production Build

Preview the production build locally:
```bash
bun run preview
```

### Linting

Run ESLint to check code quality:
```bash
bun run lint
```

### Generating Images

1. Log in with your Auth0 credentials
2. Select an AI model (GPT or NanoBanana)
3. Configure model options if needed
4. Enter your prompt in the input field
5. Optionally upload a reference image
6. Click send to generate your image
7. View generated images in the chat or gallery

## Deployment

### Using Docker

The application includes a multi-stage Dockerfile for optimized production builds.

1. **Build the Docker image**
   ```bash
   docker build \
     --build-arg VITE_API_URL=<your-api-url> \
     --build-arg VITE_AUTH0_DOMAIN=<your-auth0-domain> \
     --build-arg VITE_AUTH0_CLIENT_ID=<your-auth0-client-id> \
     --build-arg VITE_AUTH0_AUDIENCE=<your-auth0-audience> \
     -t myaiimg .
   ```

2. **Run the container**
   ```bash
   docker run -p 80:80 myaiimg
   ```

### Using the Deploy Script

A deployment script is provided for automated Docker Hub deployment:

1. **Set required environment variables**
   ```bash
   export DOCKERHUB_USER=<your-dockerhub-username>
   export DOCKERHUB_TOKEN=<your-dockerhub-token>
   export VITE_API_URL=<your-api-url>
   export VITE_AUTH0_DOMAIN=<your-auth0-domain>
   export VITE_AUTH0_CLIENT_ID=<your-auth0-client-id>
   export VITE_AUTH0_AUDIENCE=<your-auth0-audience>
   ```

2. **Run the deployment script**
   ```bash
   bash scripts/deploy.sh
   ```

The script will:
- Validate environment variables
- Build and tag the Docker image
- Push to Docker Hub
- Deploy to your server

---

**Built with ❤️ using React, TypeScript, and AI**

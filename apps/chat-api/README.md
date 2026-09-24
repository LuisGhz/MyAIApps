# MyAIChat

A scalable AI chat application built with NestJS that enables users to interact with multiple AI models (OpenAI, Google Gemini) through a RESTful API. The application features real-time streaming responses, audio transcription, custom prompts, and comprehensive authentication.

## Key Features

- **Multi-Model AI Support**: Integrate with OpenAI (GPT models) and Google Gemini AI models
- **Real-Time Streaming**: Server-Sent Events (SSE) for streaming AI responses
- **Authentication & Authorization**: OAuth 2.0 with GitHub, JWT-based authentication, and role-based access control (Admin/User)
- **Conversation Management**: Create, manage, and organize chat sessions with full message history
- **Custom Prompts**: Create and manage reusable system prompts for different use cases
- **Model Management**: Admin panel for configuring and managing AI models
- **Audio Transcription**: Support for audio file transcription using OpenAI Whisper API
- **File Upload**: S3 integration for handling file attachments in conversations
- **Rate Limiting**: Built-in throttling to prevent API abuse
- **Caching**: Redis-based caching for improved performance
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Database Migrations**: TypeORM migrations with module-specific migration management
- **Comprehensive Testing**: Unit tests and E2E tests with coverage reporting

## Technologies Used

### Core Framework

- **NestJS** - Progressive Node.js framework for building efficient server-side applications
- **TypeScript** - Strongly typed programming language
- **Node.js** - JavaScript runtime environment

### Database & ORM

- **PostgreSQL** - Relational database
- **TypeORM** - ORM for TypeScript and JavaScript

### AI & Machine Learning

- **OpenAI API** - Integration with GPT models and gpt 4o mini transcribe
- **Google Generative AI** - Integration with Gemini models

### Caching & Storage

- **Redis** - In-memory data structure store for caching
- **AWS S3** - Cloud storage for file uploads
- **cache-manager** - Caching solution with Redis adapter

### Authentication & Security

- **JWT (JSON Web Tokens)** - Token-based authentication
- **OAuth 2.0** - GitHub OAuth integration
- **PKCE** - Proof Key for Code Exchange for secure OAuth flows
- **cookie-parser** - Cookie parsing middleware

### Validation & Transformation

- **class-validator** - Decorator-based validation
- **class-transformer** - Object transformation and serialization
- **Zod** - TypeScript-first schema validation

### API Documentation

- **Swagger/OpenAPI** - API documentation and testing interface

### Testing

- **Jest** - JavaScript testing framework

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Docker** - Containerization for Redis
- **ts-node** - TypeScript execution environment

## Installation

### Prerequisites

- Node.js (v22 or higher)
- PostgreSQL database
- Redis (via Docker or local installation)
- AWS S3 account (for file uploads)
- OpenAI API key (optional, for OpenAI models)
- Google AI API key (optional, for Gemini models)
- GitHub OAuth App credentials

### Steps

1. **Clone the repository**

  ```bash
  git clone <repository-url>
  cd myaichat
  ```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=myaichat
# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/callback
# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
# AI APIs (Optional - configure based on models you want to use)
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

4. **Start Redis using Docker**

```bash
docker-compose up -d
```

5. **Run database migrations**

```bash
npm run migration:run
```

6. **Generate JWT secret (optional)**

```bash
npm run generate:key
```

Copy the generated key to the env file

## Usage

### Development Mode

```bash
# Start in watch mode
npm run start:dev

# Start with debugging
npm run start:debug
```

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm start:prod
```

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Test coverage
npm run test:cov
```

### API Docs

Once the application is running, access the interactive API documentation at:

```bash
http://localhost:3000/api/docs
```

### Database Migrations

```bash
# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Generate new migration (example for user module)
npm run migration:user:generate --name=MigrationName

# Create empty migration (example for chat module)
npm run migration:chat:create --name=MigrationName
```

### Available Endpoints

- **Authentication**: `/api/auth/*` - OAuth login, callback, refresh token, logout
- **Users**: `/api/user/*` - User profile management
- **Chat**: `/api/chat/*` - Create chats, send messages, stream responses, transcribe audio
- **Prompts**: `/api/prompts/*` - Manage custom system prompts
- **Models**: `/api/models/*` - List and manage AI models (admin)

## Deployment

This project includes a `Dockerfile` and a GitHub Actions workflow that build and publish a Docker image, then deploy it to a remote server using an SSH action and the `scripts/deploy.sh` helper script.

- **Dockerfile**: `Dockerfile` — builds the app and produces a production image (`node:22-alpine`).
- **CI Workflow**: `.github/workflows/deploy.yaml` — builds and pushes the Docker image, then SSHs to the server and runs `scripts/deploy.sh`.
- **Deploy Script**: `scripts/deploy.sh` — validates environment variables, pulls the new image, runs migrations inside the new image, and only replaces the running container after migrations succeed (safe rollback behavior).

Required repository Variables and Secrets

- **Repository Variables (`Settings → Variables`)**: set non-sensitive configuration values here. Example names used by the workflow:
  - `NODE_ENV` (e.g., `production`)
  - `PORT` (e.g., `3000`)
  - `FRONTEND_URL`
  - `DOCKERHUB_USERNAME` (the workflow maps this to `DOCKERHUB_USER` at deploy time)
  - `JWT_EXPIRES_IN`
  - `REFRESH_TOKEN_LENGTH`
  - `REFRESH_TOKEN_EXPIRES_IN`
  - `CALLBACK_URL` (used as `GITHUB_CALLBACK_URL` in the workflow)
  - `MAX_SESSIONS_PER_USER`
  - `CDN_DOMAIN`
  - `THROTTLE_TTL`
  - `THROTTLE_LIMIT`
  - `REDIS_HOST`
  - `CACHE_SHORT_TTL`
  - `CACHE_TTL`
  - `CACHE_LONG_TTL`

- **Repository Secrets (`Settings → Secrets and variables → Actions → Secrets`)**: set sensitive credentials here. Example names used by the workflow:
  - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
  - `JWT_SECRET`
  - `DOCKERHUB_ACCESS_TOKEN` (the workflow maps this to `DOCKERHUB_TOKEN` at deploy time)
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `S3_ACCESS_KEY`
  - `S3_SECRET_KEY`
  - `S3_BUCKET_NAME`
  - `SERVER_IP` (SSH host for deployment)
  - `SERVER_USER` (SSH user for deployment)
  - `SSH_PRIVATE_KEY` (SSH private key used by the action)
  - `SSH_PASSPHRASE` (if your SSH key is encrypted)

Note: `.github/workflows/deploy.yaml` reads some values from repository `vars` and others from `secrets`. The deploy step exports a set of env variables to the remote `scripts/deploy.sh` (for example, `vars.DOCKERHUB_USERNAME` becomes the remote env `DOCKERHUB_USER`, and `secrets.DOCKERHUB_ACCESS_TOKEN` becomes `DOCKERHUB_TOKEN`). Ensure both the Variables and Secrets shown above are configured in your GitHub repository settings before running the workflow.

Note: `scripts/deploy.sh` includes a complete list of validated variables; ensure all required variables are set as repository `secrets` or `variables` in GitHub prior to using the workflow.

How the GitHub Action works (high-level)

- Checkout code, build multi-platform image via `docker/build-push-action`, push to Docker Hub.
- SSH to the remote server and execute `scripts/deploy.sh` which:
  - Validates env vars
  - Pulls the new Docker image
  - Runs migrations in a temporary container: `npm run migration:run:prod`
  - If migrations succeed, stops/removes the old container and starts the new one.

Local quick deploy (example)

```bash
# Build image locally
docker build -t yourdockeruser/myaichat-nest:local .

# Run migrations in the image (adjust envs as needed)
docker run --rm -e NODE_ENV=production -e DB_HOST=... -e DB_USERNAME=... -e DB_PASSWORD=... yourdockeruser/myaichat-nest:local npm run migration:run:prod

# Run the container
docker run -d \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DB_HOST=... -e DB_PORT=5432 -e DB_USERNAME=... -e DB_PASSWORD=... -e DB_NAME=... \
  -p 3000:3000 \
  --name myaichat-nest \
  yourdockeruser/myaichat-nest:local
```

Deployment notes and tips

- `scripts/deploy.sh` expects Docker networks named `dbs` and `redis` when running on the remote host (the script uses `--network dbs` and `--network redis`). Ensure those networks exist or remove the flags if not using them.
- The script logs and aborts if migrations fail; this preserves the previous container for safe rollback.
- Ensure GitHub repository `Secrets` and `Variables` include all the values referenced by `.github/workflows/deploy.yaml` (Docker Hub credentials, server SSH key, DB credentials, API keys, etc.).
- If you prefer not to run migrations automatically, modify `scripts/deploy.sh` to skip `npm run migration:run:prod`.

If you need help customizing the deployment for your environment (e.g., different Docker registry, Kubernetes, or a managed host), open an issue or request a tailored guide.

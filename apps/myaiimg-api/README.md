# MyAIImg

AI-powered image generation and editing API built with NestJS, integrating OpenAI and Google Gemini models with secure cloud storage.

## Description

MyAIImg is a RESTful API service that enables image generation and editing through AI models. It supports both OpenAI (DALL-E) and Google Gemini for creating and modifying images based on text prompts. The service includes JWT authentication, AWS S3 storage integration, and PostgreSQL database for tracking generated images.

## Key Features

- **Multi-Provider AI Image Generation**: Support for both OpenAI and Google Gemini AI models
- **Image Editing**: Edit existing images or previously generated images with AI assistance
- **Secure Authentication**: JWT-based authentication with Auth0 integration
- **Cloud Storage**: Automatic upload to AWS S3 with CDN delivery
- **Database Tracking**: PostgreSQL integration for image metadata and user tracking
- **Type-Safe Configuration**: Zod schema validation for environment variables
- **TypeORM Migrations**: Database schema versioning and migration support
- **File Upload Support**: Multipart form data handling with Multer
- **Global API Prefix**: All endpoints prefixed with `/api`
- **CORS Enabled**: Cross-origin resource sharing support

## Technologies Used

### Core Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Bun** - Fast JavaScript runtime and package manager

### AI Integration
- **OpenAI API** - DALL-E image generation and editing
- **Google Generative AI** - Gemini image generation

### Database
- **PostgreSQL** - Primary database
- **TypeORM** - ORM for database operations
- **TypeORM Migrations** - Schema version control

### Cloud Services
- **AWS S3** - Image storage
- **CDN** - Content delivery network for image serving

### Authentication & Security
- **Passport JWT** - JWT authentication strategy
- **Auth0** - Identity provider integration
- **jwks-rsa** - JSON Web Key Set for Auth0
- **Cookie Parser** - Cookie handling

### Validation & Transformation
- **class-validator** - DTO validation
- **class-transformer** - Object transformation
- **Zod** - Schema validation for environment variables

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Docker** - Containerization

## Installation

### Prerequisites
- Bun (v1.3.5 or higher)
- PostgreSQL database
- AWS S3 bucket
- OpenAI API key
- Google Gemini API key
- Auth0 account (for authentication)

### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd myaiimg
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file in the root directory with the following variables:
```env
NODE_ENV=development
PORT=3000

# AI Services
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=myaiimg

# Auth0 Configuration
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience

# AWS S3 Configuration
AWS_S3_REGION=your_aws_region
AWS_S3_BUCKET=your_bucket_name
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
CDN_DOMAIN=https://your-cdn-domain.com
```

4. Run database migrations:
```bash
bun run migration:run
```

5. Start the development server:
```bash
bun start:dev
```

The API will be available at `http://localhost:3000/api`

## Usage

### API Endpoints

#### Generate Image with OpenAI
```http
POST /api/img/openai
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Body:
- prompt: string (text description for image generation)
- image: file (optional - for image editing)
- lastGeneratedImage: file (optional - previously generated image to edit)
```

#### Generate Image with Gemini
```http
POST /api/img/gemini
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

Body:
- prompt: string (text description for image generation)
- image: file (optional - for image editing)
- lastGeneratedImage: file (optional - previously generated image to edit)
```

#### Get User Images
```http
GET /api/img
Authorization: Bearer <jwt_token>
```

### Response Format
```json
{
  "image": "base64_encoded_image_string",
  "key": "s3_storage_key"
}
```

### Database Management

Generate a new migration:
```bash
bun --name=YourMigrationName migration:img:generate
```

Run migrations:
```bash
bun run migration:run
```

Revert last migration:
```bash
bun run migration:revert
```

Show migration status:
```bash
bun run migration:show
```

## Deployment

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t myaiimg .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env myaiimg
```

### Automated Deployment

The project includes a deployment script that handles:
- Environment variable validation
- Docker image building and pushing to DockerHub
- Container deployment

Required environment variables for deployment:
```env
DOCKERHUB_USER=your_dockerhub_username
DOCKERHUB_TOKEN=your_dockerhub_token
```

Run the deployment script:
```bash
bash scripts/deploy.sh
```

### Production Migrations

Run migrations in production:
```bash
bun run migration:run:prod
```

Revert migrations in production:
```bash
bun run migration:revert:prod
```

### Production Build

Build for production:
```bash
bun run build
```

Start production server:
```bash
bun start:prod
```

## License

UNLICENSED

# MyAI Apps

MyAI Apps is a Bun workspace monorepo containing three web applications and their NestJS APIs. Turborepo runs repository tasks and caches build and test outputs. Each application can also be developed and deployed independently.

## Applications

| Application   | Purpose and primary stack                                                               | Production port mapping |
| ------------- | --------------------------------------------------------------------------------------- | ----------------------- |
| `chat-api`    | NestJS, TypeORM, PostgreSQL, Redis, OpenAI, Gemini, GitHub OAuth, and S3-backed uploads | `3001:3000`             |
| `chat-web`    | Angular 21, NGXS, and Tailwind CSS                                                      | `3051:80`               |
| `english-api` | NestJS, TypeORM, PostgreSQL, Auth0, and OpenAI                                          | `3003:3000`             |
| `english-web` | Angular 21, Auth0, and Tailwind CSS                                                     | `3053:80`               |
| `imggen-api`  | NestJS, TypeORM, PostgreSQL, Auth0, OpenAI, Gemini, and AWS S3                          | `3004:3000`             |
| `imggen-web`  | React 19, Vite, Tailwind CSS, Auth0, and Zustand                                        | `3054:80`               |

The mappings are the host ports assigned by the deployment scripts; the values after the colon are the ports inside each container. API routes use the `/api` prefix where configured by the application.

## Repository Layout

```text
apps/                 Six independently buildable applications
deploy/               Per-application remote Docker deployment scripts
.github/workflows/    Central deployment workflow
packages/             Shared workspace package location
turbo.json            Turborepo task graph and output cache configuration
```

## Requirements

- Bun 1.4.0 or newer. The root package declares Bun 1.4.0 as its package-manager version.
- Docker for container builds and the local Redis service.
- PostgreSQL instances for the APIs you run. Database servers are not provisioned by the root workspace.
- Application-specific provider credentials for features such as Auth0, OpenAI, Gemini, and AWS S3.

Install workspace dependencies from the repository root:

```sh
bun install
```

Do not commit `.env` files or credentials. The repository currently includes example configuration in `apps/english-api/.env.example` and `apps/imggen-web/.env.example`; consult the relevant app's configuration schema and README for additional settings.

### Runtime version note

The root package targets Bun 1.4.0, and the chat API and chat web Dockerfiles use Bun 1.4 images. The English API, English web, image-generation API, and image-generation web Dockerfiles currently pin Bun 1.3.5. Update those Dockerfile base images if Bun 1.4+ is to be enforced consistently in production as well as local development.

## Development

Root scripts are backed by Turborepo:

```sh
bun run build
bun run lint
bun run check-types
bunx turbo run test
```

Build a single workspace by package name:

```sh
bun run build --filter=@myaiapps/chat-api
bun run build --filter=@myaiapps/chat-web
```

For watch-mode development, use the script provided by the application. NestJS APIs use `start:dev`; the Angular and Vite applications use their own `start` or `dev` scripts. For example:

```sh
cd apps/chat-api
bun run start:dev
```

```sh
cd apps/imggen-web
bun run dev
```

Configure each API's database and provider environment before starting it. The chat API's compose file starts Redis only; it does not start PostgreSQL. From `apps/chat-api`, run `docker compose up -d` to start that Redis service for local development, and set `REDIS_HOST=localhost` for an API process running on the host.

Useful application-level checks include `bun run test`, `bun run test:e2e` (where provided), and `bun run test:cov` from the corresponding API directory. The web projects expose their test scripts in their respective `package.json` files.

## TypeORM Migrations

Run a migration against the database configured for a local API from that API's directory:

```sh
cd apps/chat-api
bun run migration:run
```

```sh
cd apps/english-api
bun run migration:run
```

```sh
cd apps/imggen-api
bun run migration:run
```

Set the matching `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_NAME` values before running the command. Migration status and rollback scripts are also available in each API package where defined (for example, `migration:show` and `migration:revert`).

For a built production image, run the production command from its API directory with production database environment variables available:

```sh
bun run build
bun run migration:run:prod
```

The production script executes the compiled TypeORM CLI (`dist/typeorm-cli.js`). The deployment scripts run `bun run migration:run:prod` in a one-off container connected to the `dbs` Docker network before replacing the running API container. A failed migration stops that deployment before the new API container is started.

## Build and Cache

The root `package.json` exposes `build`, `dev`, `lint`, `format`, and `check-types` scripts. Turborepo task configuration is in `turbo.json`:

- Build tasks declare `dist/**` as cacheable output.
- Test tasks declare `coverage/**` as cacheable output.
- Development tasks are persistent and not cached.
- Build tasks account for `.env*` and TypeScript configuration files as inputs.

Turborepo remote caching is enabled for CI. Configure the repository variable `TURBO_TEAM` and secret `TURBO_TOKEN` with the Vercel team slug and a Vercel access token. Each app build job installs the root Bun workspace and runs its filtered `turbo run build` task. Turbo restores or uploads the declared `dist/**` output through the remote cache; frontend build-time environment variables are included in their task hashes.

Dockerfiles now package those Turbo-built outputs instead of compiling the applications again. Docker Buildx also retains its separate GitHub Actions layer cache per app, which can reuse image packaging layers. These caches accelerate builds; they do not determine whether an app needs deployment.

## Production Deployment

Deployment is split across three workflows: [chat](.github/workflows/deploy-chat.yml), [English](.github/workflows/deploy-english.yml), and [image generation](.github/workflows/deploy-imggen.yml). Each runs on pushes to `main` or `master` and can also be started with `workflow_dispatch`. In a manual run, `all` deploys both applications in that workflow, or select one API or web app.

For push events, each workflow's `dorny/paths-filter` checks its two `apps/<app>/**` directories, matching `deploy/<app>.sh` scripts, and shared build inputs (`package.json`, `bun.lock`, `.npmrc`, `turbo.json`, and `packages/**`). Only matching applications are built and deployed. A manual run intentionally bypasses change detection. Each selected API or web image is assembled from the Turbo output, pushed with Docker Buildx, and deployed over SSH by its script in `deploy/`.

On pushes, unchanged applications skip both the build and deploy jobs through the per-app path filters; a shared workspace change conservatively selects all six applications. Turbo's remote cache avoids rerunning an app's build task when its inputs and build-time environment match a cached result. The cache itself is not used as a deployment gate: a cache hit can restore build output, but does not prove that the currently deployed image includes that output.

Production hosts must have Docker installed, the relevant application networks configured (`dbs` for the APIs and `redis` for chat API), database/network access, and the mapped host ports available. API deployment scripts pass runtime configuration to containers. The English and image-generation web builds receive configuration as Turbo build environment variables and bake it into their static bundles; chat web has no additional build-time environment variables.

## GitHub Actions Configuration

Create the following repository-level GitHub Secrets and Variables. The first column is the GitHub setting; the last column shows the name or purpose at the deployment/container boundary. Rows are grouped so shared settings are listed once.

Also configure the repository secret `TURBO_TOKEN` and variable `TURBO_TEAM` for Vercel Remote Cache access. The token is used only by the Turbo build step and is not passed into Docker builds or runtime containers.

### GitHub Secrets

| GitHub Secret                                      | Used by                            | Container runtime or build-time mapping                                                               |
| -------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `DOCKERHUB_TOKEN`                                  | All deployments                    | Used for Docker Hub login on the build runner and remote host; not passed into application containers |
| `SERVER_IP`                                        | All deployments                    | SSH target; not an application variable                                                               |
| `SERVER_USER`                                      | All deployments                    | SSH account; not an application variable                                                              |
| `SSH_PRIVATE_KEY`                                  | All deployments                    | SSH authentication; not an application variable                                                       |
| `SSH_PASSPHRASE`                                   | All deployments                    | SSH key passphrase; not an application variable                                                       |
| `AWS_ACCESS_KEY_ID`                                | Chat API, image-generation API     | Chat API: `S3_ACCESS_KEY`; image-generation API: `AWS_ACCESS_KEY_ID`                                  |
| `AWS_SECRET_ACCESS_KEY`                            | Chat API, image-generation API     | Chat API: `S3_SECRET_KEY`; image-generation API: `AWS_SECRET_ACCESS_KEY`                              |
| `IMGGEN_AWS_S3_REGION`                             | Image-generation API               | `AWS_S3_REGION`                                                                                       |
| `IMGGEN_AWS_S3_BUCKET`                             | Image-generation API               | `AWS_S3_BUCKET`                                                                                       |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` | All APIs                           | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`                                                    |
| `CHAT_DB_NAME`                                     | Chat API                           | `DB_NAME`                                                                                             |
| `CHAT_JWT_SECRET`                                  | Chat API                           | `JWT_SECRET`                                                                                          |
| `CHAT_OPENAI_API_KEY`                              | Chat API                           | `OPENAI_API_KEY`                                                                                      |
| `CHAT_GEMINI_API_KEY`                              | Chat API                           | `GEMINI_API_KEY`                                                                                      |
| `CHAT_GITHUB_CLIENT_ID`                            | Chat API                           | `GITHUB_CLIENT_ID`                                                                                    |
| `CHAT_GITHUB_CLIENT_SECRET`                        | Chat API                           | `GITHUB_CLIENT_SECRET`                                                                                |
| `CHAT_S3_BUCKET_NAME`                              | Chat API                           | `S3_BUCKET_NAME`                                                                                      |
| `ENGLISH_DB_NAME`                                  | English API                        | `DB_NAME`                                                                                             |
| `ENGLISH_OPENAI_API_KEY`                           | English API                        | `OPENAI_API_KEY`                                                                                      |
| `ENGLISH_AUTH0_DOMAIN`                             | English API and web build          | API: `AUTH0_DOMAIN`; web Turbo build env: `NG_APP_AUTH0_DOMAIN`                                       |
| `ENGLISH_AUTH0_AUDIENCE`                           | English API and web build          | API: `AUTH0_AUDIENCE`; web Turbo build env: `NG_APP_AUTH0_AUDIENCE`                                   |
| `ENGLISH_AUTH0_CLIENT_ID`                          | English web build                  | Turbo build env: `NG_APP_AUTH0_CLIENT_ID`                                                             |
| `IMGGEN_DB_NAME`                                   | Image-generation API               | `DB_NAME`                                                                                             |
| `IMGGEN_OPENAI_API_KEY`                            | Image-generation API               | `OPENAI_API_KEY`                                                                                      |
| `IMGGEN_GEMINI_API_KEY`                            | Image-generation API               | `GEMINI_API_KEY`                                                                                      |
| `IMGGEN_AUTH0_DOMAIN`                              | Image-generation API and web build | API: `AUTH0_DOMAIN`; web Turbo build env: `VITE_AUTH0_DOMAIN`                                         |
| `IMGGEN_AUTH0_AUDIENCE`                            | Image-generation API and web build | API: `AUTH0_AUDIENCE`; web Turbo build env: `VITE_AUTH0_AUDIENCE`                                     |
| `IMGGEN_AUTH0_CLIENT_ID`                           | Image-generation web build         | Turbo build env: `VITE_AUTH0_CLIENT_ID`                                                               |

### GitHub Variables

| GitHub Variable                                                                     | Used by                    | Container runtime or build-time mapping                                                          |
| ----------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| `DOCKERHUB_USER`                                                                    | All deployments            | Docker Hub account and image namespace; forwarded to deploy scripts, not an app runtime variable |
| `CHAT_API_PORT`                                                                     | Chat API                   | `PORT`; defaults to `3000` if unset                                                              |
| `CHAT_JWT_EXPIRES_IN`, `CHAT_REFRESH_TOKEN_LENGTH`, `CHAT_REFRESH_TOKEN_EXPIRES_IN` | Chat API                   | Same-named container variables                                                                   |
| `CHAT_GITHUB_CALLBACK_URL`                                                          | Chat API                   | `GITHUB_CALLBACK_URL`                                                                            |
| `CHAT_FRONTEND_URL`                                                                 | Chat API                   | `FRONTEND_URL`                                                                                   |
| `CHAT_MAX_SESSIONS_PER_USER`                                                        | Chat API                   | `MAX_SESSIONS_PER_USER`                                                                          |
| `CHAT_CDN_DOMAIN`                                                                   | Chat API                   | `CDN_DOMAIN`                                                                                     |
| `CHAT_THROTTLE_TTL`, `CHAT_THROTTLE_LIMIT`                                          | Chat API                   | Same-named container variables                                                                   |
| `CHAT_REDIS_HOST`                                                                   | Chat API                   | `REDIS_HOST`                                                                                     |
| `CHAT_CACHE_SHORT_TTL`, `CHAT_CACHE_TTL`, `CHAT_CACHE_LONG_TTL`                     | Chat API                   | Same-named container variables                                                                   |
| `ENGLISH_FRONTEND_URL`                                                              | English API                | `FRONTEND_URL`                                                                                   |
| `IMGGEN_API_PORT`                                                                   | Image-generation API       | `PORT`; defaults to `3000` if unset                                                              |
| `IMGGEN_CDN_DOMAIN`                                                                 | Image-generation API       | `CDN_DOMAIN`                                                                                     |
| `IMGGEN_API_URL`                                                                    | Image-generation web build | Turbo build env `VITE_API_URL`                                                                   |

`NODE_ENV=production` is set by the API deployment jobs and is not a GitHub setting. The API host ports are set by the deploy scripts, not by the `*_API_PORT` variables; those variables configure the port inside the container.

Auth0 domain, audience, and client ID are browser-visible configuration when included in a web build. Although the workflow currently reads these values from GitHub Secrets, they are compiled into static frontend assets and must not contain client secrets or other confidential credentials.

## Deployment Scripts and Images

| Application          | Image tag                                | Deployment script                                |
| -------------------- | ---------------------------------------- | ------------------------------------------------ |
| Chat API             | `personalwebapss:myaichat-nest`          | [`deploy/chat-api.sh`](deploy/chat-api.sh)       |
| Chat web             | `personalwebapss:myaichat-angular`       | [`deploy/chat-web.sh`](deploy/chat-web.sh)       |
| English API          | `personalwebapss:myaienglish-api-nestjs` | [`deploy/english-api.sh`](deploy/english-api.sh) |
| English web          | `personalwebapss:myaienglish-angular`    | [`deploy/english-web.sh`](deploy/english-web.sh) |
| Image-generation API | `personalwebapss:myaiimg-api`            | [`deploy/imggen-api.sh`](deploy/imggen-api.sh)   |
| Image-generation web | `personalwebapss:myaiimg`                | [`deploy/imggen-web.sh`](deploy/imggen-web.sh)   |

The `personalwebapss` image repository name is currently embedded in the deployment scripts. Keep image tags, workflow build tags, and deployment scripts aligned when changing image naming.

## Application Documentation

- [Chat API](apps/chat-api/README.md)
- [Chat web](apps/chat-web/README.md)
- [English API](apps/english-api/README.md)
- [English web](apps/english-web/README.md)
- [Image-generation API](apps/imggen-api/README.md)
- [Image-generation web](apps/imggen-web/README.md)

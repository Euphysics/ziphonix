# Ziphonix

## Overview

Ziphonix is a modern backend template that leverages **Hono**, **Prisma**, **Zod**, and **Inversify** to deliver a scalable, type-safe, and DI-driven architecture for web applications.

## Features

- **Strict Type Safety**: Powered by Zod for runtime schema validation and type definitions.
- **Dependency Injection**: Implemented using Inversify for modular and testable code.
- **RPC Implementation**: Enables structured remote procedure calls with clear contracts.
- **Customizable Builds**: Use esbuild to produce a single consolidated service or modular microservices.
- **Developer Experience**:
  - **Linting**: Configured with ESLint 9 for maintaining code quality.
  - **Formatting**: Prettier ensures consistent code styling.
  - **Hot Reloading**: Development server powered by Bun (`bun run --hot`).

## Core Technologies

- **Hono**: Lightweight and fast web framework.
- **Prisma**: ORM for type-safe database interactions.
- **Zod**: Schema validation and type inference.
- **Inversify**: Implements Dependency Injection for clean architecture.
- **PostgreSQL**: Database solution for reliable and scalable storage.

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS version recommended)
- [Bun](https://bun.sh/) (used for development tooling)
- [Prisma CLI](https://www.prisma.io/docs/concepts/components/prisma-cli)
- [PostgreSQL](https://www.postgresql.org/) (optional if using Docker)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd ziphonix
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Generate Prisma client:
   ```bash
   bun run generate
   ```
4. Set up the database:
   If you have Docker installed, you can easily set up a PostgreSQL database using the provided `compose.yml` file:
   ```bash
   cd docker
   docker compose up -d
   ```
5. Configure environment variables:
   Copy the `.env.example` file to `.env` in the project root and update the values as needed:
   ```bash
   cp .env.example .env
   ```
   If using Docker, do the same for the `.env.example` file in the `docker` directory:
   ```bash
   cp docker/.env.example docker/.env
   ```
6. Apply Prisma migrations:
   Execute the following command to apply the existing migration files to your database:
   ```bash
   bun run migrate
   ```

### Development

Start the development server with hot reloading:

```bash
bun run dev
```

### Building

Choose between a single consolidated build or microservice-based builds:

- **Single Service**:
  ```bash
  bun run build
  ```
- **Microservices**:
  ```bash
  bun run build:micro
  ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.


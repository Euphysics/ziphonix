# Ziphonix

## Overview

Ziphonix is a modern backend template that leverages **Hono**, **Prisma**, **Zod**, and **Inversify** to deliver a scalable, type-safe, and DI-driven architecture for web applications. It also supports automatic generation of OpenAPI specifications, making it easier to document and integrate APIs.

## Features

- **Strict Type Safety**: Powered by Zod for runtime schema validation and type definitions.
- **Dependency Injection**: Implemented using Inversify for modular and testable code.
- **RPC Implementation**: Enables structured remote procedure calls with clear contracts.
- **OpenAPI Specification**: Automatically generate OpenAPI documentation for your API.
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
7. Run the development server:
   Start the server with hot reloading and ensure the OpenAPI documentation is available:
   ```bash
   bun run dev
   ```

## Building

Choose between a single consolidated build or microservice-based builds:

- **Single Service**:
  ```bash
  bun run build
  ```
- **Microservices**:
  ```bash
  bun run build:micro
  ```

## API Documentation

The OpenAPI specification for your API is automatically generated and accessible during development. Visit the `/docs` endpoint to view and interact with the API documentation.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

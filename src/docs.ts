import { mkdirSync, writeFileSync } from 'fs';

import { stringify } from 'yaml';

import { docsBootstrap } from '@/bootstrap';
import { registerDocsRoutes } from '@/routes';

const { hono, container } = docsBootstrap();

const docs = registerDocsRoutes(hono, container).getOpenAPIDocument({
  openapi: '3.0.3',
  info: {
    title: 'Ziphonix',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
});

const outputDir = 'out';
const outputFile = `${outputDir}/docs.yaml`;

mkdirSync(outputDir, { recursive: true });

writeFileSync(outputFile, stringify(docs), 'utf8');

console.log(`Docs written to ${outputFile}`);

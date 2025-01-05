import { readdirSync, statSync } from 'fs';
import { join } from 'path';

import { build } from 'esbuild';

const ALL_BUILD_MODE = '--all';
const MICROSERVICES_BUILD_MODE = '--microservices';

const getMicroserviceEntryPoints = () => {
  const featuresDir = join(__dirname, 'src', 'features');
  const entries: string[] = [];
  readdirSync(featuresDir).forEach((feature) => {
    const featureDir = join(featuresDir, feature);
    if (statSync(featureDir).isDirectory()) {
      entries.push(join(featureDir, 'index.ts'));
    }
  });
  return entries;
};

const getArgs = () => {
  const mode = process.argv[2] || ALL_BUILD_MODE;
  if (mode !== ALL_BUILD_MODE && mode !== MICROSERVICES_BUILD_MODE) {
    console.error(
      `Invalid mode. Use ${ALL_BUILD_MODE} or ${MICROSERVICES_BUILD_MODE}`,
    );
    process.exit(1);
  }
  return mode;
};

const mode = getArgs();
const isMicroserviceBuild = mode === MICROSERVICES_BUILD_MODE;

const entryPoints = isMicroserviceBuild
  ? getMicroserviceEntryPoints()
  : ['src/index.ts'];

build({
  entryPoints,
  outdir: 'out',
  bundle: true,
  format: 'esm',
  splitting: false,
  minify: true,
  sourcemap: false,
  target: 'node22',
  platform: 'node',
  legalComments: 'external',
  chunkNames: 'chunks/[name]-[hash]',
  external: ['@prisma/client', 'inversify', 'reflect-metadata', 'chalk'],
  tsconfig: 'tsconfig.build.json',
  treeShaking: true,
  drop: ['debugger'],
})
  .then(() => console.log('Build complete.'))
  .catch((err) => console.error('Build failed:', err));

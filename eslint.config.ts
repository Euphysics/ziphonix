import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

// Utilities
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

// Base ignore patterns
const ignorePatterns = ['**/node_modules/', '**/out/'];

// Import resolver settings
const importResolverSettings = {
  'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
  'import/resolver': {
    node: {
      paths: ['src'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    typescript: {},
  },
};

const getFeatures = (): string[] => {
  const featuresDir = join(__dirname, 'src', 'features');
  const features: string[] = [];
  readdirSync(featuresDir).forEach((feature) => {
    const featureDir = join(featuresDir, feature);
    if (statSync(featureDir).isDirectory()) {
      features.push(feature);
    }
  });
  return features;
};

const generateRestrictedPaths = (
  features: string[],
  integrationFeature: string = 'integration',
): Array<{ from: string; target: string; message: string }> =>
  features.map((feature) => {
    return {
      from: `./src/features/${feature}/**/*`,
      target: `./src/features/!(${feature}|${integrationFeature})/**/*`,
      message: `You cannot import from ${feature} to other features except ${integrationFeature}`,
    };
  });

const restrictedPaths = generateRestrictedPaths(getFeatures());

const rules = {
  'no-console': 'off',
  'no-alert': 'error',
  'no-use-before-define': 'off',
  '@typescript-eslint/no-use-before-define': ['error'],
  'import/prefer-default-export': 'off',
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-empty-object-type': 'off',
  'unused-imports/no-unused-imports': 'error',
  'no-shadow': 'off',
  'import/no-extraneous-dependencies': 'off',
  'import/default': 'off',
  '@typescript-eslint/no-shadow': 'off',
  '@typescript-eslint/no-explicit-any': 'warn',
  'import/no-restricted-paths': [
    'error',
    {
      zones: restrictedPaths,
    },
  ],
  'unused-imports/no-unused-vars': [
    'warn',
    {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
    },
  ],
  'no-param-reassign': [
    'error',
    {
      props: false,
    },
  ],
  'import/extensions': [
    'error',
    {
      js: 'ignorePackages',
      jsx: 'never',
      ts: 'never',
      tsx: 'never',
      svg: 'always',
      json: 'always',
    },
  ],
  'no-void': [
    'error',
    {
      allowAsStatement: true,
    },
  ],
  'import/order': [
    'error',
    {
      groups: [
        'builtin',
        'external',
        'internal',
        ['parent', 'sibling'],
        'object',
        'type',
        'index',
      ],
      'newlines-between': 'always',
      pathGroupsExcludedImportTypes: ['builtin'],
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
      pathGroups: [
        {
          pattern: '@/components/common',
          group: 'internal',
          position: 'before',
        },
        {
          pattern: '@/components/hooks',
          group: 'internal',
          position: 'before',
        },
      ],
    },
  ],
};

const eslintConfig = [
  {
    ignores: ignorePatterns,
  },
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
      },
    },
    settings: importResolverSettings,
    rules,
  },
];

export default eslintConfig;

import type { Configuration } from 'webpack';

module.exports = {
  entry: { background: { import: 'src/background/index.ts', runtime: false } },
} as Configuration;

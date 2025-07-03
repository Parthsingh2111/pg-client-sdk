const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve');
const json = require('@rollup/plugin-json');

module.exports = [
  {
    input: 'lib/index.js',
    output: {
      file: 'dist/payglocal.cjs',
      format: 'cjs',
      exports: 'auto',
    },
    plugins: [nodeResolve(), commonjs(), json()],
  },
  {
    input: 'lib/index.js',
    output: {
      file: 'dist/payglocal.mjs',
      format: 'esm',
    },
    plugins: [nodeResolve(), commonjs(), json()],
  },
];
const { execSync } = require('child_process');
const concurrently = require('concurrently');

// Pipe the stdio to the same ones used by this process.
// https://stackoverflow.com/a/39085344
execSync('node ./scripts/prebuild.mjs', { stdio: [0, 1, 2] });
execSync('node ./.artifacts/env.js --dev', { stdio: [0, 1, 2] });

concurrently([
  {
    command: 'IS_DEV=true node ./.artifacts/build.js --watch',
    prefixColor: 'blue',
    name: 'esbuild',
  },
  {
    command: 'npm run typecheck',
    prefixColor: 'red',
    name: 'typescript',
  },
  {
    command: 'node ./scripts/dev-server.js',
    prefixColor: 'green',
    name: 'serve',
  },
]);

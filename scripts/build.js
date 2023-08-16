const { execSync } = require('child_process');

const args = process.argv;

const env = (() => {
  const env = args.find((a) => a.startsWith('--env='));
  return env ? env.split('--env=')[1] : 'default';
})();

console.log('ENV', env);
// Pipe the stdio to the same ones used by this process.
// https://stackoverflow.com/a/39085344
try {
  execSync('node ./scripts/prebuild.mjs', { stdio: [0, 1, 2] });
  execSync(
    `node ./.artifacts/env.js ${env !== 'default' ? `--env=${env}` : ''}`,
    { stdio: [0, 1, 2] },
  );
  execSync('node ./.artifacts/build.js', { stdio: [0, 1, 2] });
} catch (ex) {
  console.error('Build exited with non-zero code');
}

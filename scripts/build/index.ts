import { execSync } from 'child_process';
import esbuild, { BuildOptions } from 'esbuild';
import fs from 'fs/promises';
import { getPathFromRoot } from '../utils/root-path';
import { postBuildPlugin } from './post-build-plugin';

export const build_dir = getPathFromRoot('./.build');
export const artifacts_dir = getPathFromRoot('./.artifacts');
export const src_dir = getPathFromRoot('./src');

const watch_mode = process.argv.find((a) => a === '--watch');

(async () => {
  execSync(`rm -rf ${build_dir}`, { stdio: [0, 1, 2] });
  execSync(`mkdir -p ${build_dir}`, { stdio: [0, 1, 2] });

  const define = JSON.parse(
    await fs.readFile(getPathFromRoot('./.artifacts/define.json'), 'utf-8'),
  );

  const build_options: BuildOptions = {
    entryPoints: [getPathFromRoot('./src/index.ts')],
    entryNames: '[name].[hash]',
    sourcemap: process.env.IS_DEV ? 'inline' : false,
    minify: !process.env.IS_DEV,
    bundle: true,
    outdir: build_dir,
    metafile: true,
    loader: {
      '.png': 'base64',
    },
    define: {
      ...define,
      'process.env.NODE_ENV': process.env.IS_DEV
        ? '"development"'
        : '"production"',
    },
    plugins: [postBuildPlugin()],
  };

  if (watch_mode) {
    esbuild.context(build_options).then((ctx) => {
      ctx.watch();
    });
  } else {
    esbuild.build(build_options);
  }
})();

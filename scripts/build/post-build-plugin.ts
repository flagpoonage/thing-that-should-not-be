import type { PluginBuild } from 'esbuild';
import path from 'path';
import fs from 'fs/promises';
import { getPathFromRoot } from '../utils/root-path';

const time = () => new Date().getTime();

export const postBuildPlugin = () => ({
  name: 'postbuild',
  setup(build: PluginBuild) {
    let laststart = time();
    build.onStart(() => {
      laststart = time();
    });
    build.onEnd(async (result) => {
      if (!result.metafile) {
        console.error('No metafile was generated');
        return;
      }

      const html = await fs.readFile(
        getPathFromRoot('./src/template.html'),
        'utf-8',
      );

      const js = [];
      const css = [];

      for (const [key, info] of Object.entries(result.metafile.outputs)) {
        if (path.extname(key) === '.css') {
          css.push(key);
        } else if (path.extname(key) === '.js') {
          js.push(key);
        }

        const hash = key.split('.').slice(-2)[0];
        console.log(
          `Built [${path.basename(
            info.entryPoint ?? '',
          )}] with hash [${hash}] as [${path.basename(key)}]`,
        );
      }

      // TODO: Make this more dynamic, it's hacky.
      // const [key] = Object.entries(result.metafile.outputs)[0];

      let out_html = html.replace(
        '<!--SCRIPT-->',
        js
          .map(
            (key) =>
              `<script type="text/javascript" src="${path.basename(
                key,
              )}"></script>`,
          )
          .join('\n'),
      );

      out_html = out_html.replace(
        '<!--STYLE-->',
        css
          .map(
            (key) => `<link rel="stylesheet" href="${path.basename(key)}" />`,
          )
          .join('\n'),
      );

      await fs.writeFile(getPathFromRoot('./.build/index.html'), out_html);

      console.info('Build completed in', time() - laststart, 'milliseconds');
    });
  },
});

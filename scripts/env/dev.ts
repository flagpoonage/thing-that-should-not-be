import { getPathFromRoot } from '../utils/root-path';
import { safeReadJson } from '../utils/safe-read-json';

export async function getDevParams() {
  const params_raw = await safeReadJson(
    getPathFromRoot('./build-params.dev.json'),
  );

  if (!params_raw) {
    console.error(
      'Missing build params for dev, expected JSON file [build-params.dev.json] in root directory',
    );
    return process.exit(1);
  }

  if (typeof params_raw !== 'object' || Array.isArray(params_raw)) {
    console.error('Invalid build params for dev', params_raw);
  }

  return params_raw;
}

import path from 'path';
import { rootDirectory } from '../utils/root-path';
import { safeReadJson } from '../utils/safe-read-json';
import { FlatRecordOf, UnknownObject } from '../../global/types';

export async function getEnvParams(env: string) {
  const params_raw = await safeReadJson(
    path.join(rootDirectory, './build-params.json'),
  );

  const env_params = (params_raw as Record<string, unknown> | undefined)?.[env];

  if (!env_params) {
    console.error('Missing build params for environment', env);
    return process.exit(1);
  }

  if (typeof env_params !== 'object' || Array.isArray(env_params)) {
    console.error('Invalid build params for environment', env, env_params);
  }

  console.log('Loaded build environment variables', env_params);

  return env_params as FlatRecordOf<UnknownObject>;
}

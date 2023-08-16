import type { BuildEnvironment } from '../scripts/env/schema';

declare global {
  const BUILD_ENV: BuildEnvironment;
}

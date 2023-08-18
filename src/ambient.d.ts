import type { BuildEnvironment } from '../scripts/env/schema';

declare global {
  const BUILD_ENV: BuildEnvironment;
  const document: Document & {
    caretPositionFromPoint: () => void;
  };
}

declare const document: Document & {
  caretPositionFromPoint: () => void;
};

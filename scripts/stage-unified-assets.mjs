import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const editorBuild = join(repositoryRoot, 'dist');
const rendererPublic = join(repositoryRoot, 'apps', 'not-online', 'public');
const stagedPublic = join(repositoryRoot, 'apps', 'not-online', '.deploy-public');

async function copyContents(source, destination) {
  await mkdir(destination, { recursive: true });

  for (const entry of await readdir(source)) {
    await cp(join(source, entry), join(destination, entry), {
      recursive: true,
      force: true,
    });
  }
}

await rm(stagedPublic, { recursive: true, force: true });
await copyContents(rendererPublic, stagedPublic);
await copyContents(editorBuild, stagedPublic);


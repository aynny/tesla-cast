import { cp, mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Build an isolated, allowlisted copy: never copy .env files or alter the running app.
const root = resolve(import.meta.dirname, '..');
const stage = await mkdtemp(join(tmpdir(), 'tesla-pages-'));
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'tesla-cast';
const basePath = repository.endsWith('.github.io') ? '' : `/${repository}`;
try {
  for (const name of ['app', 'components', 'lib', 'next.config.ts', 'next-env.d.ts', 'postcss.config.mjs', 'tsconfig.json', 'package.json']) {
    await cp(join(root, name), join(stage, name), { recursive: true });
  }
  await rm(join(stage, 'app/api'), { recursive: true, force: true });
  const page = join(stage, 'app/youtube/page.tsx');
  const source = await readFile(page, 'utf8');
  const dynamic = 'export const dynamic = "force-dynamic";';
  const keySetting = 'Boolean(process.env.YOUTUBE_API_KEY?.trim())';
  if (!source.includes(dynamic) || !source.includes(keySetting)) throw new Error('YouTube page changed; review static export preparation.');
  await writeFile(page, source.replace(dynamic, '').replace(keySetting, 'false'));
  await symlink(join(root, 'node_modules'), join(stage, 'node_modules'), 'dir');
  const env = { ...process.env, GITHUB_PAGES: 'true', NEXT_PUBLIC_GITHUB_PAGES: 'true', NEXT_PUBLIC_BASE_PATH: basePath, NEXT_TELEMETRY_DISABLED: '1' };
  delete env.YOUTUBE_API_KEY;
  const build = spawnSync(process.execPath, [join(root, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], { cwd: stage, env, stdio: 'inherit' });
  if (build.status !== 0) throw new Error(`Pages build failed: ${build.status}`);
  const output = join(root, 'out-pages');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(join(stage, 'out'), output, { recursive: true });
  await writeFile(join(output, '.nojekyll'), '');
  console.log(`GitHub Pages output: ${output} (base path: ${basePath || '/'})`);
} finally {
  await rm(stage, { recursive: true, force: true });
}

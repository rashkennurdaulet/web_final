import {copyFile, cp, mkdir, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const publish = path.join(root, '.publish');
const assets = ['css', 'images', 'js', 'sounds', 'vendor'];

await mkdir(publish, {recursive: true});
const pages = (await readdir(root)).filter(file => file.endsWith('.html'));
await Promise.all([
  ...pages.map(file => copyFile(path.join(root, file), path.join(publish, file))),
  ...assets.map(dir => cp(path.join(root, dir), path.join(publish, dir), {recursive: true}))
]);

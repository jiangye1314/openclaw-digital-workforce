const esbuild = require('esbuild');
const path = require('path');

const backendDir = path.join(__dirname, '../backend');
const outputDir = path.join(backendDir, 'dist');

console.log('Building backend...');

esbuild.build({
  entryPoints: [path.join(backendDir, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: path.join(outputDir, 'server.cjs'),
  external: ['electron', 'sqlite3', 'better-sqlite3'], // Exclude native modules or electron if any
  sourcemap: false,
  minify: true,
}).then(() => {
  console.log('Backend built successfully to', path.join(outputDir, 'server.js'));
}).catch((err) => {
  console.error('Backend build failed:', err);
  process.exit(1);
});

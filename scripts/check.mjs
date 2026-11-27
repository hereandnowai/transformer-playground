// Type-checks the whole app with svelte-check, then fails only on problems in the code
// HERE AND NOW AI wrote or rewrote. The rest is upstream code (Transformer Explainer) that
// predates strict TypeScript; its count is printed so it can be paid down over time.
// Usage: node scripts/check.mjs   (npm run check)   ·   npm run check:all for the raw output.
import { spawnSync } from 'node:child_process';

const OURS = [
	/^src\/components\/playground\//,
	/^src\/utils\/playground\//,
	/^src\/store\/ui\.ts$/,
	/^src\/store\/theme\.ts$/,
	/^src\/components\/Topbar\.svelte$/,
	/^src\/routes\/\+layout\.svelte$/,
	/^src\/utils\/fetchChunks\.js$/
];

const sync = spawnSync('npx', ['svelte-kit', 'sync'], { stdio: 'inherit' });
if (sync.status !== 0) process.exit(sync.status ?? 1);

const run = spawnSync(
	'npx',
	['svelte-check', '--tsconfig', './tsconfig.json', '--output', 'machine'],
	{ encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
);

const lines = (run.stdout || '').split('\n');
const problems = [];
let legacyErrors = 0;
let legacyWarnings = 0;

for (const line of lines) {
	const m = line.match(/^\d+ (ERROR|WARNING) "([^"]+)" (\d+):(\d+) "(.*)"$/);
	if (!m) continue;
	const [, kind, file, row, col, message] = m;
	if (OURS.some((re) => re.test(file))) {
		problems.push(`${kind} ${file}:${row}:${col} ${message.replace(/\\n/g, ' ')}`);
	} else if (kind === 'ERROR') legacyErrors++;
	else legacyWarnings++;
}

console.log(
	`svelte-check: upstream code has ${legacyErrors} errors and ${legacyWarnings} warnings (not blocking).`
);
if (problems.length) {
	console.error(`\n${problems.length} problem(s) in our code:\n` + problems.join('\n'));
	process.exit(1);
}
console.log('Our code: 0 errors, 0 warnings.');

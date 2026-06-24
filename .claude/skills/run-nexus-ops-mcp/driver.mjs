// REPL driver for the nexus-ops-mcp Vite/React SPA. Plain headless Chromium via
// Playwright (no xvfb/display needed) — `chromium-cli` is not available in
// this environment, so this script is the agent-facing driver instead.
// Run it directly: `node .claude/skills/run-nexus-ops-mcp/driver.mjs`
// There's no router here — App.tsx switches views via component state, not
// URL changes, so (unlike Portfolio's Astro driver) clicks don't need to
// poll location.href; a short settle wait after each click is enough.
import { chromium } from 'playwright';
import { spawn, execSync } from 'node:child_process';
import * as readline from 'node:readline';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const SHOT_DIR = process.env.SCREENSHOT_DIR || '/tmp/shots';
fs.mkdirSync(SHOT_DIR, { recursive: true });

let devProc = null;
let baseUrl = null; // e.g. http://localhost:5173/nexus-ops-mcp
let browser = null;
let page = null;
const consoleLog = [];

function killStrayDevServers() {
	try {
		execSync("pkill -f 'node_modules/.bin/vite' || true");
	} catch {}
	try {
		fs.rmSync(path.join(ROOT, 'node_modules/.vite'), { recursive: true, force: true });
	} catch {}
}

async function startDevServer() {
	killStrayDevServers();
	await new Promise((r) => setTimeout(r, 500));

	return new Promise((resolve, reject) => {
		devProc = spawn(path.join(ROOT, 'node_modules/.bin/vite'), [], {
			cwd: ROOT,
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		let buf = '';
		const onData = (chunk) => {
			buf += chunk.toString();
			const match = buf.match(/Local:\s+(http:\/\/localhost:\d+\/[^\s]*)/);
			if (match) {
				devProc.stdout.off('data', onData);
				resolve(match[1].replace(/\/$/, ''));
			}
		};
		devProc.stdout.on('data', onData);
		devProc.stderr.on('data', (d) => (buf += d.toString()));
		devProc.on('exit', (code) => {
			if (!baseUrl) reject(new Error('vite exited before becoming ready, code ' + code + '\n' + buf));
		});
		setTimeout(() => reject(new Error('vite did not become ready in 30s\n' + buf)), 30_000);
	});
}

const COMMANDS = {
	async launch() {
		if (page) return console.log('already launched');
		console.log('starting dev server...');
		baseUrl = await startDevServer();
		console.log('dev server ready at', baseUrl);
		browser = await chromium.launch();
		page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
		page.on('console', (msg) => consoleLog.push(`[${msg.type()}] ${msg.text()}`));
		page.on('pageerror', (err) => consoleLog.push(`[pageerror] ${err}`));
		await page.goto(baseUrl + '/', { waitUntil: 'networkidle' });
		console.log('launched.', baseUrl);
	},

	async ss(name) {
		if (!page) return console.log('ERROR: launch first');
		const f = path.join(SHOT_DIR, (name || `ss-${Date.now()}`) + '.png');
		await page.screenshot({ path: f });
		console.log('screenshot:', f);
	},

	async click(sel) {
		if (!page) return console.log('ERROR: launch first');
		try {
			await page.click(sel, { timeout: 5000 });
			// Scripted (non-trusted) clicks appear to commit slower than real user clicks in
			// this headless setup — empirically, 150ms wasn't always enough for a computed
			// style read or screenshot to reflect the post-click state; 350ms reliably is.
			await page.waitForTimeout(350);
			console.log('click', sel, '-> OK');
		} catch (e) {
			console.log('click', sel, '-> ERROR:', e.message.split('\n')[0]);
		}
	},

	async 'click-text'(text) {
		if (!page) return console.log('ERROR: launch first');
		try {
			await page.getByText(text, { exact: false }).first().click({ timeout: 5000 });
			await page.waitForTimeout(350);
			console.log('click-text', JSON.stringify(text), '-> OK');
		} catch (e) {
			console.log('click-text', JSON.stringify(text), '-> ERROR:', e.message.split('\n')[0]);
		}
	},

	async hover(sel) {
		if (!page) return console.log('ERROR: launch first');
		try {
			await page.hover(sel, { timeout: 5000 });
			console.log('hover', sel, '-> OK');
		} catch (e) {
			console.log('hover', sel, '-> ERROR:', e.message.split('\n')[0]);
		}
	},

	async resize(dims) {
		if (!page) return console.log('ERROR: launch first');
		const [w, h] = dims.split(/\s+/).map(Number);
		await page.setViewportSize({ width: w, height: h || 800 });
		console.log('resized to', w, 'x', h || 800);
	},

	async type(text) {
		if (page) await page.keyboard.type(text, { delay: 20 });
	},

	async press(key) {
		if (page) await page.keyboard.press(key);
	},

	async wait(sel) {
		if (!page) return console.log('ERROR: launch first');
		try {
			await page.waitForSelector(sel, { timeout: 10_000 });
			console.log('found:', sel);
		} catch {
			console.log('TIMEOUT:', sel);
		}
	},

	async eval(expr) {
		if (!page) return console.log('ERROR: launch first');
		try {
			console.log(JSON.stringify(await page.evaluate(expr)));
		} catch (e) {
			console.log('ERROR:', e.message);
		}
	},

	async text(sel) {
		if (!page) return console.log('ERROR: launch first');
		console.log(
			await page.evaluate((s) => (s ? document.querySelector(s) : document.body)?.innerText ?? '(null)', sel || null)
		);
	},

	async console() {
		console.log(consoleLog.length ? consoleLog.join('\n') : '(no console output captured)');
		consoleLog.length = 0;
	},

	async quit() {
		if (browser) await browser.close().catch(() => {});
		if (devProc) devProc.kill();
		browser = null;
		page = null;
		devProc = null;
	},

	help() {
		console.log('commands:', Object.keys(COMMANDS).join(', '));
	},
};

const stdin = fs.createReadStream(null, { fd: fs.openSync('/dev/stdin', 'r') });
const rl = readline.createInterface({ input: stdin, output: process.stdout, prompt: 'driver> ' });

// readline emits 'line' for every buffered line as soon as it arrives — with
// piped/heredoc input that means ALL lines fire near-instantly, well before
// an earlier `async` command (e.g. `launch`, which starts a dev server) has
// resolved. An explicit FIFO queue, not the event order, is what guarantees
// commands run one at a time in the order they were written.
const queue = [];
let processing = false;
let rlClosed = false; // EOF on piped/heredoc input closes readline mid-queue; guards rl.prompt()

async function processQueue() {
	if (processing) return;
	processing = true;
	while (queue.length) {
		const line = queue.shift();
		const [cmd, ...rest] = line.trim().split(/\s+/);
		if (!cmd) continue;
		const fn = COMMANDS[cmd];
		if (!fn) {
			console.log('unknown:', cmd, '— try: help');
			continue;
		}
		try {
			await fn(rest.join(' '));
		} catch (e) {
			console.log('ERROR:', e.message);
		}
		if (cmd === 'quit') {
			processing = false;
			rl.close();
			process.exit(0);
		}
		if (!rlClosed) rl.prompt();
	}
	processing = false;
}

rl.on('line', (line) => {
	queue.push(line);
	processQueue();
});

// With piped/heredoc input, readline hits EOF (and fires 'close') almost
// immediately after all lines are buffered — well before slow async
// commands like `launch` have actually finished. Wait for the queue to
// fully drain before tearing anything down, otherwise `close` races
// `launch` and kills the dev server/browser mid-startup.
function waitForDrain() {
	return new Promise((resolve) => {
		const check = () => (!processing && queue.length === 0 ? resolve() : setTimeout(check, 50));
		check();
	});
}

rl.on('close', async () => {
	rlClosed = true;
	await waitForDrain();
	if (browser || devProc) await COMMANDS.quit();
	process.exit(0);
});

console.log('nexus-ops-mcp driver — "help" for commands, "launch" to start');
rl.prompt();

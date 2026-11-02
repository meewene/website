import { css } from "dreamland/core";
import config from "../site.config";
import { Page } from "../components/Page";
import { Icon } from "../icons";
import { play, scratch, unlock } from "../sound";
import { motion } from "../motion";

const f = config.pages.font;
const DEFAULT = { weight: 400, opsz: 40, tracking: -0.02 };
const WEIGHTS: [string, number, string][] = [
	["body", 450, ""],
	["secondary", 500, "secondary"],
	["title", 550, "title"],
	["emphasis", 600, "emphasis"],
	["mono", 400, "mono"],
];
const LETTERS = [..."abcdefghijklmnopqrstuvwxyz0123456789"];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Axes = typeof DEFAULT;
type Spark = { x: number; y: number; angle: number; time: number; radius: number; length: number };

function Lab(this: { axes: Axes; pos: { x: number; y: number }; axis: string; dragging: boolean; pad: HTMLElement; canvas: HTMLCanvasElement; text: HTMLTextAreaElement }, cx: any) {
	this.axes = { ...DEFAULT };
	this.pos = { x: 0, y: 0 };
	this.axis = "";
	this.dragging = false;
	let pointer: number | null = null;
	let last = { x: 0, y: 0, time: 0 };
	let spark = (_x: number, _y: number, _speed: number, _angle: number, _burst: boolean) => {};

	const feedback = (x: number, y: number, dx: number, dy: number, burst: boolean) => {
		const now = performance.now();
		const dist = Math.hypot(dx, dy);
		const speed = (40 * dist) / Math.max(16, now - last.time);
		if (dist > 0.006 || burst) {
			spark(x, y, speed, Math.atan2(dy, dx), burst);
			if (this.axis) scratch(x, y, speed, dx + dy < 0);
		}
		last = { x, y, time: now };
	};

	const move = (e: PointerEvent, burst = false) => {
		const r = this.pad.getBoundingClientRect();
		const x = clamp((e.clientX - r.left - r.width / 2) / (r.width / 2 - 24), -1, 1);
		const y = clamp((e.clientY - r.top - r.height / 2) / (r.height / 2 - 24), -1, 1);
		const m = Math.max(Math.abs(x), Math.abs(y));
		this.pos = { x, y };
		if (m < 0.08) this.axis = "";
		else if (Math.abs(x) >= Math.abs(y)) {
			this.axis = "weight";
			this.axes = { ...this.axes, weight: Math.round(x < 0 ? 400 - m * 300 : 400 + m * 600) };
		} else if (y < 0) {
			this.axis = "opsz";
			this.axes = { ...this.axes, opsz: Math.round(40 - m * 31) };
		} else {
			this.axis = "tracking";
			this.axes = { ...this.axes, tracking: Math.round((-0.02 + m * 0.12) * 1000) / 1000 };
		}
		feedback(x, y, x - last.x, y - last.y, burst);
	};

	const key = (e: KeyboardEvent) => {
		const dir = e.shiftKey ? -1 : 1;
		const a = { ...this.axes };
		let x = 0;
		let y = 0;
		if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
			this.axis = "weight";
			a.weight = clamp(a.weight + (e.key === "ArrowLeft" ? -10 : 10) * dir, 100, 1000);
			x = a.weight < 400 ? -(400 - a.weight) / 300 : (a.weight - 400) / 600;
		} else if (e.key === "ArrowUp") {
			this.axis = "opsz";
			a.opsz = clamp(a.opsz - dir, 9, 40);
			y = -(40 - a.opsz) / 31;
		} else if (e.key === "ArrowDown") {
			this.axis = "tracking";
			a.tracking = clamp(Math.round((a.tracking + 0.005 * dir) * 1000) / 1000, -0.02, 0.1);
			y = (a.tracking + 0.02) / 0.12;
		} else return;
		e.preventDefault();
		unlock();
		this.axes = a;
		this.pos = { x, y };
		last = { x, y, time: performance.now() };
		spark(x, y, 0.1, 0, true);
		scratch(x, y, 0.1, e.shiftKey);
	};

	const reset = () => {
		play("click");
		this.axes = { ...DEFAULT };
		this.pos = { x: 0, y: 0 };
		this.axis = "";
		this.text.value = "dm sans";
	};

	cx.mount = () => {
		const ctx = this.canvas.getContext("2d")!;
		let sparks: Spark[] = [];
		let frame = 0;
		let previous = -Infinity;
		let w = 0;
		let h = 0;
		let color = "";
		const size = () => {
			const r = this.pad.getBoundingClientRect();
			const dpr = Math.min(devicePixelRatio || 1, 2);
			w = r.width;
			h = r.height;
			this.canvas.width = Math.round(w * dpr);
			this.canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		const draw = (now: number) => {
			ctx.clearRect(0, 0, w, h);
			sparks = sparks.filter((s) => now - s.time < 350);
			ctx.strokeStyle = color;
			ctx.lineWidth = 1.25;
			ctx.lineCap = "round";
			for (const s of sparks) {
				const t = Math.max(0, (now - s.time) / 350);
				const e = t * (2 - t);
				const r = 23 + e * s.radius;
				const l = s.length * (1 - e);
				ctx.globalAlpha = (1 - t) * 0.65;
				ctx.beginPath();
				ctx.moveTo(s.x + r * Math.cos(s.angle), s.y + r * Math.sin(s.angle));
				ctx.lineTo(s.x + (r + l) * Math.cos(s.angle), s.y + (r + l) * Math.sin(s.angle));
				ctx.stroke();
			}
			ctx.globalAlpha = 1;
			frame = sparks.length ? requestAnimationFrame(draw) : 0;
		};
		spark = (x, y, speed, angle, burst) => {
			const now = performance.now();
			if (motion.reduced || document.hidden || (!burst && now - previous < 55)) return;
			previous = now;
			color = getComputedStyle(this.pad).color;
			const n = burst ? 8 : 4;
			const px = w / 2 + x * (w / 2 - 24);
			const py = h / 2 + y * (h / 2 - 24);
			for (let i = 0; i < n; i++) sparks.push({ x: px, y: py, angle: angle + (2 * Math.PI * i) / n, time: now, radius: 12 + Math.min(70 * speed, 22), length: burst ? 10 : 6 });
			sparks = sparks.slice(-64);
			if (!frame) frame = requestAnimationFrame(draw);
		};
		new ResizeObserver(size).observe(this.pad);
	};

	const tracking = use(this.axes).map((a) => `${a.tracking.toFixed(3)}em`);
	return (
		<section data-intro="true" aria-labelledby="font-lab-title">
			<div class="font-playground-heading">
				<h2 id="font-lab-title">{f.specimen}</h2>
				<button type="button" class="font-reset" on:click={reset}>
					{Icon("rotateCcw")}
					{f.reset}
				</button>
			</div>
			<div class="font-stage">
				<label class="sr-only" for="font-lab-text">
					text to preview
				</label>
				<textarea
					id="font-lab-text"
					class="font-editor"
					maxlength="120"
					rows="2"
					spellcheck="false"
					placeholder="dm sans"
					this={use(this.text)}
					style={use(this.axes).map((a) => `font-weight: ${a.weight}; font-variation-settings: "opsz" ${a.opsz}; letter-spacing: ${a.tracking}em`)}
				>
					dm sans
				</textarea>
			</div>
			<div class="font-pad-control">
				<p id="font-lab-help" class="sr-only">
					arrow keys adjust each setting. left and right for weight, up for optical size, down for letter spacing. hold shift to reverse the direction.
				</p>
				<fieldset
					class="font-pad"
					aria-label="directional font axis control"
					this={use(this.pad)}
					style={use(this.pos).map((p) => `--pad-x: ${p.x}; --pad-y: ${p.y}`)}
					data-dragging={use(this.dragging)}
					on:pointerdown={(e: PointerEvent) => {
						if (!e.isPrimary || e.button !== 0 || pointer !== null) return;
						unlock();
						pointer = e.pointerId;
						this.pad.setPointerCapture(e.pointerId);
						this.dragging = true;
						move(e, true);
					}}
					on:pointermove={(e: PointerEvent) => {
						if (pointer === e.pointerId || (pointer === null && e.pointerType === "mouse" && e.buttons === 0)) move(e);
					}}
					on:pointerup={(e: PointerEvent) => {
						if (pointer !== e.pointerId) return;
						move(e);
						pointer = null;
						this.dragging = false;
						this.pad.releasePointerCapture(e.pointerId);
					}}
					on:pointercancel={(e: PointerEvent) => {
						if (pointer !== e.pointerId) return;
						pointer = null;
						this.dragging = false;
					}}
				>
					<canvas class="font-pad-sparks" aria-hidden="true" this={use(this.canvas)} />
					<span class="font-pad-guide font-pad-guide-x" aria-hidden="true" />
					<span class="font-pad-guide font-pad-guide-y" aria-hidden="true" />
					<span class="font-pad-origin" aria-hidden="true" />
					<span class="font-pad-label font-pad-label-left" data-active={use(this.axes).map((a) => a.weight < 400)}>
						light
					</span>
					<span class="font-pad-label font-pad-label-right" data-active={use(this.axes).map((a) => a.weight > 400)}>
						bold
					</span>
					<span class="font-pad-label font-pad-label-top" data-active={use(this.axis).map((a) => a === "opsz")}>
						{"optical size "}
						<span class="font-pad-value">{use(this.axes).map((a) => String(a.opsz))}</span>
					</span>
					<span class="font-pad-label font-pad-label-bottom" data-active={use(this.axis).map((a) => a === "tracking")}>
						{"tracking "}
						{tracking}
					</span>
					<button
						type="button"
						class="font-pad-handle"
						aria-describedby="font-lab-help"
						aria-label={use(this.axes).map((a) => `move font settings. weight ${a.weight}, optical size ${a.opsz}, letter spacing ${a.tracking.toFixed(3)}em`)}
						on:keydown={key}
					>
						<span class="font-pad-handle-dot" aria-hidden="true" />
					</button>
				</fieldset>
			</div>
		</section>
	);
}

Lab.style = css`
	:scope {
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}
	h2 {
		font-weight: var(--weight-emphasis);
	}
	.font-playground-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.font-reset {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 48px;
		min-height: 48px;
		padding-inline: 1rem;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		color: var(--muted-foreground);
		font-size: var(--type-small);
		font-weight: var(--weight-secondary);
		line-height: var(--type-small-leading);
		white-space: nowrap;
		text-decoration: underline;
		text-decoration-color: color-mix(in oklch, var(--link) 35%, transparent);
		cursor: pointer;
		transition:
			color var(--control-duration) var(--control-ease),
			text-decoration-color var(--control-duration) var(--control-ease);
	}
	.font-reset:is(:hover, :focus-visible) {
		text-decoration-color: var(--link);
	}
	.font-reset:active {
		translate: 0 1px;
	}
	.font-reset:focus-visible,
	.font-editor:focus-visible,
	.font-pad-handle:focus-visible {
		outline: var(--focus-width) solid var(--ring);
		outline-offset: var(--focus-offset);
	}
	.font-stage {
		border-block: 1px solid var(--border);
	}
	.font-editor {
		display: block;
		width: 100%;
		height: 240px;
		padding: 3rem 0.5rem;
		border: 0;
		border-radius: var(--radius-md);
		background: none;
		color: var(--foreground);
		caret-color: var(--foreground);
		font-family: var(--font-sans);
		font-size: min(96px, 20vw);
		line-height: 1.2;
		text-align: center;
		overflow-wrap: anywhere;
		resize: vertical;
	}
	.font-editor:focus-visible {
		outline-offset: -2px;
	}
	.font-editor::placeholder {
		color: var(--muted-foreground);
		opacity: 1;
	}
	.font-pad-control {
		margin-block: 1.5rem;
	}
	.font-pad {
		position: relative;
		min-width: 0;
		height: 208px;
		margin: 0;
		padding: 0;
		border: 1px solid var(--border);
		background: var(--background);
		color: var(--foreground);
		cursor: crosshair;
		touch-action: none;
		user-select: none;
	}
	.font-pad-sparks {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
	.font-pad-guide {
		position: absolute;
		background: var(--border);
		pointer-events: none;
	}
	.font-pad-guide-x {
		top: 50%;
		right: 24px;
		left: 24px;
		height: 1px;
	}
	.font-pad-guide-y {
		top: 24px;
		bottom: 24px;
		left: 50%;
		width: 1px;
	}
	.font-pad-origin {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--muted-foreground);
		transform: translate(-50%, -50%);
	}
	.font-pad-label {
		position: absolute;
		padding: 0.5rem;
		background: var(--background);
		color: var(--muted-foreground);
		font-size: var(--type-small);
		pointer-events: none;
		transition: color var(--control-duration) var(--control-ease);
	}
	.font-pad-label[data-active] {
		color: var(--foreground);
		font-weight: var(--weight-emphasis);
	}
	.font-pad-label-left {
		top: calc(50% - 56px);
		left: 16px;
	}
	.font-pad-label-right {
		top: calc(50% - 56px);
		right: 16px;
	}
	.font-pad-label-top {
		top: 16px;
		left: calc(50% + 32px);
		max-width: calc(50% - 40px);
	}
	.font-pad-label-bottom {
		bottom: 16px;
		left: calc(50% + 32px);
		max-width: calc(50% - 40px);
	}
	.font-pad-value {
		font-variant-numeric: tabular-nums;
	}
	.font-pad-handle {
		position: absolute;
		top: calc(50% + var(--pad-y) * (50% - 24px));
		left: calc(50% + var(--pad-x) * (50% - 24px));
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border: 1px solid var(--muted-foreground);
		border-radius: 50%;
		background: var(--background);
		cursor: grab;
		touch-action: none;
		transform: translate(-50%, -50%);
	}
	.font-pad[data-dragging] .font-pad-handle {
		cursor: grabbing;
	}
	.font-pad-handle-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--foreground);
		transition: transform 0.25s var(--expo-out);
	}
	.font-pad-handle:hover .font-pad-handle-dot,
	.font-pad[data-dragging] .font-pad-handle-dot {
		transform: scale(1.25);
	}
	:global(.reduce-motion) .font-pad-label,
	:global(.reduce-motion) .font-pad-handle-dot {
		transition: none;
	}
`;

function FontBody() {
	return (
		<div class="page-content font-page">
			<Lab />
			<section data-intro-group="true" aria-labelledby="font-about" class="page-section">
				<h2 id="font-about">{f.about.title}</h2>
				<p>{f.about.text}</p>
				<a class="home-link font-credit-link" href={f.about.link.href}>
					{f.about.link.label}
					{Icon("arrowUpRight")}
				</a>
			</section>
			<section data-intro-group="true" aria-labelledby="font-weights">
				<h2 id="font-weights" class="font-heading">
					{f.weights.title}
				</h2>
				<dl class="font-samples">
					{WEIGHTS.map(([label, weight, cls]) => (
						<div class="font-sample">
							<dt class="font-sample-label">
								<span>{label}</span>
								<span class="font-sample-weight">{String(weight)}</span>
							</dt>
							<dd class={cls}>{f.weights.sample}</dd>
						</div>
					))}
				</dl>
				<p class="font-note">{f.weights.note}</p>
			</section>
			<section data-intro-group="true" aria-labelledby="font-letters">
				<h2 id="font-letters" class="font-heading">
					{f.letters.title}
				</h2>
				<figure class="font-figure">
					<div class="font-character-grid" aria-label="lowercase latin letters, and numerals">
						{LETTERS.map((c) => (
							<span>{c}</span>
						))}
					</div>
					<figcaption class="font-note">{f.letters.note}</figcaption>
				</figure>
			</section>
			<section data-intro-group="true" aria-labelledby="font-credits" class="page-section">
				<h2 id="font-credits">{f.credits.title}</h2>
				<dl class="font-credits">
					{f.credits.items.map((c) => (
						<div>
							<dt>
								<a class="home-link font-credit-link" href={c.href}>
									{c.label}
									{Icon("arrowUpRight")}
								</a>
							</dt>
							<dd>{c.text}</dd>
						</div>
					))}
				</dl>
			</section>
		</div>
	);
}

FontBody.style = css`
	:scope.page-content.font-page {
		gap: 2.5rem;
		line-height: var(--type-body-leading);
	}
	h2 {
		font-weight: var(--weight-emphasis);
	}
	.font-heading {
		margin-bottom: 1rem;
	}
	.font-credit-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 48px;
	}
	.font-samples {
		border-block: 1px solid var(--border);
	}
	.font-sample {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		align-items: baseline;
		gap: 1.5rem;
		padding-block: 1.5rem;
	}
	.font-sample + .font-sample {
		border-top: 1px solid var(--border);
	}
	.font-sample-label {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		color: var(--muted-foreground);
		font-size: var(--type-small);
	}
	.font-sample-weight {
		font-variant-numeric: tabular-nums;
	}
	.secondary {
		font-weight: var(--weight-secondary);
	}
	.title {
		font-weight: var(--weight-title);
		letter-spacing: var(--tracking-title);
	}
	.emphasis {
		font-weight: var(--weight-emphasis);
	}
	.mono {
		font-family: var(--font-mono);
		font-feature-settings: var(--font-mono-features);
		font-weight: 400;
	}
	.font-note {
		margin-top: 1rem;
		color: var(--muted-foreground);
		font-size: var(--type-small);
	}
	.font-figure {
		margin: 0;
	}
	.font-character-grid {
		display: grid;
		grid-template-columns: repeat(9, minmax(0, 1fr));
		border-block-start: 1px solid var(--border);
		border-inline-start: 1px solid var(--border);
	}
	.font-character-grid > span {
		display: grid;
		place-items: center;
		min-height: 56px;
		border-block-end: 1px solid var(--border);
		border-inline-end: 1px solid var(--border);
		transition: background-color var(--control-duration) var(--control-ease);
	}
	.font-character-grid > span:hover {
		background: var(--accent);
		font-weight: var(--weight-emphasis);
	}
	.font-credits > div {
		display: grid;
		grid-template-columns: 11rem minmax(0, 1fr);
		align-items: center;
		gap: 1.5rem;
		padding-block: 1rem;
		border-top: 1px solid var(--border);
	}
	.font-credits dd {
		color: var(--muted-foreground);
	}
	@media (max-width: 30rem) {
		.font-sample {
			grid-template-columns: 1fr;
			gap: 0.5rem;
		}
		.font-sample-label {
			justify-content: flex-start;
		}
		.font-character-grid {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
		.font-credits > div {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}
	:global(.reduce-motion) .font-character-grid > span {
		transition: none;
	}
	:global(.reduce-motion) .font-reset:active {
		translate: none;
	}
`;

export const Font = () => (
	<Page title={f.title} description={f.description}>
		<FontBody />
	</Page>
);

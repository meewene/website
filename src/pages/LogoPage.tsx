import { css } from "dreamland/core";
import config from "../site.config";
import { Page } from "../components/Page";
import { copySvg, mask, MARK } from "../components/Logo";
import { Icon } from "../icons";
import { play } from "../sound";
import { motion } from "../motion";

const l = config.pages.logo;
const WHITE = config.brand.white;
const FLOW = ["#FFF", "#BABABA", "#E4E4E4", "#838383", "#FFF"];
const HEAD = `#version 300 es
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_ptr;
uniform vec3 u_press;
out vec4 fragColor;
`;
const SHADERS: Record<string, string> = {
	ripple: `${HEAD}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float age = u_time - u_press.z;
  float d = distance(uv, u_press.xy);
  float front = 1.0 - smoothstep(age * 0.5 - 0.1, age * 0.5 + 0.05, d);
  float wave = sin(d * 70.0 - age * 14.0) * exp(-age * 1.4) * front;
  float idle = 0.5 + 0.5 * sin(distance(uv, u_ptr) * 28.0 - u_time * 2.4);
  float v = clamp(0.45 * idle + 0.6 * wave + 0.3, 0.0, 1.0);
  fragColor = vec4(mix(vec3(0.5), vec3(1.0), v), 1.0);
}`,
	embers: `${HEAD}
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float n = 0.6 * noise(uv * 5.0 - vec2(0.0, u_time * 1.2)) + 0.4 * noise(uv * 13.0 - vec2(0.0, u_time * 2.6));
  float heat = n * (1.15 - uv.y * 0.6) + 0.25 * (1.0 - distance(uv, u_ptr));
  float age = u_time - u_press.z;
  heat += (1.0 - smoothstep(0.0, 0.06, abs(distance(uv, u_press.xy) - age * 0.7))) * exp(-age * 2.5);
  vec3 col = mix(vec3(0.55), vec3(0.85), smoothstep(0.15, 0.7, heat));
  fragColor = vec4(mix(col, vec3(1.0), smoothstep(0.75, 1.1, heat)), 1.0);
}`,
};
const SIZING = { u_fit: 1, u_rotation: 0, u_scale: 1, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0 };

function Hero(this: { mode: number; host: HTMLElement }, cx: any) {
	this.mode = 0;
	let shader: any;
	let hovering = false;
	let visible = true;
	let ptr = [0.5, 0.5];
	const speed = () => shader?.setSpeed(motion.reduced || !visible || document.hidden ? 0 : hovering && this.mode === 0 ? 4 : 1);
	const start = async () => {
		const { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } = await import("@paper-design/shaders");
		shader?.dispose();
		const id = l.modes[this.mode].id;
		shader =
			id === "flow"
				? new ShaderMount(this.host, meshGradientFragmentShader, { u_colors: FLOW.map((c) => getShaderColorFromString(c)), u_colorsCount: FLOW.length, u_distortion: 0.8, u_swirl: 0.3, u_grainMixer: 0, u_grainOverlay: 0, ...SIZING }, undefined, 0, 0, 2, 400000)
				: new ShaderMount(this.host, SHADERS[id], { u_ptr: ptr, u_press: [0.5, 0.5, -10] }, undefined, 0, 0, 2, 400000);
		speed();
	};
	const at = (e: PointerEvent) => {
		const r = this.host.getBoundingClientRect();
		return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
	};
	const pick = (i: number) => {
		play("select");
		if (i === this.mode) return;
		this.mode = i;
		start();
	};
	cx.mount = () => {
		use(motion.reduced).listen(speed);
		new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			speed();
		}).observe(this.host);
		document.addEventListener("visibilitychange", speed);
		start();
	};
	return (
		<section data-intro="true" aria-labelledby="logo-hero-title">
			<h2 id="logo-hero-title" class="sr-only">
				moving logo
			</h2>
			<div
				class="logo-hero-stage"
				on:pointerenter={() => {
					hovering = true;
					speed();
				}}
				on:pointerleave={() => {
					hovering = false;
					ptr = [0.5, 0.5];
					if (this.mode) shader?.setUniforms({ u_ptr: ptr });
					speed();
				}}
				on:pointermove={(e: PointerEvent) => {
					ptr = at(e);
					if (this.mode) shader?.setUniforms({ u_ptr: ptr });
				}}
				on:pointerdown={(e: PointerEvent) => {
					if (this.mode && shader) shader.setUniforms({ u_press: [...at(e), shader.getCurrentFrame() / 1000] });
				}}
			>
				<span class="logo-hero-mark" style={mask} aria-hidden="true">
					<span class="logo-hero-shader" this={use(this.host)} />
				</span>
			</div>
			<fieldset class="logo-hero-modes">
				<legend class="sr-only">logo effect</legend>
				{l.modes.map((m, i) => (
					<button type="button" class="logo-hero-mode" aria-pressed={use(this.mode).map((x) => String(x === i))} on:click={() => pick(i)}>
						{m.label}
					</button>
				))}
			</fieldset>
			<p class="logo-hero-note" aria-live="polite">
				{use(this.mode).map((i) => l.modes[i].note)}
			</p>
		</section>
	);
}

Hero.style = css`
	:scope {
		display: grid;
		gap: 16px;
	}
	.logo-hero-stage {
		display: grid;
		place-items: center;
		height: 320px;
		overflow: hidden;
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		background: var(--card);
		cursor: crosshair;
		touch-action: pan-y;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
	.logo-hero-mark {
		position: relative;
		display: block;
		height: 280px;
		aspect-ratio: 24 / 26;
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
		background:
			radial-gradient(ellipse at 70% 30%, var(--brand-c), transparent 65%),
			linear-gradient(145deg, var(--brand-a), var(--brand-b), var(--brand-c));
	}
	.logo-hero-shader {
		position: absolute;
		inset: 0;
	}
	:global(:root:not(.dark)) .logo-hero-shader {
		filter: invert(1);
	}
	.logo-hero-modes {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}
	.logo-hero-mode {
		min-height: 48px;
		padding: 0 16px;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		line-height: var(--type-small-leading);
		color: var(--muted-foreground);
		font-size: var(--type-small);
		font-weight: var(--weight-secondary);
		outline: var(--focus-width) solid transparent;
		outline-offset: var(--focus-offset);
		transition:
			color var(--control-duration) var(--control-ease),
			background-color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.logo-hero-mode:hover,
	.logo-hero-mode[aria-pressed="true"] {
		color: var(--foreground);
	}
	.logo-hero-mode[aria-pressed="true"] {
		background-color: color-mix(in oklab, var(--foreground) 6%, transparent);
	}
	.logo-hero-mode:focus-visible {
		outline-color: var(--ring);
	}
	.logo-hero-note {
		min-height: 16px;
		margin-top: -8px;
		color: var(--muted-foreground);
		font-size: var(--type-small);
	}
	@media (forced-colors: active) {
		.logo-hero-mode[aria-pressed="true"] {
			outline: 1px solid canvastext;
		}
	}
`;

function Files(this: { message: string; busy: boolean }) {
	this.message = "";
	this.busy = false;
	let timer: ReturnType<typeof setTimeout>;
	const copy = async () => {
		if (this.busy) return;
		this.busy = true;
		clearTimeout(timer);
		try {
			await copySvg(WHITE.href);
			this.message = `${WHITE.label} svg copied.`;
			play("success");
		} catch {
			this.message = `couldn't copy the ${WHITE.label.toLowerCase()} svg. try downloading it.`;
		}
		this.busy = false;
		timer = setTimeout(() => (this.message = ""), 2400);
	};
	return (
		<section data-intro="true" aria-labelledby="logo-files-heading" class="page-section">
			<h2 id="logo-files-heading" class="logo-heading">
				{l.files.title}
			</h2>
			<p class="logo-files-note">
				{`${l.files.before} `}
				<a class="page-link" href="/brand">
					{l.files.link}
				</a>
				{` ${l.files.after}`}
			</p>
			<div class="logo-files-actions">
				<button type="button" class="logo-action outline" aria-label={`copy ${WHITE.label.toLowerCase()} svg`} on:click={copy}>
					{Icon("copy")}
					copy svg
				</button>
				<a class="logo-action" href={WHITE.href} download={WHITE.download} aria-label={`download ${WHITE.label.toLowerCase()} svg`}>
					{Icon("arrowDown")}
					download svg
				</a>
			</div>
			<output aria-live="polite" aria-atomic="true" class="logo-files-status">
				{use(this.message)}
			</output>
		</section>
	);
}

Files.style = css`
	.logo-heading {
		font-weight: var(--weight-emphasis);
	}
	.logo-files-note {
		color: var(--muted-foreground);
	}
	.logo-files-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}
	.logo-action {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
		padding: 0 16px;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		color: var(--foreground);
		font-size: var(--type-small);
		font-weight: var(--weight-secondary);
		line-height: var(--type-small-leading);
		outline: var(--focus-width) solid transparent;
		outline-offset: var(--focus-offset);
		transition:
			border-color var(--control-duration) var(--control-ease),
			background-color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.logo-action.outline {
		border-color: var(--input);
	}
	.logo-action:hover {
		border-color: color-mix(in oklch, var(--foreground) 25%, transparent);
	}
	.logo-action:focus-visible {
		outline-color: var(--ring);
	}
	.logo-files-status {
		display: block;
		min-height: 16px;
		color: var(--muted-foreground);
		font-size: var(--type-small);
	}
`;

const Catalog = (rows: { term: string; text: string }[]) => (
	<dl class="page-catalog">
		{rows.map((r) => (
			<div>
				<dt>{r.term}</dt>
				<dd>{r.text}</dd>
			</div>
		))}
	</dl>
);

function LogoBody() {
	return (
		<div class="page-content">
			<Hero />
			<section data-intro="true" aria-labelledby="logo-mark-heading" class="page-section page-prose">
				<h2 id="logo-mark-heading">{l.mark.title}</h2>
				{l.mark.text.map((t) => (
					<p>{t}</p>
				))}
			</section>
			<section data-intro="true" aria-labelledby="logo-construction-heading" class="page-section">
				<h2 id="logo-construction-heading" class="logo-heading">
					{l.construction.title}
				</h2>
				<figure class="logo-figure">
					<svg xmlns="http://www.w3.org/2000/svg" class="logo-diagram" viewBox="-2 -1 28 27" fill="none" aria-hidden="true">
						<path fill-rule="evenodd" d={MARK} />
						<path class="logo-guides" d="M12 -1V26M-1 1H25M-1 24H25M0.5 -1V26M23.5 -1V26M0.006 1L12 24.989L23.994 1M8.763 2.953H15.237V13.873H8.763ZM4.587 8.413A7.413 7.413 0 1 0 19.413 8.413A7.413 7.413 0 1 0 4.587 8.413" />
						<circle class="logo-guide-point" cx="12" cy="8.413" r="0.35" />
					</svg>
					<figcaption class="sr-only">{l.construction.caption}</figcaption>
				</figure>
				{Catalog(l.construction.rows)}
			</section>
			<section data-intro="true" aria-labelledby="logo-usage-heading" class="page-section">
				<h2 id="logo-usage-heading" class="logo-heading">
					{l.space.title}
				</h2>
				<figure class="logo-figure logo-usage">
					<svg xmlns="http://www.w3.org/2000/svg" class="logo-diagram" viewBox="-12 -11.5 48 48" fill="none" aria-hidden="true">
						<rect class="logo-clear-zone logo-clear-edge" x="-11" y="-10.5" width="46" height="46" />
						<path fill-rule="evenodd" d={MARK} />
					</svg>
					<figcaption class="sr-only">{l.space.caption}</figcaption>
					<ul class="logo-sizes" aria-label="the mark at three sizes">
						{[64, 32, 16].map((px) => (
							<li>
								<span class="logo-size-frame">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 1 23 23" style={`height: ${px}px`} aria-hidden="true">
										<path fill-rule="evenodd" d={MARK} />
									</svg>
								</span>
								<span class="logo-size-label">{`${px}px`}</span>
							</li>
						))}
					</ul>
				</figure>
				{Catalog(l.space.rows)}
			</section>
			<Files />
		</div>
	);
}

LogoBody.style = css`
	.logo-heading {
		font-weight: var(--weight-emphasis);
	}
	.page-prose h2 {
		font-weight: var(--weight-emphasis);
	}
	.logo-figure {
		display: grid;
		place-items: center;
		margin: 0;
		padding: 32px 24px;
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		background: var(--card);
		color: var(--muted-foreground);
	}
	.logo-diagram {
		display: block;
		width: auto;
		height: 240px;
		overflow: visible;
	}
	.logo-figure :global(path:not(.logo-guides)) {
		fill: var(--brand-b);
	}
	:scope :global(.logo-guides) {
		stroke: currentColor;
		stroke-width: 0.08px;
		stroke-dasharray: 0.4 0.4;
	}
	:scope :global(.logo-guide-point) {
		fill: currentColor;
	}
	.logo-usage {
		grid-template-columns: auto auto;
		justify-content: space-evenly;
		gap: 32px;
	}
	:scope :global(.logo-clear-zone) {
		fill: color-mix(in oklab, var(--foreground) 6%, transparent);
	}
	:scope :global(.logo-clear-edge) {
		stroke: currentColor;
		stroke-width: 0.1px;
		stroke-dasharray: 0.4 0.4;
	}
	.logo-sizes {
		display: flex;
		align-items: flex-end;
		gap: 24px;
	}
	.logo-sizes li {
		display: grid;
		justify-items: center;
		gap: 8px;
	}
	.logo-size-frame {
		display: grid;
		align-items: end;
		height: 64px;
	}
	.logo-size-frame svg {
		display: block;
		width: auto;
	}
	.logo-size-label {
		font-size: var(--type-small);
		font-variant-numeric: tabular-nums;
	}
	@media (max-width: 30rem) {
		.logo-usage {
			grid-template-columns: minmax(0, 1fr);
		}
		.logo-diagram {
			height: 192px;
		}
	}
	@media (forced-colors: active) {
		.logo-figure :global(path:not(.logo-guides)) {
			fill: canvastext;
		}
	}
`;

export const LogoPage = () => (
	<Page title={l.title} description={l.description}>
		<LogoBody />
	</Page>
);

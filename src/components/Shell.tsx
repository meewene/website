import { css } from "dreamland/core";
import { Icon } from "../icons";
import { motion } from "../motion";

const GRADIENT = { u_distortion: 0.5, u_swirl: 0.1, u_grainMixer: 0, u_grainOverlay: 0, u_fit: 2, u_rotation: 0, u_scale: 1, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0 };

const SKIP = '#main-content, :is(main, h1, h2, h3, h4, h5, h6)[tabindex="-1"], textarea, select, [contenteditable]:not([contenteditable="false"]), [data-focus-native], input:not([type="button"], [type="checkbox"], [type="radio"], [type="range"], [type="reset"], [type="submit"], [type="color"])';

const num = (v: string) => Number.parseFloat(v) || 0;

const ringBox = (el: Element) => {
	const style = getComputedStyle(el);
	if (style.outlineStyle === "none") return null;
	const rect = el.getBoundingClientRect();
	if (!rect.width && !rect.height) return null;
	let pad = num(style.outlineOffset) + num(style.outlineWidth);
	let { left, top, width, height } = rect;
	let radius = style.borderTopLeftRadius;
	const row = el.closest(".hover-list > ul > li");
	if (row) {
		const highlight = row.closest(".hover-list")?.querySelector(".hover-list-highlight");
		const r = row.getBoundingClientRect();
		left = r.left - 16;
		top = r.top;
		width = r.width + 32;
		height = r.height;
		radius = highlight ? getComputedStyle(highlight).borderTopLeftRadius : radius;
		pad = 0;
	} else if (el.matches(":is(.home-link, .page-link)[data-tall]")) {
		const line = num(style.lineHeight) || 1.2 * num(style.fontSize);
		top = rect.top + (rect.height - line) / 2;
		height = line;
	}
	return { x: left - pad, y: top - pad, w: width + 2 * pad, h: height + 2 * pad, radius: radius.endsWith("%") ? radius : `${Math.max(8, num(radius) + pad)}px` };
};

const focusRing = (svg: SVGElement) => {
	const root = document.documentElement;
	let target: Element | null = null;
	let frame = 0;
	let until = 0;
	let morph: ReturnType<typeof setTimeout>;
	const place = (b: NonNullable<ReturnType<typeof ringBox>>) => {
		svg.style.translate = `${b.x}px ${b.y}px`;
		svg.style.width = `${b.w}px`;
		svg.style.height = `${b.h}px`;
		svg.style.setProperty("--focus-radius", b.radius);
	};
	const hide = () => {
		target = null;
		cancelAnimationFrame(frame);
		svg.removeAttribute("data-visible");
		root.removeAttribute("data-focus-ring");
	};
	const follow = () => {
		if (!target || !target.isConnected) return hide();
		const b = ringBox(target);
		if (!b) return hide();
		place(b);
		frame = performance.now() < until ? requestAnimationFrame(follow) : 0;
	};
	const track = (ms = 400) => {
		until = performance.now() + ms;
		if (target && !frame) frame = requestAnimationFrame(follow);
	};
	const update = () => {
		const el = document.activeElement;
		const b = el && el !== document.body && root.dataset.input !== "pointer" && el.matches(":focus-visible") && !el.matches(SKIP) ? ringBox(el) : null;
		if (!el || !b) return hide();
		if (el === target) return;
		const visible = svg.hasAttribute("data-visible");
		clearTimeout(morph);
		if (visible) {
			svg.setAttribute("data-morph", "");
			morph = setTimeout(() => svg.removeAttribute("data-morph"), 320);
		} else svg.removeAttribute("data-morph");
		target = el;
		place(b);
		root.setAttribute("data-focus-ring", "on");
		if (!visible) svg.getBoundingClientRect();
		svg.setAttribute("data-visible", "");
		cancelAnimationFrame(frame);
		frame = 0;
		track();
	};
	let next = 0;
	const later = () => {
		cancelAnimationFrame(next);
		next = requestAnimationFrame(update);
	};
	document.addEventListener("focusin", update);
	document.addEventListener("focusout", later);
	document.addEventListener("keydown", later);
	document.addEventListener("pointerdown", later, true);
	const retrack = () => track();
	addEventListener("scroll", retrack, { capture: true, passive: true });
	addEventListener("resize", retrack);
	document.addEventListener("transitionrun", retrack, true);
	document.addEventListener("animationstart", retrack, true);
	update();
};

const scrollBlur = (top: HTMLElement, bottom: HTMLElement) => {
	let frame = 0;
	const update = () => {
		frame = 0;
		const left = Math.max(0, document.body.offsetHeight - innerHeight - scrollY);
		top.style.opacity = String(Math.min(1, Math.max(0, scrollY) / 64));
		bottom.style.opacity = String(Math.min(1, left / 64));
	};
	const schedule = () => {
		if (!frame) frame = requestAnimationFrame(update);
	};
	update();
	addEventListener("scroll", schedule, { passive: true });
	addEventListener("resize", schedule);
	new ResizeObserver(schedule).observe(document.body);
};

const backdrop = (host: HTMLElement) => {
	const root = document.documentElement;
	let shader: Promise<any> | undefined;
	const load = async () => {
		const { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } = await import("@paper-design/shaders");
		const palette = () => getComputedStyle(root).getPropertyValue("--backdrop").split(",").map((c) => getShaderColorFromString(c.trim()));
		let colors = palette();
		let frame = 0;
		const mount = new ShaderMount(host, meshGradientFragmentShader, { u_colors: colors, u_colorsCount: colors.length, ...GRADIENT }, undefined, 0, 0, 1, 320 * 200);
		new MutationObserver(() => {
			const from = colors;
			const to = palette();
			const start = performance.now();
			cancelAnimationFrame(frame);
			const step = (now: number) => {
				const t = motion.reduced ? 1 : Math.min(1, (now - start) / 1000);
				colors = to.map((c, i) => c.map((v, j) => from[i][j] + (v - from[i][j]) * t));
				mount.setUniforms({ u_colors: colors });
				if (t < 1) frame = requestAnimationFrame(step);
			};
			step(start);
		}).observe(root, { attributeFilter: ["class"] });
		requestAnimationFrame(() => host.setAttribute("data-ready", ""));
		return mount;
	};
	const sync = () => {
		if (motion.reduced && !shader) return;
		shader ??= load();
		shader.then((s) => s.setSpeed(motion.reduced ? 0 : 0.2), () => {});
	};
	use(motion.reduced).listen(sync);
	sync();
};

export function Shell(this: { top: HTMLElement; bottom: HTMLElement; ring: SVGElement; backdrop: HTMLElement }, cx: any) {
	cx.mount = () => {
		focusRing(this.ring);
		scrollBlur(this.top, this.bottom);
		backdrop(this.backdrop);
	};
	return (
		<div>
			<a href="#main-content" class="skip-link" data-focus-native="">
				{Icon("arrowDown")}
				skip to content
			</a>
			<svg xmlns="http://www.w3.org/2000/svg" class="focus-morph" aria-hidden="true" this={use(this.ring)}>
				<rect class="focus-rect" />
			</svg>
			<div aria-hidden="true" class="backdrop" this={use(this.backdrop)} />
			<div aria-hidden="true" class="scroll-blur scroll-blur-top" this={use(this.top)} />
			<div aria-hidden="true" class="scroll-blur scroll-blur-bottom" this={use(this.bottom)} />
		</div>
	);
}

Shell.style = css`
	:scope {
		display: contents;
	}
	.skip-link {
		z-index: var(--z-backdrop);
		position: fixed;
		top: 1rem;
		left: 1rem;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: var(--target);
		padding: 0.5rem 1rem 0.5rem 0.75rem;
		border-radius: var(--radius-md);
		background: var(--background);
		color: var(--foreground);
		box-shadow: var(--shadow-sm);
		font-size: var(--type-small);
		font-weight: var(--weight-secondary);
		line-height: var(--type-small-leading);
		opacity: 0;
		pointer-events: none;
		transform-origin: 0 0;
		translate: 0 calc(-100% - 2rem);
		scale: 0.96;
		transition:
			translate var(--panel-duration) var(--control-ease),
			scale var(--panel-duration) var(--control-ease),
			opacity var(--micro-duration) var(--control-ease),
			box-shadow var(--micro-duration) var(--control-ease),
			var(--focus-transition);
	}
	.skip-link svg {
		color: var(--muted-foreground);
		transition: translate var(--panel-duration) var(--control-ease);
	}
	.skip-link:focus-visible {
		opacity: 1;
		pointer-events: auto;
		outline: var(--focus-width) solid var(--ring);
		outline-offset: var(--focus-offset);
		translate: 0;
		scale: 1;
		box-shadow: none;
	}
	.skip-link:focus-visible svg {
		animation: skip-arrow 0.48s var(--expo-out) 0.12s both;
	}
	@keyframes skip-arrow {
		0% {
			opacity: 0;
			translate: 0 -4px;
		}
		to {
			opacity: 1;
			translate: 0;
		}
	}
	.focus-morph {
		z-index: var(--z-focus);
		position: fixed;
		top: 0;
		left: 0;
		pointer-events: none;
		opacity: 0;
		overflow: visible;
		transition: opacity var(--micro-duration) var(--control-ease);
	}
	.focus-morph[data-visible] {
		opacity: 1;
	}
	.focus-morph[data-morph] {
		transition:
			opacity var(--micro-duration) var(--control-ease),
			translate var(--panel-duration) var(--control-ease),
			width var(--panel-duration) var(--control-ease),
			height var(--panel-duration) var(--control-ease);
	}
	.focus-rect {
		--stroke: 1.5px;
		x: calc(var(--stroke) / 2);
		y: calc(var(--stroke) / 2);
		width: calc(100% - var(--stroke));
		height: calc(100% - var(--stroke));
		rx: var(--focus-radius, 8px);
		fill: none;
		stroke: var(--ring);
		stroke-width: var(--stroke);
		stroke-dasharray: 4 4;
		shape-rendering: geometricPrecision;
		transition: rx var(--panel-duration) var(--control-ease);
	}
	.focus-morph:not([data-morph]) .focus-rect {
		transition: none;
	}
	.backdrop {
		z-index: -1;
		position: fixed;
		inset: 0;
		pointer-events: none;
		opacity: 0;
		transition: opacity 1.2s var(--expo-out);
	}
	.backdrop[data-ready] {
		opacity: 1;
	}
	.scroll-blur {
		z-index: var(--z-blur);
		position: fixed;
		inset-inline: 0;
		height: 64px;
		pointer-events: none;
		user-select: none;
		opacity: 0;
		background: linear-gradient(var(--blur-direction), color-mix(in oklab, var(--background) 30%, transparent), transparent);
		mask-image: linear-gradient(var(--blur-direction), black 50%, transparent);
		backdrop-filter: blur(2px);
	}
	.scroll-blur-top {
		--blur-direction: to bottom;
		top: 0;
	}
	.scroll-blur-bottom {
		--blur-direction: to top;
		bottom: 0;
		opacity: 1;
	}
	:global(.reduce-motion) .skip-link,
	:global(.reduce-motion) .skip-link svg {
		transition: none;
		animation: none;
	}
	:global(.reduce-motion) .backdrop {
		opacity: 0;
		transition: none;
	}
	@media print {
		.backdrop {
			display: none;
		}
	}
	@media (forced-colors: active) {
		.backdrop,
		.scroll-blur {
			display: none;
		}
		.focus-rect {
			stroke: highlight;
		}
	}
	@media (scripting: none) {
		.scroll-blur {
			display: none;
		}
	}
`;

import { css } from "dreamland/core";
import config from "../site.config";
import { Icon } from "../icons";
import { intro } from "../intro";
import { motion } from "../motion";
import { play } from "../sound";

const COLORS = ["#838383", "#FFF", "#E4E4E4", "#FFF", "#BABABA", "#aaa"];
export const MARK = "M1.3 1H22.7A0.8 0.8 0 0 1 23.416 2.158L12.716 23.558A0.8 0.8 0 0 1 11.284 23.558L0.584 2.158A0.8 0.8 0 0 1 1.3 1ZM10.159 7.974A2.848 2.848 0 1 1 13.841 7.974A3.237 3.237 0 1 1 10.159 7.974ZM10.402 5.801A1.598 1.598 0 1 0 13.598 5.801A1.598 1.598 0 1 0 10.402 5.801ZM10.013 10.636A1.987 1.987 0 1 0 13.987 10.636A1.987 1.987 0 1 0 10.013 10.636Z";
export const mask = `mask-image: url(${config.brand.black.href}); -webkit-mask-image: url(${config.brand.black.href})`;

const tween = (duration: number, delay: number, easing: string, update: (t: number) => void) => {
	const effect = new KeyframeEffect(null, null, { duration, delay, easing, fill: "forwards" });
	const anim = new Animation(effect);
	let frame = requestAnimationFrame(function step() {
		update(effect.getComputedTiming().progress ?? 0);
		if (anim.playState !== "finished") frame = requestAnimationFrame(step);
	});
	anim.play();
	return { done: anim.finished.then(() => update(1)), stop: () => (cancelAnimationFrame(frame), anim.cancel()) };
};

export const copySvg = async (href: string) => {
	const load = fetch(href).then(async (res) => {
		const text = await res.text();
		if (!res.ok || !/^\s*<svg[\s>]/.test(text)) throw new Error("not an svg");
		return text;
	});
	if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
		await navigator.clipboard.write([new ClipboardItem({ "text/plain": load.then((t) => new Blob([t], { type: "text/plain" })) })]);
	} else await navigator.clipboard.writeText(await load);
};

function LogoMenu(this: { x: number; y: number; close: () => void; copy: () => void }) {
	const asset = config.brand.white;
	return (
		<div class="logo-menu" role="menu" style={`left: ${this.x}px; top: ${this.y}px`} data-starting-style="">
			<button role="menuitem" class="item preview" on:click={this.copy}>
				<span class="tile">
					<img src={asset.href} alt="" width="150" height="150" />
				</span>
				<span class="row">
					{Icon("copy", "muted")}
					copy logo svg
				</span>
			</button>
			<div class="sep" role="separator" />
			<a role="menuitem" class="item" href={asset.href} download={asset.download} aria-label="download svg" on:click={this.close}>
				{Icon("arrowDown")}
				download svg
			</a>
			<a role="menuitem" class="item" href="/logo" on:click={this.close}>
				{Icon("notebook")}
				logo
			</a>
			<a role="menuitem" class="item" href="/brand" on:click={this.close}>
				{Icon("blocks")}
				brand guidelines
			</a>
		</div>
	);
}

LogoMenu.style = css`
	:scope {
		z-index: var(--z-popover);
		position: fixed;
		width: 14rem;
		padding: 8px;
		border-radius: var(--radius-lg);
		background: var(--popover);
		color: var(--foreground);
		box-shadow: var(--shadow-md);
		font-size: var(--type-caption);
		font-weight: var(--weight-secondary);
		line-height: 20px;
		transform-origin: top left;
		transition:
			opacity var(--control-duration) var(--control-ease),
			translate var(--control-duration) var(--control-ease),
			scale var(--control-duration) var(--control-ease);
	}
	:scope[data-starting-style],
	:scope[data-ending-style] {
		opacity: 0;
		translate: 0 -4px;
		scale: 0.98;
	}
	.item {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		min-height: 48px;
		padding-inline: 8px;
		border-radius: 8px;
		text-align: left;
		cursor: default;
		outline: none;
		transition:
			color var(--control-duration) var(--control-ease),
			background-color var(--control-duration) var(--control-ease);
	}
	.item svg {
		color: var(--muted-foreground);
		transition: color var(--control-duration) var(--control-ease);
	}
	.item:is(:hover, :focus-visible) {
		background: var(--accent);
	}
	.item:is(:hover, :focus-visible) svg {
		color: currentColor;
	}
	.preview {
		flex-direction: column;
		align-items: stretch;
		gap: 8px;
		padding: 8px;
	}
	.tile {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 4rem;
		border-radius: var(--radius-md);
		background: var(--color-neutral-900);
	}
	.tile img {
		width: 2rem;
		height: auto;
	}
	.row {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 2rem;
	}
	.sep {
		height: 1px;
		margin: 4px 8px;
		background: var(--border);
	}
	@media (pointer: fine) {
		.item:not(.preview) {
			min-height: 32px;
		}
	}
`;

export function Logo(this: { host: HTMLElement; halo: HTMLElement; link: HTMLElement; message: string; busy: boolean; error: boolean }, cx: any) {
	this.message = "";
	this.busy = false;
	this.error = false;
	let menuEl: HTMLElement | null = null;
	let pressed = false;
	let timer: ReturnType<typeof setTimeout>;

	const copy = async () => {
		const asset = config.brand.white;
		closeMenu();
		if (this.busy) return;
		this.busy = true;
		clearTimeout(timer);
		this.message = `copying ${asset.label.toLowerCase()} svg…`;
		try {
			await copySvg(asset.href);
			this.message = `${asset.label} svg copied.`;
			play("success");
			timer = setTimeout(() => (this.message = ""), 2400);
		} catch {
			this.error = true;
			this.message = `the ${asset.label.toLowerCase()} svg could not be copied. download it instead.`;
		} finally {
			this.busy = false;
		}
	};

	const closeMenu = () => {
		const el = menuEl;
		if (!el) return;
		menuEl = null;
		el.setAttribute("data-ending-style", "");
		setTimeout(() => el.remove(), 240);
		removeEventListener("pointerdown", outside, true);
		removeEventListener("keydown", keys, true);
		removeEventListener("scroll", closeMenu, true);
	};
	const outside = (e: Event) => {
		if (menuEl && !menuEl.contains(e.target as Node)) closeMenu();
	};
	const keys = (e: KeyboardEvent) => {
		if (!menuEl) return;
		const items = [...menuEl.querySelectorAll<HTMLElement>(".item")];
		const at = items.indexOf(document.activeElement as HTMLElement);
		if (e.key === "Escape") {
			e.preventDefault();
			closeMenu();
			this.link.focus();
		} else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			items[(at + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length].focus();
		} else if (e.key === "Tab") closeMenu();
	};
	const openMenu = (e: MouseEvent) => {
		e.preventDefault();
		pressed = true;
		closeMenu();
		const x = Math.min(e.clientX, innerWidth - 232);
		const el = <LogoMenu x={x} y={e.clientY + 8} close={closeMenu} copy={copy} />;
		menuEl = el;
		document.body.append(el);
		requestAnimationFrame(() => el.removeAttribute("data-starting-style"));
		(el.querySelector(".item") as HTMLElement).focus({ preventScroll: true });
		addEventListener("pointerdown", outside, true);
		addEventListener("keydown", keys, true);
		addEventListener("scroll", closeMenu, true);
	};
	const keyMenu = (e: KeyboardEvent) => {
		pressed = false;
		if (e.key !== "ContextMenu" && !(e.shiftKey && e.key === "F10")) return;
		e.preventDefault();
		const r = this.link.getBoundingClientRect();
		this.link.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2, clientX: r.left, clientY: r.bottom }));
	};
	const click = (e: MouseEvent) => {
		if (pressed) {
			pressed = false;
			e.preventDefault();
			e.stopImmediatePropagation();
		}
	};

	cx.mount = () => {
		let inView = true;
		let tabVisible = document.visibilityState === "visible";
		let hovering = false;
		let done = false;
		let busy = false;
		let shader: any;
		const speed = () => shader?.setSpeed(!motion.reduced && inView && tabVisible && done && !busy && hovering ? 4 : 0);
		new IntersectionObserver(([e]) => ((inView = e.isIntersecting), speed()), { threshold: 0.1 }).observe(this.link);
		document.addEventListener("visibilitychange", () => ((tabVisible = document.visibilityState === "visible"), speed()));
		this.link.addEventListener("pointerenter", () => ((hovering = true), speed()));
		this.link.addEventListener("pointerleave", () => ((hovering = false), speed()));
		const settle = () => {
			if (done || !shader) return;
			if (motion.reduced || intro.phase === "skipped" || !inView || !tabVisible) {
				done = true;
				this.host.style.opacity = "1";
				return;
			}
			if (intro.phase !== "complete") return;
			requestAnimationFrame(() => {
				done = true;
				busy = true;
				this.host.style.opacity = "1";
				shader.setSpeed(0);
				const start = shader.getCurrentFrame();
				this.halo.animate(
					[
						{ opacity: 0, transform: "scale(1.04)", filter: "blur(5px)" },
						{ opacity: 0.28, transform: "scale(1.16)", filter: "blur(5px)", offset: 0.17543859649122806 },
						{ opacity: 0, transform: "scale(0.9)", filter: "blur(2px)" },
					],
					{ duration: 1140, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
				);
				tween(1000, 140, "cubic-bezier(0.65, 0, 0.35, 1)", (t) => shader.setFrame(start + 2000 * t)).done.then(() => {
					busy = false;
					speed();
				});
			});
		};
		use(intro.phase).listen(settle);
		use(motion.reduced).listen(speed);
		setTimeout(async () => {
			const { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } = await import("@paper-design/shaders");
			shader = new ShaderMount(
				this.host,
				meshGradientFragmentShader,
				{
					u_colors: COLORS.map((c) => getShaderColorFromString(c)),
					u_colorsCount: COLORS.length,
					u_distortion: 0.1,
					u_swirl: 0.01,
					u_grainMixer: 0,
					u_grainOverlay: 0,
					u_fit: 1,
					u_rotation: 0,
					u_scale: 1,
					u_offsetX: 0,
					u_offsetY: 0,
					u_originX: 0.5,
					u_originY: 0.5,
					u_worldWidth: 0,
					u_worldHeight: 0,
				},
				undefined,
				0,
				0,
				2,
				160000,
			);
			settle();
		}, 1200);
	};

	return (
		<span>
			<a aria-label="home" title="home" draggable="false" class="logo-link" href="/" this={use(this.link)} on:contextmenu={openMenu} on:keydown={keyMenu} on:pointerdown={() => (pressed = false)} on:click={click}>
				<span class="logo" aria-hidden="true">
					<span class="halo" this={use(this.halo)}>
						<span class="halo-mark" style={mask} />
					</span>
					<span class="mark" style={mask}>
						<span class="shader" this={use(this.host)} />
					</span>
				</span>
				<img aria-hidden="true" alt="" src={config.brand.black.href} width="150" height="150" class="print" />
			</a>
			<span class="status" class:visible={use(this.message).map(Boolean)}>
				<output aria-live="polite" aria-atomic="true">
					{use(this.message)}
				</output>
				{use(this.error).andThen(() => (
					<span class="retry">
						<button type="button" on:click={copy}>
							try again
						</button>
						<a href={config.brand.white.href} download={config.brand.white.download}>
							download svg
						</a>
					</span>
				))}
			</span>
		</span>
	);
}

Logo.style = css`
	:scope {
		position: relative;
		display: inline-flex;
	}
	.logo-link {
		display: inline-flex;
		align-items: center;
		justify-content: flex-start;
		min-width: var(--target);
		min-height: var(--target);
		margin-left: calc(-18px / 13);
		border-radius: var(--radius-md);
		user-select: none;
		-webkit-touch-callout: none;
	}
	.logo {
		position: relative;
		display: inline-block;
		flex-shrink: 0;
		width: 1.5rem;
		height: 1.5rem;
	}
	.halo {
		position: absolute;
		inset: 0;
		opacity: 0;
		pointer-events: none;
		transform-origin: 50% 37%;
	}
	.halo-mark {
		position: absolute;
		inset: 0;
		background: var(--brand-b);
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
	}
	.mark {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
		background:
			radial-gradient(ellipse at 70% 30%, var(--brand-c), transparent 65%),
			linear-gradient(145deg, var(--brand-a), var(--brand-b), var(--brand-c));
	}
	.shader {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 1.14s cubic-bezier(0.4, 0, 0.2, 1);
	}
	:global(:root:not(.dark)) .shader {
		filter: invert(1);
	}
	.print {
		display: none;
		width: 1.5rem;
		height: 1.5rem;
	}
	.status:not(.visible) {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.status.visible {
		z-index: var(--z-header);
		position: absolute;
		top: 100%;
		left: 0;
		width: 18rem;
		max-width: calc(100vw - 3rem);
		margin-top: 0.5rem;
		padding: 1rem;
		border-radius: var(--radius-md);
		background: var(--popover);
		box-shadow: var(--shadow-sm);
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
	}
	.retry {
		display: flex;
		gap: 1rem;
		margin-top: 0.5rem;
	}
	.retry > * {
		display: inline-flex;
		align-items: center;
		min-height: var(--target);
		padding-inline: 0.5rem;
		border-radius: var(--radius-md);
	}
	.retry a {
		text-decoration: underline;
	}
	:global(.reduce-motion) .shader {
		transition: none;
	}
	@media print {
		.logo {
			display: none;
		}
		.print {
			display: block;
		}
	}
`;

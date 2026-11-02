import { css } from "dreamland/core";
import { Icon } from "../icons";

const control = `
	border-radius: var(--radius-md);
	min-width: 48px;
	min-height: 48px;
	font-size: var(--type-small);
	font-weight: var(--weight-secondary);
	line-height: var(--type-small-leading);
	transition:
		color var(--control-duration) var(--control-ease),
		background-color var(--control-duration) var(--control-ease),
		border-color var(--control-duration) var(--control-ease),
		box-shadow var(--control-duration) var(--control-ease),
		outline-color var(--control-duration) var(--control-ease),
		opacity var(--control-duration) var(--control-ease),
		transform var(--control-duration) var(--control-ease);
`;

const field = `
	${control}
	border: 1px solid var(--input);
	background: transparent;
	color: var(--foreground);
`;

export function Playground(this: { title?: string }, cx: any) {
	return (
		<div data-intro="true">
			<div class="playground-body">
				{this.title ? <h2>{this.title}</h2> : null}
				{cx.children}
			</div>
		</div>
	);
}

Playground.style = css`
	:scope {
		min-height: 12rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
	}
	.playground-body {
		display: grid;
		gap: 1.5rem;
		padding: 1.5rem;
	}
	.playground-body > :global(*) {
		min-width: 0;
	}
	.playground-body :global(:is(h2, h3)) {
		font-weight: var(--weight-emphasis);
	}
	@media (max-width: 480px) {
		.playground-body {
			padding: 1rem;
		}
	}
`;

export function Button(this: { variant?: "outline" | "ghost" | "destructive" | "link"; size?: "sm" | "icon"; label?: string; pressed?: boolean; disabled?: boolean; dim?: boolean; popup?: string; expanded?: boolean; onclick?: (e: MouseEvent) => void }, cx: any) {
	return (
		<button
			type="button"
			class={`${this.variant ?? "outline"} ${this.size ?? ""}`}
			aria-label={this.label}
			aria-pressed={use(this.pressed).map((p) => (p === undefined ? undefined : String(p)))}
			aria-disabled={this.dim ? "true" : undefined}
			aria-haspopup={this.popup}
			aria-expanded={use(this.expanded).map((x) => (x === undefined ? undefined : String(x)))}
			disabled={use(this.disabled)}
			on:click={(e: MouseEvent) => this.onclick?.(e)}
		>
			{cx.children}
		</button>
	);
}

Button.style = css`
	:scope {
		${control}
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		height: 3rem;
		padding-inline: 1rem;
		border: 1px solid transparent;
		background-clip: padding-box;
		white-space: nowrap;
		user-select: none;
	}
	:scope:active:not([aria-haspopup]) {
		translate: 0 1px;
	}
	:scope:disabled {
		pointer-events: none;
		opacity: 0.5;
	}
	:scope[aria-disabled="true"] {
		cursor: not-allowed;
		opacity: 0.5;
	}
	:scope :global(svg) {
		flex-shrink: 0;
		pointer-events: none;
	}
	:scope.outline {
		border-color: var(--input);
		color: var(--foreground);
	}
	:scope.outline:is(:hover, [aria-expanded="true"]) {
		border-color: color-mix(in oklab, var(--foreground) 25%, transparent);
	}
	:scope.ghost {
		color: var(--muted-foreground);
	}
	:scope.ghost:is(:hover, [aria-expanded="true"]) {
		color: var(--foreground);
	}
	:scope.destructive {
		border-color: color-mix(in oklab, var(--destructive) 50%, transparent);
		color: var(--destructive);
	}
	:scope.destructive:is(:hover, [aria-expanded="true"]) {
		border-color: var(--destructive);
	}
	:scope.link {
		color: var(--foreground);
	}
	:scope.link:hover {
		text-decoration-line: underline;
	}
	:scope.sm {
		padding-inline: 0.5rem;
	}
	:scope.icon {
		width: 3rem;
		padding: 0;
	}
	:global(.reduce-motion) :scope:active:not([aria-haspopup]) {
		translate: none;
	}
`;

export function Label(this: { for?: string }, cx: any) {
	return <label for={this.for}>{cx.children}</label>;
}

Label.style = css`
	:scope {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
		user-select: none;
	}
`;

export function Input(this: { id?: string; placeholder?: string; multiline?: boolean; onfocus?: () => void }) {
	return this.multiline ? <textarea id={this.id} placeholder={this.placeholder} /> : <input id={this.id} placeholder={this.placeholder} on:focus={() => this.onfocus?.()} />;
}

Input.style = css`
	:scope {
		${field}
		display: block;
		width: 100%;
		min-width: 0;
		height: 3rem;
		padding: 0.5rem 1rem;
	}
	textarea:scope {
		min-height: 6rem;
		resize: vertical;
	}
	:scope:hover {
		border-color: color-mix(in oklab, var(--foreground) 25%, transparent);
	}
	:scope::placeholder {
		color: var(--muted-foreground);
	}
	@media (pointer: coarse) {
		:scope {
			font-size: var(--type-body);
		}
	}
`;

export function Checkbox(this: { id?: string; checked: boolean; onchange?: (v: boolean) => void }) {
	return (
		<button
			type="button"
			role="checkbox"
			id={this.id}
			aria-checked={use(this.checked).map(String)}
			on:click={() => {
				this.checked = !this.checked;
				this.onchange?.(this.checked);
			}}
			on:keydown={(e: KeyboardEvent) => e.key === "Enter" && e.preventDefault()}
		>
			{Icon("check")}
		</button>
	);
}

Checkbox.style = css`
	:scope {
		${control}
		position: relative;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		color: var(--background);
	}
	:scope::before {
		content: "";
		position: absolute;
		width: 1rem;
		height: 1rem;
		border: 1px solid var(--muted-foreground);
		border-radius: var(--radius-sm);
		background: var(--background);
		transition:
			background-color var(--control-duration) var(--control-ease),
			border-color var(--control-duration) var(--control-ease);
	}
	:scope[aria-checked="true"]::before {
		border-color: var(--foreground);
		background: var(--foreground);
	}
	svg {
		position: relative;
		opacity: 0;
		transition: opacity var(--control-duration) var(--control-ease);
	}
	:scope[aria-checked="true"] svg {
		opacity: 1;
	}
`;

export function Switch(this: { checked: boolean; id: string; onchange?: (v: boolean) => void }) {
	return (
		<button
			type="button"
			role="switch"
			id={this.id}
			aria-checked={use(this.checked).map(String)}
			class:on={use(this.checked)}
			on:click={() => {
				this.checked = !this.checked;
				this.onchange?.(this.checked);
			}}
		>
			<span class="thumb" />
		</button>
	);
}

Switch.style = css`
	:scope {
		${control}
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		width: 3rem;
		height: 3rem;
		border-radius: 9999px;
	}
	:scope::before {
		content: "";
		position: absolute;
		top: 50%;
		left: 50%;
		width: 3rem;
		height: 1.5rem;
		border-radius: 9999px;
		background: color-mix(in oklab, var(--muted-foreground) 75%, transparent);
		translate: -50% -50%;
		transition: background-color var(--control-duration) var(--control-ease);
	}
	:scope.on::before {
		background: var(--foreground);
	}
	.thumb {
		position: relative;
		display: block;
		width: 1rem;
		height: 1rem;
		margin-left: 0.5rem;
		border-radius: 9999px;
		background: var(--background);
		pointer-events: none;
		transition: transform var(--control-duration) var(--control-ease);
	}
	:scope.on .thumb {
		transform: translateX(1rem);
	}
	:global(.reduce-motion) :scope::before,
	:global(.reduce-motion) .thumb {
		transition: none;
	}
`;

type Option = [value: string, label: string];

function SelectPopup(this: { options: Option[]; value: string }) {
	return (
		<div data-starting-style="">
			<div role="listbox">
				{this.options.map(([value, label]) => (
					<div role="option" tabindex="-1" data-value={value} aria-selected={String(value === this.value)}>
						<span class="text">{label}</span>
						{value === this.value ? <span class="indicator">{Icon("check")}</span> : null}
					</div>
				))}
			</div>
		</div>
	);
}

SelectPopup.style = css`
	:scope {
		position: absolute;
		z-index: var(--z-popover);
		isolation: isolate;
		min-width: 9rem;
		padding: 0.5rem;
		overflow-x: hidden;
		overflow-y: auto;
		border-radius: var(--radius-lg);
		background: var(--popover);
		color: var(--foreground);
		box-shadow: var(--shadow-md);
		font-size: var(--type-small);
		font-weight: var(--weight-secondary);
		line-height: var(--type-small-leading);
		outline: none;
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
	[role="option"] {
		position: relative;
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		min-width: 48px;
		min-height: 48px;
		padding: 0.5rem 2.5rem 0.5rem 1rem;
		border-radius: var(--radius-md);
		outline: none;
		cursor: default;
		user-select: none;
		transition:
			color var(--control-duration) var(--control-ease),
			background-color var(--control-duration) var(--control-ease);
	}
	[role="option"]:is([data-highlighted], :focus-visible) {
		background: var(--accent);
		color: var(--foreground);
	}
	.text {
		display: flex;
		flex: 1;
		flex-shrink: 0;
		gap: 0.5rem;
		white-space: nowrap;
	}
	.indicator {
		position: absolute;
		right: 0.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		pointer-events: none;
	}
`;

export function Select(this: { id?: string; label?: string; value: string; options: Option[]; raw?: boolean; wide?: boolean; onchange?: (v: string) => void; open: boolean; trigger: HTMLElement }) {
	this.open = false;
	let popup: HTMLElement | null = null;
	let pressed = false;
	let typed = "";
	let typedAt = 0;
	const text = (v: string) => (this.raw ? v : (this.options.find(([o]) => o === v)?.[1] ?? v));
	const items = () => [...popup!.querySelectorAll<HTMLElement>("[role=option]")];
	const highlight = (el?: HTMLElement) => {
		if (!el) return;
		for (const i of items()) i.toggleAttribute("data-highlighted", i === el);
		el.focus({ preventScroll: true });
		el.scrollIntoView({ block: "nearest" });
	};
	const find = (key: string) => {
		const now = performance.now();
		typed = now - typedAt < 500 ? typed + key : key;
		typedAt = now;
		return this.options.findIndex(([, label]) => label.toLowerCase().startsWith(typed.toLowerCase()));
	};
	const typing = () => typed && performance.now() - typedAt < 500;
	const pick = (value: string) => {
		this.value = value;
		this.onchange?.(value);
	};
	const outside = (e: PointerEvent) => {
		if (popup?.contains(e.target as Node) || this.trigger.contains(e.target as Node)) return;
		close(false);
		setTimeout(() => document.activeElement === document.body && this.trigger.focus({ preventScroll: true }));
	};
	const close = (refocus = true) => {
		if (!popup) return;
		const el = popup;
		popup = null;
		this.open = false;
		el.setAttribute("data-ending-style", "");
		el.style.pointerEvents = "none";
		setTimeout(() => el.remove(), parseFloat(getComputedStyle(el).transitionDuration) * 1000);
		removeEventListener("pointerdown", outside, true);
		if (refocus) this.trigger.focus({ preventScroll: true });
	};
	const choose = (el: HTMLElement) => {
		pick(el.dataset.value!);
		close();
	};
	const keys = (e: KeyboardEvent) => {
		const list = items();
		const at = list.indexOf(document.activeElement as HTMLElement);
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			e.preventDefault();
			highlight(list[Math.min(list.length - 1, Math.max(0, at + (e.key === "ArrowDown" ? 1 : -1)))]);
		} else if (e.key === "Home" || e.key === "End") {
			e.preventDefault();
			highlight(list[e.key === "Home" ? 0 : list.length - 1]);
		} else if (e.key === "Enter" || (e.key === " " && !typing())) {
			e.preventDefault();
			if (e.key === " ") addEventListener("keyup", (k) => k.preventDefault(), { once: true, capture: true });
			if (at >= 0) choose(list[at]);
		} else if (e.key === "Escape") {
			e.preventDefault();
			close();
		} else if (e.key === "Tab") {
			close(false);
			this.trigger.focus({ preventScroll: true });
		} else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			highlight(list[find(e.key)]);
		}
	};
	const place = (el: HTMLElement) => {
		const t = this.trigger.getBoundingClientRect();
		const width = Math.max(t.width, 144);
		el.style.width = `${width}px`;
		const height = el.offsetHeight;
		const below = innerHeight - t.bottom - 8;
		const above = t.top - 8;
		const down = below >= height || below >= above;
		el.style.maxHeight = `${(down ? below : above) - 5}px`;
		el.style.left = `${scrollX + Math.max(5, Math.min(t.left, innerWidth - width - 5))}px`;
		el.style.top = `${scrollY + (down ? t.bottom + 8 : t.top - 8 - Math.min(height, above - 5))}px`;
		el.style.transformOrigin = `${t.width / 2}px ${down ? "-8px" : `${Math.min(height, above - 5) + 8}px`}`;
	};
	const open = () => {
		if (popup) return;
		const el: HTMLElement = <SelectPopup options={this.options} value={this.value} />;
		popup = el;
		this.open = true;
		document.body.append(el);
		place(el);
		el.addEventListener("keydown", keys);
		el.addEventListener("pointermove", (e) => highlight((e.target as Element).closest<HTMLElement>("[role=option]") ?? undefined));
		el.addEventListener("pointerup", (e) => {
			const o = (e.target as Element).closest<HTMLElement>("[role=option]");
			if (o && pressed) choose(o);
		});
		el.addEventListener("click", (e) => {
			const o = (e.target as Element).closest<HTMLElement>("[role=option]");
			if (o && popup === el) choose(o);
		});
		addEventListener("pointerdown", outside, true);
		requestAnimationFrame(() => el.removeAttribute("data-starting-style"));
		highlight(items().find((i) => i.dataset.value === this.value) ?? items()[0]);
	};
	const toggle = () => (popup ? close() : open());
	return (
		<button
			type="button"
			role="combobox"
			id={this.id}
			aria-label={this.label}
			aria-haspopup="listbox"
			aria-expanded={use(this.open).map(String)}
			class:wide={!!this.wide}
			this={use(this.trigger)}
			on:pointerdown={(e: PointerEvent) => {
				if (e.pointerType !== "mouse" || e.button) return;
				e.preventDefault();
				pressed = true;
				addEventListener("pointerup", () => setTimeout(() => (pressed = false)), { once: true });
				toggle();
			}}
			on:click={() => !pressed && toggle()}
			on:keydown={(e: KeyboardEvent) => {
				if (e.key === "ArrowDown" || e.key === "ArrowUp") {
					e.preventDefault();
					open();
				} else if (e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey) {
					const i = find(e.key);
					if (i >= 0) pick(this.options[i][0]);
				} else if (e.key === " " && typing()) e.preventDefault();
			}}
		>
			<span class="value">{use(this.value).map(text)}</span>
			{Icon("chevronDown")}
		</button>
	);
}

Select.style = css`
	:scope {
		${field}
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		width: fit-content;
		height: 3rem;
		padding: 0.5rem 1rem;
		white-space: nowrap;
	}
	:scope.wide {
		width: 100%;
	}
	:scope:is(:hover, [aria-expanded="true"]) {
		border-color: color-mix(in oklab, var(--foreground) 25%, transparent);
	}
	.value {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.5rem;
		overflow: hidden;
		text-align: left;
	}
	svg {
		flex-shrink: 0;
		color: var(--muted-foreground);
		pointer-events: none;
	}
`;

export function RadioGroup(this: { value: string; options: Option[]; labelledby?: string }) {
	const step = (e: KeyboardEvent, i: number) => {
		const d = ["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 0;
		if (!d) return;
		e.preventDefault();
		const j = (i + d + this.options.length) % this.options.length;
		this.value = this.options[j][0];
		(e.currentTarget as HTMLElement).closest("[role=radiogroup]")!.querySelectorAll<HTMLElement>("[role=radio]")[j].focus();
	};
	return (
		<div role="radiogroup" aria-labelledby={this.labelledby}>
			{this.options.map(([value, label], i) => (
				<Label>
					<button
						type="button"
						role="radio"
						aria-checked={use(this.value).map((v) => String(v === value))}
						tabindex={use(this.value).map((v) => (v === value ? "0" : "-1"))}
						on:click={() => (this.value = value)}
						on:keydown={(e: KeyboardEvent) => step(e, i)}
					>
						<span class="dot" />
					</button>
					{label}
				</Label>
			))}
		</div>
	);
}

RadioGroup.style = css`
	:scope {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1.5rem;
	}
	[role="radio"] {
		${control}
		position: relative;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 9999px;
	}
	[role="radio"]::before {
		content: "";
		position: absolute;
		width: 1rem;
		height: 1rem;
		border: 1px solid var(--muted-foreground);
		border-radius: 9999px;
		background: var(--background);
		transition:
			background-color var(--control-duration) var(--control-ease),
			border-color var(--control-duration) var(--control-ease);
	}
	[role="radio"][aria-checked="true"]::before {
		border-color: var(--foreground);
		background: var(--foreground);
	}
	.dot {
		position: relative;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		background: var(--background);
		opacity: 0;
		transition: opacity var(--control-duration) var(--control-ease);
	}
	[aria-checked="true"] .dot {
		opacity: 1;
	}
`;

export function Progress(this: { value: number; label: string }) {
	return (
		<div role="progressbar" aria-label={this.label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={use(this.value).map(String)}>
			<div class="track">
				<div class="fill" style={use(this.value).map((v) => `width: ${v}%`)} />
			</div>
		</div>
	);
}

Progress.style = css`
	:scope {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.track {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		height: 0.5rem;
		overflow-x: hidden;
		border-radius: 9999px;
		background: var(--muted);
	}
	.fill {
		height: 100%;
		background: var(--foreground);
		transition: width var(--control-duration) var(--control-ease);
	}
`;

export function Tabs(this: { tabs: Option[]; label: string; active: number }) {
	this.active = 0;
	const rove = (tab: HTMLElement) => {
		const all = tab.parentElement!.querySelectorAll<HTMLElement>("[role=tab]");
		all.forEach((t) => t.setAttribute("tabindex", t === tab ? "0" : "-1"));
		return all;
	};
	const move = (e: KeyboardEvent, i: number) => {
		const n = this.tabs.length;
		const j = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i + n - 1) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
		if (j < 0) return;
		e.preventDefault();
		const all = (e.currentTarget as HTMLElement).parentElement!.querySelectorAll<HTMLElement>("[role=tab]");
		rove(all[j]);
		all[j].focus();
	};
	return (
		<div>
			<div role="tablist" aria-label={this.label} style={use(this.active).map((a) => `--active: ${a}; --count: ${this.tabs.length}`)}>
				{this.tabs.map(([name], i) => (
					<button
						type="button"
						role="tab"
						id={`tab-${name}`}
						aria-controls={`tabpanel-${name}`}
						aria-selected={use(this.active).map((a) => String(a === i))}
						tabindex={i ? "-1" : "0"}
						on:click={(e: MouseEvent) => {
							rove(e.currentTarget as HTMLElement);
							this.active = i;
						}}
						on:keydown={(e: KeyboardEvent) => move(e, i)}
					>
						{name}
					</button>
				))}
				<span class="indicator" />
			</div>
			{this.tabs.map(([name, text], i) => (
				<div role="tabpanel" id={`tabpanel-${name}`} aria-labelledby={`tab-${name}`} tabindex="0" hidden={use(this.active).map((a) => a !== i)}>
					{text}
				</div>
			))}
		</div>
	);
}

Tabs.style = css`
	:scope {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	[role="tablist"] {
		position: relative;
		display: flex;
		border-bottom: 1px solid var(--border);
	}
	[role="tab"] {
		${control}
		position: relative;
		display: inline-flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		color: var(--muted-foreground);
	}
	[role="tab"]:is(:hover, [aria-selected="true"]) {
		color: var(--foreground);
	}
	.indicator {
		position: absolute;
		bottom: -1px;
		left: 0;
		width: calc(100% / var(--count));
		height: 2px;
		background: var(--foreground);
		pointer-events: none;
		translate: calc(var(--active) * 100%) 0;
		transition:
			translate var(--panel-duration) var(--control-ease),
			width var(--panel-duration) var(--control-ease);
	}
	[role="tabpanel"] {
		flex: 1;
		min-width: 0;
		line-height: 1.4;
	}
`;

export function Dialog(this: { trigger: string; title: string; description: string; close: string; open: boolean; dialog: HTMLDialogElement }) {
	this.open = false;
	const show = () => {
		const d = this.dialog;
		d.setAttribute("data-starting-style", "");
		d.showModal();
		this.open = true;
		requestAnimationFrame(() => d.removeAttribute("data-starting-style"));
	};
	const hide = () => {
		const d = this.dialog;
		if (!this.open) return;
		this.open = false;
		d.setAttribute("data-ending-style", "");
		setTimeout(() => {
			d.close();
			d.removeAttribute("data-ending-style");
		}, parseFloat(getComputedStyle(d).transitionDuration) * 1000);
	};
	const outside = (e: MouseEvent) => {
		const r = this.dialog.getBoundingClientRect();
		if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) hide();
	};
	const trap = (e: KeyboardEvent) => {
		if (e.key !== "Tab") return;
		e.preventDefault();
		const all = [...this.dialog.querySelectorAll<HTMLElement>("button")];
		all[(all.indexOf(document.activeElement as HTMLElement) + (e.shiftKey ? all.length - 1 : 1)) % all.length].focus();
	};
	return (
		<div>
			<Button popup="dialog" expanded={use(this.open)} onclick={show}>
				{this.trigger}
			</Button>
			<dialog aria-labelledby="dialog-title" aria-describedby="dialog-description" this={use(this.dialog)} on:cancel={(e: Event) => (e.preventDefault(), hide())} on:click={outside} on:keydown={trap}>
				<div class="copy">
					<h2 id="dialog-title">{this.title}</h2>
					<p id="dialog-description">{this.description}</p>
				</div>
				<Button onclick={hide}>{this.close}</Button>
			</dialog>
		</div>
	);
}

Dialog.style = css`
	dialog {
		position: fixed;
		inset: 0;
		z-index: var(--z-dialog);
		width: min(28rem, 100% - 2rem);
		max-width: none;
		height: fit-content;
		max-height: calc(100dvh - 2rem);
		margin: auto;
		padding: 1.5rem;
		overflow: auto;
		overscroll-behavior: contain;
		border: 0;
		border-radius: var(--radius-lg);
		background: var(--popover);
		color: var(--foreground);
		box-shadow: var(--shadow-md);
		font-size: var(--type-small);
		font-weight: var(--weight-secondary);
		line-height: var(--type-small-leading);
		outline: none;
		transition:
			opacity var(--control-duration) var(--control-ease),
			translate var(--control-duration) var(--control-ease),
			scale var(--control-duration) var(--control-ease);
	}
	dialog:is([data-starting-style], [data-ending-style]) {
		opacity: 0;
		translate: 0 -4px;
		scale: 0.98;
	}
	dialog::backdrop {
		background: #00000040;
		backdrop-filter: blur(4px);
		transition: opacity var(--control-duration) var(--control-ease);
	}
	dialog:is([data-starting-style], [data-ending-style])::backdrop {
		opacity: 0;
	}
	:global(body:has(dialog[open])) {
		overflow: hidden;
	}
	.copy {
		display: grid;
		gap: 0.5rem;
	}
	.copy > h2 {
		font-size: var(--type-body);
		font-weight: 700;
		line-height: 1.4;
	}
	.copy > p {
		color: var(--muted-foreground);
		line-height: 1.4;
	}
	dialog > :global(button) {
		margin-top: 1.5rem;
	}
`;

export function Range(this: { value: number; id: string; label: string; min?: number; max?: number; step?: number }) {
	const fill = use(this.value).map((v) => `--fill: ${(v - (this.min ?? 0)) / ((this.max ?? 1) - (this.min ?? 0))}`);
	return (
		<input
			type="range"
			id={this.id}
			aria-label={this.label}
			min={String(this.min ?? 0)}
			max={String(this.max ?? 1)}
			step={String(this.step ?? 0.05)}
			value={use(this.value).map(String)}
			style={fill}
			on:input={(e: Event) => {
				this.value = Number((e.target as HTMLInputElement).value);
			}}
		/>
	);
}

Range.style = css`
	:scope {
		--fill: 0;
		--track: linear-gradient(to right, var(--foreground) calc(24px + (100% - 48px) * var(--fill)), var(--muted) 0);
		display: block;
		width: 100%;
		height: 3rem;
		margin: 0;
		background: transparent;
		appearance: none;
		outline: none;
	}
	:scope::-webkit-slider-runnable-track {
		height: 0.5rem;
		border-radius: 9999px;
		background: var(--track);
	}
	:scope::-moz-range-track {
		height: 0.5rem;
		border-radius: 9999px;
		background: var(--track);
	}
	:scope::-webkit-slider-thumb {
		width: 3rem;
		height: 3rem;
		margin-top: -1.25rem;
		border-radius: 9999px;
		background: radial-gradient(circle, var(--background) 7px, var(--foreground) 7.5px 8px, transparent 8.5px);
		appearance: none;
		outline: var(--focus-width) solid transparent;
		outline-offset: calc(var(--focus-width) * -1 - 12px);
		transition: outline-color var(--control-duration) var(--control-ease);
	}
	:scope::-moz-range-thumb {
		width: 3rem;
		height: 3rem;
		border: 0;
		border-radius: 9999px;
		background: radial-gradient(circle, var(--background) 7px, var(--foreground) 7.5px 8px, transparent 8.5px);
	}
	:scope:focus-visible::-webkit-slider-thumb {
		outline-color: var(--ring);
	}
`;

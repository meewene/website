import { css, stateListen } from "dreamland/core";
import config from "../site.config";
import { Page } from "../components/Page";
import { Button, Checkbox, Input, Label, Playground, Range, Select, Switch } from "../components/Controls";
import { Icon } from "../icons";
import { cueLength, hoverAllowed, play, sound, stop, type Cue } from "../sound";
import { motion } from "../motion";

const c = config.pages.sounds;

function Lab(this: { playing: string; selected: string; result: string; panel: HTMLElement; open: boolean }) {
	this.playing = "";
	this.selected = "";
	this.result = "idle";
	this.open = false;
	let timer: ReturnType<typeof setTimeout>;
	const onplay = (cue: Cue) => {
		clearTimeout(timer);
		if (this.playing === cue) {
			stop();
			this.playing = "";
			this.result = "idle";
			return;
		}
		this.selected = cue;
		this.result = play(cue);
		this.playing = this.result === "played" ? cue : "";
		if (this.playing) timer = setTimeout(() => (this.playing = ""), cueLength(cue));
	};
	stateListen(sound, () => {
		clearTimeout(timer);
		this.playing = "";
		this.result = "idle";
	});
	const status = use(sound.enabled, sound.volume, this.selected, this.result).map(([on, volume, selected, result]) =>
		!on ? "sound is off." : !volume ? "volume is at zero." : result === "unavailable" ? "audio couldn’t start." : result === "muted" ? "playback stopped." : selected ? `selected ${selected}.` : "",
	);
	const toggle = () => {
		this.open = !this.open;
		const panel = this.panel;
		if (this.open) panel.hidden = false;
		const frames = [{ height: "0px", opacity: 0 }, { height: `${panel.scrollHeight}px`, opacity: 1 }];
		if (motion.reduced) return void (panel.hidden = !this.open);
		panel.animate(this.open ? frames : frames.reverse(), { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }).finished.then(() => (panel.hidden = !this.open));
	};
	return (
		<div>
			<div data-intro="true" class="page-controls">
				<div class="control">
					<Switch id="sound-enabled" checked={use(sound.enabled)} />
					<label for="sound-enabled" class="label">
						sound
					</label>
				</div>
				<div class="control">
					<label for="sound-volume" class="label">
						volume
					</label>
					<div class="volume">
						<Range id="sound-volume" label="volume" value={use(sound.volume)} />
					</div>
					<span class="percent">{use(sound.volume).map((v) => `${Math.round(v * 100)}%`)}</span>
				</div>
			</div>
			<section aria-label="sound catalog">
				<table class="sound-table">
					<caption class="sr-only">interface sounds, grouped by purpose</caption>
					<colgroup>
						<col class="col-name" />
						<col />
						<col class="col-length" />
						<col class="col-action" />
					</colgroup>
					<thead>
						<tr data-intro="true">
							<th scope="col">cue</th>
							<th scope="col" class="cell-description">
								description
							</th>
							<th scope="col" class="length">
								length
							</th>
							<th scope="col">
								<span class="sr-only">play</span>
							</th>
						</tr>
					</thead>
					{c.groups.map((g) => (
						<tbody>
							<tr data-intro="true">
								<th scope="rowgroup" colspan="4" class="group-label">
									{g.label}
								</th>
							</tr>
							{g.cues.map((cue) => (
								<tr data-intro="true" class="sound-row" data-playing={use(this.playing).map((p) => (p === cue ? "" : undefined))}>
									<th scope="row" class="name">
										<span class="name-label">{cue}</span>
										<span class="description stacked">{c.cues[cue]}</span>
									</th>
									<td class="cell-description description">{c.cues[cue]}</td>
									<td class="length">{[...(cueLength(cue as Cue) / 1000).toFixed(2)].map((ch) => (ch === "." ? <span class="point">.</span> : ch))}s</td>
									<td class="action">
										<button type="button" class="play" aria-label={use(this.playing).map((p) => `${p === cue ? "pause" : "play"} ${cue}`)} on:click={() => onplay(cue as Cue)}>
											<span class="play-icon">
												{Icon("play", "idle")}
												{Icon("pause", "busy")}
												<span class="dot" aria-hidden="true" />
											</span>
										</button>
									</td>
								</tr>
							))}
						</tbody>
					))}
				</table>
			</section>
			<p id="playback-status" aria-live="polite" class={status.map((s) => (s && !s.startsWith("selected ") ? "status" : "sr-only"))}>
				{status}
			</p>
			<div data-intro="true">
				<button type="button" class="trigger" aria-expanded={use(this.open).map(String)} on:click={toggle}>
					try in ui
					{Icon("chevronDown")}
				</button>
				<div class="disclosure" hidden this={use(this.panel)}>
					<Panel onplay={onplay} />
				</div>
			</div>
		</div>
	);
}

function Panel(this: { onplay: (cue: Cue) => void; busy: boolean; result: string }) {
	this.busy = false;
	this.result = "success";
	let pending: ReturnType<typeof setTimeout> | undefined;
	const submit = () => {
		if (pending) return;
		this.busy = true;
		this.onplay("loading");
		pending = setTimeout(() => {
			pending = undefined;
			this.onplay(this.result as Cue);
			this.busy = false;
		}, 450);
	};
	return (
		<div>
			<Playground title="interface sounds">
				<div class="demo">
					<Button onclick={() => this.onplay("click")}>play click sound</Button>
					<a href="#playback-status" class="status-link" on:pointerenter={(e: PointerEvent) => e.pointerType === "mouse" && hoverAllowed() && this.onplay("hover")} on:click={() => this.onplay("click")}>
						playback status
					</a>
					<div class="row">
						<Checkbox id="playground-checkbox" checked={false} onchange={() => this.onplay("select")} />
						<Label for="playground-checkbox">checkbox</Label>
					</div>
					<div class="row">
						<Switch id="playground-toggle" checked={false} onchange={(on: boolean) => this.onplay(on ? "toggle-on" : "toggle-off")} />
						<Label for="playground-toggle">sample switch</Label>
					</div>
					<div class="field">
						<Label for="playground-select">choose an option</Label>
						<Select id="playground-select" wide raw value="one" options={[["one", "first option"], ["two", "second option"]]} onchange={() => this.onplay("select")} />
					</div>
					<div class="field">
						<Label for="playground-input">text field</Label>
						<Input id="playground-input" placeholder="hello, piano." onfocus={() => this.onplay("select")} />
					</div>
					<Button dim onclick={() => this.onplay("disabled")}>
						disabled button
					</Button>
					<div class="pair">
						<Select label="demo submission result" raw value="success" options={[["success", "success"], ["failure", "failure"]]} onchange={(v: string) => ((this.result = v), this.onplay("select"))} />
						<Button disabled={use(this.busy)} onclick={submit}>
							{use(this.busy).map((b) => (b ? "submitting…" : "submit"))}
						</Button>
					</div>
				</div>
			</Playground>
		</div>
	);
}

Panel.style = css`
	:scope {
		padding-top: 0.5rem;
	}
	.demo {
		display: grid;
		gap: 1rem;
	}
	.status-link {
		display: flex;
		align-items: center;
		min-height: 3rem;
		padding-inline: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}
	.status-link:hover {
		text-decoration-line: underline;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 3rem;
	}
	.field {
		display: grid;
		gap: 0.5rem;
	}
	.pair {
		display: flex;
		gap: 0.5rem;
	}
	.pair > :global(:last-child) {
		flex: 1;
	}
	@media (min-width: 40rem) {
		.demo {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
`;

Lab.style = css`
	:scope {
		display: flex;
		flex-direction: column;
		gap: var(--page-section-gap);
	}
	.control {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 3rem;
	}
	.label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: var(--type-small);
		user-select: none;
	}
	.volume {
		flex-shrink: 0;
		width: 7rem;
	}
	.percent {
		width: 2rem;
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-feature-settings: var(--font-mono-features);
		font-weight: 400;
		font-size: var(--type-small);
		font-variant-numeric: tabular-nums;
	}
	.sound-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--type-small);
		line-height: 1.25rem;
		text-align: left;
	}
	th,
	td {
		padding: 0;
		font-weight: inherit;
		vertical-align: middle;
	}
	thead th {
		height: 3rem;
		border-bottom: 1px solid var(--border);
		color: var(--muted-foreground);
	}
	.group-label {
		padding-block: 2rem 0.5rem;
		border-bottom: 1px solid var(--border);
		color: var(--foreground);
		font-size: var(--type-body);
		font-weight: var(--weight-emphasis);
	}
	tbody:first-of-type .group-label {
		padding-top: 1.5rem;
	}
	.sound-row {
		position: relative;
		isolation: isolate;
		border-bottom: 1px solid var(--border);
	}
	tbody .sound-row:last-child {
		border-bottom: 0;
	}
	.sound-row > * {
		padding-block: 0.5rem;
	}
	.name {
		padding-right: 1.5rem;
	}
	.name-label {
		display: block;
		color: var(--foreground);
		font-size: var(--type-body);
		font-weight: var(--weight-emphasis);
	}
	.description,
	.length {
		color: var(--muted-foreground);
		text-wrap: pretty;
		transition: color var(--control-duration) var(--control-ease);
	}
	.stacked {
		display: block;
		margin-top: var(--page-row-gap);
	}
	.cell-description {
		display: none;
		padding-right: 1rem;
	}
	.length {
		display: none;
		padding-right: 0.5rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.point {
		font-variant-numeric: normal;
	}
	.action {
		text-align: right;
	}
	.play {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-md);
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.play::before,
	.play::after {
		content: "";
		position: absolute;
		inset: 0.25rem -0.5rem;
		border-radius: var(--radius-lg);
	}
	.play::after {
		z-index: 1;
	}
	.play::before {
		z-index: -1;
		background: var(--muted);
		opacity: 0;
		transition: opacity var(--control-duration) var(--control-ease);
	}
	.play:active .play-icon {
		translate: 0 1px;
	}
	.play-icon {
		position: relative;
		display: inline-flex;
		width: var(--icon);
		height: var(--icon);
	}
	.play-icon svg {
		position: absolute;
		inset: 0;
		transition:
			opacity var(--control-duration) var(--control-ease),
			scale var(--control-duration) var(--control-ease),
			rotate var(--control-duration) var(--control-ease);
	}
	.busy {
		opacity: 0;
		scale: 0.8;
		rotate: 12deg;
	}
	.sound-row[data-playing] .idle {
		opacity: 0;
		scale: 0.8;
		rotate: -12deg;
	}
	.sound-row[data-playing] .busy {
		opacity: 1;
		scale: 1;
		rotate: 0deg;
	}
	.sound-row[data-playing] .play::before {
		opacity: 1;
	}
	.sound-row[data-playing] :is(.description, .length),
	.sound-row[data-playing] .play {
		color: var(--foreground);
	}
	:global(:root:not([data-input="pointer"])) .play:focus-visible::before {
		opacity: 0.6;
	}
	.play:focus-visible {
		outline: none;
	}
	@media (hover: hover) and (pointer: fine) {
		.sound-row:hover .play::before {
			opacity: 0.6;
		}
		.sound-row:hover :is(.description, .length),
		.sound-row:hover .play {
			color: var(--foreground);
		}
	}
	.trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 48px;
		height: 3rem;
		padding: 0;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		color: var(--muted-foreground);
		font-size: var(--type-small);
		font-weight: var(--weight-secondary);
		line-height: var(--type-small-leading);
		white-space: nowrap;
		user-select: none;
		text-decoration-line: underline;
		text-decoration-color: color-mix(in oklch, var(--link) 35%, transparent);
		transition:
			color var(--control-duration) var(--control-ease),
			text-decoration-color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.trigger:is(:hover, [aria-expanded="true"]) {
		color: var(--foreground);
	}
	.trigger:is(:hover, :focus-visible) {
		text-decoration-color: var(--link);
	}
	.trigger:active {
		translate: 0 1px;
	}
	.trigger svg {
		transition: rotate var(--control-duration) var(--control-ease);
	}
	.trigger[aria-expanded="true"] svg {
		rotate: 180deg;
	}
	.disclosure {
		overflow: clip;
	}
	.dot {
		position: absolute;
		top: -0.125rem;
		right: -0.125rem;
		display: none;
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 9999px;
		background: currentColor;
	}
	.sound-row[data-playing] .dot {
		display: block;
		animation:
			dot-in 0.24s var(--expo-out),
			dot-pulse 0.6s ease-in-out infinite;
	}
	@keyframes dot-in {
		from {
			scale: 0.5;
		}
	}
	@keyframes dot-pulse {
		50% {
			opacity: 0.4;
		}
	}
	.status {
		color: var(--muted-foreground);
		font-family: var(--font-mono);
		font-feature-settings: var(--font-mono-features);
		font-weight: 400;
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
	}
	@media (max-width: 39.99rem) {
		thead {
			display: none;
		}
		tbody:first-of-type .group-label {
			padding-top: 0;
		}
	}
	@media (min-width: 40rem) {
		.sound-table {
			table-layout: fixed;
		}
		.col-name {
			width: 10.5rem;
		}
		.col-length {
			width: 4rem;
		}
		.col-action {
			width: 3rem;
		}
		.cell-description,
		.length {
			display: table-cell;
		}
		.stacked {
			display: none;
		}
		.volume {
			width: 9rem;
		}
	}
	:global(.reduce-motion) .sound-row[data-playing] .dot {
		animation: none;
	}
	:global(.reduce-motion) .trigger:active {
		translate: none;
	}
	:global(.reduce-motion) .play::before,
	:global(.reduce-motion) .description,
	:global(.reduce-motion) .length,
	:global(.reduce-motion) .trigger svg,
	:global(.reduce-motion) .play-icon svg {
		transition: none;
	}
`;

export const Sounds = () => (
	<Page title={c.title} description={c.description} vt="title-sounds">
		<Lab />
	</Page>
);

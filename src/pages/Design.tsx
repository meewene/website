import { css } from "dreamland/core";
import config from "../site.config";
import { Page } from "../components/Page";
import { Button, Checkbox, Dialog, Input, Label, Playground, Progress, RadioGroup, Range, Select, Switch, Tabs } from "../components/Controls";
import { Icon } from "../icons";
import { motion } from "../motion";

const d = config.pages.design;
const PAIRS: [string, string, string, number][] = [
	["foreground", "background", "body text, titles, and active controls.", 4.5],
	["muted-foreground", "background", "descriptions, metadata, and resting controls.", 4.5],
	["muted-foreground", "muted", "quiet text on a muted surface.", 4.5],
	["destructive", "background", "errors and destructive actions.", 4.5],
	["primary-foreground", "primary", "text placed on the blue accent.", 4.5],
	["primary", "background", "the blue accent for marks, strokes, and selection.", 3],
	["ring", "background", "focus outlines.", 3],
	["border", "background", "hairline dividers. decorative, so no minimum applies.", 0],
];
const STEPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
const need = (min: number) => (min ? `needs ${min}:1` : "decorative");

const luminance = (rgb: number[]) => rgb.reduce((sum, v, i) => {
	const c = v / 255;
	return sum + [0.2126, 0.7152, 0.0722][i] * (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
}, 0);

const Token = (label: string, token: string) => (
	<li class="ds-token-row">
		<span>{label}</span>
		<code class="ds-token">{token}</code>
	</li>
);

function DesignBody(this: { ratios: string[]; verdicts: string[]; moved: boolean; level: number; probe: HTMLElement }, cx: any) {
	this.ratios = PAIRS.map(() => "–");
	this.verdicts = PAIRS.map(([, , , min]) => need(min));
	this.moved = false;
	this.level = 40;
	cx.mount = () => {
		const canvas = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
		const rgb = (token: string) => {
			this.probe.style.color = `var(--${token})`;
			canvas.clearRect(0, 0, 1, 1);
			canvas.fillStyle = getComputedStyle(this.probe).color;
			canvas.fillRect(0, 0, 1, 1);
			return [...canvas.getImageData(0, 0, 1, 1).data.slice(0, 3)];
		};
		const measure = () => {
			const ratios = PAIRS.map(([fg, bg]) => {
				const [hi, lo] = [luminance(rgb(fg)), luminance(rgb(bg))].sort((a, b) => b - a);
				return (hi + 0.05) / (lo + 0.05);
			});
			this.ratios = ratios.map((r) => `${r.toFixed(2)}:1`);
			this.verdicts = ratios.map((r, i) => {
				const min = PAIRS[i][3];
				return min ? `${r >= min ? "passes" : "below"} ${min}:1` : "decorative";
			});
		};
		measure();
		new MutationObserver(measure).observe(document.documentElement, { attributeFilter: ["class"] });
	};
	const compare = () => {
		this.moved = !this.moved;
	};
	return (
		<div class="page-content">
			<span class="ds-probe" aria-hidden="true" this={use(this.probe)} />
			<section data-intro-group="true" class="page-section" aria-labelledby="ds-principles">
				<h2 id="ds-principles">{d.principles.title}</h2>
				<dl class="page-catalog">
					{d.principles.items.map((item) => (
						<div data-intro="true">
							<dt>{item.term}</dt>
							<dd>{item.text}</dd>
						</div>
					))}
				</dl>
			</section>
			<section data-intro-group="true" class="page-section" aria-labelledby="ds-color">
				<h2 id="ds-color">{d.color.title}</h2>
				<p class="muted">{d.color.lead}</p>
				<ul class="ds-contrast" aria-label="color tokens and contrast">
					{PAIRS.map(([fg, bg, text, min], i) => (
						<li class="ds-contrast-row">
							<span class="ds-contrast-swatch" aria-hidden="true" style={`background: var(--${bg}); color: var(--${fg})`}>
								{min === 4.5 ? "aa" : <span class="ds-contrast-mark" />}
							</span>
							<span class="ds-contrast-copy">
								<code>
									<span class="nowrap">{`--${fg}`}</span> <span class="nowrap muted">{`on --${bg}`}</span>
								</code>
								<span class="small muted">{text}</span>
							</span>
							<span class="ds-contrast-ratio">
								<span class="small">{use(this.ratios).map((r) => r[i])}</span>
								<span class="small muted">{use(this.verdicts).map((v) => v[i])}</span>
							</span>
						</li>
					))}
				</ul>
				<details class="ds-disclosure">
					<summary>{d.color.show}</summary>
					<div class="ds-ramps">
						{["neutral", "blue"].map((ramp) => (
							<div class="ds-ramp">
								<span class="small muted">{ramp}</span>
								<ol class="ds-ramp-steps" aria-label={`${ramp} ramp`}>
									{STEPS.map((step) => (
										<li>
											<span class="ds-ramp-swatch" aria-hidden="true" style={`background: var(--color-${ramp.toLowerCase()}-${step})`} />
											<span class="ds-ramp-label">{step}</span>
										</li>
									))}
								</ol>
							</div>
						))}
					</div>
				</details>
			</section>
			<section data-intro-group="true" class="page-section" aria-labelledby="ds-type">
				<h2 id="ds-type">{d.type.title}</h2>
				<p class="muted">{d.type.lead}</p>
				<div class="ds-specimens">
					<h3>dm sans</h3>
					<ul class="ds-token-card" aria-label="dm sans">
						{Token("the quick brown fox jumps over the lazy dog", "--weight-body 450")}
						<li class="ds-token-row">
							<span class="title">the quick brown fox jumps over the lazy dog</span>
							<code class="ds-token">--weight-title 550</code>
						</li>
						<li class="ds-token-row">
							<span class="emphasis">the quick brown fox jumps over the lazy dog</span>
							<code class="ds-token">--weight-emphasis 600</code>
						</li>
					</ul>
				</div>
				<div class="ds-specimens">
					<h3>fira code</h3>
					<ul class="ds-token-card" aria-label="fira code">
						<li class="ds-token-row">
							<span class="mono">the quick brown fox jumps over the lazy dog</span>
							<code class="ds-token">--font-mono 400</code>
						</li>
					</ul>
				</div>
				<div class="ds-specimens">
					<h3>cormorant garamond</h3>
					<ul class="ds-token-card" aria-label="cormorant garamond">
						<li class="ds-token-row">
							<span class="serif">the quick brown fox jumps over the lazy dog</span>
							<code class="ds-token">--font-serif 500</code>
						</li>
					</ul>
				</div>
				<div class="ds-specimens">
					<h3>sizes and color</h3>
					<ul class="ds-token-card" aria-label="sizes and color">
						{Token("body text", "--type-body 16/24")}
						<li class="ds-token-row">
							<span class="small">small text</span>
							<code class="ds-token">--type-small 14/20</code>
						</li>
						<li class="ds-token-row">
							<span class="muted">muted text</span>
							<code class="ds-token">--muted-foreground</code>
						</li>
					</ul>
				</div>
				<a class="page-link ds-link" href="/font">
					{d.type.link}
				</a>
			</section>
			<section data-intro-group="true" class="page-section" aria-labelledby="ds-space">
				<h2 id="ds-space">{d.spacing.title}</h2>
				<p class="muted">{d.spacing.lead}</p>
				<div class="ds-specimens">
					<h3>spacing scale</h3>
					<ul class="ds-token-card" aria-label="spacing scale">
						{[8, 16, 24, 32, 48, 64].map((px) => (
							<li class="ds-token-row">
								<span>
									<span class="ds-scale-bar" style={`width: ${px}px`} aria-hidden="true" />
								</span>
								<code class="ds-token">{`${px}px ${px / 16}rem`}</code>
							</li>
						))}
					</ul>
				</div>
			</section>
			<section data-intro-group="true" class="page-section" aria-labelledby="ds-shape">
				<h2 id="ds-shape">{d.shape.title}</h2>
				<div class="ds-specimens">
					<h3>radius</h3>
					<ul class="ds-token-card" aria-label="radius">
						{[
							["small marks", "--radius-sm 4px", "var(--radius-sm)"],
							["controls", "--radius-md 8px", "var(--radius-md)"],
							["popups", "--radius-lg 12px", "var(--radius-lg)"],
							["panels", "--radius-xl 16px", "var(--radius-xl)"],
							["switches, thumbs", "9999px", "9999px"],
						].map(([label, token, radius]) => (
							<li class="ds-token-row">
								<span class="ds-swatch-row">
									<span class="ds-radius-tile" style={`border-radius: ${radius}`} aria-hidden="true" />
									{label}
								</span>
								<code class="ds-token">{token}</code>
							</li>
						))}
					</ul>
				</div>
				<div class="ds-specimens">
					<h3>elevation</h3>
					<ul class="ds-token-card" aria-label="elevation">
						{[
							["skip link", "sm"],
							["menus, selects, dialogs", "md"],
						].map(([label, size]) => (
							<li class="ds-token-row">
								<span class="ds-swatch-row">
									<span class="ds-elevation-tile" style={`box-shadow: var(--shadow-${size})`} aria-hidden="true" />
									{label}
								</span>
								<code class="ds-token">{`--shadow-${size}`}</code>
							</li>
						))}
					</ul>
				</div>
			</section>
			<section data-intro-group="true" class="page-section" aria-labelledby="ds-motion">
				<h2 id="ds-motion">{d.motion.title}</h2>
				<p class="muted">
					{`${d.motion.lead[0]} `}
					<code class="small">cubic-bezier(0.22, 1, 0.36, 1)</code>
					{d.motion.lead[1]}
				</p>
				<div class="ds-motion">
					<ul class="ds-motion-list" aria-label="duration tokens">
						{[
							["micro", "200ms", "press feedback, small icon shifts, and menu feedback."],
							["control", "240ms", "color, border, focus, and popup changes on controls."],
							["panel", "300ms", "disclosures, tab indicators, and theme changes."],
						].map(([name, ms, text]) => (
							<li class="ds-motion-row">
								<span class="ds-motion-copy">
									<code>
										{`--${name}-duration`}
										<span class="muted">{` ${ms}`}</span>
									</code>
									<span class="small muted">{text}</span>
								</span>
								<span class="ds-motion-track" aria-hidden="true">
									<span class="ds-motion-runner" style={`transition-duration: var(--${name}-duration)`} data-moved={use(this.moved)}>
										<span class="ds-motion-dot" />
									</span>
								</span>
							</li>
						))}
					</ul>
					<div class="page-controls">
						<Button pressed={use(this.moved)} onclick={compare}>
							{d.motion.compare}
						</Button>
						<p class="small muted" hidden={use(motion.reduced).map((r) => !r)}>
							{d.motion.reduced}
						</p>
					</div>
				</div>
			</section>
			<section data-intro-group="true" class="page-section" aria-labelledby="ds-focus">
				<h2 id="ds-focus">{d.focus.title}</h2>
				<p>{d.focus.text[0]}</p>
				<p class="muted">{d.focus.text[1]}</p>
			</section>
			<section data-intro-group="true" class="page-section" aria-labelledby="ds-components">
				<h2 id="ds-components">{d.components.title}</h2>
				<p class="muted">
					{`${d.components.lead[0]} `}
					<code class="small">components/Controls.tsx</code>
					{d.components.lead[1]}
				</p>
				<dl class="page-catalog">
					{d.components.items.map((item) => (
						<div data-intro="true">
							<dt>{item.term}</dt>
							<dd>{item.text}</dd>
						</div>
					))}
				</dl>
				<details data-intro="true" class="ds-disclosure">
					<summary>{d.components.try}</summary>
					<Playground>
						<section class="ds-specimen" aria-labelledby="ds-buttons">
							<h3 id="ds-buttons" class="small muted">
								button
							</h3>
							<div class="ds-specimen-row">
								<Button>outline</Button>
								<Button variant="ghost">ghost</Button>
								<Button variant="destructive">delete</Button>
								<Button variant="link">link</Button>
								<Button size="icon" label="search">
									{Icon("search")}
								</Button>
								<Button disabled>disabled</Button>
							</div>
						</section>
						<section class="ds-specimen" aria-labelledby="ds-fields">
							<h3 id="ds-fields" class="small muted">
								fields
							</h3>
							<div class="ds-field">
								<Label for="ds-name">name</Label>
								<Input id="ds-name" placeholder="ada lovelace" />
							</div>
							<div class="ds-field">
								<Label for="ds-note">note</Label>
								<Input multiline id="ds-note" placeholder="a short message" />
							</div>
							<div class="ds-field start">
								<Label for="ds-density">density</Label>
								<Select id="ds-density" value="comfortable" options={[["comfortable", "comfortable"], ["compact", "compact"]]} />
							</div>
						</section>
						<section class="ds-specimen" aria-labelledby="ds-choices">
							<h3 id="ds-choices" class="small muted">
								choices
							</h3>
							<div class="ds-specimen-row">
								<Label>
									<Checkbox checked={true} />
									checkbox
								</Label>
								<div class="ds-row">
									<Switch id="ds-switch" checked={true} />
									<Label for="ds-switch">switch</Label>
								</div>
							</div>
							<RadioGroup labelledby="ds-choices" value="light" options={[["light", "light"], ["dark", "dark"]]} />
						</section>
						<section class="ds-specimen" aria-labelledby="ds-ranges">
							<h3 id="ds-ranges" class="small muted">
								ranges
							</h3>
							<Range id="ds-level" label="level" min={0} max={100} step={1} value={use(this.level)} />
							<Progress label="progress" value={use(this.level)} />
						</section>
						<section class="ds-specimen" aria-labelledby="ds-surfaces">
							<h3 id="ds-surfaces" class="small muted">
								tabs and dialog
							</h3>
							<Tabs label="sample tabs" tabs={[["one", "the indicator slides over 300ms."], ["two", "panels keep a 16px gap."], ["three", "arrow keys move between tabs."]]} />
							<Dialog trigger="open dialog" title="a floating surface" description="dialogs use the large radius and a smooth shadow ring instead of a border." close="close" />
						</section>
					</Playground>
				</details>
			</section>
		</div>
	);
}

DesignBody.style = css`
	:scope {
		interpolate-size: allow-keywords;
	}
	code {
		font-family: var(--font-mono);
		font-feature-settings: var(--font-mono-features);
	}
	h2 {
		font-weight: var(--weight-emphasis);
	}
	h3 {
		font-weight: var(--weight-title);
	}
	.muted {
		color: var(--muted-foreground);
	}
	.small {
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
	}
	.nowrap {
		white-space: nowrap;
	}
	.title {
		font-weight: var(--weight-title);
	}
	.emphasis {
		font-weight: var(--weight-emphasis);
	}
	.mono {
		font-family: var(--font-mono);
		font-feature-settings: var(--font-mono-features);
		font-weight: 400;
	}
	.serif {
		font-family: var(--font-serif);
		font-weight: var(--weight-serif);
		letter-spacing: normal;
	}
	.ds-probe {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
	}
	.ds-contrast > li,
	.ds-motion-list > li {
		border-bottom: 1px solid var(--border);
	}
	.ds-contrast-row {
		display: grid;
		grid-template-columns: 48px minmax(0, 1fr) auto;
		align-items: center;
		gap: 16px;
		padding-block: 16px;
	}
	.ds-contrast-swatch {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--foreground) 10%, transparent);
		font-weight: var(--weight-emphasis);
	}
	.ds-contrast-mark {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: currentColor;
	}
	.ds-contrast-copy,
	.ds-motion-copy {
		display: grid;
		gap: 4px;
		min-width: 0;
	}
	.ds-contrast-ratio {
		display: grid;
		justify-items: end;
		gap: 4px;
		text-align: end;
	}
	.ds-disclosure summary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 48px;
		height: 48px;
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
		list-style: none;
		transition:
			color var(--control-duration) var(--control-ease),
			text-decoration-color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.ds-disclosure summary:hover,
	.ds-disclosure[open] summary {
		color: var(--foreground);
	}
	.ds-disclosure summary:is(:hover, :focus-visible) {
		text-decoration-color: var(--link);
	}
	.ds-disclosure summary:active {
		translate: 0 1px;
	}
	.ds-disclosure summary::-webkit-details-marker {
		display: none;
	}
	.ds-disclosure::details-content {
		block-size: 0;
		opacity: 0;
		overflow: clip;
		transition:
			block-size var(--panel-duration) var(--control-ease),
			opacity var(--panel-duration) var(--control-ease),
			content-visibility var(--panel-duration) allow-discrete;
	}
	.ds-disclosure[open]::details-content {
		block-size: auto;
		opacity: 1;
	}
	.ds-ramps {
		display: grid;
		gap: 16px;
	}
	.ds-ramp {
		display: grid;
		gap: 8px;
	}
	.ds-ramp-steps {
		display: grid;
		grid-template-columns: repeat(11, minmax(0, 1fr));
		gap: 4px;
	}
	.ds-ramp-steps > li {
		display: grid;
		gap: 4px;
		min-width: 0;
	}
	.ds-ramp-swatch {
		height: 32px;
		border-radius: var(--radius-sm);
		box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--foreground) 8%, transparent);
	}
	.ds-ramp-label {
		overflow: hidden;
		color: var(--muted-foreground);
		font-size: var(--type-small);
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
	.ds-specimens {
		display: grid;
		gap: 8px;
	}
	.ds-token-card {
		display: grid;
		overflow: hidden;
		border-radius: var(--radius-lg);
		background: color-mix(in oklch, var(--muted) 64%, var(--background));
		box-shadow: inset 0 0 0 1px var(--border);
	}
	.ds-token-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 16px;
		min-height: 48px;
		padding: 8px 16px;
	}
	.ds-token-row + .ds-token-row {
		border-top: 1px solid var(--border);
	}
	.ds-token-row > span:first-child {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ds-token {
		color: var(--muted-foreground);
		font-size: var(--type-caption);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.ds-swatch-row {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.ds-scale-bar {
		display: block;
		height: 16px;
		border-radius: var(--radius-sm);
		background: color-mix(in oklch, var(--primary) 32%, transparent);
	}
	.ds-radius-tile,
	.ds-elevation-tile {
		flex: none;
		width: 32px;
		height: 32px;
	}
	.ds-radius-tile {
		width: 48px;
		height: 48px;
		border: 1px solid color-mix(in oklch, var(--foreground) 24%, transparent);
		background: var(--muted);
	}
	.ds-elevation-tile {
		border-radius: var(--radius-md);
		background: var(--popover);
	}
	.ds-link {
		display: inline-flex;
		align-items: center;
		min-height: 48px;
	}
	.ds-motion {
		display: grid;
		gap: 16px;
	}
	.ds-motion-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(96px, 40%);
		align-items: center;
		gap: 16px;
		padding-block: 16px;
	}
	.ds-motion-track {
		position: relative;
		height: 16px;
		border-radius: 999px;
		background: var(--border);
	}
	.ds-motion-runner {
		position: absolute;
		inset: 0 16px 0 0;
		transition-property: translate;
		transition-timing-function: var(--expo-out);
	}
	.ds-motion-runner[data-moved] {
		translate: 100%;
	}
	.ds-motion-dot {
		display: block;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--foreground);
	}
	.ds-specimen {
		display: grid;
		gap: 16px;
	}
	.ds-specimen-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
	}
	.ds-field {
		display: grid;
		gap: 0.5rem;
	}
	.ds-field.start {
		justify-items: start;
	}
	.ds-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 48px;
	}
	@media (max-width: 30rem) {
		.ds-ramp-label {
			font-size: 0;
		}
		.ds-ramp-steps > li:is(:first-child, :nth-child(6), :last-child) .ds-ramp-label {
			font-size: var(--type-small);
		}
		.ds-motion-row {
			grid-template-columns: 1fr;
		}
	}
	:global(.reduce-motion) .ds-disclosure summary:active {
		translate: none;
	}
`;

export const Design = () => (
	<Page title={d.title} description={d.description}>
		<DesignBody />
	</Page>
);

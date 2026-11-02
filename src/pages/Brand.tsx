import { css } from "dreamland/core";
import config from "../site.config";
import { Page } from "../components/Page";
import { copySvg, MARK } from "../components/Logo";
import { Icon } from "../icons";
import { play } from "../sound";

const b = config.pages.brand;
const LOGOS = [
	{ ...config.brand.white, note: "main version, for dark surfaces.", dark: true },
	{ ...config.brand.black, note: "for light surfaces and print.", dark: false },
];
const COLORS: [string, string, string, string, string][] = [
	["background", "--background", "page surface", "#ffffff", "#0a0a0a"],
	["card", "--card", "raised surfaces", "#ffffff", "#2e2e2e"],
	["text", "--foreground", "reading text and titles", "#4b4b4b", "#fbfbfb"],
	["muted text", "--muted-foreground", "secondary text and captions", "#6a6a6a", "#bababa"],
	["border", "--border", "lines between sections", "#e4e4e4", "#4b4b4b"],
	["accent", "--primary", "accent marks and text selection", "#326cb6", "#94c0fb"],
	["logo", "logo files", "the mark itself, black or white", config.brand.black.color, config.brand.white.color],
];
const TYPE: [string, string, string, string][] = [
	["body", "dm sans 16/24 · 450", "", b.type.body],
	["title", "dm sans 16/24 · 550, -0.02em", "title", "page titles"],
	["emphasis", "dm sans 16/24 · 600", "emphasis", "section headings"],
	["small", "dm sans 14/20 · 450", "small muted", "dates and captions"],
	["mono", "mono · 400", "mono", config.email],
	["display", "cormorant garamond · 500", "brand-display", config.name],
];
const NAMES: [string, string, string][] = [
	["first name", config.firstName, b.names.notes.firstName],
	["handle", config.handle, b.names.notes.handle],
	["short handle", config.shortHandle, b.names.notes.shortHandle],
	["site", config.host, b.names.notes.site],
];
const BODY_CSS = `font-family: "dm sans", sans-serif;\nfont-size: 16px;\nline-height: 24px;\nfont-weight: 450;\n`;

const oklch = (hex: string) => {
	const [r, g, bl] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * bl);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * bl);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * bl);
	const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
	const C = Math.hypot(A, B);
	const H = C < 0.0005 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
	return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${H.toFixed(1)})`;
};

const Mark = (px: number) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 1 23 23" width={px} height={px} aria-hidden="true">
		<path fill-rule="evenodd" d={MARK} fill="currentColor" />
	</svg>
);

function BrandBody(this: { oklch: boolean; copied: string; logoMessage: string; colorMessage: string; typeMessage: string }) {
	this.oklch = false;
	this.copied = "";
	this.logoMessage = "";
	this.colorMessage = "";
	this.typeMessage = "";
	let timer: ReturnType<typeof setTimeout>;
	const done = (key: string, field: "logoMessage" | "colorMessage" | "typeMessage", message: string) => {
		clearTimeout(timer);
		this.copied = key;
		this[field] = message;
		play("success");
		timer = setTimeout(() => {
			this.copied = "";
			this[field] = "";
		}, 1600);
	};
	const fail = (field: "logoMessage" | "colorMessage" | "typeMessage") => {
		this[field] = "couldn't copy. try again.";
	};
	const copyLogo = (logo: (typeof LOGOS)[number]) =>
		copySvg(logo.href).then(
			() => done(logo.href, "logoMessage", `${logo.label} svg copied.`),
			() => fail("logoMessage"),
		);
	const copyText = (key: string, field: "colorMessage" | "typeMessage", text: string, message: string) =>
		navigator.clipboard.writeText(text).then(
			() => done(key, field, message),
			() => fail(field),
		);
	const value = (hex: string) => use(this.oklch).map((o) => (o ? oklch(hex) : hex));
	const CopyIcon = (key: string) => (
		<span class="brand-copy-icon" data-copied={use(this.copied).map((c) => c === key)}>
			{Icon("copy")}
			{Icon("check")}
		</span>
	);
	const format = (o: boolean) => {
		this.oklch = o;
	};

	return (
		<div class="page-content">
			<section data-intro="true" aria-labelledby="brand-logo-heading" class="page-section">
				<h2 id="brand-logo-heading">{b.logo.title}</h2>
				<p>{b.logo.text}</p>
				<ul class="page-list">
					{LOGOS.map((logo) => (
						<li class="brand-logo">
							<span class="brand-logo-preview" data-dark={logo.dark}>
								<img alt="" width="150" height="150" src={logo.href} />
							</span>
							<span class="brand-logo-copy">
								<span class="emphasis">{logo.label}</span>
								<span class="small muted">{logo.note}</span>
								<span class="small muted">
									{"svg · "}
									<code>{logo.color}</code>
								</span>
								<span class="brand-actions">
									<button type="button" class="brand-button sm" aria-label={`copy ${logo.label.toLowerCase()} svg`} on:click={() => copyLogo(logo)}>
										{CopyIcon(logo.href)}
										copy svg
									</button>
									<a class="brand-button sm" href={logo.href} download={logo.download} aria-label={`download ${logo.label.toLowerCase()} svg`}>
										{Icon("arrowDown")}
										download
									</a>
								</span>
							</span>
						</li>
					))}
				</ul>
				<output aria-live="polite" aria-atomic="true" class="brand-status">
					{use(this.logoMessage)}
				</output>
			</section>
			<section data-intro-group="true" aria-labelledby="brand-space-heading" class="page-section">
				<h2 id="brand-space-heading">{b.space.title}</h2>
				<div class="brand-space">
					<figure class="brand-space-figure">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -11.5 48 48" width="136" height="136" aria-hidden="true">
							<rect class="brand-space-zone" x="-11" y="-10.5" width="46" height="46" />
							<rect class="brand-space-bounds" x="0.5" y="1" width="23" height="23" />
							<path class="brand-space-measure" d="m-11 12.5h0.5" />
							<path fill-rule="evenodd" d={MARK} fill="currentColor" />
						</svg>
						<figcaption class="small muted">{b.space.caption}</figcaption>
					</figure>
					<figure class="brand-space-figure">
						<span class="brand-sizes">
							{[
								[48, "48px"],
								[24, "24px"],
								[16, "16px min"],
							].map(([px, label]) => (
								<span class="brand-size">
									{Mark(px as number)}
									<span class="small muted">{label as string}</span>
								</span>
							))}
						</span>
						<figcaption class="sr-only">the mark at three heights in pixels: 48, 24 and 16</figcaption>
					</figure>
				</div>
				<dl class="page-catalog">
					{b.space.rows.map((r) => (
						<div>
							<dt>{r.term}</dt>
							<dd>{r.text}</dd>
						</div>
					))}
				</dl>
			</section>
			<section data-intro-group="true" aria-labelledby="brand-colors-heading" class="page-section">
				<div class="brand-section-head">
					<h2 id="brand-colors-heading">{b.color.title}</h2>
					<fieldset class="brand-segmented">
						<legend class="sr-only">color format</legend>
						<button type="button" aria-pressed={use(this.oklch).map((o) => String(!o))} on:click={() => format(false)}>
							hex
						</button>
						<button type="button" aria-pressed={use(this.oklch).map(String)} on:click={() => format(true)}>
							oklch
						</button>
					</fieldset>
				</div>
				<p>{b.color.text}</p>
				<ul class="brand-colors">
					{COLORS.map(([name, token, note, light, dark]) => (
						<li class="brand-color">
							<span class="brand-color-copy">
								<span class="emphasis">{name}</span>
								<code class="small muted">{token}</code>
								<span class="small muted">{note}</span>
							</span>
							<span class="brand-color-values">
								{[
									["light", light],
									["dark", dark],
								].map(([mode, hex]) => {
									const key = `${name}-${mode}`;
									const text = value(hex);
									return (
										<button
											type="button"
											class="brand-color-value"
											aria-label={text.map((v) => `copy ${name.toLowerCase()}, ${mode.toLowerCase()} theme: ${v}`)}
											on:click={() => {
												const v = this.oklch ? oklch(hex) : hex;
												copyText(key, "colorMessage", v, `copied ${v}.`);
											}}
										>
											<span class="brand-chip" style={`background: ${hex}`} aria-hidden="true" />
											<span class="brand-color-mode">{mode}</span>
											<code class="brand-color-code">{text}</code>
											{CopyIcon(key)}
										</button>
									);
								})}
							</span>
						</li>
					))}
				</ul>
				<output aria-live="polite" aria-atomic="true" class="brand-status">
					{use(this.colorMessage)}
				</output>
				<p class="small muted">{b.color.note}</p>
			</section>
			<section data-intro-group="true" aria-labelledby="brand-type-heading" class="page-section">
				<h2 id="brand-type-heading">{b.type.title}</h2>
				<p>{b.type.text}</p>
				<dl class="brand-type">
					{TYPE.map(([name, spec, cls, sample]) => (
						<div>
							<dt>
								<span>{name}</span>
								<span class="small muted">{spec}</span>
							</dt>
							<dd class={cls}>{sample}</dd>
						</div>
					))}
				</dl>
				<p class="small muted">{b.type.note}</p>
				<div class="brand-actions">
					<button type="button" class="brand-button" aria-label="copy body text css" on:click={() => copyText("body-css", "typeMessage", BODY_CSS, "body css copied.")}>
						{CopyIcon("body-css")}
						{b.type.copy}
					</button>
					<output aria-live="polite" class="sr-only">
						{use(this.typeMessage)}
					</output>
					<a class="page-link brand-link" href={config.pages.font.about.link.href}>
						{config.pages.font.about.link.label}
						{Icon("arrowUpRight")}
					</a>
				</div>
			</section>
			<section data-intro-group="true" aria-labelledby="brand-name-heading" class="page-section">
				<h2 id="brand-name-heading">{b.names.title}</h2>
				<dl class="page-catalog brand-names">
					{NAMES.map(([term, name, note]) => (
						<div>
							<dt class="small muted">{term}</dt>
							<dd>
								<span class="brand-name">{name}</span>
								<span>{note}</span>
							</dd>
						</div>
					))}
				</dl>
				<p>{b.names.text}</p>
			</section>
			<section data-intro-group="true" aria-labelledby="brand-usage-heading" class="page-section">
				<h2 id="brand-usage-heading">{b.usage.title}</h2>
				<div class="brand-usage">
					{[
						["do", "check", b.usage.do],
						["don't", "x", b.usage.dont],
					].map(([title, icon, rules]) => (
						<div>
							<h3 class="small muted">{title as string}</h3>
							<ul>
								{(rules as string[]).map((rule) => (
									<li>
										{Icon(icon as "check" | "x")}
										{rule}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<p class="small muted">{b.usage.note}</p>
			</section>
			<section data-intro-group="true" aria-labelledby="brand-related-heading" class="page-section">
				<h2 id="brand-related-heading">{b.related.title}</h2>
				<ul class="page-list">
					{b.related.items.map((item) => (
						<li>
							<a class="page-row" href={item.href}>
								<span class="page-row-copy">
									<span class="page-row-title">{(config.pages as any)[item.href.slice(1)].title}</span>
									<span class="page-row-description">{item.text}</span>
								</span>
							</a>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}

BrandBody.style = css`
	h2,
	.emphasis {
		font-weight: var(--weight-emphasis);
	}
	code {
		font-family: var(--font-mono);
		font-feature-settings: var(--font-mono-features);
	}
	.muted {
		color: var(--muted-foreground);
	}
	.small {
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
	}
	.title {
		font-weight: var(--weight-title);
		letter-spacing: var(--tracking-title);
	}
	.mono {
		font-family: var(--font-mono);
		font-feature-settings: var(--font-mono-features);
		font-weight: 400;
	}
	.brand-status {
		display: block;
		min-height: 16px;
		color: var(--muted-foreground);
		font-size: var(--type-small);
	}
	.brand-copy-icon {
		display: inline-grid;
		flex-shrink: 0;
		width: 16px;
		height: 16px;
	}
	.brand-copy-icon > svg {
		grid-area: 1 / 1;
		transition:
			opacity var(--control-duration) var(--control-ease),
			scale var(--control-duration) var(--control-ease);
	}
	.brand-copy-icon > svg:last-child,
	.brand-copy-icon[data-copied] > svg:first-child {
		opacity: 0;
		scale: 0.75;
	}
	.brand-copy-icon[data-copied] > svg:last-child {
		opacity: 1;
		scale: 1;
	}
	.brand-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
	}
	.brand-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
		padding-inline: 16px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--foreground);
		font-size: var(--type-small);
		outline: var(--focus-width) solid transparent;
		outline-offset: var(--focus-offset);
		transition:
			border-color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.brand-button.sm {
		padding-inline: 8px;
		font-weight: var(--weight-secondary);
		line-height: var(--type-small-leading);
	}
	.brand-button:hover {
		border-color: color-mix(in oklch, var(--foreground) 25%, transparent);
	}
	.brand-button:focus-visible,
	.brand-color-value:focus-visible,
	.brand-segmented button:focus-visible {
		outline-color: var(--ring);
	}
	.brand-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 48px;
	}
	.brand-logo {
		display: grid;
		grid-template-columns: 96px minmax(0, 1fr);
		align-items: center;
		gap: 24px;
		padding-block: 16px;
	}
	.brand-logo-copy {
		display: grid;
		gap: 4px;
		min-width: 0;
	}
	.brand-logo-copy .brand-actions {
		margin-top: 8px;
	}
	.brand-logo-preview {
		display: grid;
		height: 96px;
		overflow: hidden;
		border-radius: var(--radius-md);
		background: var(--color-neutral-50);
		box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--foreground) 8%, transparent);
	}
	.brand-logo-preview[data-dark] {
		background: var(--color-neutral-950);
	}
	.brand-logo-preview img {
		place-self: center;
		width: 48px;
		height: auto;
	}
	.brand-space {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 16px;
	}
	.brand-space-figure {
		display: grid;
		align-content: end;
		justify-items: center;
		gap: 8px;
		margin: 0;
		padding: 16px;
		border-radius: var(--radius-md);
		background: var(--card);
		box-shadow: inset 0 0 0 1px var(--border);
	}
	.brand-space-figure svg {
		overflow: visible;
		color: var(--brand-b);
	}
	.brand-space-figure :global(:is(.brand-space-zone, .brand-space-bounds, .brand-space-measure)) {
		fill: none;
		stroke-width: 1px;
		vector-effect: non-scaling-stroke;
	}
	.brand-space-figure :global(.brand-space-zone) {
		stroke: var(--muted-foreground);
		stroke-dasharray: 4 4;
	}
	.brand-space-figure :global(.brand-space-bounds) {
		stroke: var(--border);
	}
	.brand-space-figure :global(.brand-space-measure) {
		stroke: var(--muted-foreground);
	}
	.brand-sizes {
		display: flex;
		align-items: flex-end;
		justify-content: center;
		gap: 32px;
		height: 100%;
	}
	.brand-size {
		display: grid;
		justify-items: center;
		gap: 8px;
	}
	.brand-section-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 24px;
	}
	.brand-segmented {
		display: inline-flex;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius-md);
		box-shadow: inset 0 0 0 1px var(--border);
	}
	.brand-segmented button {
		min-width: 64px;
		min-height: 48px;
		padding-inline: 16px;
		border-radius: var(--radius-md);
		color: var(--muted-foreground);
		font-size: var(--type-small);
		outline: var(--focus-width) solid transparent;
		outline-offset: var(--focus-offset);
		transition:
			color var(--control-duration) var(--control-ease),
			background-color var(--control-duration) var(--control-ease),
			box-shadow var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.brand-segmented button:hover,
	.brand-segmented button[aria-pressed="true"] {
		color: var(--foreground);
	}
	.brand-segmented button[aria-pressed="true"] {
		background: var(--muted);
		box-shadow: inset 0 0 0 1px var(--border);
		font-weight: var(--weight-emphasis);
	}
	.brand-colors > li {
		border-bottom: 1px solid var(--border);
	}
	.brand-color,
	.brand-type > div {
		display: grid;
		grid-template-columns: minmax(0, 9rem) minmax(0, 1fr);
		align-items: center;
		gap: 8px 24px;
		padding-block: 16px;
	}
	.brand-color-copy {
		display: grid;
		gap: 4px;
		min-width: 0;
	}
	.brand-color-values {
		display: grid;
	}
	.brand-color-value {
		display: grid;
		grid-template-columns: 24px 40px minmax(0, 1fr) 16px;
		align-items: center;
		gap: 8px;
		min-height: 48px;
		padding-inline: 8px;
		border-radius: var(--radius-md);
		text-align: start;
		outline: var(--focus-width) solid transparent;
		outline-offset: var(--focus-offset);
		transition:
			background-color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.brand-color-value:hover {
		background: var(--muted);
	}
	.brand-color-value .brand-copy-icon {
		color: var(--muted-foreground);
		opacity: 0;
		transition: opacity var(--control-duration) var(--control-ease);
	}
	.brand-color-value:is(:hover, :focus-visible) .brand-copy-icon,
	.brand-color-value .brand-copy-icon[data-copied] {
		opacity: 1;
	}
	.brand-chip {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm);
		box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--foreground) 16%, transparent);
	}
	.brand-color-mode {
		color: var(--muted-foreground);
		font-size: var(--type-small);
	}
	.brand-color-code {
		overflow: hidden;
		font-size: var(--type-small);
		font-variant-numeric: tabular-nums;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.brand-type > div {
		border-bottom: 1px solid var(--border);
	}
	.brand-type dt {
		display: grid;
		gap: 4px;
	}
	.brand-type dd {
		min-width: 0;
	}
	.brand-display {
		font-family: var(--font-serif);
		font-size: 32px;
		font-weight: var(--weight-serif);
		line-height: 1.2;
		letter-spacing: 0;
	}
	.brand-names dd {
		display: grid;
		gap: 4px;
	}
	.brand-name {
		color: var(--foreground);
		font-size: var(--type-body);
	}
	.brand-usage {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 24px;
	}
	.brand-usage ul {
		display: grid;
		margin-top: 8px;
	}
	.brand-usage li {
		display: grid;
		grid-template-columns: 16px minmax(0, 1fr);
		gap: 8px;
		padding-block: 8px;
		border-bottom: 1px solid var(--border);
	}
	.brand-usage li > svg {
		margin-top: 2px;
		color: var(--muted-foreground);
	}
	@media (max-width: 34rem) {
		.brand-color,
		.brand-type > div,
		.brand-usage,
		.brand-space {
			grid-template-columns: minmax(0, 1fr);
		}
		.brand-logo {
			grid-template-columns: 72px minmax(0, 1fr);
			gap: 16px;
		}
		.brand-logo-preview {
			height: 72px;
		}
	}
	:global(.reduce-motion) .brand-copy-icon > svg {
		transition: none;
	}
`;

export const Brand = () => (
	<Page title={b.title} description={b.description}>
		<BrandBody />
	</Page>
);

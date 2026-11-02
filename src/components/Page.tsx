import { css } from "dreamland/core";
import { Icon } from "../icons";
import { Preferences } from "./Preferences";

export const SharedTitle = (title: string, name?: string) =>
	name ? (
		<span class="shared-title" style={`view-transition-name: ${name}; view-transition-class: page-title`}>
			{title}
		</span>
	) : (
		title
	);

export function Page(this: { title: string; description?: string; vt?: string; intro?: HTMLElement; mono?: boolean; current?: boolean }, cx: any) {
	return (
		<div class:mono={!!this.mono} data-page-intro="pending">
			<header class="page-header">
				<a data-intro="true" class="experience-toggle page-back" aria-label="back home" title="back home" href="/">
					{Icon("arrowLeft")}
				</a>
				<Preferences />
			</header>
			<main id="main-content" tabindex="-1" class="page-main">
				{this.intro || (
					<div class="page-intro">
						<h1 data-intro="true" class="page-title">
							{SharedTitle(this.title, this.vt)}
						</h1>
						{this.description ? (
							<p data-intro="true" class="page-description">
								{this.description}
							</p>
						) : null}
					</div>
				)}
				{cx.children}
			</main>
			<footer data-intro="true" class="page-footer">
				<nav aria-label="site navigation" class="site-nav">
					<a class="home-link" data-tall="" href="/sitemap" aria-current={this.current ? "page" : undefined}>
						sitemap
					</a>
				</nav>
			</footer>
		</div>
	);
}

Page.style = css`
	:scope {
		--page-ui-duration: var(--control-duration);
		--page-ease: var(--control-ease);
		display: grid;
		grid-template-columns: 1fr min(var(--page-width), 100%) 1fr;
		grid-template-rows: auto 1fr auto;
		min-height: 100svh;
		padding-inline: var(--page-gutter);
		padding-top: var(--site-top-offset);
		font-size: var(--type-body);
		line-height: var(--type-body-leading);
	}
	:scope > * {
		grid-column-start: 2;
		min-width: 0;
	}
	.page-header {
		z-index: var(--z-header);
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: 1rem;
	}
	.experience-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		margin-left: -14px;
		border-radius: 50%;
		color: var(--muted-foreground);
		transition:
			color var(--control-duration) var(--control-ease),
			background-color var(--control-duration) var(--control-ease),
			transform var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.experience-toggle:hover,
	.experience-toggle:focus-visible {
		color: var(--foreground);
		background: var(--hover-fill);
	}
	.experience-toggle:focus-visible {
		outline: var(--focus-width) solid var(--ring);
		outline-offset: calc(var(--focus-width) * -1);
	}
	.experience-toggle:active {
		transform: scale(0.96);
	}
	.page-main {
		display: flex;
		flex-direction: column;
		gap: var(--page-section-gap);
		padding-block: 1.5rem 3rem;
	}
	.page-intro {
		display: grid;
		gap: var(--page-title-gap);
	}
	.page-title {
		font-weight: var(--weight-title);
		letter-spacing: var(--tracking-title);
	}
	:scope :global(.shared-title) {
		display: inline-block;
		vertical-align: top;
		width: fit-content;
		max-width: 100%;
	}
	.page-description {
		white-space: pre-line;
		text-wrap: pretty;
		color: var(--muted-foreground);
	}
	.page-footer {
		display: grid;
		gap: var(--page-title-gap);
		padding-block: 1.5rem;
		color: var(--muted-foreground);
	}
	.site-nav {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1.5rem;
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
	}
	.home-link {
		display: inline-flex;
		align-items: center;
		min-width: var(--target);
		min-height: var(--target);
	}
	:scope :global(:is(.page-link, .home-link, .page-row, .page-prose a)) {
		outline: var(--focus-width) solid transparent;
		outline-offset: var(--focus-offset);
		transition:
			color var(--page-ui-duration) var(--page-ease),
			text-decoration-color var(--page-ui-duration) var(--page-ease),
			var(--focus-transition);
	}
	:scope :global(:is(.page-link, .home-link, .page-prose a)) {
		color: var(--link);
		text-decoration-line: underline;
		text-decoration-color: color-mix(in oklch, var(--link) 35%, transparent);
	}
	:scope :global(:is(.page-link, .home-link, .page-prose a):is(:hover, :focus-visible)) {
		color: var(--link);
		text-decoration-color: var(--link);
	}
	:scope a.home-link[aria-current="page"] {
		color: var(--foreground);
	}
	:scope :global(:is(.page-link, .home-link, .page-row, .page-prose a):focus-visible) {
		outline-color: var(--ring);
	}
	:scope :global(.page-content) {
		display: flex;
		flex-direction: column;
		gap: var(--page-section-gap);
	}
	:scope :global(.page-section) {
		display: block;
	}
	:scope :global(.page-section > * + *) {
		margin-top: var(--page-heading-gap);
	}
	:scope :global(.page-section > p + p) {
		margin-top: var(--page-paragraph-gap);
	}
	:scope :global(.page-prose) {
		overflow-wrap: anywhere;
	}
	:scope :global(.page-prose > * + *) {
		margin-top: var(--page-paragraph-gap);
	}
	:scope :global(.page-prose :is(h1, h2, h3, h4, h5, h6)) {
		margin-top: var(--page-section-gap);
		scroll-margin-top: 4rem;
		font-weight: var(--weight-emphasis);
		letter-spacing: var(--tracking-title);
	}
	:scope :global(.page-prose > :first-child) {
		margin-top: 0;
	}
	:scope :global(.page-prose :is(h1, h2, h3, h4, h5, h6) + *) {
		margin-top: var(--page-heading-gap);
	}
	:scope :global(.page-meta) {
		display: grid;
		gap: var(--page-title-gap);
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
		color: var(--muted-foreground);
	}
	:scope :global(.page-list > li + li) {
		border-top: 1px solid var(--border);
	}
	:scope :global(.page-row) {
		display: block;
		min-height: var(--target);
		padding-block: 1rem;
	}
	:scope :global(.page-row-copy) {
		display: grid;
		gap: var(--page-row-gap);
	}
	:scope :global(.page-row-title) {
		font-weight: var(--weight-title);
		color: var(--link);
		letter-spacing: var(--tracking-title);
		text-decoration-line: underline;
		text-decoration-color: transparent;
		transition: text-decoration-color var(--page-ui-duration) var(--page-ease);
	}
	:scope :global(.page-row:is(:hover, :focus-visible) .page-row-title) {
		text-decoration-color: var(--link);
	}
	:scope :global(:is(.page-row-description, .page-row-meta)) {
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
		text-wrap: pretty;
		color: var(--muted-foreground);
	}
	:scope :global(.page-row-description) {
		white-space: pre-line;
	}
	:scope :global(.page-catalog > div) {
		display: grid;
		grid-template-columns: minmax(0, 9rem) minmax(0, 1fr);
		align-items: center;
		column-gap: 1.5rem;
		row-gap: var(--page-title-gap);
		padding-block: 1rem;
		border-bottom: 1px solid var(--border);
	}
	:scope :global(.page-catalog dd) {
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
		color: var(--muted-foreground);
	}
	:scope :global(.page-controls) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		column-gap: 1.5rem;
		row-gap: 1rem;
	}
	:scope.mono {
		font-family: var(--font-mono);
		font-feature-settings: var(--font-mono-features);
		font-weight: 400;
	}
	@media (min-width: 40rem) {
		:scope {
			--page-gutter: 2rem;
		}
	}
	@media (max-width: 39.999rem) {
		:scope :global(.page-catalog > div) {
			grid-template-columns: 1fr;
		}
	}
	:global(.reduce-motion) :scope {
		--page-ui-duration: 0s;
	}
	:global(.reduce-motion) .experience-toggle {
		transition: none;
	}
	:global(.reduce-motion) .experience-toggle:active {
		transform: none;
	}
`;

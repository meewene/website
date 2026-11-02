import { css } from "dreamland/core";
import config from "../site.config";
import { posts } from "../content";
import { FooterNote } from "../components/FooterNote";
import { Logo } from "../components/Logo";
import { Preferences } from "../components/Preferences";
import { SharedTitle } from "../components/Page";

function HoverList(this: { box: HTMLElement }, cx: any) {
	const move = (target: EventTarget | null) => {
		const li = target instanceof Element ? target.closest("li") : null;
		if (!li || !this.box.contains(li)) return;
		this.box.style.setProperty("--highlight-y", `${li.offsetTop}px`);
		this.box.style.setProperty("--highlight-height", `${li.offsetHeight}px`);
		this.box.setAttribute("data-active", "");
	};
	const leave = () => this.box.removeAttribute("data-active");
	return (
		<div
			class="hover-list"
			this={use(this.box)}
			on:pointerover={(e: PointerEvent) => e.pointerType === "mouse" && move(e.target)}
			on:pointerleave={leave}
			on:focusin={(e: FocusEvent) => move(e.target)}
			on:focusout={(e: FocusEvent) => !this.box.contains(e.relatedTarget as Node) && leave()}
		>
			<span class="hover-list-highlight" aria-hidden="true" />
			{cx.children}
		</div>
	);
}

HoverList.style = css`
	:scope {
		position: relative;
	}
	.hover-list-highlight {
		position: absolute;
		top: 0;
		inset-inline: -16px;
		height: var(--highlight-height, 0px);
		translate: 0 var(--highlight-y, 0px);
		border-radius: var(--radius-md);
		background: var(--hover-fill);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity var(--micro-duration) var(--control-ease),
			scale var(--micro-duration) var(--control-ease);
	}
	:scope[data-active] .hover-list-highlight {
		transition:
			opacity var(--micro-duration) var(--control-ease),
			scale var(--micro-duration) var(--control-ease),
			translate var(--control-duration) var(--control-ease),
			height var(--control-duration) var(--control-ease);
	}
	@media (hover: hover) and (pointer: fine) {
		:scope[data-active] .hover-list-highlight {
			opacity: 1;
		}
	}
	:scope[data-active]:has(:focus-visible) .hover-list-highlight {
		opacity: 1;
	}
	:scope:has(a:active) .hover-list-highlight {
		scale: 0.985;
	}
	:global(.reduce-motion) .hover-list-highlight,
	:global(.reduce-motion) :scope[data-active] .hover-list-highlight {
		transition: opacity 0.2s var(--control-ease);
	}
	:global(.reduce-motion) :scope:has(a:active) .hover-list-highlight {
		scale: none;
	}
`;

export function Home() {
	return (
		<div class="home-page" data-page-intro="pending">
			<header class="home-header">
				<div class="header-row">
					<div data-intro="true">
						<Logo />
					</div>
					<Preferences />
				</div>
			</header>
			<main id="main-content" tabindex="-1" class="home-main">
				<div class="home-bio">
					<div data-intro="true">
						<img class="character" src="/character.png" alt="" width="160" height="206" />
					</div>
					<div class="bio-copy">
						<h1 data-intro="true" class="name">
							{config.name}
						</h1>
						<p data-intro="true">{config.bio}</p>
						<p data-intro="true">
							<a class="home-link" href="/about">
								{config.home.moreAbout}
							</a>
						</p>
					</div>
				</div>
				<section aria-labelledby="selected-work-heading" class="home-section">
					<h2 data-intro="true" id="selected-work-heading" class="home-section-title">
						work
					</h2>
					<div class="home-section-content">
						<HoverList>
							<ul class="home-work-list">
								{config.home.work.map((w) => (
									<li data-intro="true">
										<a class="home-work-link" href={w.href}>
											<span class="work-copy">
												<span class="home-work-title">{w.title}</span>
												<span class="muted">{w.description}</span>
											</span>
										</a>
									</li>
								))}
							</ul>
						</HoverList>
					</div>
				</section>
				<section aria-labelledby="blog-heading" class="home-section">
					<h2 data-intro="true" id="blog-heading" class="home-section-title">
						blog
					</h2>
					<div class="home-section-content">
						<HoverList>
							<ul class="home-work-list">
								{posts.slice(0, 3).map((p) => (
									<li data-intro="true">
										<a class="home-work-link" href={`/blog/${p.slug}`}>
											<span class="work-copy">
												<span class="home-work-title">{SharedTitle(p.title, `title-post-${p.slug}`)}</span>
												<time datetime={p.date} class="muted">
													{p.dateLabel}
												</time>
											</span>
										</a>
									</li>
								))}
							</ul>
						</HoverList>
						<a data-intro="true" class="home-link tall" data-tall="" href="/blog">
							all posts
						</a>
					</div>
				</section>
				<section aria-labelledby="contact-heading" class="home-section">
					<h2 data-intro="true" id="contact-heading" class="home-section-title">
						get in touch
					</h2>
					<div class="home-section-content">
						<div data-intro="true">
							<a class="home-link tall" data-tall="" href="/contact">
								say hello
							</a>
						</div>
						<p data-intro="true" class="muted">
							{config.home.contact}
						</p>
					</div>
				</section>
			</main>
			<footer class="home-footer">
				<div class="footer-inner">
					<FooterNote />
				</div>
			</footer>
		</div>
	);
}

Home.style = css`
	:scope {
		--page-column: 34.375rem;
		--viewport-padding: 1.5rem;
		display: grid;
		grid-template-columns: 1fr min(var(--page-column), 100%) 1fr;
		grid-template-rows: auto 1fr;
		min-height: 100svh;
		padding-inline: var(--viewport-padding);
		padding-top: var(--site-top-offset);
	}
	:scope > * {
		grid-column: 2;
	}
	.home-header {
		position: relative;
		z-index: var(--z-header);
	}
	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-block: 1rem;
	}
	.home-main {
		display: flex;
		flex-direction: column;
		gap: 3.5rem;
		padding-block: 1.5rem 3rem;
	}
	.home-bio {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		column-gap: clamp(1.25rem, 6vw, 3rem);
		margin-bottom: -2rem;
	}
	.bio-copy {
		display: grid;
		gap: 1rem;
		text-wrap: pretty;
	}
	.character {
		display: block;
		width: clamp(5rem, 28vw, 10rem);
		height: auto;
	}
	.name {
		font-weight: var(--weight-title);
	}
	.home-section {
		display: grid;
		grid-template-columns: 8rem minmax(0, 1fr);
		align-items: baseline;
		column-gap: 1.5rem;
	}
	.home-section-content {
		min-width: 0;
	}
	.home-section-title {
		padding-block: 16px;
		color: var(--muted-foreground);
		font-weight: var(--weight-secondary);
	}
	.home-work-list {
		position: relative;
	}
	.home-work-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		min-height: var(--target);
		padding-block: 16px;
		border-radius: var(--radius-md);
		transition:
			color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.home-work-link:focus-visible {
		outline: var(--focus-width) solid var(--ring);
		outline-offset: var(--focus-offset);
	}
	@media (hover: hover) and (pointer: fine) {
		.home-work-link:hover {
			color: var(--link);
		}
	}
	.work-copy {
		display: block;
		min-width: 0;
	}
	.work-copy > * {
		display: block;
	}
	.work-copy > * + * {
		margin-top: 0.5rem;
	}
	.home-work-title {
		color: var(--link);
		font-weight: var(--weight-title);
	}
	.home-work-title :global(.shared-title) {
		display: inline-block;
		vertical-align: top;
		width: fit-content;
		max-width: 100%;
		color: var(--link);
		font-weight: var(--weight-title);
	}
	.muted {
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
		color: var(--muted-foreground);
	}
	.home-link {
		color: var(--link);
		text-decoration-line: underline;
		text-decoration-color: color-mix(in oklch, var(--link) 35%, transparent);
		transition:
			color var(--control-duration) var(--control-ease),
			text-decoration-color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.home-link:is(:hover, :focus-visible) {
		color: var(--link);
		text-decoration-color: var(--link);
	}
	.home-link:focus-visible {
		outline: var(--focus-width) solid var(--ring);
		outline-offset: var(--focus-offset);
	}
	.tall {
		display: inline-flex;
		align-items: center;
		min-height: var(--target);
	}
	.home-footer {
		grid-column: 1 / -1;
		margin-inline: calc(var(--viewport-padding) * -1);
	}
	.footer-inner {
		width: min(var(--page-column), calc(100% - var(--viewport-padding) * 2));
		margin-inline: auto;
		padding-block: 24px;
	}
	@media (min-width: 40rem) {
		:scope {
			--viewport-padding: 2rem;
		}
		.home-main {
			gap: 4rem;
		}
	}
	@media (max-width: 30rem) {
		.home-section {
			grid-template-columns: 1fr;
		}
		.home-section-title {
			padding-bottom: 0.5rem;
		}
	}
	:global(.reduce-motion) .home-link,
	:global(.reduce-motion) .home-work-link {
		transition: none;
	}
`;

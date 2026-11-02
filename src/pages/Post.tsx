import { css } from "dreamland/core";
import config from "../site.config";
import type { Post as Info } from "../content";
import { Icon } from "../icons";
import { Page, SharedTitle } from "../components/Page";

function Contents(this: { post: Info; desktop: boolean }, cx: any) {
	const post = this.post;
	cx.mount = () => {
		if (!this.desktop) return;
		const nav = cx.root as HTMLElement;
		const links = [...nav.querySelectorAll<HTMLAnchorElement>(".article-contents-link")];
		const update = () => {
			if (!nav.isConnected) return removeEventListener("scroll", update);
			const title = document.getElementById("article-title");
			nav.dataset.scrolled = String(!!title && title.getBoundingClientRect().bottom < 0);
			let active = -1;
			links.forEach((a, i) => {
				const h = document.getElementById(a.hash.slice(1));
				if (h && h.getBoundingClientRect().top < innerHeight * 0.3) active = i;
			});
			links.forEach((a, i) => (i === active ? a.setAttribute("aria-current", "location") : a.removeAttribute("aria-current")));
		};
		addEventListener("scroll", update, { passive: true });
		requestAnimationFrame(update);
	};
	return (
		<nav data-intro="true" class={`article-contents ${this.desktop ? "desktop" : "mobile"}`} aria-label="on this page" data-scrolled="false">
			{this.desktop ? (
				<a href="#main-content" class="article-contents-title" tabindex="-1">
					{post.title}
				</a>
			) : (
				<h2 class="bold">on this page</h2>
			)}
			<ol>
				{post.headings.map((h) => (
					<li>
						<a href={`#${h.id}`} class="article-contents-link">
							<span class="article-contents-text">{h.text}</span>
						</a>
					</li>
				))}
			</ol>
		</nav>
	);
}

function Article(this: { post: Info }) {
	return (
		<article id="article" aria-labelledby="article-title">
			<div class="article-body">
				<div data-intro-group="true" class="blog-prose page-prose" attr:innerHTML={this.post.html} />
			</div>
			<footer data-intro="true" class="article-signoff">
				<p>{config.name}</p>
				<a class="home-link article-back" href="/blog">
					{Icon("arrowLeft")}
					all posts
				</a>
			</footer>
		</article>
	);
}

export const Post = (post: Info) => (
	<Page
		title={post.title}
		intro={
			<div class="page-intro">
				<h1 id="article-title" data-intro="true" class="page-title">
					{SharedTitle(post.title, `title-post-${post.slug}`)}
				</h1>
				{post.headings.length ? <Contents post={post} desktop={true} /> : null}
				{post.headings.length ? <Contents post={post} desktop={false} /> : null}
				<p data-intro="true" class="page-description">
					{post.description}
				</p>
				<div data-intro="true" class="page-meta">
					<p>
						<time datetime={post.date}>{post.dateLabel}</time>
						<span aria-hidden="true"> · </span>
						{post.minutes} min read
					</p>
				</div>
			</div>
		}
	>
		<Article post={post} />
	</Page>
);

Contents.style = css`
	.article-contents {
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
		color: var(--muted-foreground);
	}
	.desktop {
		display: none;
	}
	.mobile {
		margin-block: 0.5rem;
		padding-block: 1rem;
		border-block: 1px solid var(--border);
	}
	.bold {
		font-weight: 700;
	}
	ol {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.article-contents-link {
		display: block;
		text-decoration: none;
		transition: color 0.1s var(--control-ease);
	}
	.mobile .article-contents-link {
		display: flex;
		align-items: center;
		min-height: var(--target);
	}
	.article-contents-link:is(:hover, :focus-visible, [aria-current="location"]) {
		color: var(--foreground);
	}
	.article-contents-link:focus-visible,
	.article-contents-title:focus-visible {
		outline: var(--focus-width) solid var(--ring);
		outline-offset: 4px;
	}
	.article-contents-text {
		display: block;
	}
	.article-contents-title {
		display: block;
		padding-bottom: 1rem;
		color: var(--muted-foreground);
		text-align: left;
		opacity: 0;
		pointer-events: none;
		transition:
			color 0.4s var(--control-ease),
			opacity 0.4s var(--control-ease);
	}
	.article-contents-title:is(:hover, :focus-visible) {
		color: var(--foreground);
	}
	.article-contents[data-scrolled="true"] .article-contents-title {
		opacity: 1;
		pointer-events: auto;
	}
	@media (min-width: 67.5rem) {
		.desktop {
			position: fixed;
			top: 8.625rem;
			left: 5rem;
			display: block;
			max-width: 10rem;
		}
		.mobile {
			display: none;
		}
	}
	:global(.reduce-motion) .article-contents-link {
		transition: none;
	}
`;

Article.style = css`
	.article-body > * + * {
		margin-top: var(--page-paragraph-gap);
	}
	.blog-prose {
		position: relative;
	}
	.blog-prose :global(:is(ul, ol)) {
		padding-left: 1.5rem;
	}
	.blog-prose :global(ul) {
		list-style: outside;
	}
	.blog-prose :global(ol) {
		list-style: decimal;
	}
	.blog-prose :global(li + li) {
		margin-top: 0.5rem;
	}
	.blog-prose :global(blockquote) {
		padding-left: 1rem;
		border-left: 2px solid var(--border);
		font-family: var(--font-serif);
		font-weight: var(--weight-serif);
		letter-spacing: 0;
		color: var(--muted-foreground);
	}
	.blog-prose :global(blockquote :is(strong, b)) {
		font-weight: var(--weight-serif);
		color: var(--foreground);
	}
	.blog-prose :global(pre) {
		padding: 1rem;
		overflow-x: auto;
		background: var(--muted);
	}
	.blog-prose :global(code) {
		font-size: 0.875em;
	}
	.blog-prose :global(figure) {
		margin-block: 2.5rem;
	}
	.blog-prose :global(figure img) {
		display: block;
		width: min(100%, 26rem);
		height: auto;
		margin-inline: auto;
		aspect-ratio: auto 3 / 2;
		object-fit: contain;
	}
	.blog-prose :global(figcaption) {
		margin-top: 1rem;
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
		color: var(--muted-foreground);
		text-align: center;
		text-wrap: pretty;
	}
	.article-signoff {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 3rem;
		padding-block: 1.5rem;
		border-top: 1px solid var(--border);
		font-size: var(--type-small);
	}
	.article-back {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: var(--target);
		font-size: var(--type-small);
		color: var(--muted-foreground);
	}
	:global(html:not(.reduce-motion):has(#article)) {
		scroll-behavior: smooth;
	}
`;

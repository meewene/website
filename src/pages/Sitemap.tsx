import { css } from "dreamland/core";
import config from "../site.config";
import { routes } from "../routes";
import { Page } from "../components/Page";

function Tree() {
	const top = routes.filter((r) => r.path !== "/" && r.path.split("/").length === 2);
	const children = (path: string) => routes.filter((r) => r.path.startsWith(path + "/"));
	const leaf = (path: string) => path.split("/").pop();
	return (
		<nav aria-label="all pages">
			<a data-intro="tree-root" data-intro-delay="130" class="link" title="home" href="/">
				{config.host}/
			</a>
			<ul class="branches">
				{top.map((r, i) => {
					const kids = children(r.path);
					const delay = Math.min(404, 180 + 32 * i);
					return (
						<li class="branch">
							<a data-intro="tree-branch" data-intro-delay={String(delay)} class="link" title={r.name} href={r.path} aria-current={r.path === "/sitemap" ? "page" : undefined}>
								{leaf(r.path) + (kids.length ? "/" : "")}
							</a>
							{kids.length ? (
								<ul class="branches">
									{kids.map((k, j) => (
										<li class="branch">
											<a data-intro="tree-leaf" data-intro-delay={String(delay + 70 + 24 * j)} class="link" title={k.name} href={k.path}>
												{leaf(k.path)}
											</a>
										</li>
									))}
								</ul>
							) : null}
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

Tree.style = css`
	:scope {
		--tree-indent: 3ch;
		--tree-junction: 24px;
		--sitemap-hover: var(--color-blue-800);
		color: var(--primary);
		letter-spacing: 0;
		line-height: 20px;
	}
	:global(.dark) :scope {
		--sitemap-hover: var(--color-blue-300);
	}
	.branches {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.branch {
		position: relative;
		padding-left: var(--tree-indent);
	}
	.branch::before,
	.branch::after {
		content: "";
		position: absolute;
		left: 0;
		pointer-events: none;
	}
	.branch::before {
		top: 0;
		bottom: 0;
		border-left: 1px solid;
	}
	.branch:last-child::before {
		bottom: auto;
		height: var(--tree-junction);
	}
	.branch::after {
		top: var(--tree-junction);
		width: calc(var(--tree-indent) - 0.75ch);
		border-top: 1px solid;
	}
	.link {
		display: flex;
		align-items: center;
		width: fit-content;
		min-width: 48px;
		max-width: 100%;
		min-height: 48px;
		padding-block: 8px;
		overflow-wrap: anywhere;
		text-decoration: underline transparent;
		transition:
			color var(--control-duration) var(--control-ease),
			text-decoration-color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.link:is(:hover, :focus-visible) {
		color: var(--sitemap-hover);
		text-decoration-color: currentColor;
	}
`;

export const Sitemap = () => (
	<Page title={config.pages.sitemap.title} description={config.pages.sitemap.description} mono={true} current={true}>
		<Tree />
	</Page>
);

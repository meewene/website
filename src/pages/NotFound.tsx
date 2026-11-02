import { css } from "dreamland/core";
import config from "../site.config";
import { Page } from "../components/Page";

function Lost(this: { path: HTMLElement }, cx: any) {
	cx.mount = () => {
		this.path.firstChild!.nextSibling!.textContent = location.pathname;
		requestAnimationFrame(() => this.path.setAttribute("data-ready", ""));
	};
	return (
			<div class="page-content">
				<p data-intro="true" class="lost-route">
					<span class="host">{config.host}</span>
					<del class="lost-route-path" this={use(this.path)}>
						<span class="sr-only">missing address: </span>/
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
							<path d="M1 7 C 25 4, 60 9, 99 5" pathLength="1" />
						</svg>
					</del>
				</p>
				<section data-intro-group="true" class="page-section" aria-labelledby="lost-suggestions">
					<h2 id="lost-suggestions" data-intro="true" class="bold">
						elsewhere
					</h2>
					<ul class="page-list">
						{[
							["/", "home"],
							["/blog", "blog"],
							["/sitemap", "sitemap"],
						].map(([href, label]) => (
							<li data-intro="true">
								<a class="page-row" href={href}>
									<span class="page-row-title">{label}</span>
								</a>
							</li>
						))}
					</ul>
				</section>
			</div>
	);
}

export const NotFound = () => (
	<Page title={config.pages.notFound.title} description={config.pages.notFound.description}>
		<Lost />
	</Page>
);

Lost.style = css`
	.lost-route {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		min-width: 0;
	}
	.host {
		color: var(--muted-foreground);
	}
	.lost-route-path {
		position: relative;
		min-width: 0;
		overflow-wrap: anywhere;
		color: var(--foreground);
		text-decoration-line: none;
	}
	.lost-route-path svg {
		position: absolute;
		top: 50%;
		inset-inline: 0;
		width: 100%;
		height: 0.75rem;
		translate: 0 -50%;
		overflow: visible;
		color: var(--primary);
		pointer-events: none;
	}
	.lost-route-path :global(path) {
		fill: none;
		stroke: currentColor;
		stroke-width: 2px;
		stroke-linecap: round;
		vector-effect: non-scaling-stroke;
		stroke-dasharray: 1;
		stroke-dashoffset: 1px;
	}
	.lost-route-path[data-ready] :global(path) {
		stroke-dashoffset: 0;
		transition: stroke-dashoffset 0.48s var(--control-ease) 0.4s;
	}
	.bold {
		font-weight: 700;
	}
	:global(.reduce-motion) .lost-route-path[data-ready] :global(path) {
		transition: none;
	}
`;

import config from "../site.config";
import { posts } from "../content";
import { Page, SharedTitle } from "../components/Page";

export function Blog() {
	const { title, description } = config.pages.blog;
	return (
		<Page title={title} description={description}>
			<section class="page-section" aria-label="essays">
				<ul class="page-list">
					{posts.map((p) => (
						<li data-intro="true">
							<a class="page-row" href={`/blog/${p.slug}`}>
								<div class="page-row-copy">
									<h2 class="page-row-title">{SharedTitle(p.title, `title-post-${p.slug}`)}</h2>
									<p class="page-row-description">{p.description}</p>
									<div class="page-row-meta">
										<time datetime={p.date}>
											{p.dateLabel}
										</time>
										<span aria-hidden="true"> · </span>
										{p.minutes} min read
									</div>
								</div>
							</a>
						</li>
					))}
				</ul>
			</section>
		</Page>
	);
}

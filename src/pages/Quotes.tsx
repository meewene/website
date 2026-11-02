import { css } from "dreamland/core";
import config from "../site.config";
import { Page } from "../components/Page";

function QuoteList() {
	return (
		<ul>
			{config.quotes.map((q) => (
				<li data-intro="true">
					<figure>
						<blockquote>{q.text}</blockquote>
						<figcaption>{q.author}</figcaption>
					</figure>
				</li>
			))}
		</ul>
	);
}

export const Quotes = () => (
	<Page title={config.pages.quotes.title} description={config.pages.quotes.description}>
		<QuoteList />
	</Page>
);

QuoteList.style = css`
	:scope {
		display: grid;
		gap: 2rem;
	}
	figure {
		display: grid;
		gap: 0.5rem;
	}
	blockquote {
		color: var(--foreground);
		font-family: var(--font-serif);
		font-size: var(--type-body);
		font-weight: var(--weight-serif);
		line-height: var(--type-body-leading);
		letter-spacing: 0;
		text-wrap: pretty;
	}
	figcaption {
		color: var(--muted-foreground);
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
	}
`;

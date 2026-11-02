import { css } from "dreamland/core";
import config from "../site.config";
import { Page } from "../components/Page";
import { Icon } from "../icons";

const a = config.pages.about;

function AboutBody() {
	return (
		<div class="page-content about-page">
			<div class="page-prose">
				{a.intro.map((p) => (
					<p>{p}</p>
				))}
			</div>
			<div class="about-contact">
				<p>{a.contact}</p>
				<a class="page-link about-contact-link" href="/contact">
					{a.contactLink}
					{Icon("arrowRight")}
				</a>
			</div>
		</div>
	);
}

AboutBody.style = css`
	:scope.about-page.page-content {
		gap: 64px;
	}
	.about-contact {
		display: grid;
		gap: 8px;
		color: var(--muted-foreground);
		font-size: var(--type-small);
		text-wrap: pretty;
	}
	.about-contact-link {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		width: fit-content;
		min-height: 48px;
		font-size: var(--type-body);
	}
	.about-contact-link svg {
		transition: translate 0.24s var(--expo-out);
	}
	@media (hover: hover) and (pointer: fine) {
		.about-contact-link:hover svg {
			translate: 4px;
		}
	}
`;

export const About = () => (
	<Page title={a.title} description={a.description}>
		<AboutBody />
	</Page>
);

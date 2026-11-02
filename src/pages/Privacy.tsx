import config from "../site.config";
import { Page } from "../components/Page";
import { Sections, type Section } from "../components/Sections";

export function Privacy() {
	const c = config.pages.privacy;
	const sections = c.sections.map((s, i) => (i === c.sections.length - 1 ? { ...s, blocks: [...s.blocks, { links: [{ label: config.email, href: `mailto:${config.email}` }] }] } : s));
	const intro = (
		<div class="page-intro">
			<h1 data-intro="true" class="page-title">
				{c.title}
			</h1>
			<p data-intro="true" class="page-description">
				{c.description}
			</p>
			<div data-intro="true" class="page-meta">
				<p>
					updated <time datetime={c.updated}>{c.updatedLabel}</time>
				</p>
			</div>
		</div>
	);
	return (
		<Page title={c.title} intro={intro}>
			<Sections lead={c.lead} sections={sections as Section[]} />
		</Page>
	);
}

import config from "../site.config";
import { Page } from "../components/Page";
import { Sections, type Section } from "../components/Sections";

export function Source() {
	const c = config.pages.source;
	return (
		<Page title={c.title} description={c.description}>
			<Sections sections={c.sections as Section[]} />
		</Page>
	);
}

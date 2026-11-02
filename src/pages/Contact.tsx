import config from "../site.config";
import { Page } from "../components/Page";
import { Sections } from "../components/Sections";

export function Contact() {
	const c = config.pages.contact;
	return (
		<Page title={c.title} description={c.description}>
			<Sections
				sections={[
					{ id: "contact-email", heading: "email", blocks: [c.email, { links: [{ label: config.email, href: `mailto:${config.email}`, icon: "mail" }] }] },
					{ id: "contact-about", heading: c.topics.heading, blocks: [c.topics.text] },
					{ id: "contact-elsewhere", heading: "elsewhere", blocks: [{ nav: "profile links", links: config.links.map((l) => ({ label: l.label, href: l.href, me: true })) }] },
					{ id: "contact-location", heading: "location", blocks: [c.location] },
				]}
			/>
		</Page>
	);
}

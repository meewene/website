import { css } from "dreamland/core";
import { Icon, type IconName } from "../icons";

type Link = { label: string; href: string; icon?: string; me?: boolean };
type Block = string | { links: Link[]; nav?: string } | { catalog: { term: string; text: string; href?: string }[] };
export type Section = { id: string; heading: string; blocks: Block[] };

const inline = (text: string) => text.split("`").flatMap((part, i) => (i % 2 ? [<code>{part}</code>] : part ? [part] : []));

const link = (l: Link) => (
	<a class="page-link tall" data-tall="" rel={l.me ? "me" : undefined} href={l.href}>
		{l.icon ? Icon(l.icon as IconName) : null}
		{l.label}
	</a>
);

const block = (b: Block) => {
	if (typeof b === "string") return <p>{inline(b)}</p>;
	if ("links" in b)
		return b.nav ? (
			<nav aria-label={b.nav} class="links">
				{b.links.map(link)}
			</nav>
		) : (
			<div class="links">{b.links.map(link)}</div>
		);
	return (
		<dl class="page-catalog">
			{b.catalog.map((c) => (
				<div>
					<dt>{c.href ? link({ label: c.term, href: c.href }) : c.term}</dt>
					<dd>{inline(c.text)}</dd>
				</div>
			))}
		</dl>
	);
};

export function Sections(this: { sections: Section[]; lead?: string }) {
	return (
		<div class="page-content">
			{this.lead ? <p data-intro="true">{this.lead}</p> : null}
			{this.sections.map((s) => (
				<section data-intro-group="true" aria-labelledby={s.id} class="page-section">
					<h2 id={s.id} class="bold">
						{s.heading}
					</h2>
					{s.blocks.map(block)}
				</section>
			))}
		</div>
	);
}

Sections.style = css`
	.bold {
		font-weight: 700;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1.5rem;
	}
	.tall {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-width: var(--target);
		min-height: var(--target);
	}
	code {
		font-size: 0.875em;
	}
	.page-catalog dt {
		min-width: 0;
		overflow-wrap: anywhere;
	}
`;

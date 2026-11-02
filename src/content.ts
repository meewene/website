export type Post = {
	slug: string;
	title: string;
	description: string;
	date: string;
	dateLabel: string;
	html: string;
	headings: { id: string; text: string }[];
	minutes: number;
};

const slug = (path: string) => path.split("/").pop()!.replace(/\.\w+$/, "");

export const posts: Post[] = Object.entries(import.meta.glob<{ default: Omit<Post, "slug"> }>("./content/blog/*.md", { eager: true }))
	.map(([path, mod]) => ({ ...mod.default, slug: slug(path), dateLabel: mod.default.dateLabel.toLowerCase() }))
	.sort((a, b) => b.date.localeCompare(a.date));

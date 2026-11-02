import { defineConfig } from "vite";
import { devSsr, jsxPlugin } from "dreamland/vite";
import { Marked } from "marked";
import config from "./src/site.config.ts";

const slugify = (text: string) =>
	text
		.toLowerCase()
		.replace(/<[^>]+>/g, "")
		.replace(/&[a-z0-9#]+;/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-");

const dateLabel = (date: string) =>
	date ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(date)) : "";

const markdown = {
	name: "markdown",
	transform(src: string, id: string) {
		if (!id.endsWith(".md")) return;
		const [, front = "", body = ""] = src.replace(/\r\n/g, "\n").match(/^(?:---\n([\s\S]*?)\n---\n?)?([\s\S]*)$/)!;
		const meta: Record<string, string> = {};
		let key = "";
		for (const line of front.split("\n")) {
			const i = line.indexOf(":");
			if (key && /^\s+\S/.test(line)) meta[key] += (meta[key] ? "\n" : "") + line.trim();
			else if (i > 0) meta[(key = line.slice(0, i).trim())] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "").replace(/^\|$/, "");
		}
		const headings: { id: string; text: string }[] = [];
		const marked = new Marked({
			breaks: true,
			renderer: {
				heading({ tokens, depth }) {
					const text = this.parser.parseInline(tokens);
					const id = slugify(text);
					if (depth === 2) headings.push({ id, text: text.replace(/<[^>]+>/g, "") });
					return `<h${depth} id="${id}">${text}</h${depth}>`;
				},
			},
		});
		const html = marked.parse(body) as string;
		const words = body.split(/\s+/).filter(Boolean).length;
		const post = { ...meta, dateLabel: dateLabel(meta.date), html, headings, minutes: Math.max(1, Math.round(words / 230)) };
		return { code: `export default ${JSON.stringify(post)};`, map: null };
	},
};

const compactCss = {
	name: "compact-css",
	apply: "build" as const,
	enforce: "pre" as const,
	transform(code: string, id: string) {
		if (id.endsWith(".tsx")) return code.replace(/css`([^`]*)`/g, (_, body: string) => `css\`${body.replace(/\s+/g, " ").replace(/\s*([{};])\s*/g, "$1")}\``);
	},
};

const swatchNames = {
	name: "swatch-names",
	apply: "build" as const,
	transform(code: string, id: string) {
		if (id.includes("@highlighters/core")) return code.replace(/\w+(?=: "#(?:ffb24d|f0cdb0)")/g, "amber");
	},
};

export default defineConfig({
	plugins: [
		jsxPlugin(),
		devSsr({
			entry: "/src/main-server.ts",
			transform: (html) =>
				html.replaceAll("__TITLE__", config.title).replaceAll("__DESCRIPTION__", config.description).replaceAll("__URL__", config.url).replaceAll("__SITE__", config.url),
		}),
		markdown,
		compactCss,
		swatchNames,
	],
});

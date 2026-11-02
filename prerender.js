import { renderSsr } from "dreamland/vite";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const entry = await import("./.ssr/main-server.js");
const { config, notFound, routeFor } = entry;

const template = await readFile("dist/index.html", "utf8");
const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const head = (route) =>
	template
		.replaceAll("__TITLE__", escape(route.title))
		.replaceAll("__DESCRIPTION__", escape(route.description))
		.replaceAll("__URL__", config.url + (route.path === "/" ? "/" : route.path))
		.replaceAll("__SITE__", config.url);

const write = async (file, html) => {
	await mkdir(dirname(file), { recursive: true });
	await writeFile(file, html);
	console.log(`prerendered: ${file}\t${(Buffer.byteLength(html) / 1024).toFixed(2)}kb`);
};

entry.default("/");
const paths = entry.router.ssgables().map(([route]) => route);

for (const path of paths) {
	await write(`dist${path === "/" ? "/index" : path}.html`, await renderSsr(head(routeFor(path)), () => entry.default(path)));
}
await write("dist/404.html", await renderSsr(head(notFound), () => entry.default(notFound.path)));

const urls = paths.map((p) => `<url>\n<loc>${config.url}${p}</loc>\n</url>`).join("\n");
await writeFile("dist/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
console.log(`sitemap.xml: ${paths.length} urls`);

await rm(".ssr", { recursive: true });

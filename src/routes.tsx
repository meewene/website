import config from "./site.config";
import { posts } from "./content";
import { Home } from "./pages/Home";
import { Contact } from "./pages/Contact";
import { Source } from "./pages/Source";
import { Quotes } from "./pages/Quotes";
import { Privacy } from "./pages/Privacy";
import { Blog } from "./pages/Blog";
import { Post } from "./pages/Post";
import { NotFound } from "./pages/NotFound";
import { Sitemap } from "./pages/Sitemap";
import { Sounds } from "./pages/Sounds";
import { About } from "./pages/About";
import { Design } from "./pages/Design";
import { Font } from "./pages/Font";
import { LogoPage } from "./pages/LogoPage";
import { Brand } from "./pages/Brand";

type RouteInfo = { path: string; name: string; title: string; description: string; page: () => HTMLElement };

const page = (path: string, meta: { title: string; description: string }, page: () => HTMLElement): RouteInfo => ({
	path,
	name: meta.title,
	title: `${meta.title} | ${config.title}`,
	description: meta.description,
	page,
});

const p = config.pages;

export const routes: RouteInfo[] = [
	{ path: "/", name: "home", title: config.title, description: config.description, page: () => <Home /> },
	page("/about", p.about, About),
	page("/contact", p.contact, Contact),
	page("/blog", p.blog, Blog),
	...posts.map((post) => page(`/blog/${post.slug}`, post, () => Post(post))),
	page("/sounds", p.sounds, Sounds),
	page("/source", p.source, Source),
	page("/quotes", p.quotes, Quotes),
	page("/design", p.design, Design),
	page("/font", p.font, Font),
	page("/logo", p.logo, LogoPage),
	page("/brand", p.brand, Brand),
	page("/privacy", p.privacy, Privacy),
	page("/sitemap", p.sitemap, Sitemap),
];

export const notFound = page("/404", p.notFound, NotFound);

export const clean = (path: string) => (path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path);

export const routeFor = (path: string) => routes.find((r) => r.path === clean(path)) || notFound;

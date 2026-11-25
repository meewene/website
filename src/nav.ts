import { router } from "dreamland/router";
import { clean, routeFor } from "./routes";
import { runIntro } from "./intro";
import { hoverAllowed, play } from "./sound";
import { motion } from "./motion";

let shown = "";

export const onLeave = (el: Element | null | undefined, cleanup: () => void) => {
	const check = () => {
		if (!el || !el.isConnected) {
			removeEventListener("routechange", check);
			cleanup();
		}
	};
	addEventListener("routechange", check);
	return () => removeEventListener("routechange", check);
};

const decodeHash = (hash: string) => {
	const raw = hash.slice(1);
	try {
		return decodeURIComponent(raw);
	} catch {
		return raw;
	}
};

const settle = (hash: string, y?: number) => {
	shown = clean(location.pathname);
	const route = routeFor(location.pathname);
	document.title = route.title;
	document.querySelector('meta[name="description"]')?.setAttribute("content", route.description.replace(/\s+/g, " ").trim());
	const target = hash ? document.getElementById(decodeHash(hash)) : null;
	if (target) target.scrollIntoView();
	else if (y !== undefined) scrollTo({ left: 0, top: y, behavior: "instant" });
	runIntro(document.querySelector<HTMLElement>("[data-page-intro]"));
	dispatchEvent(new Event("routechange"));
};

const swap = (change: () => void, hash: string, y: number) => {
	const run = () => {
		change();
		settle(hash, y);
	};
	if (!document.startViewTransition || motion.reduced) run();
	else document.startViewTransition(run);
};

const navigate = (href: string) => {
	const url = new URL(href, location.href);
	const nextPath = clean(url.pathname);
	if (nextPath === clean(location.pathname) && url.search === location.search) {
		if (url.hash) location.hash = url.hash;
		else scrollTo({ left: 0, top: 0, behavior: motion.reduced ? "instant" : "smooth" });
		return;
	}
	history.replaceState({ y: scrollY }, "");
	swap(
		() => {
			router.navigate(nextPath);
			if (url.search || url.hash) history.replaceState(null, "", nextPath + url.search + url.hash);
		},
		url.hash,
		0,
	);
};

const link = (e: Event) => (e.target as Element).closest?.("a");
const kind = (a: HTMLAnchorElement) => a.dataset.sound || (a.hasAttribute("download") || a.getAttribute("href")?.startsWith("#") ? "none" : a.origin === location.origin ? "route" : "link");

export const startNavigation = () => {
	history.scrollRestoration = "manual";
	document.addEventListener("pointerdown", (e) => {
		const a = link(e);
		if (a && !e.button && kind(a) === "link") play("click");
	});
	document.addEventListener("keydown", (e) => {
		const a = link(e);
		if (a && e.key === "Enter" && kind(a) === "link") play("click");
	});
	document.addEventListener("pointerover", (e) => {
		const a = link(e);
		if (a && e.pointerType === "mouse" && !a.contains(e.relatedTarget as Node) && kind(a) === "link" && hoverAllowed()) play("hover");
	});
	document.addEventListener("click", (e) => {
		const a = link(e);
		if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		const rawHref = a.getAttribute("href");
		if (!rawHref) return;
		if (kind(a) === "route") play("click");
		if (rawHref.startsWith("#")) return;
		const url = new URL(a.href, location.href);
		if (a.target || a.hasAttribute("download") || url.origin !== location.origin) return;
		e.preventDefault();
		navigate(url.href);
	});
	addEventListener(
		"popstate",
		(e) => {
			e.stopImmediatePropagation();
			if (clean(location.pathname) === shown) return;
			swap(() => router.route(clean(location.pathname)), location.hash, history.state?.y ?? 0);
		},
		true,
	);
	queueMicrotask(() => settle(location.hash));
};

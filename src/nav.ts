import { router } from "dreamland/router";
import { clean, routeFor } from "./routes";
import { runIntro } from "./intro";
import { hoverAllowed, play } from "./sound";
import { motion } from "./motion";

let shown = "";

const settle = (hash: string, y?: number) => {
	shown = clean(location.pathname);
	const route = routeFor(location.pathname);
	document.title = route.title;
	document.querySelector('meta[name="description"]')?.setAttribute("content", route.description);
	const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)));
	if (target) target.scrollIntoView();
	else if (y !== undefined) scrollTo(0, y);
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

const navigate =(href: string) => {
	const url = new URL(href, location.href);
	if (clean(url.pathname) === clean(location.pathname) && url.hash) return void (location.hash = url.hash);
	history.replaceState({ y: scrollY }, "");
	swap(
		() => {
			router.navigate(clean(url.pathname));
			if (url.search || url.hash) history.replaceState(null, "", clean(url.pathname) + url.search + url.hash);
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
		if (kind(a) === "route") play("click");
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

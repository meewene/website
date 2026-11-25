import { hydrate } from "dreamland/ssr/client";
import App from "./main";
import { startNavigation } from "./nav";
import { unlock } from "./sound";
import { watchSystemTheme } from "./theme";
import { watchSystemMotion } from "./motion";
import { selectionInk } from "./ink";
import { clean, notFound, routeFor } from "./routes";

startNavigation();
const root = document.querySelector<HTMLElement>("#app")!;
const currentPath = clean(location.pathname);
const matchesSsr = root.dataset.path === currentPath || (root.dataset.path === notFound.path && routeFor(currentPath) === notFound);
const ssrData = document.querySelector("[dlssr-d]");
if (matchesSsr && ssrData) hydrate(App, root, document.head, ssrData);
else {
	document.head.querySelectorAll("style[dlssri]").forEach((s) => s.remove());
	root.replaceWith(App());
}

const prime = () => {
	if (unlock()) for (const type of ["pointerdown", "pointerup", "keydown"]) removeEventListener(type, prime);
};
for (const type of ["pointerdown", "pointerup", "keydown"]) addEventListener(type, prime);
watchSystemTheme();
watchSystemMotion();
selectionInk();

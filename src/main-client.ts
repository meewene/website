import { hydrate } from "dreamland/ssr/client";
import App from "./main";
import { startNavigation } from "./nav";
import { unlock } from "./sound";
import { watchSystemTheme } from "./theme";
import { watchSystemMotion } from "./motion";
import { selectionInk } from "./ink";
import { clean } from "./routes";

startNavigation();
const root = document.querySelector<HTMLElement>("#app")!;
if (root.dataset.path === clean(location.pathname)) hydrate(App, root, document.head, document.querySelector("[dlssr-d]")!);
else root.replaceWith(App());

const prime = () => {
	if (unlock()) for (const type of ["pointerdown", "pointerup", "keydown"]) removeEventListener(type, prime);
};
for (const type of ["pointerdown", "pointerup", "keydown"]) addEventListener(type, prime);
watchSystemTheme();
watchSystemMotion();
selectionInk();

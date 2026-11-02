import { createState } from "dreamland/core";
import { play } from "./sound";

const root = () => document.documentElement;
const system = () => matchMedia("(prefers-reduced-motion: reduce)");

export const motion = createState({ reduced: typeof document !== "undefined" && root().classList.contains("reduce-motion") });

const apply = (reduced: boolean) => {
	root().classList.toggle("reduce-motion", reduced);
	motion.reduced = reduced;
};

export const toggleMotion = () => {
	const reduced = !motion.reduced;
	play(reduced ? "toggle-on" : "toggle-off");
	try {
		if (reduced === system().matches) localStorage.removeItem("motion");
		else localStorage.setItem("motion", reduced ? "reduce" : "full");
	} catch {}
	apply(reduced);
};

export const watchSystemMotion = () => {
	apply(motion.reduced);
	const query = system();
	query.addEventListener("change", () => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem("motion");
		} catch {}
		if (!stored) apply(query.matches);
	});
};

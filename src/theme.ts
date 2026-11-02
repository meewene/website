import { play } from "./sound";
import { motion } from "./motion";

const root = () => document.documentElement;

const isDark =() => root().classList.contains("dark");

const apply = (dark: boolean) => {
	root().classList.remove("light", "dark");
	root().classList.add(dark ? "dark" : "light");
	root().style.colorScheme = dark ? "dark" : "light";
};

const setTheme =(dark: boolean) => {
	play(dark ? "toggle-on" : "toggle-off");
	try {
		localStorage.setItem("theme", dark ? "dark" : "light");
	} catch {}
	if (!document.startViewTransition || motion.reduced) return apply(dark);
	root().dataset.themeTransition = "";
	const done = () => delete root().dataset.themeTransition;
	document.startViewTransition(() => apply(dark)).finished.then(done, done);
};

export const toggleTheme = () => setTheme(!isDark());

export const watchSystemTheme = () => {
	const query = matchMedia("(prefers-color-scheme: dark)");
	query.addEventListener("change", () => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem("theme");
		} catch {}
		if (!stored || stored === "system") apply(query.matches);
	});
};

import { motion } from "./motion";

export const selectionInk = () => {
	const fine = matchMedia("(pointer: fine)");
	const forced = matchMedia("(forced-colors: active)");
	const root = document.documentElement;
	let run = 0;
	let stop: ((keepClass?: boolean) => void) | undefined;
	const options = () => {
		const dark = root.classList.contains("dark");
		return {
			color: "#9bc0ef",
			opacity: dark ? 0.22 : 0.3,
			vivid: dark && "screen",
			snap: "none",
			fadeOnClear: false,
			speed: { enabled: !motion.reduced, sensitivity: 0.35, minDeposit: 0.75 },
			animation: { duration: motion.reduced ? 0 : 220 },
			tip: { overshoot: 1, overshootJitter: 0.3 },
			ink: { feathering: 0.15, flow: 0.5 },
		} as any;
	};
	const start = async (keepClass = false) => {
		const id = ++run;
		const eligible = fine.matches && !forced.matches;
		stop?.(keepClass && eligible);
		stop = undefined;
		if (!eligible) {
			root.classList.remove("selection-ink-ready");
			return;
		}
		try {
			const { highlightSelection } = await import("@highlighters/core");
			if (id !== run || !fine.matches || forced.matches) return;
			const ink = highlightSelection(options());
			let lastDark = root.classList.contains("dark");
			let lastReduced = motion.reduced;
			root.classList.add("selection-ink-ready");
			const watch = new MutationObserver(() => {
				const dark = root.classList.contains("dark");
				const reduced = motion.reduced;
				if (dark === lastDark && reduced === lastReduced) return;
				lastDark = dark;
				lastReduced = reduced;
				ink.update(options());
			});
			watch.observe(root, { attributes: true, attributeFilter: ["class"] });
			stop = (preserve = false) => {
				watch.disconnect();
				ink.remove();
				if (!preserve) root.classList.remove("selection-ink-ready");
			};
		} catch {}
	};
	start();
	[fine, forced].forEach((q) => q.addEventListener("change", () => start(false)));
	addEventListener("routechange", () => start(true));
};

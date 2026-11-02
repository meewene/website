import { motion } from "./motion";

export const selectionInk = () => {
	const fine = matchMedia("(pointer: fine)");
	const forced = matchMedia("(forced-colors: active)");
	const root = document.documentElement;
	let run = 0;
	let stop: (() => void) | undefined;
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
	const start = async () => {
		const id = ++run;
		stop?.();
		stop = undefined;
		if (!fine.matches || forced.matches) return;
		try {
			const { highlightSelection } = await import("@highlighters/core");
			if (id !== run || !fine.matches || forced.matches) return;
			const ink = highlightSelection(options());
			const watch = new MutationObserver(() => ink.update(options()));
			watch.observe(root, { attributes: true, attributeFilter: ["class"] });
			root.classList.add("selection-ink-ready");
			stop = () => {
				watch.disconnect();
				ink.remove();
				root.classList.remove("selection-ink-ready");
			};
		} catch {}
	};
	start();
	[fine, forced].forEach((q) => q.addEventListener("change", start));
	addEventListener("routechange", start);
};

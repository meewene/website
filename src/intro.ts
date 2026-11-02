import { createState } from "dreamland/core";
import { motion } from "./motion";

export const intro = createState({ phase: "pending" });

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const controls = { transform: "translateX(8px) scale(0.95, 1)", filter: "blur(4px)", duration: 320, stagger: 60 };
const quick = { transform: "translateY(4px)", duration: 200 };
const kinds: Record<string, { transform: string; duration: number }> = {
	default: { transform: "translateY(8px)", duration: 440 },
	"tree-root": { transform: "translateY(4px)", duration: 320 },
	"tree-branch": { transform: "translateX(-6px)", duration: 380 },
	"tree-leaf": { transform: "translateY(2px)", duration: 300 },
};

let firstPath: string | undefined;
let navigated = false;
let stop = () => {};

export const runIntro = (root: HTMLElement | null) => {
	stop();
	const html = document.documentElement;
	const setPhase = (phase: string) => {
		intro.phase = phase;
		root?.setAttribute("data-page-intro", phase);
	};
	setPhase("pending");
	if (!root || motion.reduced || root.contains(document.activeElement)) {
		html.removeAttribute("data-intro-boot");
		return setPhase("skipped");
	}
	if ((firstPath ??= location.pathname) !== location.pathname) navigated = true;
	const all = [...root.querySelectorAll<HTMLElement>("[data-intro], [data-intro-group] > *, [data-intro-controls] > button")].filter(
		(el) => !el.hasAttribute("data-intro-group") && !(navigated && el.closest("header")) && el.getClientRects().length > 0,
	);
	const items = all.filter((el) => !all.some((other) => other !== el && other.contains(el)));
	if (!items.length) {
		html.removeAttribute("data-intro-boot");
		return setPhase("skipped");
	}
	const isControl = (el: HTMLElement) => el.parentElement?.hasAttribute("data-intro-controls");
	const explicit = (el: HTMLElement) => {
		const n = Number(el.dataset.introDelay);
		return el.dataset.introDelay !== undefined && n >= 0 ? n : null;
	};
	const inView = (el: HTMLElement) => el.getBoundingClientRect().top < innerHeight;
	const count = items.filter((el) => !isControl(el) && explicit(el) === null && inView(el)).length;
	const step = !navigated && count > 1 ? Math.min(56, 400 / (count - 1)) : 0;
	let order = 0;
	const animations = items.map((el) => {
		const group = isControl(el) ? [...el.parentElement!.querySelectorAll(":scope > button")] : null;
		const kind = navigated ? quick : group ? controls : kinds[el.dataset.intro!] || kinds.default;
		const fancy = group && !navigated;
		const blur = kind === kinds.default ? "blur(2px)" : fancy ? controls.filter : undefined;
		const delay = navigated
			? 0
			: group
				? (group.length - 1 - group.indexOf(el)) * controls.stagger
				: explicit(el) !== null
					? Math.min(explicit(el)!, 900 - kind.duration)
					: (inView(el) ? order++ : Math.max(order - 1, 0)) * step;
		const origin = fancy ? { transformOrigin: "right center" } : {};
		return el.animate(
			[
				{ opacity: 0, transform: kind.transform, ...(blur && { filter: blur }), ...origin },
				{ opacity: 1, transform: "none", ...(blur && { filter: "blur(0px)" }), ...origin },
			],
			{ duration: kind.duration, delay, easing: EASE, fill: "both" },
		);
	});
	html.removeAttribute("data-intro-boot");
	let ended = false;
	const end = (phase: string) => {
		if (ended) return;
		ended = true;
		animations.forEach((a) => a.cancel());
		root.removeEventListener("focusin", skip);
		setPhase(phase);
	};
	const skip = () => end("skipped");
	root.addEventListener("focusin", skip);
	Promise.all(animations.map((a) => a.finished)).then(() => end("complete"), () => {});
	stop = () => {
		ended = true;
		animations.forEach((a) => a.cancel());
		root.removeEventListener("focusin", skip);
	};
};

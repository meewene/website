import { css } from "dreamland/core";
import config from "../site.config";
import { motion } from "../motion";

const clock = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: config.timeZone });

const words = (text: string) => text.split(" ").flatMap((w, i) => [i > 0 ? " " : null, <span style={`--word: ${i}`}>{w}</span>]).filter((x) => x !== null);

export function FooterNote(this: { quote: HTMLAnchorElement; time: HTMLElement }, cx: any) {
	const first = config.quotes[0].text;

	cx.mount = () => {
		const pick = Math.floor(Math.random() * config.quotes.length);
		const text = config.quotes[pick].text.split(" ");
		const q = this.quote.querySelector("q")!;
		this.quote.dataset.quoteIndex = String(pick);
		q.textContent = "";
		q.style.setProperty("--words", String(text.length));
		text.forEach((w, i) => {
			if (i) q.append(" ");
			const span = document.createElement("span");
			span.style.setProperty("--word", String(i));
			span.textContent = w;
			q.append(span);
		});
		if (!motion.reduced) {
			this.quote.dataset.reveal = "pending";
			const io = new IntersectionObserver(
				(entries) => {
					if (entries.some((e) => e.isIntersecting)) {
						this.quote.dataset.reveal = "shown";
						io.disconnect();
					}
				},
				{ threshold: 0.5 },
			);
			io.observe(this.quote);
		}

		const show = (now: Date, morph: boolean) => {
			const next = clock.format(now);
			const prev = this.time.textContent || "";
			this.time.setAttribute("datetime", now.toISOString());
			this.time.parentElement!.removeAttribute("style");
			this.time.textContent = "";
			[...next].forEach((ch, i) => {
				const span = document.createElement("span");
				span.textContent = ch;
				if (ch === ":") span.className = "colon";
				else if (morph && ch !== prev[i]) span.className = "morph";
				this.time.append(span);
			});
		};
		let interval: ReturnType<typeof setInterval>;
		const schedule = () => {
			clearInterval(interval);
			const now = new Date();
			show(now, false);
			return setTimeout(() => {
				show(new Date(), true);
				interval = setInterval(() => show(new Date(), true), 60000);
			}, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()));
		};
		let timeout = schedule();
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				clearTimeout(timeout);
				timeout = schedule();
			}
		});
	};

	return (
		<div>
			<a id="footer-quote" data-quote-index="0" class="footer-quote" href="/quotes" this={use(this.quote)}>
				<q style={`--words: ${first.split(" ").length}`}>{words(first)}</q>
			</a>
			<div class="footer-note-row">
				<p data-intro="true" class="muted" style="visibility: hidden">
					<time id="footer-time" class="time" this={use(this.time)}>
						00:00
					</time>{" "}
					in {config.city}
				</p>
				<div data-intro="true">
					<nav aria-label="site navigation" class="site-nav">
						<a class="home-link" data-tall="" href="/sitemap">
							sitemap
						</a>
					</nav>
				</div>
			</div>
			<div class="footer-links">
				<a data-intro="true" class="home-link footer-privacy" data-tall="" href="/privacy">
					{config.pages.privacy.title}
				</a>
				<a data-intro="true" class="home-link footer-privacy" data-tall="" href="/source">
					{config.pages.source.title}
				</a>
			</div>
		</div>
	);
}

FooterNote.style = css`
	:scope {
		display: grid;
		gap: 16px;
	}
	.footer-quote {
		display: flex;
		align-items: center;
		justify-self: start;
		min-height: var(--target);
		border-radius: var(--radius-sm);
		color: var(--foreground);
		transition:
			color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.footer-quote :global(q > span) {
		display: inline-block;
	}
	.footer-quote[data-reveal] :global(q > span),
	.footer-quote[data-reveal] :global(q::before),
	.footer-quote[data-reveal] :global(q::after) {
		animation: quote-word-in 0.64s var(--expo-out) both;
		animation-delay: calc(var(--word) * min(56ms, 0.56s / var(--words)));
		animation-play-state: paused;
	}
	.footer-quote[data-reveal] :global(q::before) {
		display: inline-block;
		animation-delay: 0s;
	}
	.footer-quote[data-reveal] :global(q::after) {
		display: inline-block;
		animation-delay: calc((var(--words) - 1) * min(56ms, 0.56s / var(--words)));
	}
	.footer-quote[data-reveal="shown"] :global(q > span),
	.footer-quote[data-reveal="shown"] :global(q::before),
	.footer-quote[data-reveal="shown"] :global(q::after) {
		animation-play-state: running;
	}
	@keyframes quote-word-in {
		0% {
			opacity: 0;
			filter: blur(6px);
			transform: translateY(6px);
		}
	}
	:global(:root[data-intro-boot]) .footer-quote:not([data-reveal]) {
		opacity: 0;
	}
	@media (hover: hover) and (pointer: fine) {
		.footer-quote:hover {
			color: var(--link);
		}
	}
	.footer-quote:focus-visible {
		outline: var(--focus-width) solid var(--ring);
		outline-offset: var(--focus-offset);
	}
	.footer-note-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 24px;
	}
	.muted,
	.site-nav {
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
		color: var(--muted-foreground);
	}
	.time {
		font-variant-numeric: tabular-nums;
	}
	.time :global(span) {
		display: inline-block;
	}
	.time :global(.morph) {
		animation: time-morph 0.5s var(--expo-out);
	}
	.time :global(.colon) {
		font-variant-numeric: normal;
	}
	@keyframes time-morph {
		0% {
			opacity: 0;
			transform: translateY(0.3em);
			filter: blur(2px);
		}
	}
	.site-nav {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1.5rem;
	}
	.home-link {
		display: inline-flex;
		align-items: center;
		min-width: var(--target);
		min-height: var(--target);
		color: var(--link);
		text-decoration-line: underline;
		text-decoration-color: color-mix(in oklch, var(--link) 35%, transparent);
		transition:
			color var(--control-duration) var(--control-ease),
			text-decoration-color var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.home-link:is(:hover, :focus-visible) {
		text-decoration-color: var(--link);
	}
	.home-link:focus-visible {
		outline: var(--focus-width) solid var(--ring);
		outline-offset: var(--focus-offset);
	}
	.footer-links {
		display: grid;
		padding-block: calc((var(--target) - 1lh) / 2);
		font-size: var(--type-small);
		line-height: var(--type-small-leading);
	}
	.footer-privacy {
		position: relative;
		justify-self: start;
		min-height: 0;
		color: var(--muted-foreground);
		text-decoration-color: color-mix(in oklch, var(--muted-foreground) 35%, transparent);
	}
	.footer-privacy::before {
		content: "";
		position: absolute;
		inset: calc(1lh - var(--target)) 0 0;
	}
	.footer-privacy + .footer-privacy::before {
		inset: 0 0 calc(1lh - var(--target));
	}
	.footer-privacy:is(:hover, :focus-visible) {
		color: var(--link);
	}
	:global(.reduce-motion) .footer-quote,
	:global(.reduce-motion) .home-link {
		transition: none;
	}
	:global(.reduce-motion) .time :global(.morph) {
		animation: none;
	}
`;

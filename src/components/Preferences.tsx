import { css } from "dreamland/core";
import { Icon } from "../icons";
import { play, sound } from "../sound";
import { toggleTheme } from "../theme";
import { motion, toggleMotion } from "../motion";

export function Preferences() {
	const on = use(sound.enabled);
	const still = use(motion.reduced);
	const toggleSound = () => {
		sound.enabled = !sound.enabled;
		if (sound.enabled) play("toggle-on");
	};
	return (
		<fieldset data-intro-controls="true">
			<legend class="sr-only">site preferences</legend>
			<button type="button" aria-label="sound" aria-pressed={on.map(String)} title={on.map((v) => (v ? "mute sound" : "enable sound"))} class="experience-toggle" on:click={toggleSound}>
				<span class="stack" aria-hidden="true">
					<span class="swap" class:hidden-icon={on.map((v) => !v)}>
						{Icon("volumeOn")}
					</span>
					<span class="swap mute" class:hidden-icon={on}>
						{Icon("volumeOff")}
					</span>
				</span>
			</button>
			<button type="button" aria-label="less motion" aria-pressed={still.map(String)} title={still.map((v) => (v ? "enable motion" : "reduce motion"))} class="experience-toggle" on:click={toggleMotion}>
				<span class="stack" aria-hidden="true">
					<span class="swap" class:hidden-icon={still}>
						{Icon("pause")}
					</span>
					<span class="swap mute" class:hidden-icon={still.map((v) => !v)}>
						{Icon("play")}
					</span>
				</span>
			</button>
			<button type="button" aria-label="toggle color theme" title="toggle color theme" class="experience-toggle" on:click={toggleTheme}>
				<span aria-hidden="true" class="stack">
					{Icon("sun", "sun")}
					{Icon("moon", "moon")}
				</span>
			</button>
		</fieldset>
	);
}

Preferences.style = css`
	:scope {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}
	.experience-toggle {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--muted-foreground);
		cursor: pointer;
		transition:
			color var(--control-duration) var(--control-ease),
			background-color var(--control-duration) var(--control-ease),
			transform var(--control-duration) var(--control-ease),
			var(--focus-transition);
	}
	.experience-toggle:hover,
	.experience-toggle:focus-visible {
		color: var(--foreground);
		background: var(--hover-fill);
	}
	.experience-toggle:focus-visible {
		outline: var(--focus-width) solid var(--ring);
		outline-offset: calc(var(--focus-width) * -1);
	}
	.experience-toggle:active {
		transform: scale(0.96);
	}
	.stack {
		position: relative;
		display: inline-flex;
		width: var(--icon);
		height: var(--icon);
	}
	.swap {
		position: absolute;
		inset: 0;
		display: inline-flex;
		transition:
			opacity var(--panel-duration) var(--expo-out),
			scale var(--panel-duration) var(--expo-out),
			rotate var(--panel-duration) var(--expo-out);
	}
	.swap.hidden-icon {
		opacity: 0;
		scale: 0.85;
		rotate: -8deg;
	}
	.swap.mute.hidden-icon {
		rotate: 8deg;
	}
	.sun,
	.moon {
		position: absolute;
		inset: 0;
		transform-origin: 50%;
		transition:
			transform var(--panel-duration) var(--expo-out),
			opacity var(--control-duration) var(--control-ease);
	}
	.moon {
		opacity: 0;
		transform: rotate(45deg) scale(0.75);
	}
	:global(.dark) .sun {
		opacity: 0;
		transform: rotate(-45deg) scale(0.75);
	}
	:global(.dark) .moon {
		opacity: 1;
		transform: rotate(0) scale(1);
	}
	:global(.reduce-motion) .experience-toggle,
	:global(.reduce-motion) .swap,
	:global(.reduce-motion) .sun,
	:global(.reduce-motion) .moon {
		transition: none;
	}
	:global(.reduce-motion) .experience-toggle:active {
		transform: none;
	}
	@media (scripting: none) {
		:scope {
			display: none;
		}
	}
`;

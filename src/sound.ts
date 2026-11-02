import { createState, stateListen } from "dreamland/core";

type Note = [frequency: number, at: number, velocity: number, decay?: number];

const cues: Record<string, Note[]> = {
	success: [[349.23, 0, 0.81], [440, 0.09, 0.74], [523.25, 0.18, 0.83, 0.34]],
	failure: [[293.66, 0, 0.68], [233.08, 0.1, 0.64], [196, 0.2, 0.7, 0.32]],
	warning: [[261.63, 0, 0.62], [349.23, 0.08, 0.58], [261.63, 0.2, 0.56], [349.23, 0.28, 0.54]],
	error: [[277.18, 0, 0.7, 0.16], [261.63, 0.07, 0.66, 0.16], [116.54, 0.14, 0.72, 0.24]],
	notification: [[349.23, 0, 0.69], [523.25, 0.1, 0.76, 0.3]],
	click: [[466.16, 0, 0.46, 0.15]],
	tap: [[349.23, 0, 0.42, 0.14]],
	hover: [[880, 0, 0.22, 0.1]],
	select: [[523.25, 0, 0.44, 0.16]],
	"toggle-on": [[233.08, 0, 0.42, 0.16], [349.23, 0.08, 0.48, 0.2]],
	"toggle-off": [[349.23, 0, 0.42, 0.16], [233.08, 0.08, 0.46, 0.2]],
	open: [[261.63, 0, 0.42, 0.16], [392, 0.08, 0.48, 0.22]],
	close: [[392, 0, 0.42, 0.16], [261.63, 0.08, 0.46, 0.22]],
	disabled: [[116.54, 0, 0.33, 0.13]],
	loading: [[233.08, 0, 0.38, 0.16], [293.66, 0.09, 0.4, 0.16], [349.23, 0.18, 0.42, 0.2]],
};

export type Cue = keyof typeof cues;

export const sound = createState({ enabled: true, volume: 0.7 });

export const cueLength = (cue: Cue) => {
	const [, at, , decay = 0.24] = cues[cue].at(-1)!;
	return Math.round(1000 * (at + 0.03 + decay / 4 + 3 * 0.28 + 0.06));
};

let ctx: AudioContext | undefined;
let playing: { input: GainNode; src: OscillatorNode[] } | undefined;

const context = (): AudioContext | undefined => {
	if (!ctx) {
		if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
		ctx = new AudioContext();
	}
	if (ctx.state === "suspended") ctx.resume();
	return ctx;
};

const chain = (c: AudioContext) => {
	const comp = c.createDynamicsCompressor();
	comp.threshold.value = -20;
	comp.knee.value = 12;
	comp.ratio.value = 2;
	comp.attack.value = 0.004;
	comp.release.value = 0.12;
	comp.connect(c.destination);
	const length = Math.ceil(0.7 * 0.3 * c.sampleRate);
	const impulse = c.createBuffer(2, length, c.sampleRate);
	for (let ch = 0; ch < 2; ch++) {
		const data = impulse.getChannelData(ch);
		let last = 0;
		for (let i = 0; i < length; i++) {
			last = (2 * Math.random() - 1) * Math.exp(-i / (0.28 * length)) * 0.1 + last * 0.95;
			data[i] = last;
		}
	}
	const reverb = c.createConvolver();
	reverb.buffer = impulse;
	const dry = c.createGain();
	const wet = c.createGain();
	dry.gain.value = 0.88;
	wet.gain.value = 0.12;
	const delay = c.createDelay();
	delay.delayTime.value = 0.28;
	const lp = c.createBiquadFilter();
	lp.type = "lowpass";
	lp.frequency.value = 900;
	const echo = c.createGain();
	echo.gain.value = 0.14;
	const input = c.createGain();
	input.connect(dry).connect(comp);
	input.connect(wet).connect(reverb).connect(comp);
	input.connect(delay).connect(lp).connect(echo).connect(input);
	return input;
};

const voice = (c: AudioContext, input: AudioNode, t: number, freq: number, harmonics: number[], gain: number, attack: number, decay: number, filter?: [number, number]) => {
	const imag = new Float32Array([0, ...harmonics]);
	const osc = c.createOscillator();
	osc.setPeriodicWave(c.createPeriodicWave(new Float32Array(imag.length), imag));
	osc.frequency.setValueAtTime(freq, t);
	const env = c.createGain();
	env.gain.setValueAtTime(1e-4, t);
	env.gain.linearRampToValueAtTime(gain, t + attack);
	env.gain.setTargetAtTime(1e-4, t + attack, decay / 3);
	let out: AudioNode = osc;
	if (filter) {
		const lp = c.createBiquadFilter();
		lp.type = "lowpass";
		lp.Q.value = 0.2;
		lp.frequency.setValueAtTime(filter[0], t);
		lp.frequency.linearRampToValueAtTime(filter[1], t + attack);
		lp.frequency.exponentialRampToValueAtTime(filter[0], t + attack + decay);
		out = osc.connect(lp);
	}
	out.connect(env).connect(input);
	osc.start(t);
	osc.stop(t + attack + 2 * decay + 0.06 + 0.1);
	return osc;
};

export const unlock = () => context();

export const stop = () => {
	if (!playing || !ctx) return;
	const now = ctx.currentTime;
	playing.input.gain.setTargetAtTime(1e-4, now, 0.025 / 3);
	for (const o of playing.src) {
		try {
			o.stop(now + 0.075);
		} catch {}
	}
	playing = undefined;
};

stateListen(sound, stop);

let lastHover = -Infinity;

export const hoverAllowed = () => {
	const now = performance.now();
	if (now - lastHover < 120) return false;
	lastHover = now;
	return true;
};

export const play = (cue: Cue) => {
	if (!sound.enabled || !sound.volume) return "muted";
	const c = typeof AudioContext === "undefined" ? undefined : context();
	if (!c) return "unavailable";
	stop();
	const now = c.currentTime;
	const input = chain(c);
	const src: OscillatorNode[] = [];
	for (const [f, at, v, decay = 0.24] of cues[cue]) {
		const t = now + at;
		src.push(
			voice(c, input, t, f, [1, 0.2 + 0.1 * v, 0.07, 0.02, 0.004], 0.06 * v * sound.volume, 0.03, decay, [Math.max(560, 1.15 * f), Math.min(2000, f * (2.1 + v))]),
			voice(c, input, t, 1.003 * f, [1, 0.1, 0.025], 0.013 * v * sound.volume, 0.06, decay * 0.8),
		);
	}
	playing = { input, src };
	return "played";
};

let records: AudioBuffer[] | undefined;
let lastScratch = -Infinity;

export const scratch = (x: number, y: number, speed: number, reverse: boolean) => {
	const now = performance.now();
	if (!sound.enabled || !sound.volume || !ctx || ctx.state !== "running" || document.hidden || now - lastScratch < 55) return;
	lastScratch = now;
	if (!records) {
		const length = Math.ceil(0.4 * ctx.sampleRate);
		const forward = ctx.createBuffer(1, length, ctx.sampleRate);
		const data = forward.getChannelData(0);
		for (let i = 0; i < length; i++) {
			const t = i / ctx.sampleRate;
			const p = t % 0.1;
			let v = 0;
			for (const f of [110, 164.81, 220]) v += 0.2 * Math.sin(2 * Math.PI * f * t) + 0.04 * Math.sin(4 * Math.PI * f * t);
			data[i] = Math.min(1, p / 0.003) * Math.exp(-32 * p) * (v + (2 * Math.random() - 1) * 0.025);
		}
		const backward = ctx.createBuffer(1, length, ctx.sampleRate);
		backward.copyToChannel(data.slice().reverse(), 0);
		records = [forward, backward];
	}
	const t = ctx.currentTime;
	const src = ctx.createBufferSource();
	src.buffer = records[+reverse];
	src.playbackRate.value = 0.65 + Math.min(1.5, 5 * speed) + 0.35 * Math.abs(x);
	const lp = ctx.createBiquadFilter();
	lp.type = "lowpass";
	lp.frequency.value = 560 + (1 - y) * 1500;
	lp.Q.value = 0.7;
	const env = ctx.createGain();
	env.gain.setValueAtTime(0, t);
	env.gain.linearRampToValueAtTime(0.19 * sound.volume, t + 0.006);
	env.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
	src.connect(lp).connect(env).connect(ctx.destination);
	src.start(t, (x + 1) * 0.1, 0.12);
	src.stop(t + 0.105);
};

"""Synthesise the three SFX (CC0, made here) and lay out out/sfx_stem.wav on the film timeline.
Run: python3 render/make_sfx.py   (loudness to -14 LUFS is applied in stitch.sh)"""
import numpy as np, wave, os

SR = 48000
ROOT = os.path.join(os.path.dirname(__file__), '..')
rng = np.random.default_rng(7)


def write(path, x):
    x = np.clip(x, -1, 1)
    st = np.repeat((x * 32767).astype('<i2')[:, None], 2, axis=1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())


def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def click():
    n = int(0.035 * SR)
    noise = rng.standard_normal(n)
    hp = np.diff(noise, prepend=0)                      # crude high-pass = "clack"
    body = np.sin(2 * np.pi * 1900 * np.arange(n) / SR)  # small resonant tick
    return (0.55 * hp + 0.35 * body) * env(n, 0.0005, 0.006)


def impact():
    n = int(1.4 * SR); t = np.arange(n) / SR
    f = 38 + 70 * np.exp(-t / 0.08)                      # pitch-drop sub thump
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.45)
    noise = rng.standard_normal(n)
    k = int(SR / 600); lp = np.convolve(noise, np.ones(k) / k, 'same') * np.exp(-t / 0.05) * 3
    return 0.95 * sub + 0.35 * lp


def ding():
    n = int(1.2 * SR); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / d) for f, a, d in
            [(1568, 0.6, 0.45), (3136, 0.25, 0.25), (4704, 0.1, 0.12), (2093, 0.2, 0.35)])
    return x * np.minimum(1, t / 0.002)


def place(stem, clip, at, gain=1.0):
    i = int(round(at * SR)); j = min(len(stem), i + len(clip))
    stem[i:j] += clip[:j - i] * gain


if __name__ == '__main__':
    d = os.path.join(ROOT, 'assets', 'sfx'); os.makedirs(d, exist_ok=True)
    c, im, dg = click(), impact(), ding()
    write(os.path.join(d, 'click.wav'), c * 0.8); write(os.path.join(d, 'impact.wav'), im); write(os.path.join(d, 'ding.wav'), dg)

    stem = np.zeros(int(30.0 * SR))
    place(stem, im, 2.0, 0.9)
    # key clicks on the actual typing spans from timeline.js
    spans = [(2.0, 2.0 + 18 / 28, 0.5), (2.9, 2.9 + 20 / 30, 0.5), (5.0, 5.0 + 32 / 36, 0.4), (12.0, 14.5, 0.28)]
    for s, e, g in spans:
        t = s
        while t < e:
            place(stem, c, t, g * rng.uniform(0.75, 1.0))
            t += 1 / 9 + rng.uniform(-0.025, 0.025)
    place(stem, c, 15.0, 0.6)          # the copy "click"
    place(stem, dg, 17.5, 0.6)         # Fixed
    place(stem, dg, 25.6, 0.6)         # CTA
    peak = np.max(np.abs(stem)); stem *= 0.9 / peak
    os.makedirs(os.path.join(ROOT, 'out'), exist_ok=True)
    write(os.path.join(ROOT, 'out', 'sfx_stem_raw.wav'), stem)
    print('sfx ok, peak normalised from', round(float(peak), 3))

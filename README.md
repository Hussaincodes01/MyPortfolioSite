# Jiyad's Quest

A playable pixel-art portfolio for Jiyad Hussain. Visitors land on a game title screen, read a short player profile, then play a side-scroller that runs through two live projects (ArcVisual and VayuNetra). Each project station pauses the game and plays a narrated overview, impact matrix and usefulness section.

It is a static site: one `index.html` plus the narration clips in `audio/`. `npm run build` just copies those into `dist/`, which is what Vercel (see `vercel.json`) and the GitHub Pages workflow publish.

## Deploy

**Vercel (CLI)**

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # production
```

**Vercel (GitHub):** push this folder to a repo, then in Vercel choose *Add New → Project*, import the repo, set Framework Preset to *Other*, leave the build command empty and the output directory as the root.

Any static host works the same way (Netlify, GitHub Pages, Cloudflare Pages).

## Files

| Path | What it is |
|---|---|
| `index.html` | The built site. Everything (markup, styles, game code, sprite data, portrait) is inlined. |
| `audio/*.mp3` | Narration clips, loaded by the game at runtime. |
| `src/page.html` | Markup and CSS. `/*GAME_JS*/` marks where the script is injected. |
| `src/game.js` | All game code: title screen, audio engine (music + sound effects are synthesized), level data, physics, rendering, narration panels. |
| `src/sprite.json` | The character's pixel frames (generated). |
| `src/sprite_gen.py` | Generates `sprite.json` from hand-written pixel maps. Run `python3 src/sprite_gen.py` from inside `src/` (needs Pillow for the preview sheet). |
| `src/portrait.png` | 56×56 pixel portrait used in the HUD, profile and narration panel. |
| `build.py` | Rebuilds `index.html` from `src/`. |

## Editing

1. Change files in `src/`.
2. Run `python3 build.py`.
3. Open `index.html` through a local server so the audio can load: `python3 -m http.server` then visit `http://localhost:8000`.

Common edits in `src/game.js`:

- **Project copy and numbers:** the `NARR` object (one entry per station: tabs, captions, panel HTML, link).
- **Level layout:** the `G(...)`, `P(...)`, `B(...)`, `O(...)`, `bug(...)`, `ghost(...)` calls under `WORLD` (ground, platforms, blocks, skill orbs, enemies).
- **Achievement chests:** the `ACH` array.
- **Physics feel:** the `C` constants (run speed, jump velocity, gravity, dash).
- **Colours per zone:** `SKY`, `DARK`, and the palettes inside `buildLayers()` / `groundTex()`.

## Narration clips

The clips were synthesized from a 16-second recording of Jiyad's voice. To replace any of them with a real recording, record the line below and save it with the same file name (MP3, mono is fine).

| File | Line |
|---|---|
| `intro.mp3` | Hey there, I'm Jiyad. Welcome to my world. Run to the right, collect my skills, and stop at each glowing beacon. I'll walk you through what I've built. |
| `arc_overview.mp3` | This is ArcVisual. Paste any arXiv link, and it reads the paper's LaTeX source, finds the ideas that are hardest to understand, and turns them into animated explainers right beside the original text. |
| `arc_impact.mp3` | Under the hood it's a four-stage pipeline: ingest, analyze, generate, validate. Every animation passes three gates (a security check, a draft render and a layout check) before anyone sees it. Up to seven visuals per paper, and every claim cites back to the source. |
| `arc_use.mp3` | It's built for students, researchers and teachers who have ever stared at an equation and given up. It's live and free during beta. Hit the link and try a paper. |
| `vayu_overview.mp3` | This is VayuNetra. Methane is invisible, so I built a satellite AI that makes it visible. It scans free Sentinel-2 images over Indian landfills, detects methane plumes, and estimates how much is leaking. |
| `vayu_impact.mp3` | I fine-tuned a U-Net with a satellite-pretrained ResNet-50 encoder on 3,552 real plumes. It scores 0.76 on the ROC curve against 0.51 for the classic baseline. That's more than twice the recall and four times better pixel overlap. Across 674 scenes from five landfills, it raised zero false alarms on 334 control scenes. |
| `vayu_use.mp3` | Every detection becomes an action dossier for municipal bodies and pollution control boards: where the leak is, how big it is, and what to do next. It's deployed and live. |
| `outro.mp3` | You made it to the end. I'm looking for remote internships in AI engineering, research and back-end development. If you liked what you saw, let's build something together. |

## Controls

Arrow keys or A/D to run · Space/↑ to jump (again in the air to double jump) · Shift to dash · Z/J to attack · E/↓ to talk at a station · Esc to pause · M/V to toggle music/voice. Phones get on-screen buttons.

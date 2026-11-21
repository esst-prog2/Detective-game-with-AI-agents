# Homework 10: Ashcroft promo video

The finished file is [ashcroft-promo.mp4](../../promo/public/video/ashcroft-promo.mp4). It uses seven genuine, reproducibly captured screens from the actual offline Ashcroft game, with captions and restrained motion. No accusation was confirmed and no verdict or solution is shown.

- [Storyboard and lecture requirements](storyboard.md)
- [Exported-video contact sheet](video-contact-sheet.jpg) (frames near 2.5, 7.5, 12.5, 17.5, 22.5 and 27.5 seconds)
- [Source-capture contact sheet](capture-contact-sheet.jpg)
- [Capture provenance](../../videos/ashcroft/assets/provenance.json)
- [Editable HyperFrames source](../../videos/ashcroft/index.html)
- [Probe results](ffprobe.json), [composition checks](hyperframes-check.json), and [playback verification](verification/local-video.json)

## Format and audio

Measured export: exactly 30.000 seconds, 1920 × 1080, 16:9, 30 fps, 900 frames, H.264 High profile, yuv420p, BT.709 SDR. About 9.6 MiB. The MP4 has no audio stream: intentionally silent, as permitted by lecture slides 15/16. No music, voice, third-party stock footage or associated audio license was used. Visuals are existing project artwork and genuine game captures; no new ownership or license claim is made for those existing assets. Captions are part of the picture; the page also has an expandable text transcript.

## Reproduce on Windows

Tools installed with the user's explicit approval: official HyperFrames CLI **0.9.77**, FFmpeg **9.1** (Gyan Windows build via winget). Existing Node 24, Python/Pillow, Playwright and Chrome are used. Video tooling adds no game package dependency or gameplay changes. HyperFrames downloads/caches its own render dependencies; authoring needs network access for its pinned GSAP CDN script and compiler font cache on first use. Public playback needs only the self-contained MP4.

From the repository root, with the existing root and web dependencies installed:

```powershell
node scripts/homework-10-capture.mjs
python -B scripts/homework-10-compose.py
npx.cmd --yes hyperframes@0.9.77 check videos/ashcroft --json
npx.cmd --yes hyperframes@0.9.77 preview videos/ashcroft
```

The capture script requires its temporary ports 3002 and 5173 to be free; it refuses to reuse an unrelated server and stops its own servers afterwards. The original screenshots and provenance are retained under `videos/ashcroft/assets`. Generated HTML scenes are editable individually; rerunning compose regenerates them from the Python source. Root duration controls the 30-second timeline. Cached/intermediate renders are ignored by Git.

Use an **absolute output path**: this CLI version resolves output relative to the invoking working directory, not the composition directory.

```powershell
$videoOutput = Join-Path (Get-Location) 'promo/public/video/ashcroft-promo.mp4'
npx.cmd --yes hyperframes@0.9.77 render videos/ashcroft --output "$videoOutput" --fps 30 --format mp4 --quality delivery --workers 2 --sdr
ffprobe -v error -show_format -show_streams -of json "$videoOutput"
ffmpeg -hide_banner -loglevel error -i "$videoOutput" -f null -
ffmpeg -hide_banner -loglevel error -ss 2 -i "$videoOutput" -frames:v 1 -y promo/public/video/ashcroft-poster.webp
ffmpeg -hide_banner -loglevel error -i "$videoOutput" -vf 'fps=1/5,scale=640:-1,tile=3x2' -frames:v 1 -y docs/homework-10/video-contact-sheet.jpg
node web/node_modules/vite/bin/vite.js build promo --config promo/vite.config.mjs
node scripts/check-promo-assets.mjs
node scripts/homework-10-verify.mjs
$env:PROMO_BROWSER_CHANNEL = 'chrome'
$env:PROMO_VERIFY_DIR = 'docs/homework-10/verification/regression-local'
node scripts/homework-9-smoke.mjs
```

After installing FFmpeg, open a new terminal or refresh PATH from the user and machine environment. Playback verification uses installed Chrome for H.264 support, waits for the entire video to end at normal speed and saves six actual playback frames. Run it with the public page URL as an argument to verify HTTPS playback. The older screenshot regression now serves the correct MP4 MIME type and allows an explicit Chrome channel; it explicitly loads offscreen lazy images before awaiting their decoding; its existing screenshot assertions remain unchanged.

## Review and publication

The actual exported MP4 was fully decoded with FFmpeg and inspected through representative frames and normal-speed browser playback. HyperFrames reports zero lint, runtime, layout, motion or contrast errors/warnings. Its intentional image-crop overflow information reflects screenshots zoomed within their frame. The remaining craft warning is the deliberately silent film. No blank opening frame remains. Native browser controls, poster, transcript, phone/tablet reflow and all six repaired full-size screenshot links are checked. This is not a claim of full assistive-technology certification.

The isolated `promo/dist` build uses the existing audited `gh-pages` publication route; no game server or private case package enters the page. Publication hashes and actual public browser evidence are saved in `verification/`. The source PR targets `main` and remains unmerged for the user's approval.

## Canvas

Lecture 08.pdf slides 15/16 permit HyperFrames **or** captioned screen recording, require about 30 seconds and say sound is unnecessary. No specific codec/resolution was mandated there; H.264/1080p are delivery choices. Slide 27 requires the video on the promotional page and the **page address** on Canvas, under **Homework 10 — Your video**, by **21 November 2026, 20:00 Europe/Budapest**.

Open that Canvas assignment and submit this page address using its text/address submission field:

https://esst-prog2.github.io/Detective-game-with-AI-agents/

The lecture does not require a separate raw MP4 upload. Canvas has not been accessed or submitted by the assistant; account-specific control labels have not been verified.

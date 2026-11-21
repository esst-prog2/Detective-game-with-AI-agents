Adds the required 30-second Ashcroft video to the existing promotional page. Visitors can watch genuine game screens with readable captions, native playback controls, a poster and text transcript. No solution is revealed and no gameplay code changes.

The silent H.264 MP4 is exactly 30.000 seconds, 1920×1080 at 30fps. Retained storyboard, original captures/provenance, editable HyperFrames scenes and pinned reproduction commands make revisions possible. Rendering intermediates remain ignored. The screenshot regression harness now handles offscreen lazy images and MP4 MIME correctly, retaining all existing screenshot assertions.

Validation: HyperFrames composition checks; FFprobe metadata and full FFmpeg decode; normal-speed Chrome playback to the end; responsive/native-player/transcript checks; production build and asset-boundary audit; all six repaired screenshot links, keyboard navigation and 200% reflow at four widths. Dated local/public evidence and the separate Pages deployment record are in `docs/homework-10/verification`.

Course slides require this video on the promo and the page address on Canvas. The existing authorized isolated `gh-pages` artifact route publishes the static page independently. This source PR is intentionally left unmerged for review; Canvas submission remains with the student. No claim of full accessibility certification or macOS/Linux execution.

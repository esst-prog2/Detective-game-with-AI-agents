The published promo's six full-size screenshot links returned404: Vite hashed imported image src files but left manually authored hrefs pointing to missing un-hashed paths. Move the unchanged images to public/screenshots and use the configured BASE_URL for all thumbnails/image/caption destinations, keeping stable filenames at the GitHub project prefix.

Keep the selected layout and Windows instructions; add concise macOS/Linux npm and POSIX-shell equivalents with an explicit untested-platform note. Append a transparent correction to PROCESS.md without rewriting historical tests/evidence.

Validation: the new production-asset check failed against the original build with missing dist/assets/study.webp, then passed after repair. Production browser checks cover all six actual image/caption clicks and intended1440px images, thumbnail loads, mobile/desktop reflow, navigation and the OS note. All three moved screenshots are byte-identical. No game code, mechanics, E/F or video changes.

The existing authorized gh-pages artifact workflow publishes independently of this source PR; no automatic source merge is performed. Dated before/after public evidence and final deployment results are recorded alongside this description and in PROCESS.md.

The repair is now publicly verified. Pages workflow44906153511 succeeded for deployment237add2. All six actual public screenshot/caption clicks return200 with intended1440px images; all artifact hashes match. Desktop/mobile checks and the macOS/Linux note pass. Original November13 records remain intact.

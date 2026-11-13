"""Deliver agent-authored variants into the real Impeccable session scaffold.

Development helper only; never part of the public site artifact.
"""
import json
import pathlib
import re
import tempfile

root = pathlib.Path(__file__).resolve().parents[1]
saved = json.loads((pathlib.Path(tempfile.gettempdir()) / 'ashcroft-live-resume.json').read_text(encoding='utf-8-sig'))
event = saved['snapshot']['pendingEvent']
scaffold = event['scaffold']
target = root / 'promo' / 'index.html'
source = target.read_text(encoding='utf-8')
lines = source.splitlines(keepends=True)
original = event['element']['outerHTML']

styles = '''
@scope ([data-impeccable-variant="1"]) {
  :scope > .case-spread {background:var(--ground)}
  .masthead {border:0;max-width:1320px;padding:2rem 3rem}
  .hero {position:relative;background:var(--paper);color:#20282c;margin:1rem auto 5rem;max-width:1224px;padding:4rem;gap:3rem;grid-template-columns:1fr 1.2fr;align-items:start;box-shadow:0 24px 60px #0005}
  .hero-copy {gap:1.4rem}.hero h1{font-size:clamp(3rem,5.5vw,5.3rem)}
  .hook{color:#775524;font-size:1.5rem}.intro,.local-note{color:#424d50}.hero-proof{align-self:center;transform:rotate(-2deg);background:#20282c;padding:1rem;color:var(--ink)}.hero-proof img{border:0}.hero-proof figcaption{color:var(--ink);font-style:italic}
  .button{background:#20282c;color:var(--paper)}.button:hover{background:#45535a}.hero .text-link{color:#20282c}.hero a:focus-visible{outline-color:#775524}
  .section {max-width:1224px;padding:calc(5rem * var(--p-density,1)) 2rem}.how{display:grid;grid-template-columns:1fr 1.2fr;gap:4rem}.game-loop{margin:0;padding:0;list-style-position:inside;gap:1.5rem}.game-loop li{padding-bottom:1.5rem;border-bottom:1px solid var(--line)}.game-loop h3{display:inline}.game-loop p{margin-top:.5rem}.people article{border-top:1px solid var(--brass);padding-top:2rem}.people img{height:170px;width:136px}.investigation{grid-template-columns:1fr}.investigation>div{grid-template-columns:1fr 1fr;align-items:end}.investigation figure{max-width:1000px;margin:auto}.preview{background:var(--surface)}
  @media(min-width:1000px){.hero{grid-template-columns:calc(42% * var(--p-balance,1)) 1fr}.setup{grid-template-columns:.8fr 1.4fr}}
  @media(max-width:800px){.masthead{padding:1.5rem 5vw}.hero{margin:1rem 5vw 3rem;padding:2rem 1.5rem;grid-template-columns:1fr;gap:2rem}.hero h1{font-size:clamp(2.6rem,10vw,4rem)}.hero-proof{transform:none}.how,.investigation>div{grid-template-columns:1fr;gap:2rem}.section{padding:calc(3rem * var(--p-density,1)) 5vw}}
}
@scope ([data-impeccable-variant="2"]) {
  :scope > .walkthrough {background:var(--ground)}
  .masthead{max-width:1280px;padding-bottom:1.5rem}.hero{max-width:1280px;display:flex;flex-direction:column;padding-top:3.5rem;gap:2.5rem;align-items:stretch}.hero-copy{display:grid;grid-template-columns:1.3fr 1fr;column-gap:5rem;row-gap:1.5rem;align-items:start}.hero h1{grid-row:span 2;font-size:clamp(3rem,6vw,5.5rem)}.hook{font-size:1.6rem}.intro{grid-column:2}.actions{grid-column:1;grid-row:3}.local-note{grid-column:2;grid-row:3;align-self:center}.hero-proof{width:100%;margin:0}.hero-proof img{width:100%;max-height:calc(580px * var(--p-proof,1));object-fit:contain;background:#0c1012}.hero-proof figcaption{padding:.85rem 0}.section{padding:calc(4.5rem * var(--p-density,1)) 4vw;max-width:1280px}.how{display:grid;grid-template-columns:.85fr 1.5fr;gap:5rem}.game-loop{list-style:none;margin:0;padding:0;counter-reset:steps;gap:0}.game-loop li{counter-increment:steps;display:grid;grid-template-columns:3rem 1fr;column-gap:1rem;padding:1.5rem 0;border-bottom:1px solid var(--line)}.game-loop li::before{content:counter(steps);font:2rem Georgia,serif;color:var(--brass);grid-row:span 2}.game-loop h3{font-size:1.8rem}.game-loop p{grid-column:2}.people{gap:4rem}.people img{width:144px;height:180px}.people h3{font-size:2rem}.investigation{grid-template-columns:.85fr 1.5fr;gap:5rem}.characters{background:var(--surface)}.preview{grid-template-columns:.85fr 1.5fr;gap:5rem}.setup{grid-template-columns:.85fr 1.5fr;gap:5rem}.setup h2{position:sticky;top:2rem;align-self:start}.footer{padding-bottom:5rem}
  @media(max-width:800px){.hero-copy{grid-template-columns:1fr;gap:1.25rem}.hero h1,.intro,.actions,.local-note{grid-row:auto;grid-column:auto}.hero h1{font-size:clamp(2.7rem,10vw,4rem)}.hero{padding:3rem 5vw}.how,.investigation,.preview,.setup{grid-template-columns:1fr;gap:2rem}.section{padding:calc(3rem * var(--p-density,1)) 5vw}.setup h2{position:static}.people{gap:2rem}.people img{width:90px;height:130px}}
}
@scope ([data-impeccable-variant="3"]) {
  :scope > .theatre {background:var(--ground)}
  .masthead{max-width:none;padding:1.5rem 5vw;border-color:#576064}.hero{max-width:none;padding:0;display:flex;flex-direction:column;gap:0;position:relative;align-items:stretch}.hero-copy{display:contents}.hero h1{order:0;text-align:center;padding:3rem 5vw 2rem;font-size:clamp(3rem,6.5vw,6rem);line-height:1.02}.hero h1 br{display:none}.hero-proof{order:1;position:relative;width:min(100%,1600px);margin:auto;background:#0c1012}.hero-proof img{width:100%;max-height:calc(650px * var(--p-scene,1));object-fit:cover;object-position:center 45%;border:0}.hero-proof figcaption{position:absolute;bottom:0;left:0;right:0;background:#131719;padding:1rem 5vw;color:var(--muted)}.hook{order:2;text-align:center;font-size:clamp(1.4rem,2.5vw,2.1rem);padding:2rem 5vw 1.25rem;color:var(--brass)}.hook br{display:none}.hook br::after{content:' '}.intro{order:3;text-align:center;margin:auto;max-width:64ch;padding:0 5vw 1.5rem}.actions{order:4;justify-content:center;padding:0 5vw 1rem}.local-note{order:5;text-align:center;margin:auto;max-width:64ch;padding:0 5vw 3rem}.section{padding:calc(5rem * var(--p-density,1)) 5vw;max-width:1440px}.how>h2{text-align:center}.game-loop{list-style:none;padding:0;margin:0;grid-template-columns:repeat(5,1fr);gap:2rem}.game-loop li{border-top:1px solid var(--brass);padding-top:1.5rem}.game-loop h3{font-size:1.6rem}.game-loop p{font-size:.95rem}.suspects>h2{text-align:center}.people{max-width:1040px;margin:auto;gap:4rem}.people article{justify-items:center;text-align:center}.people img{width:160px;height:200px}.people h3{font-size:2rem}.investigation{display:flex;flex-direction:column;gap:2.5rem;align-items:center}.investigation>div{text-align:center;justify-items:center;gap:1.5rem}.investigation figure{max-width:1040px;width:100%}.characters,.preview,.setup{grid-template-columns:1fr 1.2fr;gap:6rem}.preview{background:var(--surface)}.footer{text-align:center;justify-items:center}
  @media(max-width:800px){.hero h1{font-size:clamp(2.7rem,10vw,4rem);padding-top:2rem}.hero h1 br{display:block}.hero-proof img{object-fit:contain;max-height:none}.hero-proof figcaption{position:static}.hook{font-size:1.5rem}.hook br{display:block}.game-loop{grid-template-columns:1fr;gap:1.5rem}.game-loop li{padding-top:1rem}.how>h2,.suspects>h2{text-align:left}.people{gap:2rem}.people article{justify-items:start;text-align:left}.people img{width:90px;height:130px}.characters,.preview,.setup{grid-template-columns:1fr;gap:2rem}.section{padding:calc(3rem * var(--p-density,1)) 5vw}}
}
'''

names = ['case-spread', 'walkthrough', 'theatre']
params = [
    [('density', .6, 1.4, .05, 1, 'Spacing'), ('balance', .8, 1.2, .05, 1, 'Copy / screenshot balance')],
    [('density', .6, 1.4, .05, 1, 'Spacing'), ('proof', .7, 1.2, .05, 1, 'Screenshot height')],
    [('density', .6, 1.4, .05, 1, 'Spacing'), ('scene', .7, 1.2, .05, 1, 'Scene height')],
]
fragments = [f'<style data-impeccable-css="{event["id"]}">{styles}</style>']
for number, name in enumerate(names, 1):
    markup = original.replace('class="promo-page"', f'class="promo-page {name}"', 1)
    # Every preview has a complete page while keeping anchor destinations unique.
    ids = re.findall(r'\bid="([^"]+)"', markup)
    for anchor in ids:
        markup = markup.replace(f'id="{anchor}"', f'id="v{number}-{anchor}"')
        markup = markup.replace(f'href="#{anchor}"', f'href="#v{number}-{anchor}"')
        markup = markup.replace(f'aria-labelledby="{anchor}"', f'aria-labelledby="v{number}-{anchor}"')
    if number == 3:
        markup = markup.replace('Question the suspects.<br>Examine the evidence.<br>Find out who is lying.', 'Question the suspects. <br>Examine the evidence. <br>Find out who is lying.')
    manifest = [dict(id=p[0], kind='range', min=p[1], max=p[2], step=p[3], default=p[4], label=p[5]) for p in params[number-1]]
    hidden = ' style="display: none"' if number > 1 else ''
    fragments.append(f'<div data-impeccable-variant="{number}" data-impeccable-params=\'{json.dumps(manifest)}\'{hidden}>\n{markup}\n</div>')

block = scaffold['wrapperBlock'].replace('<!-- Variants: insert below this line -->', '<!-- Variants: insert below this line -->\n' + '\n'.join(fragments))
start, end = scaffold['replaceStartLine'] - 1, scaffold['replaceEndLine']
target.write_text(''.join(lines[:start]) + block + '\n' + ''.join(lines[end:]), encoding='utf-8')
print(f'Delivered 3 complete layout variants in one write for browser session {event["id"]}.')

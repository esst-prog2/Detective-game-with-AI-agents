"""Generate the editable, deterministic HyperFrames composition from real captures."""
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1] / 'videos/ashcroft'
(root / 'compositions').mkdir(exist_ok=True)
scenes = [
    ('opening', 0, 4, 'THE ASHCROFT MANOR MURDER', 'One murder. Three suspects.', 'Your investigation begins here.', 'opening', 1.0),
    ('explore', 4, 5, '01 / EXPLORE & INSPECT', 'Explore the scene.', 'Look closely. Keep the details.', 'study', 1.0),
    ('question', 9, 6, '02 / QUESTION', 'Question everyone.', 'Choose a question. Hear their account.', 'questioning', 1.35),
    ('test', 15, 6, '03 / COMPARE', 'Test their stories.', 'Responses stay within authored character knowledge.', 'evidence-response', 1.35),
    ('accuse', 21, 5, '04 / DECIDE', 'Make your accusation.', 'The choice is yours. The ending stays yours.', 'accusation', 1.5),
    ('closing', 26, 4, 'A UNIVERSITY DETECTIVE GAME', 'Detective Game with AI Agents', 'Learn more · Play locally', None, 1),
]
css = '''*{box-sizing:border-box}#root{position:absolute;inset:0;background:#131719;color:#f3ecdc;font-family:Arial,sans-serif;overflow:hidden}.inside{position:absolute;inset:0}.eyebrow{position:absolute;left:192px;top:96px;font-size:28px;letter-spacing:5px;color:#d6b16d}h1{position:absolute;left:192px;top:128px;margin:0;font:normal 76px Georgia,serif;line-height:1.12}.picture{position:absolute;left:192px;top:258px;width:1536px;height:650px;overflow:hidden;border:1px solid #6e6044;background:#101516}.picture img{width:100%;height:100%;object-fit:contain;transform-origin:55% 65%}.caption{position:absolute;left:192px;top:938px;font-size:30px;color:#f3ecdc;line-height:1.4;margin:0}.rule{position:absolute;left:192px;top:230px;width:100px;height:3px;background:#d6b16d}.closing h1{top:300px;max-width:1450px;font-size:108px}.closing .eyebrow{top:230px}.closing .caption{top:610px;font-size:44px;color:#d6b16d}.url{position:absolute;left:192px;top:740px;font-size:30px;line-height:1.5;color:#f3ecdc}.closing .rule{top:560px;width:150px}.corner{position:absolute;right:192px;bottom:108px;color:#d6b16d;font-size:28px;letter-spacing:3px}'''
hosts=[]
for sid,start,duration,eyebrow,title,caption,asset,scale in scenes:
    hosts.append(f'<div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{start}" data-duration="{duration}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>')
    picture = f'<div class="picture"><img id="{sid}-image" src="assets/{asset}.png" alt="Genuine Ashcroft gameplay capture"></div>' if asset else '<div class="url">https://esst-prog2.github.io/<br>Detective-game-with-AI-agents/</div><div class="corner">ASHCROFT MANOR</div>'
    image_motion = f"tl.fromTo('#{sid}-image',{{scale:{scale}}},{{scale:{scale + .035},duration:{duration},ease:'none'}},0);" if asset else ''
    # The inspection shot uses a second genuine capture, never reconstructed UI.
    if sid == 'explore':
        picture += '<div class="picture" id="inspection"><img src="assets/evidence.png" alt="Genuine silver cufflink inspection"></div>'
        image_motion += "tl.fromTo('#inspection',{opacity:0},{opacity:1,duration:.3},2.2);"
    html = f'''<template><style>{css}</style>
<div id="root" data-composition-id="{sid}" data-width="1920" data-height="1080"><div id="{sid}-clip" class="clip" data-start="0" data-duration="{duration}"><div class="inside {'closing' if not asset else ''}" id="{sid}-inside"><div class="eyebrow">{eyebrow}</div><h1>{title}</h1><div class="rule"></div>{picture}<p class="caption">{caption}</p></div></div></div>
<script>const tl=gsap.timeline({{paused:true}});tl.fromTo('#{sid}-inside',{{opacity:{1 if sid == 'opening' else 0}}},{{opacity:1,duration:.22,ease:'power2.out'}},0);{image_motion}window.__timelines['{sid}']=tl;</script></template>'''
    (root/'compositions'/f'{sid}.html').write_text(html,encoding='utf-8')
(root/'index.html').write_text('''<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920,height=1080"><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><style>html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:#131719}#root{position:absolute;inset:0}</style></head><body><div id="root" data-composition-id="main" data-start="0" data-duration="30" data-fps="30" data-width="1920" data-height="1080">''' + ''.join(hosts) + '''</div><script>window.__timelines.main=gsap.timeline({paused:true});</script></body></html>''',encoding='utf-8')
(root/'hyperframes.json').write_text(json.dumps({'$schema':'https://hyperframes.heygen.com/schema/hyperframes.json','paths':{'blocks':'compositions','assets':'assets'},'media':{'autoProxy':True}},indent=2)+'\n')
(root/'.gitignore').write_text('.hyperframes/\nrenders/\nnode_modules/\n')
print('Generated six editable scenes, 30 seconds, with authentic screenshot sources.')

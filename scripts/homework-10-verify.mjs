// Play the actual MP4 at normal speed and verify its native player locally or live.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from '../web/node_modules/@playwright/test/index.mjs';
const root=resolve(import.meta.dirname,'..');
const dir=resolve(root,'docs/homework-10/verification');
const live=process.argv[2];
const prefix='/Detective-game-with-AI-agents/';
let server,browser;
await mkdir(dir,{recursive:true});
try {
  if(!live){
    const dist=resolve(root,'promo/dist');
    server=createServer(async(req,res)=>{
      const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(!path.startsWith(prefix)){res.writeHead(404).end();return;}
      const file=resolve(dist,path.slice(prefix.length)||'index.html');
      if(!file.startsWith(dist+'/')&&!file.startsWith(dist+'\\')){res.writeHead(404).end();return;}
      try{const data=await readFile(file);res.writeHead(200,{'Content-Type':{'.html':'text/html','.css':'text/css','.mp4':'video/mp4','.webp':'image/webp','.svg':'image/svg+xml'}[extname(file)]||'application/octet-stream','Content-Length':data.length}).end(data);}catch{res.writeHead(404).end();}
    });
    await new Promise((yes,no)=>server.once('error',no).listen(5177,'127.0.0.1',yes));
  }
  const url=live||'http://127.0.0.1:5177'+prefix;
  const errors=[];
  browser=await chromium.launch({channel:'chrome'});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`HTTP ${r.status()} ${new URL(r.url()).pathname}`);});
  assert.equal((await page.goto(url)).status(),200);
  const video=page.locator('video');
  await video.scrollIntoViewIfNeeded();
  await video.evaluate(v=>v.load());
  await page.waitForFunction(()=>document.querySelector('video').readyState>=2);
  const metadata=await video.evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,controls:v.controls,poster:v.poster,source:v.currentSrc,rate:v.playbackRate}));
  assert.equal(metadata.duration,30);assert.equal(metadata.width,1920);assert.equal(metadata.height,1080);assert.equal(metadata.controls,true);assert.equal(metadata.rate,1);
  await page.getByText('Read the video transcript',{exact:true}).click();
  assert.equal(await page.locator('.film details li').count(),6);
  await page.getByText('Read the video transcript',{exact:true}).click();
  const started=Date.now();
  await video.evaluate(v=>v.play());
  const label=live?'public':'local';
  for(const time of [1,6,12,18,23,28]){
    await page.waitForFunction(t=>document.querySelector('video').currentTime>=t,time,{timeout:40000});
    await video.screenshot({path:resolve(dir,`${label}-playback-${time}.png`)});
  }
  await page.waitForFunction(()=>document.querySelector('video').ended,null,{timeout:15000});
  const elapsedMs=Date.now()-started;
  assert.ok(elapsedMs>=29000&&elapsedMs<45000,`Normal speed playback took ${elapsedMs}ms`);
  assert.deepEqual(errors,[]);
  for(const width of [360,768]){
    await page.setViewportSize({width,height:900});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    assert.ok(await video.evaluate(v=>v.getBoundingClientRect().width<=innerWidth));
  }
  const result={url,metadata,elapsedMs,ended:true,errors,responsiveWidths:[360,768],transcript:true};
  await writeFile(resolve(dir,`${label}-video.json`),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
}finally{await browser?.close();await new Promise(yes=>server?server.close(yes):yes());}

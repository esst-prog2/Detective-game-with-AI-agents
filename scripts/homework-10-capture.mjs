// Genuine public Ashcroft screen states; never confirm an accusation.
import { chromium } from '../web/node_modules/@playwright/test/index.mjs';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'node:net';
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'videos/ashcroft/assets');
const children = []; let browser;
const events = [];
async function free(port, host) {
  const probe = createServer();
  await new Promise((yes,no)=>probe.once('error',no).listen(port,host,yes));
  await new Promise(r=>probe.close(r));
}
async function ready(url) {
  for(let i=0;i<100;i++) { try{ if((await fetch(url)).ok)return; }catch{} await new Promise(r=>setTimeout(r,100)); }
  throw Error('Capture server not ready');
}
const env = { ...process.env, API_PORT:'3002', OPENAI_API_KEY:'', OPENAI_MODEL:'' };
await mkdir(out,{recursive:true});
try {
  await free(3002,'127.0.0.1'); await free(5173,'::1');
  children.push(spawn(process.execPath,['src/server.js'],{cwd:root,env,windowsHide:true,stdio:'ignore'}));
  children.push(spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','::1'],{cwd:resolve(root,'web'),env,windowsHide:true,stdio:'ignore'}));
  await Promise.all([ready('http://127.0.0.1:3002/api/cases'),ready('http://[::1]:5173')]);
  browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
  const capture=async(name,action)=>{
    await page.screenshot({path:resolve(out,name+'.png'),fullPage:false});
    events.push({file:name+'.png',action,viewport:'1920x1080'});
  };
  await page.goto('http://localhost:5173');
  await page.getByRole('button',{name:'Start investigation',exact:true}).waitFor();
  await capture('opening','Actual default Ashcroft start screen');
  await page.getByRole('button',{name:'Start investigation',exact:true}).click();
  await page.getByRole('heading',{name:'the study',exact:true,level:1}).waitFor();
  await capture('study','Started actual offline Ashcroft investigation');
  await page.locator('.room-object').filter({hasText:'Silver cufflink'}).click();
  await page.getByRole('button',{name:'Close observation'}).waitFor();
  await capture('evidence','Inspected silver cufflink without ownership interpretation');
  await page.getByRole('button',{name:'Close observation'}).click();
  await page.getByRole('button',{name:'Speak with Alice Mercer',exact:true}).click();
  await page.getByLabel('Your question for Alice Mercer').fill('Where were you?');
  await page.getByRole('button',{name:'Ask question',exact:true}).click();
  await page.locator('blockquote').filter({hasText:'at home in my room'}).waitFor();
  await capture('questioning','Asked Alice an ordinary alibi question; real authored response');
  await page.getByRole('button',{name:/Return to room/}).click();
  await page.getByRole('button',{name:'Go to the garden',exact:true}).click();
  await page.getByRole('heading',{name:'the garden',exact:true,level:1}).waitFor();
  await capture('garden','Travelled to garden through actual room exit');
  await page.locator('.room-object').filter({hasText:'Muddy footprints'}).click();
  await page.getByRole('button',{name:'Close observation'}).click();
  await page.getByRole('button',{name:'Speak with Ben Carter',exact:true}).click();
  await page.locator('[data-choice="present-footprints"]').click();
  await page.locator('blockquote').filter({hasText:/anyone/i}).waitFor();
  await capture('evidence-response','Presented inspected footprints to Ben; genuine bounded response, no solution');
  await page.getByRole('button',{name:'Make an accusation',exact:true}).click();
  await page.getByRole('dialog').waitFor();
  // Ben is a neutral editorial selection; do not submit or imply correctness.
  await page.getByLabel('Selected suspect').selectOption('ben-carter');
  await capture('accusation','Opened and changed unconfirmed accusation dialog; no verdict requested');
  await page.getByRole('button',{name:'Cancel accusation',exact:true}).click();
  await writeFile(resolve(out,'provenance.json'),JSON.stringify({date:'2026-11-21',source:'Actual current offline game; no mocked API or fabricated screens',events,noAccusationConfirmed:true,noVerdictCaptured:true},null,2));
  console.log('Captured seven genuine 1920x1080 Ashcroft states; accusation cancelled, no verdict.');
} finally { await browser?.close(); for(const child of children)child.kill(); }

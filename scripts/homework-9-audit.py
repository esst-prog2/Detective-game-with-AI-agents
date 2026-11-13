"""Check the intended Pages artifact and its relevant Git history; print no secret values."""
from pathlib import Path
import hashlib,json,re,subprocess

root=Path(__file__).resolve().parents[1]
dist=root/'promo/dist'
patterns={
 'private-key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
 'github-token':r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b',
 'openai-key':r'\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{30,}\b',
 'session-injection':r'live\.js\?token=|impeccable-live-start',
 'server-solution':r'murdererId|privateFacts|intendedSolution|SERVER_ONLY_CANARY|concealmentReason',
}
findings=[]; manifest=[]
def scan(text,label):
 for kind,pattern in patterns.items():
  if re.search(pattern,text): findings.append({'location':label,'kind':kind})
for p in sorted(dist.rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(dist).as_posix()
 if p.is_symlink() or p.suffix in ['.map','.js','.mjs','.env','.py'] or '.git' in p.parts or p.name.startswith('.env'):
  findings.append({'location':rel,'kind':'unexpected-public-file'})
 data=p.read_bytes();manifest.append({'path':rel,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
 if p.suffix in ['.html','.css','.svg','.json']:scan(data.decode('utf-8'),rel)
# These are the files that could actually enter Pages. Prior revisions matter too.
commits=subprocess.check_output(['git','rev-list','HEAD','--','promo/index.html','promo/style.css','promo/assets'],text=True).splitlines()
blobs=set()
for commit in commits:
 for line in subprocess.check_output(['git','ls-tree','-r',commit,'--','promo/index.html','promo/style.css','promo/assets'],text=True).splitlines():
  meta,path=line.split('\t',1);oid=meta.split()[2]
  if Path(path).suffix in ['.html','.css','.svg','.json']:blobs.add((oid,path))
for oid,path in blobs:
 text=subprocess.check_output(['git','cat-file','blob',oid]).decode('utf-8')
 # Historic proposed variants legitimately have data-impeccable markers, never credentials/solutions.
 scan(text,f'{path}@{oid[:10]}')
env_history=subprocess.check_output(['git','log','--all','--format=%h','--','.env'],text=True).splitlines()
if env_history:findings.append({'location':'.env tracked history','kind':'environment-file'})
report={'scope':'Exact Pages artifact, all reachable historic promo source/assets, and tracked .env history. No claim of removing existing case source from the public repository.','manifest':manifest,'history_commits':len(commits),'history_text_blobs':len(blobs),'tracked_dotenv_commits':len(env_history),'findings':findings}
out=root/'docs/homework-9/publication-audit.json';out.write_text(json.dumps(report,indent=2))
print(json.dumps({'public_files':len(manifest),'artifact_bytes':sum(i['bytes'] for i in manifest),'history_text_blobs':len(blobs),'findings':findings}))
raise SystemExit(1 if findings else 0)

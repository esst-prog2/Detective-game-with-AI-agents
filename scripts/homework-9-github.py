"""Minimal GitHub API helper. Credentials stay in process memory and stdin only."""
import json
import subprocess
import sys
import urllib.request
import urllib.error
from pathlib import Path
import base64
import hashlib

REPO = 'esst-prog2/Detective-game-with-AI-agents'

def request(path, method='GET', data=None, auth=True):
    headers = {'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'homework-9-pages'}
    if auth:
        credential = subprocess.run(['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n', text=True, capture_output=True, check=True)
        values = dict(line.split('=',1) for line in credential.stdout.splitlines() if '=' in line)
        token = values.get('password')
        if not token:
            raise RuntimeError('No GitHub credential available through the configured Git helper')
        headers['Authorization'] = 'Bearer ' + token
    raw = json.dumps(data).encode() if data is not None else None
    try:
        with urllib.request.urlopen(urllib.request.Request('https://api.github.com'+path, data=raw, headers=headers, method=method), timeout=45) as response:
            content = response.read()
            return response.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as error:
        payload = json.loads(error.read() or '{}')
        return error.code, {'message': payload.get('message', 'GitHub API error')}

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'inspect':
        status, repo = request('/repos/'+REPO)
        print(json.dumps({'repository_status': status, 'private':repo.get('private'), 'visibility':repo.get('visibility'), 'default_branch':repo.get('default_branch'), 'permissions':repo.get('permissions') }))
        status, pages = request('/repos/'+REPO+'/pages')
        print(json.dumps({'pages_status':status, 'url':pages.get('html_url'), 'build_type':pages.get('build_type'), 'source':pages.get('source'), 'message':pages.get('message')}))
        status, branches = request('/repos/'+REPO+'/branches?per_page=100')
        print(json.dumps({'branches_status':status, 'branches':[b['name'] for b in branches] if isinstance(branches,list) else []}))
    elif mode == 'publish':
        root = Path(__file__).resolve().parents[1]
        audit = json.loads((root/'docs/homework-9/publication-audit.json').read_text())
        if audit['findings']:
            raise SystemExit('Publication blocked: audit findings remain')
        dist = root/'promo/dist'
        files = {p.relative_to(dist).as_posix():p for p in dist.rglob('*') if p.is_file()}
        if set(files) != {item['path'] for item in audit['manifest']}:
            raise SystemExit('Publication blocked: artifact differs from audited file list')
        for item in audit['manifest']:
            if hashlib.sha256(files[item['path']].read_bytes()).hexdigest() != item['sha256']:
                raise SystemExit('Publication blocked: artifact changed since audit')
        def checked(path, method='GET', data=None, codes=(200,201)):
            status, body = request(path,method,data)
            if status not in codes:
                raise RuntimeError(f'GitHub {method} {path} returned {status}: {body.get("message")}')
            return body
        repo = checked('/repos/'+REPO)
        if repo.get('private'):
            raise SystemExit('Publication blocked: repository is private; visibility approval required')
        status, pages = request('/repos/'+REPO+'/pages')
        if status not in (200,404):
            raise SystemExit(f'Cannot inspect Pages settings: HTTP {status}')
        if status==200 and pages.get('source') != {'branch':'gh-pages','path':'/'}:
            raise SystemExit('Publication blocked: another Pages publishing source exists')
        refstatus, ref = request('/repos/'+REPO+'/git/ref/heads/gh-pages')
        if refstatus not in (200,404):
            raise SystemExit(f'Cannot inspect deployment branch: HTTP {refstatus}')
        tree=[]
        for name,p in sorted(files.items()):
            blob=checked('/repos/'+REPO+'/git/blobs','POST',{'content':base64.b64encode(p.read_bytes()).decode(),'encoding':'base64'})
            tree.append({'path':name,'mode':'100644','type':'blob','sha':blob['sha']})
        result=checked('/repos/'+REPO+'/git/trees','POST',{'tree':tree})
        source=subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
        commit=checked('/repos/'+REPO+'/git/commits','POST',{'message':'Deploy approved detective promo from '+source,'tree':result['sha'],'parents':[ref['object']['sha']] if refstatus==200 else []})
        if refstatus==404:
            checked('/repos/'+REPO+'/git/refs','POST',{'ref':'refs/heads/gh-pages','sha':commit['sha']})
        else:
            checked('/repos/'+REPO+'/git/refs/heads/gh-pages','PATCH',{'sha':commit['sha'],'force':False})
        if status==404:
            enabled, response = request('/repos/'+REPO+'/pages','POST',{'build_type':'legacy','source':{'branch':'gh-pages','path':'/'}})
            if enabled==409:
                # Creating gh-pages can auto-enable Pages before this request.
                pages=checked('/repos/'+REPO+'/pages')
                if pages.get('source') != {'branch':'gh-pages','path':'/'}:
                    raise SystemExit('Publication blocked: automatic Pages source differs')
            elif enabled==201:
                pages=response
            else:
                raise RuntimeError(f'Pages setup returned HTTP {enabled}: {response.get("message")}')
        report={'source_commit':source,'deployment_commit':commit['sha'],'branch':'gh-pages','files':list(sorted(files)),'url':pages.get('html_url'),'method':'GitHub Pages branch publishing; isolated static root; no inherited game history'}
        (root/'docs/homework-9/deployment.json').write_text(json.dumps(report,indent=2))
        print(json.dumps(report))
    elif mode == 'status':
        status,pages=request('/repos/'+REPO+'/pages')
        print(json.dumps({'pages_status':status,'status':pages.get('status'),'url':pages.get('html_url'),'source':pages.get('source')}))
        status,build=request('/repos/'+REPO+'/pages/builds/latest')
        print(json.dumps({'build_http':status,'build_status':build.get('status'),'commit':build.get('commit'),'error':build.get('error')}))
        status,runs=request('/repos/'+REPO+'/actions/runs?branch=gh-pages&per_page=3')
        print(json.dumps({'runs_http':status,'runs':[{'id':r['id'],'status':r['status'],'conclusion':r['conclusion'],'url':r['html_url'],'sha':r['head_sha']} for r in runs.get('workflow_runs',[])]}))
    elif mode == 'pr':
        status,pulls=request('/repos/'+REPO+'/pulls?state=open&head=esst-prog2:feature/homework-9-promo-page')
        if status==200 and pulls:
            print(json.dumps({'pull_request':pulls[0]['html_url'],'existing':True}))
        else:
            root=Path(__file__).resolve().parents[1]
            body=(root/'docs/homework-9/PR_DESCRIPTION.md').read_text()
            status,pull=request('/repos/'+REPO+'/pulls','POST',{'title':'Add Homework 9 detective-game promotional page','head':'feature/homework-9-promo-page','base':'main','body':body,'draft':True})
            print(json.dumps({'http':status,'pull_request':pull.get('html_url'),'message':pull.get('message')}))
            if status!=201:raise SystemExit(1)
    else:
        raise SystemExit('Expected inspect, publish, status or pr')

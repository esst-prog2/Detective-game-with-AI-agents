"""Minimal GitHub API helper. Credentials stay in process memory and stdin only."""
import json
import subprocess
import sys
import urllib.request
import urllib.error

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
    else:
        raise SystemExit('Only inspect is currently supported')

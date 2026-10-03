#!/usr/bin/env python3
"""Generates each recipe's n8n workflow (webhook → code → HTTP request) from recipes/*/n8n.src.json.

An n8n.src.json gives the name, the LearnFloo events, the mapping code and the HTTP node settings; the generated
n8n.json is what people import. Generic nodes only (Webhook, Code, HTTP Request), so the file imports the same way
on every n8n version. Run: python3 ci/build.py
"""
import json, uuid, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent


def uid(seed: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_URL, f'learnfloo-integrations/{seed}'))


def workflow(slug: str, src: dict) -> dict:
    events = src['events']
    hook = {
        'parameters': {'httpMethod': 'POST', 'path': uid(slug + '/path'), 'responseMode': 'onReceived', 'options': {}},
        'id': uid(slug + '/webhook'),
        'name': src.get('triggerName', 'LearnFloo webhook'),
        'type': 'n8n-nodes-base.webhook',
        'typeVersion': 2,
        'position': [0, 0],
        'webhookId': uid(slug + '/webhookId'),
    }
    code = (
        f"// Keeps the events of this recipe, then builds the request(s) for {src['tool']}.\n"
        f"const WANTED = {json.dumps(events)}\n"
        "const out = []\n"
        "for (const item of $input.all()) {\n"
        "  const msg = item.json.body ?? item.json\n"
        "  if (WANTED.length && !WANTED.includes(msg.event)) continue\n"
        + "\n".join('  ' + line for line in src['code'].strip().split('\n'))
        + "\n}\nreturn out\n"
    )
    mapper = {
        'parameters': {'jsCode': code},
        'id': uid(slug + '/code'),
        'name': 'Map to ' + src['tool'],
        'type': 'n8n-nodes-base.code',
        'typeVersion': 2,
        'position': [240, 0],
    }
    http_params = {
        'method': '={{ $json.method }}',
        'url': '={{ $json.url }}',
        'sendBody': True,
        'specifyBody': 'json',
        'jsonBody': '={{ JSON.stringify($json.body) }}',
        'options': {},
    }
    auth = src.get('auth')
    if auth:
        http_params['authentication'] = 'genericCredentialType'
        http_params['genericAuthType'] = 'httpHeaderAuth'
    if src.get('headers'):
        http_params['sendHeaders'] = True
        http_params['headerParameters'] = {'parameters': [{'name': k, 'value': v} for k, v in src['headers'].items()]}
    request = {
        'parameters': http_params,
        'id': uid(slug + '/http'),
        'name': src['tool'],
        'type': 'n8n-nodes-base.httpRequest',
        'typeVersion': 4.2,
        'position': [480, 0],
    }
    nodes = [hook, mapper, request]
    connections = {
        hook['name']: {'main': [[{'node': mapper['name'], 'type': 'main', 'index': 0}]]},
        mapper['name']: {'main': [[{'node': request['name'], 'type': 'main', 'index': 0}]]},
    }
    notes = src.get('note')
    if notes:
        nodes.append({
            'parameters': {'content': notes, 'height': 260, 'width': 420},
            'id': uid(slug + '/note'),
            'name': 'Read me',
            'type': 'n8n-nodes-base.stickyNote',
            'typeVersion': 1,
            'position': [0, -320],
        })
    return {'name': src['name'], 'nodes': nodes, 'connections': connections, 'settings': {'executionOrder': 'v1'}, 'pinData': {}, 'meta': {'templateCredsSetupCompleted': False}}


def main():
    for src_path in sorted(ROOT.glob('recipes/*/n8n.src.json')):
        slug = src_path.parent.name
        src = json.loads(src_path.read_text())
        out = src_path.parent / 'n8n.json'
        out.write_text(json.dumps(workflow(slug, src), indent=2, ensure_ascii=False) + '\n')
        print('built', out.relative_to(ROOT))
    # One catalog for the www pages and the app's Integrations tab (a single source: the meta.json files)
    catalog = [json.loads(m.read_text()) for m in sorted(ROOT.glob('recipes/*/meta.json'))]
    (ROOT / 'catalog.json').write_text(json.dumps({'recipes': catalog}, indent=2, ensure_ascii=False) + '\n')
    print('built catalog.json')


if __name__ == '__main__':
    main()

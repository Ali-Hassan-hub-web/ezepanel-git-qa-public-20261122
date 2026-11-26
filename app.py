import json
import os
import pathlib

REVISION = json.loads((pathlib.Path(__file__).parent / 'revision.json').read_text())['revision']

def app(environ, start_response):
    try:
        storage = pathlib.Path(os.environ['EZEPANEL_STORAGE_PATH'])
        counter = storage / 'git-native175-visits'
        count = int(counter.read_text()) if counter.exists() else 0
        if count < 0:
            raise ValueError('STORAGE_COUNTER_INVALID')
        counter.write_text(str(count + 1))
        counter.chmod(0o600)
        try:
            pathlib.Path('/root/.bashrc').read_bytes()
            private_read_denied = False
        except PermissionError:
            private_read_denied = True
        body = json.dumps({'provider': 'python', 'revision': REVISION, 'uid': os.getuid(), 'storageCount': count + 1, 'environmentPreserved': os.environ.get('QA_GREETING') == 'managed-native-qa', 'privateReadDenied': private_read_denied}).encode()
        start_response('200 OK', [('Content-Type', 'application/json'), ('Cache-Control', 'no-store'), ('Content-Length', str(len(body)))])
        return [b'' if environ.get('REQUEST_METHOD') == 'HEAD' else body]
    except Exception:
        body = b'{"error":"MANAGED_NATIVE_QA_REQUEST_FAILED"}'
        start_response('500 Internal Server Error', [('Content-Type', 'application/json'), ('Content-Length', str(len(body)))])
        return [body]

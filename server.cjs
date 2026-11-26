'use strict';
const fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const revision=require('./revision.json').revision;
http.createServer((request,response)=>{
 try {
  const storage=process.env.EZEPANEL_STORAGE_PATH;
  if(!storage)throw new Error('MANAGED_STORAGE_REQUIRED');
  const counter=path.join(storage,'git-native175-visits');
  const count=fs.existsSync(counter)?Number(fs.readFileSync(counter,'utf8')):0;
  if(!Number.isSafeInteger(count)||count<0)throw new Error('STORAGE_COUNTER_INVALID');
  fs.writeFileSync(counter,String(count+1),{mode:0o600});
  let privateReadDenied=false;try{fs.readFileSync('/root/.bashrc');}catch(error){privateReadDenied=error.code==='EACCES';}
  const body=JSON.stringify({provider:'node',revision,uid:typeof process.getuid==='function'?process.getuid():null,storageCount:count+1,environmentPreserved:process.env.QA_GREETING==='managed-native-qa',privateReadDenied});
  response.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(request.method==='HEAD'?'':body);
 }catch(error){console.error('MANAGED_NATIVE_QA_REQUEST_FAILED');response.writeHead(500,{'Content-Type':'application/json'});response.end('{"error":"MANAGED_NATIVE_QA_REQUEST_FAILED"}');}
}).listen(3000,'127.0.0.1');

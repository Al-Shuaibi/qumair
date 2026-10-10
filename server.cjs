const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};
const root=__dirname;
const server=http.createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end();return;}
  const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(target,(err,bytes)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);});
});
const port=Number(process.env.QUMAIR_PORT||8767);
if(!Number.isInteger(port)||port<1024||port>65535){console.error('Invalid QUMAIR_PORT. Use a number from 1024 to 65535.');process.exitCode=1;}
else {
 server.on('error',err=>{console.error(err.code==='EADDRINUSE'?'Qumair is already running on this port. Open the existing window or close it before starting again.':'Could not start Qumair: '+err.message);process.exitCode=1;});
 server.listen(port,'127.0.0.1',()=>console.log('Qumair: http://127.0.0.1:'+port+'/'));
}

const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const source=html.match(/<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/)[1];

const context={window:{},React:{createRef:()=>({current:null})},DCLogic:class{setState(p){this.state={...this.state,...(typeof p==='function'?p(this.state):p)}}},console,AbortController,setTimeout,clearTimeout,clearInterval,performance,localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:()=>null}};
vm.createContext(context);vm.runInContext(fs.readFileSync('questions.js','utf8'),context);vm.runInContext(source+'\nglobalThis.TestComponent=Component;',context);
(async()=>{
 const c=new context.TestComponent();assert.equal(c.questions().length,110);
 for(const q of c.questions()){assert.equal(c.local(q.q).a,q.a);assert.equal(c.local(q.q).sure,true)}
 assert.equal(c.local('من فاز في مباراة كرة القدم؟').sure,false);
 let calls=0;c.gemini=async()=>{calls++;return{text:'{"scope":"other"}'}};
 const outside=await c.researched('كيف أطبخ الأرز؟');assert.match(outside.a,/مختص بالفضاء/);assert.equal(calls,1);
 c.gemini=async(text,opts)=>opts.tools?{text:'إجابة موثقة',candidate:{groundingMetadata:{groundingChunks:[{web:{uri:'https://www.nasa.gov/',title:'NASA'}},{web:{uri:'javascript:alert(1)',title:'bad'}}]}}}:{text:'{"scope":"space"}'};
 const inside=await c.researched('كيف يتكون المذنب؟');assert.equal(inside.a,'إجابة موثقة');assert.equal(inside.sources.length,1);
 c.gemini=async(text,opts)=>opts.tools?{text:'غير موثق',candidate:{}}:{text:'{"scope":"space"}'};
 assert.match((await c.researched('سؤال فضائي')).a,/لم أتمكن من التحقق/);
 let played=false;c.recordedBuffer=async()=>({duration:2});c.playBuffer=async()=>{played=true};c.stopAudio=()=>{};c.reveal=text=>c.setState({bubble:text});
 await c.say('إجابة محفوظة');assert.equal(played,true);assert.equal(c.gKey(),'');
 c.state.provider='recorded';c.recordedBuffer=async()=>null;played=false;await c.say('إجابة غير محفوظة');assert.equal(played,false);assert.match(c.state.voiceNotice,/لا يوجد مقطع/);
 const voice=new context.TestComponent();assert.equal(voice.state.provider,'elevenlabs');assert.equal(voice.state.elevenVoice,'qSfjem6kskBSKupE4hr0');
 voice.stopAudio=()=>{};voice.renderVals().onVoiceProfile({target:{value:'female'}});assert.equal(voice.state.elevenVoice,'FZeLZd39ejvLgzR2gY0t');
 voice.renderVals().onElevenVoice({target:{value:'femaleTestVoice123'}});assert.equal(voice.state.femaleVoice,'femaleTestVoice123');
 voice.renderVals().onVoiceProfile({target:{value:'students'}});assert.equal(voice.state.elevenVoice,'qSfjem6kskBSKupE4hr0');
 voice.savedClip=async key=>{voice.lastRecordingKey=key;return null;};await voice.recordedBuffer('test answer');assert.match(voice.lastRecordingKey,/qSfjem6kskBSKupE4hr0/);
 voice.renderVals().onVoiceProfile({target:{value:'female'}});await voice.recordedBuffer('test answer');assert.match(voice.lastRecordingKey,/femaleTestVoice123/);
 const cancel=new context.TestComponent();cancel.stopAudio=()=>{};cancel.say=()=>{throw Error('Cancelled reply must not speak');};
 cancel.apiKey='test-only';let finishResearch;cancel.researched=()=>new Promise(resolve=>finishResearch=resolve);
 const pending=cancel.ask('سؤال جديد');cancel.renderVals().onStop();finishResearch({a:'late reply',sources:[]});await pending;assert.equal(cancel.state.history.length,0);assert.equal(cancel.busy,false);
 assert.ok(!templateHasGoogleVoice(html));
 const api=new context.TestComponent();api.elevenKey='test-only-not-a-real-key';api.getCtx=()=>({decodeAudioData:async()=>({sampleRate:44100,getChannelData:()=>new Float32Array([0])})});api.savedClip=async()=>null;api.saveClip=async()=>true;
 let requested;context.fetch=async(url,options)=>{requested={url,options,body:JSON.parse(options.body)};return{ok:true,arrayBuffer:async()=>new ArrayBuffer(0)}};
 await api.ttsBuffer('إجابة جديدة');assert.match(requested.url,/qSfjem6kskBSKupE4hr0/);assert.equal(requested.body.language_code,'ar');assert.equal(requested.body.model_id,'eleven_flash_v2_5');assert.equal(requested.body.text,'إجابة جديدة');
 api.state.elevenVoice='femaleTestVoice123';await api.ttsBuffer('إجابة جديدة');assert.match(requested.url,/femaleTestVoice123/);
 api.elevenKey='';api.savedClip=async()=>({rate:24000,samples:new Float32Array([0])});api.getCtx=()=>({createBuffer:()=>({copyToChannel:()=>{}})});api.cache.clear();assert.ok(await api.ttsBuffer('إجابة محفوظة'));
 const values=c.renderVals();const template=html.match(/<x-dc>([\s\S]*?)<\/x-dc>/)[1];
 const vars=[...template.matchAll(/\{\{\s*([\w]+)\s*\}\}/g)].map(m=>m[1]);for(const v of vars)assert.ok(v in values,'Missing UI value '+v);
 assert.ok(!source.includes('window.claude'));assert.ok(!source.includes("localStorage.setItem('qumair-gemini-key'"));
 const motion=new context.TestComponent();motion.idlePose(1000);assert.equal(motion.idlePose(16000).comet,null);
 motion.idleEvent={name:'comet',start:17000,duration:4200,dir:1};const dodge=motion.idlePose(19000);assert.ok(dodge.comet);assert.ok(dodge.x>0);assert.ok(dodge.y<-.27);
 motion.state.listening=true;const stopped=motion.idlePose(19001);assert.equal(stopped.comet,null);assert.equal(stopped.x,0);assert.equal(stopped.ry,0);assert.equal(motion.idleEvent,null);
 motion.state.listening=false;motion.reducedMotion=true;assert.equal(motion.idlePose(90000).comet,null);
 assert.ok(!source.includes('root.add(ring)'));assert.ok(template.includes('voice-primary'));assert.ok(template.includes('showChat'));
 // المذنب يستأنف نفس المقطع من موضع التوقف، والإيقاف يلغي الاستئناف المتأخر.
 const scene=new context.TestComponent();scene.getCtx=()=>({currentTime:12});scene.whoosh=()=>{};
 scene.playback={buf:{duration:40},id:4,offset:3,started:7};scene.speakId=4;scene.speaking=true;
 scene.recordedBuffer=async()=>({duration:1});let scenePlays=[];scene.playBuffer=async(buf,id,offset=0)=>scenePlays.push({buf,id,offset});
 let endFlight;const realTimeout=context.setTimeout;context.setTimeout=(fn,ms)=>ms===2400?(endFlight=fn,0):realTimeout(fn,ms);
 const scenePending=scene.sceneComet();assert.equal(scene.state.sceneActive,true);assert.equal(scene.pausedPlayback.offset,8);endFlight();await scenePending;
 assert.equal(scenePlays.length,3);assert.equal(scenePlays[2].offset,8);assert.equal(scenePlays[2].id,4);assert.equal(scene.state.sceneActive,false);
 const cancelledScene=new context.TestComponent();cancelledScene.whoosh=()=>{};cancelledScene.recordedBuffer=async()=>{throw Error('Cancelled scene must not load speech')};
 const interrupted=cancelledScene.sceneComet();cancelledScene.renderVals().onStop();endFlight();await interrupted;assert.equal(cancelledScene.state.sceneActive,false);
 context.setTimeout=realTimeout;
 console.log('PASS: comet pauses PCM at exact elapsed offset, plays remarks and resumes; Stop cancels pending scene.');
 const crypto=require('node:crypto');const support=fs.readFileSync('support.js','utf8');
 for(const [file,name] of [['react.js','REACT_SRI'],['react-dom.js','REACT_DOM_SRI'],['babel.js','BABEL_SRI']]){const expected=support.match(new RegExp('var '+name+' = "([^"]+)"'))[1];assert.equal('sha384-'+crypto.createHash('sha384').update(fs.readFileSync('vendor/'+file)).digest('base64'),expected);}
 console.log('PASS: 110 question answers, scope refusal, sourced research, unverified fallback, saved audio without key, UI bindings and no Claude dependency.');
 console.log('PASS: comet dodge, idle pause during listening, reduced motion, ring removal, voice-first layout, local dependency integrity.');
 console.log('PASS: selected ElevenLabs voice, separate student voices and recordings, cancellation of late answers, Google is research-only.');
 console.log('PASS: ElevenLabs request uses chosen voice for new answers, Arabic language, and cached audio plays without a key. Live services are not tested.');
 let route;const path=require('node:path');const serverStub={on:()=>{},listen:()=>{}};
 vm.runInNewContext(fs.readFileSync('server.cjs','utf8'),{require:name=>name==='node:http'?{createServer:handler=>{route=handler;return serverStub}}:require(name),__dirname:process.cwd(),URL,console,process:{env:{}}});
 const request=url=>new Promise(resolve=>{let status,headers;route({url},{writeHead:(code,h)=>{status=code;headers=h},end:body=>resolve({status,headers,body})});});
 assert.equal((await request('/')).status,200);assert.equal((await request('/vendor/three.module.js')).headers['Content-Type'],'text/javascript; charset=utf-8');
 assert.equal((await request('/missing-file.js')).status,404);assert.equal((await request('/%ZZ')).status,400);assert.equal((await request('/%2e%2e%2foutside.txt')).status,403);
 console.log('PASS: local server serves app and module assets, handles missing files, malformed URLs and traversal. Browser rendering is not tested.');
})().catch(e=>{console.error(e);process.exitCode=1});
function templateHasGoogleVoice(html){return html.includes('option value="gemini"');}




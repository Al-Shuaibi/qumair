const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const source=html.match(/<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/)[1];

const context={window:{},React:{createRef:()=>({current:null})},DCLogic:class{setState(p){this.state={...this.state,...(typeof p==='function'?p(this.state):p)}}},console,AbortController,setTimeout,clearTimeout,clearInterval,performance,localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:()=>null}};
vm.createContext(context);vm.runInContext(fs.readFileSync('speech-text.js','utf8'),context);vm.runInContext(fs.readFileSync('questions.js','utf8'),context);vm.runInContext(source+'\nglobalThis.TestComponent=Component;',context);
(async()=>{
 const c=new context.TestComponent();assert.equal(c.questions().length,110);
 const diagnosis=new context.TestComponent();diagnosis.elevenKey='test-only';
 const creditError=await diagnosis.speechServiceError({status:400,json:async()=>({detail:{status:'quota_exceeded',message:'secret-must-not-appear'}})});
 assert.match(diagnosis.speechErrorNotice(creditError),/رصيد/);assert.match(diagnosis.speechErrorNotice(creditError),/400 \/ quota_exceeded/);assert.ok(!diagnosis.speechErrorNotice(creditError).includes('secret'));
 assert.match(diagnosis.speechErrorNotice(await diagnosis.speechServiceError({status:402,json:async()=>({detail:{status:'payment_required'}})})),/اشتراكًا/);
 assert.match(diagnosis.speechErrorNotice({status:403}),/Text to Speech/);assert.match(diagnosis.speechErrorNotice({name:'TypeError'}),/الاتصال/);
 const malformed=await diagnosis.speechServiceError({status:400,json:async()=>({detail:{status:'<secret>'}})});assert.equal(malformed.serviceCode,undefined);
 console.log('PASS: voice failures report safe service codes, credit/payment/access and connection errors without raw response messages.');
 for(const q of c.questions()){assert.equal(c.local(q.q).a,q.a);assert.equal(c.local(q.q).sure,true)}
 assert.equal(c.local('من فاز في مباراة كرة القدم؟').sure,false);
 let calls=0;c.gemini=async()=>{calls++;return{text:'{"scope":"other"}'}};
 const outside=await c.researched('كيف أطبخ الأرز؟');assert.match(outside.a,/مختص بالفضاء/);assert.equal(calls,1);
 c.gemini=async(text,opts)=>opts.tools?{text:'إجابة موثقة',candidate:{groundingMetadata:{groundingChunks:[{web:{uri:'https://www.nasa.gov/',title:'NASA'}},{web:{uri:'javascript:alert(1)',title:'bad'}}]}}}:{text:'{"scope":"space"}'};
 const inside=await c.researched('كيف يتكون المذنب؟');assert.equal(inside.a,'إجابة موثقة');assert.equal(inside.sources.length,1);
 c.gemini=async(text,opts)=>opts.tools?{text:'غير موثق',candidate:{}}:{text:'{"scope":"space"}'};
 assert.match((await c.researched('سؤال فضائي')).a,/لم أتمكن من التحقق/);
 let played=false;c.recordedBuffer=async()=>({duration:2});c.playBuffer=async()=>{played=true};c.stopAudio=()=>{};c.reveal=text=>c.setState({bubble:text});
 c.state.provider='recorded';await c.say('إجابة محفوظة');assert.equal(played,true);assert.equal(c.gKey(),'');
 c.state.provider='recorded';c.recordedBuffer=async()=>null;played=false;await c.say('إجابة غير محفوظة');assert.equal(played,false);assert.match(c.state.voiceNotice,/لا يوجد مقطع/);
 const voice=new context.TestComponent();assert.equal(voice.state.provider,'elevenlabs');assert.equal(voice.state.elevenVoice,'qSfjem6kskBSKupE4hr0');
 voice.stopAudio=()=>{};voice.renderVals().onVoiceProfile({target:{value:'female'}});assert.equal(voice.state.elevenVoice,'FZeLZd39ejvLgzR2gY0t');
 voice.renderVals().onElevenVoice({target:{value:'femaleTestVoice123'}});assert.equal(voice.state.femaleVoice,'femaleTestVoice123');
 voice.renderVals().onVoiceProfile({target:{value:'students'}});assert.equal(voice.state.elevenVoice,'qSfjem6kskBSKupE4hr0');
 voice.renderVals().onElevenVoice({target:{value:''}});voice.renderVals().onSaveEleven();assert.equal(voice.state.elevenVoice,'qSfjem6kskBSKupE4hr0');
 voice.savedClip=async key=>{voice.lastRecordingKey=key;return null;};await voice.recordedBuffer('test answer');assert.match(voice.lastRecordingKey,/qSfjem6kskBSKupE4hr0/);
 voice.renderVals().onVoiceProfile({target:{value:'female'}});await voice.recordedBuffer('test answer');assert.match(voice.lastRecordingKey,/femaleTestVoice123/);
 const cancel=new context.TestComponent();cancel.stopAudio=()=>{};cancel.say=()=>{throw Error('Cancelled reply must not speak');};
 cancel.apiKey='test-only';let finishResearch;cancel.researched=()=>new Promise(resolve=>finishResearch=resolve);
 const pending=cancel.ask('سؤال جديد');cancel.renderVals().onStop();finishResearch({a:'late reply',sources:[]});await pending;assert.equal(cancel.state.history.length,0);assert.equal(cancel.busy,false);
 assert.ok(!templateHasGoogleVoice(html));
 const api=new context.TestComponent();api.elevenKey='test-only-not-a-real-key';api.getCtx=()=>({decodeAudioData:async()=>({sampleRate:44100,getChannelData:()=>new Float32Array([0])})});api.savedClip=async()=>null;api.saveClip=async()=>true;
 let requested;context.fetch=async(url,options)=>{requested={url,options,body:JSON.parse(options.body)};return{ok:true,arrayBuffer:async()=>new ArrayBuffer(0)}};
 await api.ttsBuffer('إجابة جديدة');assert.match(requested.url,/qSfjem6kskBSKupE4hr0/);assert.equal(requested.body.language_code,undefined);assert.equal(requested.body.model_id,'eleven_multilingual_v2');assert.equal(requested.body.apply_text_normalization,'on');assert.equal(requested.body.text,'إجابة جديدة');
 api.state.elevenVoice='femaleTestVoice123';await api.ttsBuffer('إجابة جديدة');assert.match(requested.url,/femaleTestVoice123/);
 api.elevenKey='';api.savedClip=async()=>({rate:24000,samples:new Float32Array([0])});api.getCtx=()=>({createBuffer:()=>({copyToChannel:()=>{}})});api.cache.clear();assert.ok(await api.ttsBuffer('إجابة محفوظة'));

 const speech=context.window.QUMAIR_SPEECH;
 assert.equal(speech.text('عام 2023، رؤية 2030، المذنب'), 'عام ألفين وثلاثة وعشرين، رؤية ألفين وثلاثين، المُذَنَّب');
 assert.equal(speech.text('أنا قمير', 'female'),'أنا قُمَيرة');
 assert.ok(!/[0-9٠-٩]/.test(speech.text('١٢٣٫٥٪')));
 for(const q of c.questions())assert.ok(!/[0-9٠-٩]/.test(speech.text(q.a)),q.id);
 const natural=new context.TestComponent();natural.stopAudio=()=>{};natural.reveal=()=>{};
 natural.recordedBuffer=()=>{throw Error('Natural voice must not play imported recordings');};
 natural.ttsBuffer=async()=>({duration:1});natural.playBuffer=async()=>true;assert.equal(await natural.say('test'),true);
 const oldFingerprint=natural.voiceFingerprint();natural.state.speed=.95;assert.notEqual(oldFingerprint,natural.voiceFingerprint());
 let cacheReads=0;api.elevenKey='test-only';api.savedClip=async()=>{cacheReads++;return null;};
 api.getCtx=()=>({decodeAudioData:async()=>({sampleRate:44100,getChannelData:()=>new Float32Array([0])})});
 await api.ttsBuffer('عينة جديدة',{force:true});assert.equal(cacheReads,0);
 assert.equal(new context.TestComponent().state.cometSpeech,false);
 console.log('PASS: Arabic pronunciation text, number expansion, feminine identity, fresh sample and no imported voice mixing.');
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
 scene.state.provider='recorded';scene.state.cometSpeech=true;scene.recordedBuffer=async()=>({duration:1});let scenePlays=[];scene.playBuffer=async(buf,id,offset=0)=>scenePlays.push({buf,id,offset});
 let endFlight;const realTimeout=context.setTimeout;context.setTimeout=(fn,ms)=>ms===2400?(endFlight=fn,0):realTimeout(fn,ms);
 const scenePending=scene.sceneComet();assert.equal(scene.state.sceneActive,true);assert.equal(scene.pausedPlayback.offset,8);endFlight();await scenePending;
 assert.equal(scenePlays.length,3);assert.equal(scenePlays[2].offset,8);assert.equal(scenePlays[2].id,4);assert.equal(scene.state.sceneActive,false);
 const cancelledScene=new context.TestComponent();cancelledScene.whoosh=()=>{};cancelledScene.recordedBuffer=async()=>{throw Error('Cancelled scene must not load speech')};
 const interrupted=cancelledScene.sceneComet();cancelledScene.renderVals().onStop();endFlight();await interrupted;assert.equal(cancelledScene.state.sceneActive,false);
 context.setTimeout=realTimeout;
 const quiet=new context.TestComponent();quiet.getCtx=()=>({currentTime:5});quiet.state.cometSound=false;quiet.whoosh=()=>{throw Error('Muted effect must not play');};quiet.recordedBuffer=()=>{throw Error('Muted commentary must not load audio');};quiet.ttsBuffer=quiet.recordedBuffer;quiet.playback={buf:{duration:20},id:7,offset:2,started:3};quiet.speakId=7;quiet.speaking=true;
 let resumed;quiet.playBuffer=async(buf,id,offset)=>{resumed={id,offset}};context.setTimeout=(fn,ms)=>ms===2400?(endFlight=fn,0):realTimeout(fn,ms);const quietPending=quiet.sceneComet();endFlight();await quietPending;assert.equal(resumed.id,7);assert.equal(resumed.offset,4);context.setTimeout=realTimeout;
 const consistent=new context.TestComponent();consistent.elevenKey='test-only';consistent.getCtx=()=>({currentTime:5});consistent.state.cometSpeech=true;consistent.whoosh=()=>{};consistent.playback={buf:{duration:20},id:8,offset:0,started:0,config:{voiceId:'originalVoice',profile:'students'}};consistent.speakId=8;consistent.speaking=true;let ids=[];consistent.ttsBuffer=async(text,options)=>{ids.push(options.config.voiceId);return{duration:1}};consistent.playBuffer=async()=>true;context.setTimeout=(fn,ms)=>ms===2400?(endFlight=fn,0):realTimeout(fn,ms);const consistentPending=consistent.sceneComet();consistent.state.elevenVoice='changedVoice';endFlight();await consistentPending;assert.deepEqual(ids,['originalVoice','originalVoice']);context.setTimeout=realTimeout;
 console.log('PASS: muted comet speech/effect and frozen answer voice for both commentary clips.');
 const progressive=new context.TestComponent();progressive.elevenKey='test-only';progressive.speakId=1;progressive.savedClip=async()=>null;progressive.saveClip=async()=>true;let starts=0,reads=0,streamNodes=[];context.window.ReadableStream=function(){};
 progressive.getCtx=()=>({currentTime:1,resume:async()=>{},destination:{},createAnalyser:()=>({connect:()=>{},disconnect:()=>{}}),createBuffer:(channels,length,rate)=>({duration:length/rate,sampleRate:rate,copyToChannel:()=>{}}),createBufferSource:()=>{const node={connect:()=>{},disconnect:()=>{},stop:()=>{},start:()=>{starts++}};streamNodes.push(node);return node;}});
 context.fetch=async(url,opts)=>{assert.match(url,/qSfjem6kskBSKupE4hr0\/stream\?output_format=pcm_24000/);assert.equal(JSON.parse(opts.body).model_id,'eleven_multilingual_v2');return{ok:true,body:{getReader:()=>({read:async()=>{reads++;if(reads===2)assert.equal(starts,1,'Audio must start before the full response arrives');if(reads<3)return{value:new Uint8Array([0,0,0,64]),done:false};for(const node of streamNodes)node.onended();return{done:true}}})}}};
 assert.equal(await progressive.streamSpeech('المذنب',1),true);assert.equal(starts,2);assert.equal(progressive.speaking,false);delete context.window.ReadableStream;
 console.log('PASS: selected voice streamed as PCM, starts before response completes, caches full audio and cleans up. Live streaming is not tested.');
 console.log('PASS: comet pauses PCM at exact elapsed offset, plays remarks and resumes; Stop cancels pending scene.');
 const crypto=require('node:crypto');const support=fs.readFileSync('support.js','utf8');
 for(const [file,name] of [['react.js','REACT_SRI'],['react-dom.js','REACT_DOM_SRI'],['babel.js','BABEL_SRI']]){const expected=support.match(new RegExp('var '+name+' = "([^"]+)"'))[1];assert.equal('sha384-'+crypto.createHash('sha384').update(fs.readFileSync('vendor/'+file)).digest('base64'),expected);}
 console.log('PASS: 110 question answers, scope refusal, sourced research, unverified fallback, saved audio without key, UI bindings and no Claude dependency.');
 console.log('PASS: comet dodge, idle pause during listening, reduced motion, ring removal, voice-first layout, local dependency integrity.');
 console.log('PASS: selected ElevenLabs voice, separate student voices and recordings, cancellation of late answers, Google is research-only.');
 console.log('PASS: ElevenLabs request uses chosen voice for new answers, Arabic text normalization, and cached audio plays without a key. Live services are not tested.');
 let route;const path=require('node:path');const serverStub={on:()=>{},listen:()=>{}};
 vm.runInNewContext(fs.readFileSync('server.cjs','utf8'),{require:name=>name==='node:http'?{createServer:handler=>{route=handler;return serverStub}}:require(name),__dirname:process.cwd(),URL,console,process:{env:{}}});
 const request=url=>new Promise(resolve=>{let status,headers;route({url},{writeHead:(code,h)=>{status=code;headers=h},end:body=>resolve({status,headers,body})});});
 assert.equal((await request('/')).status,200);assert.equal((await request('/vendor/three.module.js')).headers['Content-Type'],'text/javascript; charset=utf-8');
 assert.equal((await request('/assets/moon-color.jpg')).headers['Content-Type'],'image/jpeg');assert.equal((await request('/assets/ai-club-aou.jpeg')).status,200);
 assert.equal((await request('/missing-file.js')).status,404);assert.equal((await request('/%ZZ')).status,400);assert.equal((await request('/%2e%2e%2foutside.txt')).status,403);
 console.log('PASS: local server serves app and module assets, handles missing files, malformed URLs and traversal. Browser rendering is not tested.');
})().catch(e=>{console.error(e);process.exitCode=1});
function templateHasGoogleVoice(html){return html.includes('option value="gemini"');}




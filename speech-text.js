/* نسخة النطق منفصلة عن النص المعروض. لا تغيّر المعنى ولا تتصل بأي خدمة. */
(function(global){
 const units=['صفر','واحد','اثنان','ثلاثة','أربعة','خمسة','ستة','سبعة','ثمانية','تسعة'];
 const teens=['عشرة','أحد عشر','اثنا عشر','ثلاثة عشر','أربعة عشر','خمسة عشر','ستة عشر','سبعة عشر','ثمانية عشر','تسعة عشر'];
 const tens=['','','عشرون','ثلاثون','أربعون','خمسون','ستون','سبعون','ثمانون','تسعون'];
 function number(n){
  n=Number(n);if(!Number.isSafeInteger(n)||n<0||n>999999999)return String(n).split('').map(c=>units[Number(c)]||c).join(' ');
  if(n<10)return units[n];if(n<20)return teens[n-10];
  if(n<100)return(n%10?units[n%10]+' و':'')+tens[Math.floor(n/10)];
  if(n<1000){const h=['','مئة','مئتان','ثلاثمئة','أربعمئة','خمسمئة','ستمئة','سبعمئة','ثمانمئة','تسعمئة'][Math.floor(n/100)];return h+(n%100?' و'+number(n%100):'');}
  const base=n<1000000?1000:1000000,plural=base===1000?'آلاف':'ملايين',single=base===1000?'ألف':'مليون',dual=base===1000?'ألفان':'مليونان';
  const count=Math.floor(n/base);return(count===1?single:count===2?dual:count<11?number(count)+' '+plural:number(count)+' '+single)+(n%base?' و'+number(n%base):'');
 }
 const lexicon=[
  ['المذنب','المُذَنَّب'],['مذنب','مُذَنَّب'],['قميرة','قُمَيرة'],['قمير','قُمَير'],
  ['ريانة','رَيَّانة'],['برناوي','بَرْناوي'],['القرني','القَرْني'],['زحل','زُحَل'],['عطارد','عُطارِد'],
  ['سعوديات','سعودي سات'],['كاكست','كاكست'],['التيلومير','التيلومير']
 ];
 function text(value,profile='students'){
  let t=String(value||'').replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
  t=t.replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/https?:\/\/\S+/g,'').replace(/[*_#`]/g,'');
  const abbreviations={'SSA-HSF1':'إس إس إيه، إتش إس إف، واحد','SGS-1':'إس جي إس، واحد','AX-2':'أكسيوم الثانية','AX-4':'أكسيوم الرابعة','5A':'خمسة إيه','5B':'خمسة بي','1A':'واحد إيه','1B':'واحد بي','mRNA':'الحمض النووي الريبوزي المرسال','NASA':'ناسا','NSG':'نيو للفضاء','SLS':'نظام الإطلاق الفضائي','SHMS':'شمس','Ka-Band':'نطاق كا'};
  for(const [a,b] of Object.entries(abbreviations))t=t.replaceAll(a,b);
  t=t.replace(/رؤية\s*2030/g,'رؤية ألفين وثلاثين');
  t=t.replace(/\b(\d{1,3}(?:[,٬]\d{3})+)\b/g,n=>n.replace(/[,٬]/g,''));
  const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  t=t.replace(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,(all,d,m,y)=>Number(m)>0&&Number(m)<13?number(d)+' من '+months[m-1]+' عام '+number(y).replace(/ون/g,'ين').replace('ألفان','ألفين'):all);
  t=t.replace(/(عام|سنة|يونيو|مايو|أبريل)\s+(\d{4})/g,(_,word,n)=>word+' '+number(n).replace(/ون/g,'ين').replace('ألفان','ألفين'));
  t=t.replace(/\b\d+(?:[.٫]\d+)?\b/g,n=>n.includes('.')||n.includes('٫')?n.split(/[.٫]/).map((part,i)=>i?part.split('').map(c=>units[Number(c)]).join(' '):number(part)).join(' فاصلة '):number(n));
  t=t.replace(/%|٪/g,' بالمئة').replace(/كم\/س/g,'كيلومترًا في الساعة');
  t=t.replace(/[\u064b-\u065f\u0670]/g,'');
  if(profile==='female')t=t.replace(/قمير(?!ة)/g,'قميرة').replace(/أنا مختص\b/g,'أنا مختصة').replace('مختص بالفضاء','مختصة بالفضاء').replace('جاهز للإجابة','جاهزة للإجابة');
  // حدود عربية صريحة؛ \b لا يعرّف حدود الكلمات العربية في JavaScript.
  for(const [a,b] of lexicon){const escaped=a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');t=t.replace(new RegExp('(^|[^ء-ي])('+escaped+')(?=$|[^ء-ي])','g'),(_,before)=>before+b);}
  return t.replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
 }
 global.QUMAIR_SPEECH={revision:'pronunciation-2',number,text};
})(window);

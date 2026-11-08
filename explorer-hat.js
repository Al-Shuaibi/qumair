/* Qumair's approved explorer hat. Local geometry, no remote assets or services. */
window.QUMAIR_EXPLORER_HAT = function (T) {
  const hat = new T.Group();
  hat.name = 'qumair-explorer-hat';
  hat.position.set(0, .66, 0);
  hat.rotation.z = -.045;
  const felt = new T.MeshStandardMaterial({color:0x805033,roughness:.94,side:T.DoubleSide});
  const leather = new T.MeshStandardMaterial({color:0x38251c,roughness:.78,side:T.DoubleSide});
  const edging = new T.MeshStandardMaterial({color:0x623c26,roughness:.92});
  // Fine, restrained felt grain; shared by crown and brim, generated locally.
  if (typeof document !== 'undefined' && document.createElement) {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
    const ctx=canvas.getContext('2d');
    if(ctx){
      const pixels=ctx.createImageData(128,128);
      for(let i=0;i<128*128;i++){
        const shade=118+((Math.imul(i+19,2654435761)>>>22)%23);
        pixels.data.set([shade,shade,shade,255],i*4);
      }
      ctx.putImageData(pixels,0,0);
      const grain=new T.CanvasTexture(canvas);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(5,3);
      felt.bumpMap=grain;felt.bumpScale=.007;
    }
  }
  const profile=new T.SplineCurve([
    new T.Vector2(.79,0),new T.Vector2(.805,.08),new T.Vector2(.77,.26),
    new T.Vector2(.64,.43),new T.Vector2(.43,.51),new T.Vector2(.20,.53),new T.Vector2(0,.535)
  ]).getPoints(28);
  const crown=new T.Mesh(new T.LatheGeometry(profile,80),felt);
  crown.name='rounded-felt-crown';crown.scale.z=.94;hat.add(crown);
  // Continuous brim with gently raised sides and a lowered front.
  const point=(angle,r)=>{
    const f=(r-.755)/(1.17-.755);
    return new T.Vector3(Math.cos(angle)*r, .19*Math.pow(Math.abs(Math.cos(angle)),4)*f*f-.055*Math.sin(angle)*f, Math.sin(angle)*r*.94);
  };
  const segments=96,rings=10,positions=[],uvs=[],indices=[];
  for(let ring=0;ring<=rings;ring++)for(let i=0;i<=segments;i++){
    const p=point(i/segments*Math.PI*2,.755+(1.17-.755)*ring/rings);
    positions.push(p.x,p.y,p.z);uvs.push(i/segments,ring/rings);
  }
  for(let ring=0;ring<rings;ring++)for(let i=0;i<segments;i++){
    const a=ring*(segments+1)+i,b=a+segments+1;
    indices.push(a,b,a+1,b,b+1,a+1);
  }
  const brimGeometry=new T.BufferGeometry();
  brimGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  brimGeometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  brimGeometry.setIndex(indices);brimGeometry.computeVertexNormals();
  const brim=new T.Mesh(brimGeometry,felt);brim.name='curled-all-around-brim';hat.add(brim);
  const edgePoints=Array.from({length:96},(_,i)=>point(i/96*Math.PI*2,1.17));
  hat.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(edgePoints,true),96,.012,5,true),edging));
  const band=new T.Mesh(new T.LatheGeometry([
    new T.Vector2(.804,.035),new T.Vector2(.811,.075),new T.Vector2(.797,.145)
  ],80),leather);band.scale.z=.94;band.name='dark-leather-band';hat.add(band);
  const crescent=new T.Shape();
  crescent.moveTo(.025,.045);
  crescent.bezierCurveTo(-.065,.06,-.065,-.06,.025,-.045);
  crescent.bezierCurveTo(-.022,-.025,-.022,.025,.025,.045);
  const pin=new T.Mesh(new T.ExtrudeGeometry(crescent,{depth:.009,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:2}),
    new T.MeshStandardMaterial({color:0xc28a54,metalness:.65,roughness:.4}));
  pin.name='copper-crescent-pin';pin.position.set(.49,.10,.605);pin.rotation.y=.65;hat.add(pin);
  return hat;
};

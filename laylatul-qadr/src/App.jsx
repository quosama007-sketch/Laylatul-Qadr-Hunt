import { useState, useMemo, useEffect } from "react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
// Deep ink navy + warm parchment + restrained gold — no neons, no bright primaries
const C = {
  bg:        "#0b0d13",
  surface:   "#11141f",
  surfaceHi: "#171b2a",
  border:    "rgba(255,255,255,0.07)",
  borderGold:"rgba(196,155,60,0.22)",
  gold:      "#c49b3c",
  goldDim:   "rgba(196,155,60,0.45)",
  goldFaint: "rgba(196,155,60,0.12)",
  text:      "rgba(236,230,218,0.88)",
  textDim:   "rgba(236,230,218,0.38)",
  textFaint: "rgba(236,230,218,0.18)",
  ink:       "#060810",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TIERS = ["silver","gold","platinum","diamond","emerald","pearl"];
const TIER = {
  silver:   { label:"Silver",   color:"#8aa4be", pts:10  },
  gold:     { label:"Gold",     color:"#c49b3c", pts:25  },
  platinum: { label:"Platinum", color:"#9e96cc", pts:50  },
  diamond:  { label:"Diamond",  color:"#4ab0cc", pts:100 },
  emerald:  { label:"Emerald",  color:"#3aa870", pts:175 },
  pearl:    { label:"Pearl",    color:"#b83898", pts:250 },
};

const CATS = [
  { id:"salah",     ar:"الصَّلَاة",    en:"Salah",     sub:"Night Prayer",    color:"#4a88b0" },
  { id:"quran",     ar:"الْقُرْآن",    en:"Quran",     sub:"Sacred Recitation",color:"#b89030" },
  { id:"zikr",      ar:"الذِّكْر",     en:"Dhikr",     sub:"Remembrance",     color:"#7050b8" },
  { id:"sadaqah",   ar:"الصَّدَقَة",   en:"Sadaqah",   sub:"Charity",         color:"#2a8858" },
  { id:"community", ar:"الْمُجْتَمَع", en:"Community", sub:"Connection",      color:"#a03050" },
  { id:"dua",       ar:"الدُّعَاء",    en:"Dua",       sub:"Supplication",    color:"#a07020" },
];

const TASKS = [
  {id:"q1",cat:"quran",tier:"silver",  ar:"سُورَةُ الْفَاتِحَة",      en:"Recite Surah Al-Fatiha 7 times with full reflection"},
  {id:"q2",cat:"quran",tier:"gold",    ar:"سُورَةُ يس",                en:"Recite Surah Yaseen and contemplate its meaning"},
  {id:"q3",cat:"quran",tier:"platinum",ar:"سُورَةُ الْوَاقِعَة",       en:"Read the full translation of Surah Al-Waqiah"},
  {id:"q4",cat:"quran",tier:"diamond", ar:"سُورَةُ الْمُلْك",          en:"Study Surah Al-Mulk with tafsir notes"},
  {id:"q5",cat:"quran",tier:"emerald", ar:"جُزْءٌ كَامِل",             en:"Complete one full Juz with deep reflection"},
  {id:"q6",cat:"quran",tier:"pearl",   ar:"سُورَةُ الْبَقَرَة",        en:"Recite Surah Al-Baqarah in its entirety"},
  {id:"s1",cat:"salah",tier:"silver",  ar:"رَكْعَتَانِ",               en:"Pray 2 rakat of Tahajjud before Fajr"},
  {id:"s2",cat:"salah",tier:"gold",    ar:"أَرْبَعُ رَكَعَات",        en:"Pray 4 rakat of Tahajjud with long surahs"},
  {id:"s3",cat:"salah",tier:"platinum",ar:"ثَمَانِي رَكَعَات",         en:"Pray 8 rakat of Tahajjud with full khushoo"},
  {id:"s4",cat:"salah",tier:"diamond", ar:"الْوِتْرُ بِالْقُنُوت",     en:"8 rakat Tahajjud + 3 Witr with Qunoot"},
  {id:"s5",cat:"salah",tier:"emerald", ar:"صَلَاةُ الْجَمَاعَة",       en:"Pray all 5 fardh prayers in congregation"},
  {id:"s6",cat:"salah",tier:"pearl",   ar:"صَلَاةُ الْإِشْرَاق",       en:"Pray Fajr in congregation, remain until Ishraq"},
  {id:"sa1",cat:"sadaqah",tier:"silver",  ar:"صَدَقَة",                en:"Distribute water bottles to people nearby"},
  {id:"sa2",cat:"sadaqah",tier:"gold",    ar:"هَدِيَّةٌ لِلْحَارِس",  en:"Gift a suhoor or iftaar packet to a security guard"},
  {id:"sa3",cat:"sadaqah",tier:"platinum",ar:"إِطْعَامُ الصَّائِم",    en:"Provide a full iftaar meal for a family in need"},
  {id:"sa4",cat:"sadaqah",tier:"diamond", ar:"صَدَقَةٌ سِرِّيَّة",     en:"Make an anonymous donation to a charitable cause"},
  {id:"sa5",cat:"sadaqah",tier:"emerald", ar:"تَيْسِيرُ الْكُرْبَة",   en:"Secretly ease someone's financial burden"},
  {id:"sa6",cat:"sadaqah",tier:"pearl",   ar:"كَفَالَةُ الْيَتِيم",    en:"Sponsor an orphan's meals for a full week"},
  {id:"z1",cat:"zikr",tier:"silver",  ar:"الاِسْتِغْفَار",             en:"Recite Astaghfirullah wa atubu ilayh — 100 times"},
  {id:"z2",cat:"zikr",tier:"gold",    ar:"دُعَاءُ الْقَدْر",           en:"Recite the Laylatul Qadr dua — 50 times"},
  {id:"z3",cat:"zikr",tier:"platinum",ar:"التَّسْبِيح الْكَامِل",      en:"SubhanAllah, Alhamdulillah, Allahu Akbar — 100× each"},
  {id:"z4",cat:"zikr",tier:"diamond", ar:"تَسْبِيحُ فَاطِمَة",         en:"Complete the Tasbih of Fatimah — three rounds"},
  {id:"z5",cat:"zikr",tier:"emerald", ar:"الصَّلَاةُ عَلَى النَّبِيّ", en:"Send Salawat upon the Prophet ﷺ — 300 times"},
  {id:"z6",cat:"zikr",tier:"pearl",   ar:"ذِكْرٌ خَالِص",             en:"Sit in silent, focused dhikr for one full hour"},
  {id:"c1",cat:"community",tier:"silver",  ar:"صِلَةُ الرَّحِم",       en:"Call someone who is sick or elderly"},
  {id:"c2",cat:"community",tier:"gold",    ar:"بِرُّ الْوَالِدَيْن",   en:"Seek sincere forgiveness from a parent or elder"},
  {id:"c3",cat:"community",tier:"platinum",ar:"إِصْلَاحُ الْبَيْن",    en:"Reconcile with someone you have had conflict with"},
  {id:"c4",cat:"community",tier:"diamond", ar:"حَقُّ الْجَار",         en:"Proactively help a neighbor without being asked"},
  {id:"c5",cat:"community",tier:"emerald", ar:"نَشْرُ الْعِلْم",       en:"Volunteer to tutor or mentor someone for free"},
  {id:"c6",cat:"community",tier:"pearl",   ar:"قِيَامُ رَمَضَان",      en:"Organise or lead a community iftaar gathering"},
  {id:"d1",cat:"dua",tier:"silver",  ar:"دُعَاءٌ بَسِيط",             en:"Spend 15 minutes making sincere dua for your family"},
  {id:"d2",cat:"dua",tier:"gold",    ar:"دُعَاءُ السُّجُود",           en:"Make extended, heartfelt dua in each sujood"},
  {id:"d3",cat:"dua",tier:"platinum",ar:"دُعَاءُ السَّحَر",            en:"Wake in the last third of the night to make dua"},
  {id:"d4",cat:"dua",tier:"diamond", ar:"دُعَاءٌ بِالأَسْمَاء",       en:"Call upon Allah through each of His 99 Names"},
  {id:"d5",cat:"dua",tier:"emerald", ar:"دُعَاءُ الْيَقِين",          en:"Make dua for one full hour with complete certainty"},
  {id:"d6",cat:"dua",tier:"pearl",   ar:"دُعَاءٌ بِالدُّمُوع",        en:"Cry sincerely before Allah until you find peace"},
];

const RANKS = [
  {min:0,   title:"Seeker",                  ar:"السَّالِك",          desc:"The first step is intention"},
  {min:100, title:"Devoted",                 ar:"الْمُخْلِص",         desc:"The heart that remembers"},
  {min:300, title:"Worshipper",              ar:"الْعَابِد",           desc:"Rising while the world sleeps"},
  {min:600, title:"Illuminated",             ar:"النُّورَانِيّ",       desc:"Nūrun ʿalā nūr"},
  {min:1000,title:"Blessed",                 ar:"الْمُبَارَك",         desc:"Touched by divine grace"},
  {min:1500,title:"Hunter of Laylatul Qadr", ar:"صَائِدُ لَيْلَةِ الْقَدْر", desc:"A night worth a thousand months"},
];
const MOCK = [{name:"Ahmad S.",pts:1420},{name:"Fatima K.",pts:1185},{name:"Omar R.",pts:980},{name:"Aisha M.",pts:755},{name:"Yusuf H.",pts:610}];

function getRank(p){let r=RANKS[0];for(const x of RANKS)if(p>=x.min)r=x;else break;return r;}
function getTopTier(cat,done){
  const c=TASKS.filter(t=>t.cat===cat&&done.has(t.id));
  if(!c.length)return null;
  return TIERS[Math.max(...c.map(t=>TIERS.indexOf(t.tier)))];
}
function catPts(cat,done){
  return TASKS.filter(t=>t.cat===cat&&done.has(t.id)).reduce((s,t)=>s+TIER[t.tier].pts,0);
}

// ── Rotating geometric star used in hero ──────────────────────────────────────
function GeomStar({ size=320, opacity=0.06, spin=true }) {
  const c = size/2, r1 = size*0.47, r2 = size*0.22, r3 = size*0.1;
  const pts = (n, r) => Array.from({length:n},(_,i)=>{
    const a = (i/n)*Math.PI*2 - Math.PI/2;
    return `${c+Math.cos(a)*r},${c+Math.sin(a)*r}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{
      width:size,height:size,opacity,
      animation:spin?"geomSpin 80s linear infinite":"none",
      flexShrink:0,
    }}>
      {/* Outer circles */}
      <circle cx={c} cy={c} r={r1} fill="none" stroke={C.gold} strokeWidth="0.6"/>
      <circle cx={c} cy={c} r={r1*0.85} fill="none" stroke={C.gold} strokeWidth="0.3"/>
      <circle cx={c} cy={c} r={r1*0.7} fill="none" stroke={C.gold} strokeWidth="0.4"/>
      {/* 12-point star */}
      <polygon points={pts(12,r1*0.68)} fill="none" stroke={C.gold} strokeWidth="0.5"/>
      {/* 8-point star */}
      {Array.from({length:8},(_,i)=>{
        const a=(i/8)*Math.PI*2-Math.PI/2;
        const b=((i+0.5)/8)*Math.PI*2-Math.PI/2;
        return <line key={i}
          x1={c+Math.cos(a)*r1*0.68} y1={c+Math.sin(a)*r1*0.68}
          x2={c+Math.cos(b)*r2}      y2={c+Math.sin(b)*r2}
          stroke={C.gold} strokeWidth="0.4"/>;
      })}
      {/* Inner hexagon */}
      <polygon points={pts(6,r2)} fill="none" stroke={C.gold} strokeWidth="0.5"/>
      {/* Radial lines */}
      {Array.from({length:24},(_,i)=>{
        const a=(i/24)*Math.PI*2;
        return <line key={i}
          x1={c+Math.cos(a)*r3} y1={c+Math.sin(a)*r3}
          x2={c+Math.cos(a)*r1*0.68} y2={c+Math.sin(a)*r1*0.68}
          stroke={C.gold} strokeWidth="0.25" opacity="0.6"/>;
      })}
      {/* Center */}
      <circle cx={c} cy={c} r={r3} fill="none" stroke={C.gold} strokeWidth="0.5"/>
      <circle cx={c} cy={c} r={4} fill={C.gold} opacity="0.6"/>
    </svg>
  );
}

// ── Thin separator ─────────────────────────────────────────────────────────────
function Divider({ my=0 }){
  return <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.borderGold},transparent)`,margin:`${my}px 0`}}/>;
}

// ── Category progress arc ──────────────────────────────────────────────────────
function Arc({ pct, color, size=44 }){
  const r=16, cx=size/2, cy=size/2;
  const circ=2*Math.PI*r;
  const dash=circ*(pct/100);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="2.5"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray 0.6s ease",filter:`drop-shadow(0 0 4px ${color}88)`}}/>
    </svg>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [name,setName]   = useState("");
  const [inp,setInp]     = useState("");
  const [started,setStart]=useState(false);
  const [done,setDone]   = useState(new Set());
  const [cat,setCat]     = useState("salah");
  const [modal,setModal] = useState(null); // "lb" | "badge" | null
  const [copied,setCopied]=useState(false);
  const [flash,setFlash] = useState(null);
  const [view,setView]   = useState("progress"); // "acts" | "progress"

  const pts = useMemo(()=>{let s=0;for(const id of done){const t=TASKS.find(t=>t.id===id);if(t)s+=TIER[t.tier].pts;}return s;},[done]);
  const rank     = getRank(pts);
  const nextRank = RANKS[RANKS.indexOf(rank)+1];
  const pct      = Math.min(100,Math.round((pts/3660)*100));
  const catData  = CATS.find(c=>c.id===cat);
  const catTasks = TASKS.filter(t=>t.cat===cat);
  const catDone  = catTasks.filter(t=>done.has(t.id)).length;
  const lb       = useMemo(()=>[...MOCK,{name,pts}].sort((a,b)=>b.pts-a.pts),[pts,name]);
  const share    = `🌙 Hunt of Laylatul Qadr\n\n${rank.title} · ${rank.ar}\n"${rank.desc}"\n\n${pts} pts · ${done.size} of 36 acts\n\n#LailatulQadr #Ramadan`;

  const toggle = id => {
    setDone(prev=>{
      const n=new Set(prev);
      if(n.has(id)) n.delete(id);
      else { n.add(id); setFlash(id); setTimeout(()=>setFlash(null),600); }
      return n;
    });
  };

  // ── LANDING ────────────────────────────────────────────────────────────────
  if(!started) return (
    <div style={{...PG, display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"2rem"}}>
      <style>{CSS}</style>

      {/* Giant star background */}
      <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",overflow:"hidden"}}>
        <GeomStar size={520} opacity={0.045}/>
      </div>

      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:420,textAlign:"center"}}>

        {/* Top ornament line */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28}}>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.borderGold})`}}/>
          <div style={{width:6,height:6,background:C.gold,transform:"rotate(45deg)",opacity:0.6}}/>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.borderGold},transparent)`}}/>
        </div>

        {/* Arabic */}
        <p style={{fontSize:"1.05rem",color:C.goldDim,fontFamily:"serif",direction:"rtl",letterSpacing:"0.08em",margin:"0 0 10px"}}>
          لَيْلَةُ الْقَدْر
        </p>

        <h1 style={{
          fontSize:"clamp(1.7rem,4vw,2.4rem)",
          fontFamily:"'Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif",
          fontWeight:400,letterSpacing:"0.05em",
          color:C.text,margin:"0 0 8px",lineHeight:1.25,
        }}>
          Hunt of <em style={{color:C.gold,fontStyle:"normal"}}>Laylatul Qadr</em>
        </h1>

        <p style={{
          fontSize:"0.86rem",color:C.textDim,lineHeight:1.9,
          margin:"0 0 32px",fontFamily:"Georgia,serif",
          letterSpacing:"0.02em",
        }}>
          Track six acts of worship across the last ten nights.<br/>
          Complete each level to unlock the next. Seek the night worth a thousand months.
        </p>

        {/* Stats row */}
        <div style={{
          display:"flex",justifyContent:"center",gap:32,marginBottom:32,
          fontSize:"0.62rem",letterSpacing:"0.18em",textTransform:"uppercase",
          color:"rgba(236,230,218,0.55)",fontFamily:"Georgia,serif",
        }}>
          {["6 Categories","36 Acts","3,660 pts"].map(s=>(
            <span key={s} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
              <span style={{color:C.gold,fontSize:"1.1rem",fontFamily:"Georgia,serif",letterSpacing:"0.02em",fontWeight:500}}>{s.split(" ")[0]}</span>
              <span>{s.split(" ").slice(1).join(" ")}</span>
            </span>
          ))}
        </div>

        {/* Input */}
        <input
          placeholder="Your name"
          value={inp}
          onChange={e=>setInp(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&inp.trim()&&(setName(inp.trim()),setStart(true))}
          style={{
            display:"block",width:"100%",
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(196,155,60,0.5)",
            borderRadius:6,
            color:"rgba(236,230,218,0.95)",padding:"0.85rem 1.1rem",
            fontSize:"0.95rem",outline:"none",
            textAlign:"center",fontFamily:"Georgia,serif",
            boxSizing:"border-box",marginBottom:12,
            letterSpacing:"0.06em",
            transition:"border-color 0.2s, background 0.2s",
          }}
          onFocus={e=>{e.target.style.borderColor="rgba(196,155,60,0.85)";e.target.style.background="rgba(255,255,255,0.07)";}}
          onBlur={e=>{e.target.style.borderColor="rgba(196,155,60,0.5)";e.target.style.background="rgba(255,255,255,0.04)";}}
        />
        <button className="cta"
          style={{opacity:inp.trim()?1:0.45,borderColor:"rgba(196,155,60,0.7)",color:C.gold,fontSize:"0.85rem",letterSpacing:"0.25em"}}
          onClick={()=>inp.trim()&&(setName(inp.trim()),setStart(true))}>
          Begin
        </button>

        {/* Bottom ornament */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:28}}>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${C.borderGold})`}}/>
          <div style={{width:6,height:6,background:C.gold,transform:"rotate(45deg)",opacity:0.6}}/>
          <div style={{flex:1,height:1,background:`linear-gradient(90deg,${C.borderGold},transparent)`}}/>
        </div>

      </div>
    </div>
  );

  // ── MAIN VIEW ──────────────────────────────────────────────────────────────
  return (
    <div style={PG}>
      <style>{CSS}</style>

      {/* Fixed geometric background */}
      <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",overflow:"hidden",zIndex:0}}>
        <GeomStar size={680} opacity={0.025}/>
      </div>

      {/* ── HEADER ── */}
      <header style={{
        position:"sticky",top:0,zIndex:30,
        background:"rgba(11,13,19,0.97)",
        backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${C.border}`,
        padding:"0 1.2rem",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        height:54,
      }}>
        {/* Left: title */}
        <div>
          <span style={{fontSize:"0.72rem",letterSpacing:"0.16em",textTransform:"uppercase",color:C.goldDim,fontFamily:"Georgia,serif"}}>
            Laylatul Qadr
          </span>
          <span style={{fontSize:"0.58rem",color:C.textFaint,marginLeft:8,fontFamily:"Georgia,serif"}}>· {name}</span>
        </div>

        {/* Right: score + rank + actions */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{textAlign:"right",paddingRight:10,borderRight:`1px solid ${C.border}`}}>
            <div style={{fontSize:"1.05rem",fontWeight:500,color:C.gold,lineHeight:1,fontFamily:"Georgia,serif"}}>{pts}</div>
            <div style={{fontSize:"0.46rem",color:C.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>points</div>
          </div>
          <div style={{
            display:"flex",alignItems:"center",gap:6,
            background:C.surfaceHi,
            border:`1px solid ${C.border}`,
            borderRadius:20,padding:"4px 10px",
          }}>
            <span style={{fontSize:"0.62rem",color:C.textDim,fontFamily:"Georgia,serif",letterSpacing:"0.04em"}}>{rank.title}</span>
          </div>
          <button className="hbtn" onClick={()=>setModal("lb")} title="Leaderboard">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="8" width="4" height="7" rx="0.5"/><rect x="6" y="5" width="4" height="10" rx="0.5"/><rect x="11" y="2" width="4" height="13" rx="0.5"/>
            </svg>
          </button>
          <button className="hbtn" onClick={()=>setModal("badge")} title="My Progress">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="6" r="4"/><path d="M4 14 L8 11 L12 14"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── PROGRESS STRIP ── */}
      <div style={{padding:"8px 1.2rem 0",position:"relative",zIndex:1}}>
        <div style={{height:1,background:C.border}}>
          <div style={{
            height:"100%",width:`${pct}%`,
            background:`linear-gradient(90deg,${C.gold}88,${C.gold})`,
            transition:"width 0.8s ease",
            boxShadow:`0 0 8px ${C.gold}66`,
          }}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.55rem",color:C.textFaint,marginTop:4,fontFamily:"Georgia,serif",letterSpacing:"0.06em"}}>
          <span>{done.size} of 36 acts · {pct}%</span>
          {nextRank&&<span>{nextRank.title} at {nextRank.min} pts</span>}
        </div>
      </div>

      {/* ── VIEW TOGGLE ── */}
      <div style={{padding:"14px 1.2rem 0",position:"relative",zIndex:1,display:"flex",gap:4}}>
        {["acts","progress"].map(v=>(
          <button key={v} className="vtab" data-active={view===v}
            style={{color:view===v?C.gold:C.textFaint,borderColor:view===v?C.borderGold:C.border,background:view===v?C.goldFaint:"transparent"}}
            onClick={()=>setView(v)}>
            {v==="acts"?"Acts of Worship":"Overview"}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════
           VIEW: ACTS
      ════════════════════════════════ */}
      {view==="acts" && (<>

        {/* Category rail */}
        <div style={{
          display:"flex",gap:0,
          padding:"14px 0 0",
          overflowX:"auto",
          borderBottom:`1px solid ${C.border}`,
          position:"relative",zIndex:1,
        }}>
          {CATS.map(c=>{
            const topTier=getTopTier(c.id,done);
            const active=cat===c.id;
            const doneCount=TASKS.filter(t=>t.cat===c.id&&done.has(t.id)).length;
            return(
              <button key={c.id} className="catTab"
                style={{
                  borderBottom:active?`2px solid ${c.color}`:"2px solid transparent",
                  color:active?C.text:C.textDim,
                }}
                onClick={()=>setCat(c.id)}>
                <span style={{fontSize:"0.78rem",fontFamily:"Georgia,serif",letterSpacing:"0.02em"}}>{c.en}</span>
                <span style={{fontSize:"0.68rem",color:active?`${c.color}cc`:C.textFaint,direction:"rtl",fontFamily:"serif",marginTop:2}}>{c.ar}</span>
                {doneCount>0&&(
                  <span style={{
                    fontSize:"0.52rem",letterSpacing:"0.08em",
                    color:topTier?TIER[topTier].color:C.textFaint,
                    marginTop:1,textTransform:"uppercase",fontFamily:"Georgia,serif",
                  }}>
                    {topTier?TIER[topTier].label:`${doneCount}/6`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active category label */}
        <div style={{padding:"16px 1.2rem 10px",display:"flex",justifyContent:"space-between",alignItems:"flex-end",position:"relative",zIndex:1}}>
          <div>
            <div style={{fontSize:"0.55rem",letterSpacing:"0.18em",textTransform:"uppercase",color:C.textFaint,fontFamily:"Georgia,serif",marginBottom:5}}>Category</div>
            <div style={{display:"flex",alignItems:"baseline",gap:10}}>
              <span style={{fontSize:"1.25rem",color:catData.color,fontFamily:"'Palatino Linotype',Georgia,serif",fontWeight:400}}>{catData.en}</span>
              <span style={{fontSize:"0.95rem",color:`${catData.color}66`,direction:"rtl",fontFamily:"serif"}}>{catData.ar}</span>
            </div>
            <div style={{fontSize:"0.65rem",color:C.textFaint,marginTop:3,fontFamily:"Georgia,serif"}}>{catData.sub}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"0.6rem",color:C.textFaint,fontFamily:"Georgia,serif"}}>{catDone} / {catTasks.length}</div>
            {catDone>0&&<div style={{fontSize:"0.58rem",color:TIER[getTopTier(cat,done)].color,marginTop:2,fontFamily:"Georgia,serif",letterSpacing:"0.06em",textTransform:"uppercase"}}>{TIER[getTopTier(cat,done)].label}</div>}
          </div>
        </div>

        <Divider/>

        {/* Task list */}
        <div style={{padding:"10px 1.2rem 80px",display:"flex",flexDirection:"column",gap:1,position:"relative",zIndex:1}}>
          {catTasks.map((task,idx)=>{
            const tier=TIER[task.tier];
            const isDone=done.has(task.id);
            const isFlash=flash===task.id;
            // Locking: silver always open; each tier requires the previous tier's task (same cat) to be done
            const tierIdx=TIERS.indexOf(task.tier);
            const isLocked = tierIdx > 0 && !done.has(catTasks[tierIdx-1].id);
            return(
              <div key={task.id}
                className={`trow${isDone?" trow-done":""}${isFlash?" trow-flash":""}${isLocked?" trow-locked":""}`}
                style={{"--tc":tier.color}}
                onClick={()=>!isLocked&&toggle(task.id)}>

                {/* Tier indicator bar (left) */}
                <div style={{
                  width:2,alignSelf:"stretch",flexShrink:0,
                  background:isLocked?"rgba(255,255,255,0.06)":isDone?tier.color:`${tier.color}28`,
                  borderRadius:2,
                  transition:"background 0.3s",
                  boxShadow:isDone?`0 0 6px ${tier.color}66`:"none",
                }}/>

                {/* Content */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                    <span style={{
                      fontSize:"0.58rem",letterSpacing:"0.12em",textTransform:"uppercase",
                      color:isLocked?"rgba(255,255,255,0.12)":isDone?tier.color:`${tier.color}88`,
                      fontFamily:"Georgia,serif",
                    }}>
                      {isLocked ? "Locked" : tier.label}
                    </span>
                    <span style={{
                      fontSize:"0.58rem",
                      color:isLocked?"rgba(255,255,255,0.1)":isDone?tier.color:C.textFaint,
                      fontFamily:"Georgia,serif",letterSpacing:"0.06em",
                    }}>
                      {isLocked ? "——" : `+${tier.pts}`}
                    </span>
                  </div>
                  <div style={{
                    fontSize:"0.88rem",
                    color:isLocked?"rgba(255,255,255,0.08)":`${catData.color}77`,
                    direction:"rtl",textAlign:"right",fontFamily:"serif",lineHeight:1.6,marginBottom:5,
                    filter:isLocked?"blur(3px)":"none",
                    userSelect:isLocked?"none":"auto",
                  }}>{task.ar}</div>
                  <div style={{
                    fontSize:"0.8rem",
                    color:isLocked?"rgba(255,255,255,0.1)":C.textDim,
                    lineHeight:1.65,fontFamily:"Georgia,serif",letterSpacing:"0.01em",
                    filter:isLocked?"blur(3px)":"none",
                    userSelect:isLocked?"none":"auto",
                  }}>{task.en}</div>
                </div>

                {/* Check / Lock icon */}
                <div style={{
                  width:18,height:18,flexShrink:0,
                  borderRadius:"50%",
                  border:`1.2px solid ${isLocked?"rgba(255,255,255,0.1)":isDone?tier.color:C.border}`,
                  background:isDone?tier.color:"transparent",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  transition:"all 0.25s",
                  boxShadow:isDone?`0 0 10px ${tier.color}77`:"none",
                }}>
                  {isDone
                    ? <svg viewBox="0 0 10 10" width="8" height="8"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke={C.ink} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : isLocked
                    ? <svg viewBox="0 0 10 12" width="7" height="9" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round">
                        <rect x="1" y="5" width="8" height="6" rx="1"/>
                        <path d="M3 5V3.5a2 2 0 0 1 4 0V5"/>
                      </svg>
                    : null
                  }
                </div>

              </div>
            );
          })}
        </div>

      </>)}

      {/* ════════════════════════════════
           VIEW: PROGRESS (overview)
      ════════════════════════════════ */}
      {view==="progress" && (
        <div style={{padding:"18px 1.2rem 80px",position:"relative",zIndex:1}}>

          {/* Rank card */}
          <div style={{
            background:C.surface,border:`1px solid ${C.borderGold}`,
            borderRadius:10,padding:"20px 20px",marginBottom:12,
            position:"relative",overflow:"hidden",
          }}>
            <div style={{position:"absolute",right:-30,top:-30,opacity:0.06}}>
              <GeomStar size={160} spin={false}/>
            </div>
            <div style={{fontSize:"0.55rem",letterSpacing:"0.18em",textTransform:"uppercase",color:C.textFaint,fontFamily:"Georgia,serif",marginBottom:8}}>Current Rank</div>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:"1.3rem",color:C.text,fontFamily:"'Palatino Linotype',Georgia,serif",letterSpacing:"0.04em",fontWeight:400}}>{rank.title}</div>
                <div style={{fontSize:"1rem",color:C.goldDim,direction:"rtl",fontFamily:"serif",marginTop:2}}>{rank.ar}</div>
                <div style={{fontSize:"0.7rem",color:C.textFaint,fontStyle:"italic",marginTop:4,fontFamily:"Georgia,serif"}}>"{rank.desc}"</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"2rem",fontWeight:500,color:C.gold,fontFamily:"Georgia,serif",lineHeight:1}}>{pts}</div>
                <div style={{fontSize:"0.5rem",color:C.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>of 3,660</div>
              </div>
            </div>
            {nextRank&&(
              <div style={{marginTop:14}}>
                <div style={{height:1,background:C.border,borderRadius:1}}>
                  <div style={{height:"100%",width:`${Math.min(100,Math.round(((pts-rank.min)/(nextRank.min-rank.min))*100))}%`,background:`linear-gradient(90deg,${C.gold}88,${C.gold})`,transition:"width 0.8s ease"}}/>
                </div>
                <div style={{fontSize:"0.52rem",color:C.textFaint,marginTop:4,fontFamily:"Georgia,serif",letterSpacing:"0.06em"}}>{nextRank.min-pts} pts to {nextRank.title}</div>
              </div>
            )}
          </div>

          {/* Per-category cards */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {CATS.map(c=>{
              const gt=getTopTier(c.id,done);
              const td=TASKS.filter(t=>t.cat===c.id&&done.has(t.id)).length;
              const cp=catPts(c.id,done);
              const arcPct=Math.round((td/6)*100);
              return(
                <div key={c.id}
                  className="catCard"
                  style={{"--cc":c.color}}
                  onClick={()=>{setCat(c.id);setView("acts");}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                    <div>
                      <div style={{fontSize:"0.8rem",color:td>0?C.text:C.textDim,fontFamily:"Georgia,serif",letterSpacing:"0.02em",marginBottom:2}}>{c.en}</div>
                      <div style={{fontSize:"0.68rem",color:`${c.color}88`,direction:"rtl",fontFamily:"serif"}}>{c.ar}</div>
                    </div>
                    <Arc pct={arcPct} color={gt?TIER[gt].color:c.color} size={40}/>
                  </div>

                  {/* Tier pip row */}
                  <div style={{display:"flex",gap:3,marginBottom:8}}>
                    {TIERS.map(t=>{
                      const tierDone=TASKS.filter(x=>x.cat===c.id&&x.tier===t&&done.has(x.id)).length>0;
                      return <div key={t} style={{flex:1,height:2,borderRadius:1,background:tierDone?TIER[t].color:`${TIER[t].color}22`,transition:"background 0.3s",boxShadow:tierDone?`0 0 4px ${TIER[t].color}88`:"none"}}/>;
                    })}
                  </div>

                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"0.57rem",color:C.textFaint,fontFamily:"Georgia,serif"}}>{td}/6 acts</span>
                    {gt ? <span style={{fontSize:"0.57rem",color:TIER[gt].color,fontFamily:"Georgia,serif",letterSpacing:"0.07em",textTransform:"uppercase"}}>{TIER[gt].label}</span>
                        : <span style={{fontSize:"0.57rem",color:C.textFaint,fontFamily:"Georgia,serif"}}>—</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tier legend */}
          <div style={{marginTop:12,background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px 16px"}}>
            <div style={{fontSize:"0.55rem",letterSpacing:"0.18em",textTransform:"uppercase",color:C.textFaint,fontFamily:"Georgia,serif",marginBottom:10}}>Tier Scale</div>
            <div style={{display:"flex",gap:0}}>
              {TIERS.map((t,i)=>(
                <div key={t} style={{flex:1,textAlign:"center",padding:"0 2px"}}>
                  <div style={{height:3,background:TIER[t].color,borderRadius:1,marginBottom:6,boxShadow:`0 0 4px ${TIER[t].color}66`}}/>
                  <div style={{fontSize:"0.5rem",color:TIER[t].color,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"Georgia,serif"}}>{TIER[t].label}</div>
                  <div style={{fontSize:"0.52rem",color:C.textFaint,fontFamily:"Georgia,serif",marginTop:1}}>{TIER[t].pts}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── LEADERBOARD MODAL ── */}
      {modal==="lb"&&(
        <div style={OVL} onClick={()=>setModal(null)}>
          <div style={MDL} onClick={e=>e.stopPropagation()}>
            <div style={{marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:"0.55rem",letterSpacing:"0.2em",textTransform:"uppercase",color:C.textFaint,fontFamily:"Georgia,serif",marginBottom:6}}>Rankings</div>
              <div style={{fontSize:"1.1rem",color:C.text,fontFamily:"'Palatino Linotype',Georgia,serif",fontWeight:400}}>Leaderboard</div>
              <div style={{fontSize:"0.85rem",color:C.goldDim,direction:"rtl",fontFamily:"serif",marginTop:3}}>مُتَصَدِّرُو الْقَائِمَة</div>
            </div>
            <Divider my={4}/>
            <div style={{marginTop:12}}>
              {lb.map((e,i)=>{
                const isU=e.name===name; const r=getRank(e.pts);
                return(
                  <div key={i} style={{
                    display:"flex",alignItems:"center",gap:10,
                    padding:"10px 12px",borderRadius:6,marginBottom:2,
                    background:isU?C.goldFaint:C.surface,
                    border:`1px solid ${isU?C.borderGold:C.border}`,
                  }}>
                    <span style={{fontSize:"0.6rem",color:C.textFaint,width:18,fontFamily:"Georgia,serif"}}>#{i+1}</span>
                    <span style={{flex:1,fontSize:"0.82rem",color:isU?C.gold:C.text,fontFamily:"Georgia,serif"}}>{e.name}{isU?" (you)":""}</span>
                    <span style={{fontSize:"0.75rem",color:isU?C.gold:C.textDim,fontFamily:"Georgia,serif",fontWeight:600}}>{e.pts}</span>
                  </div>
                );
              })}
            </div>
            <button className="mclose" style={{marginTop:14}} onClick={()=>setModal(null)}>Close</button>
          </div>
        </div>
      )}

      {/* ── BADGE MODAL ── */}
      {modal==="badge"&&(
        <div style={OVL} onClick={()=>setModal(null)}>
          <div style={MDL} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{position:"relative",display:"inline-block",marginBottom:10}}>
                <GeomStar size={80} opacity={0.18} spin={false}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.6rem"}}>✦</div>
              </div>
              <div style={{fontSize:"1rem",color:C.text,fontFamily:"'Palatino Linotype',Georgia,serif",fontWeight:400,letterSpacing:"0.05em"}}>{name}</div>
              <div style={{fontSize:"0.7rem",color:C.gold,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:"Georgia,serif",marginTop:4}}>{rank.title}</div>
              <div style={{fontSize:"0.85rem",color:C.goldDim,direction:"rtl",fontFamily:"serif",marginTop:4}}>{rank.ar}</div>
              <div style={{fontSize:"0.68rem",color:C.textFaint,fontStyle:"italic",marginTop:5,fontFamily:"Georgia,serif"}}>"{rank.desc}"</div>
            </div>

            <Divider my={4}/>

            <div style={{display:"flex",gap:6,margin:"14px 0"}}>
              {[{n:pts,l:"Points"},{n:done.size,l:"Acts"},{n:`${pct}%`,l:"Complete"}].map((b,i)=>(
                <div key={i} style={{flex:1,background:C.surface,borderRadius:8,padding:"12px 8px",textAlign:"center",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:"1.1rem",fontWeight:500,color:C.gold,fontFamily:"Georgia,serif"}}>{b.n}</div>
                  <div style={{fontSize:"0.5rem",color:C.textFaint,textTransform:"uppercase",letterSpacing:"0.1em",marginTop:3,fontFamily:"Georgia,serif"}}>{b.l}</div>
                </div>
              ))}
            </div>

            {CATS.map(c=>{
              const gt=getTopTier(c.id,done); const tc=gt?TIER[gt]:null;
              const td=TASKS.filter(t=>t.cat===c.id&&done.has(t.id)).length;
              return(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                  <span style={{fontSize:"0.68rem",color:c.color,width:72,fontFamily:"Georgia,serif",flexShrink:0}}>{c.en}</span>
                  <div style={{flex:1,height:2,background:C.border,borderRadius:1}}>
                    <div style={{height:"100%",width:`${(td/6)*100}%`,background:tc?tc.color:c.color,borderRadius:1,transition:"width 0.5s",opacity:tc?1:0.3}}/>
                  </div>
                  <span style={{fontSize:"0.56rem",color:tc?tc.color:C.textFaint,width:52,textAlign:"right",fontFamily:"Georgia,serif",textTransform:"uppercase",letterSpacing:"0.07em"}}>
                    {tc?tc.label:`${td}/6`}
                  </span>
                </div>
              );
            })}

            <Divider my={10}/>

            <div style={{fontSize:"0.7rem",color:C.textFaint,whiteSpace:"pre-line",lineHeight:1.85,marginBottom:14,fontFamily:"Georgia,serif",letterSpacing:"0.01em"}}>{share}</div>
            <button className="cta" style={{width:"100%",maxWidth:"100%",padding:"0.72rem",marginBottom:6,fontSize:"0.78rem"}}
              onClick={()=>navigator.clipboard.writeText(share).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2200);})}>
              {copied?"Copied":"Copy & Share"}
            </button>
            <button className="mclose" onClick={()=>setModal(null)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── STYLE CONSTANTS ──────────────────────────────────────────────────────────
const PG={minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"Georgia,serif",position:"relative",overflowX:"hidden"};
const OVL={position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(18px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:"1rem"};
const MDL={background:C.surface,border:`1px solid ${C.borderGold}`,borderRadius:12,padding:"1.4rem",maxWidth:"400px",width:"100%",maxHeight:"90vh",overflowY:"auto"};

const CSS=`
  @keyframes geomSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes rowFlash { 0%{background:rgba(196,155,60,0.12)} 100%{background:transparent} }

  .cta {
    display:block; width:100%; max-width:320px;
    margin:0 auto;
    background:transparent;
    border:1px solid rgba(196,155,60,0.4);
    border-radius:6px; color:#c49b3c;
    padding:0.85rem 1.5rem; font-size:0.78rem;
    letter-spacing:0.2em; text-transform:uppercase;
    cursor:pointer; font-family:Georgia,serif;
    transition:all 0.22s ease;
  }
  .cta:hover { background:rgba(196,155,60,0.08); border-color:rgba(196,155,60,0.65); letter-spacing:0.24em; }

  .hbtn {
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:6px; padding:6px 8px;
    cursor:pointer; color:rgba(236,230,218,0.4);
    display:flex; align-items:center; justify-content:center;
    transition:all 0.18s;
  }
  .hbtn:hover { background:rgba(255,255,255,0.08); color:rgba(236,230,218,0.7); }

  .vtab {
    padding:5px 14px; font-size:0.65rem;
    letter-spacing:0.12em; text-transform:uppercase;
    font-family:Georgia,serif; cursor:pointer;
    border-radius:4px; border:1px solid;
    transition:all 0.2s;
  }

  .catTab {
    flex:1; min-width:90px;
    display:flex; flex-direction:column; align-items:center;
    padding:8px 6px 10px; cursor:pointer;
    background:transparent; border:none; border-bottom:2px solid transparent;
    transition:all 0.22s; white-space:nowrap;
  }
  .catTab:hover { background:rgba(255,255,255,0.025); }

  .trow {
    display:flex; align-items:center; gap:14px;
    padding:14px 14px 14px 10px;
    cursor:pointer; border-radius:6px;
    transition:background 0.2s;
    margin-bottom:1px;
  }
  .trow:hover { background:rgba(255,255,255,0.03); }
  .trow-done { background:rgba(255,255,255,0.015) !important; }
  .trow-flash { animation:rowFlash 0.5s ease; }
  .trow-locked { cursor:default; opacity:0.55; }
  .trow-locked:hover { background:transparent !important; transform:none !important; }

  .catCard {
    background:#11141f;
    border:1px solid rgba(255,255,255,0.07);
    border-top:2px solid var(--cc);
    border-radius:8px; padding:14px 12px;
    cursor:pointer; transition:all 0.22s;
  }
  .catCard:hover { background:#171b2a; transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,0,0,0.4); }

  .mclose {
    display:block; width:100%;
    background:transparent; border:1px solid rgba(255,255,255,0.07);
    border-radius:6px; color:rgba(236,230,218,0.25);
    padding:8px; cursor:pointer; font-family:Georgia,serif;
    font-size:0.72rem; letter-spacing:0.1em; text-transform:uppercase;
    transition:all 0.2s;
  }
  .mclose:hover { background:rgba(255,255,255,0.04); color:rgba(236,230,218,0.45); }

  ::-webkit-scrollbar { width:2px; height:2px; }
  ::-webkit-scrollbar-thumb { background:rgba(196,155,60,0.15); border-radius:1px; }
  * { box-sizing:border-box; }
  input::placeholder { color:rgba(236,230,218,0.22); }
`;

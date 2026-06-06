import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Supabase client (user fills these in) ─────────────────────────────────────
const SUPABASE_URL = "https://jvqonnsbxkusbsskdwsi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cW9ubnNieGt1c2Jzc2tkd3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3MDU5NjgsImV4cCI6MjA5NjI4MTk2OH0.Pn3Nu23knaf9T8I41ykJoYk4OPu2r851oGpE2quKfNs";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PROGRAMS = ["Film Production","Screenwriting","Cinematography","Post-Production / Editing","Acting for Film","Music for Film"];
const GRAD_YEARS = ["2025","2026","2027","2028"];

function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
function initials(name) {
  return (name||"?").split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
}

// ── LUXURY CINEMA DESIGN SYSTEM ───────────────────────────────────────────────
const G = {
  bg: "#080808",
  surface: "#0f0f0f",
  surface2: "#141414",
  border: "#1e1e1e",
  border2: "#2a2a2a",
  gold: "#c9a84c",
  goldDim: "#8a6e2f",
  goldGlow: "rgba(201,168,76,0.15)",
  white: "#f5f0e8",
  muted: "#888",
  muted2: "#555",
  red: "#c0392b",
  green: "#27ae60",
  sans: "'Montserrat', sans-serif",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${G.bg}; color: ${G.white}; font-family: ${G.sans}; min-height: 100vh; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #222; }

  /* Grain overlay */
  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* Gold scan line */
  body::after {
    content: ''; position: fixed; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, ${G.gold}, transparent);
    z-index: 9998; opacity: 0.6;
  }

  .fade-in { animation: fadeIn 0.5s ease forwards; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .slide-up { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
  @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }

  /* Staggered children */
  .stagger > * { opacity: 0; animation: fadeIn 0.4s ease forwards; }
  .stagger > *:nth-child(1) { animation-delay: 0.05s; }
  .stagger > *:nth-child(2) { animation-delay: 0.1s; }
  .stagger > *:nth-child(3) { animation-delay: 0.15s; }
  .stagger > *:nth-child(4) { animation-delay: 0.2s; }
  .stagger > *:nth-child(5) { animation-delay: 0.25s; }

  input, textarea, select {
    background: ${G.surface2}; border: 1px solid ${G.border2};
    color: ${G.white}; font-family: ${G.sans}; font-size: 13px; font-weight: 400;
    letter-spacing: 0.03em; padding: 12px 16px; width: 100%; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s; border-radius: 0;
  }
  input:focus, textarea:focus, select:focus {
    border-color: ${G.gold};
    box-shadow: 0 0 0 1px ${G.goldDim}, inset 0 0 20px rgba(201,168,76,0.03);
  }
  input::placeholder, textarea::placeholder { color: ${G.muted2}; font-style: italic; }
  select option { background: #111; }

  button { cursor: pointer; font-family: ${G.sans}; border: none; outline: none; }

  .btn-primary {
    background: linear-gradient(135deg, #c9a84c 0%, #a8832f 50%, #c9a84c 100%);
    background-size: 200% auto;
    color: #000; font-weight: 800; font-size: 10px; letter-spacing: 0.2em;
    text-transform: uppercase; padding: 14px 28px;
    transition: all 0.3s; position: relative; overflow: hidden;
    border: none;
  }
  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%);
    transform: translateX(-100%); transition: transform 0.4s;
  }
  .btn-primary:hover { background-position: right center; }
  .btn-primary:hover::after { transform: translateX(100%); }

  .btn-ghost {
    background: transparent; color: ${G.muted}; font-size: 10px; font-weight: 600;
    letter-spacing: 0.15em; text-transform: uppercase; padding: 12px 20px;
    border: 1px solid ${G.border2}; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: ${G.gold}; color: ${G.gold}; }

  .btn-outline-gold {
    background: transparent; color: ${G.gold}; font-size: 10px; font-weight: 700;
    letter-spacing: 0.15em; text-transform: uppercase; padding: 10px 18px;
    border: 1px solid ${G.goldDim}; transition: all 0.2s;
  }
  .btn-outline-gold:hover { background: ${G.goldGlow}; }

  .card {
    background: ${G.surface}; border: 1px solid ${G.border};
    position: relative; overflow: hidden;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, ${G.border2}, transparent);
  }

  .gold-line {
    height: 1px;
    background: linear-gradient(90deg, transparent, ${G.gold}, transparent);
    opacity: 0.4; margin: 0;
  }

  .tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 8px; font-weight: 700; letter-spacing: 0.15em;
    text-transform: uppercase; padding: 3px 8px; border: 1px solid;
  }
  .tag-gold { color: ${G.gold}; border-color: ${G.goldDim}; background: ${G.goldGlow}; }
  .tag-green { color: #2ecc71; border-color: #1a5c35; background: rgba(46,204,113,0.06); }
  .tag-red { color: #e74c3c; border-color: #5c1a1a; background: rgba(231,76,60,0.06); }
  .tag-blue { color: #5dade2; border-color: #1a3a5c; background: rgba(93,173,226,0.06); }

  .avatar {
    background: linear-gradient(135deg, #1a1a1a, #222);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; color: ${G.gold}; flex-shrink: 0;
    border: 1px solid ${G.border2}; font-family: ${G.sans};
    letter-spacing: 0.05em;
  }

  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 11px 20px;
    font-size: 9px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
    color: ${G.muted}; cursor: pointer; transition: all 0.15s;
    border-left: 2px solid transparent; position: relative;
  }
  .nav-item:hover { color: ${G.white}; background: rgba(255,255,255,0.02); }
  .nav-item.active { color: ${G.gold}; border-left-color: ${G.gold}; background: ${G.goldGlow}; }

  .post-card {
    background: ${G.surface}; border: 1px solid ${G.border};
    transition: border-color 0.3s; margin-bottom: 12px;
    position: relative; overflow: hidden;
  }
  .post-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, ${G.border2}, transparent);
  }
  .post-card:hover { border-color: #2a2a2a; }
  .post-card.featured { border-color: ${G.goldDim}; }
  .post-card.featured::before {
    background: linear-gradient(90deg, transparent, ${G.gold}, transparent);
    opacity: 0.5;
  }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
  }
  .modal {
    background: ${G.surface}; border: 1px solid ${G.border2};
    padding: 32px; max-width: 480px; width: 100%; max-height: 90vh; overflow-y: auto;
    position: relative;
  }
  .modal::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, ${G.gold}, transparent);
  }

  /* Film strip */
  .film-strip {
    display: flex; align-items: center; gap: 6px; overflow: hidden; padding: 0 8px;
    background: #0a0a0a;
  }
  .film-hole {
    width: 10px; height: 8px; border: 1px solid #2a2a2a; flex-shrink: 0;
    background: #080808;
  }

  /* Sprocket sidebar */
  .sprocket-bar {
    position: fixed; left: 0; top: 0; bottom: 0; width: 16px;
    background: #0a0a0a; border-right: 1px solid #161616;
    display: flex; flex-direction: column; align-items: center;
    padding: 8px 0; gap: 10px; overflow: hidden; z-index: 100;
  }
  .sprocket-hole {
    width: 8px; height: 8px; border: 1px solid #252525; flex-shrink: 0;
    background: ${G.bg};
  }

  /* Notification dot */
  .notif-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${G.gold}; position: absolute; top: 8px; right: 14px;
    box-shadow: 0 0 6px ${G.gold};
  }

  /* Mobile */
  @media (max-width: 768px) {
    .sidebar { display: none !important; }
    .sprocket-bar { display: none !important; }
    .mobile-nav { display: flex !important; }
    .main-content { padding-bottom: 80px !important; padding-left: 16px !important; padding-right: 16px !important; }
  }
  .mobile-nav { display: none; }
`;

// ── NFI LOGO ──────────────────────────────────────────────────────────────────
function NFILogo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="#000"/>
      <rect x="0.5" y="0.5" width="47" height="47" stroke="#c9a84c" strokeOpacity="0.3"/>
      {/* Camera body */}
      <rect x="3" y="13" width="34" height="22" rx="1" fill="#f5f0e8"/>
      {/* Lens outer */}
      <circle cx="19" cy="24" r="8" fill="#000"/>
      {/* Lens mid */}
      <circle cx="19" cy="24" r="5.5" fill="#f5f0e8"/>
      {/* Lens inner */}
      <circle cx="19" cy="24" r="3" fill="#000"/>
      {/* Lens glint */}
      <circle cx="21" cy="22" r="1" fill="#f5f0e8" opacity="0.6"/>
      {/* Viewfinder */}
      <rect x="21" y="8" width="10" height="6" rx="0.5" fill="#f5f0e8"/>
      {/* Sprocket holes */}
      <rect x="3" y="13" width="4" height="4" fill="#000" opacity="0.5"/>
      <rect x="3" y="31" width="4" height="4" fill="#000" opacity="0.5"/>
      {/* Side trigger */}
      <rect x="37" y="17" width="5" height="4" rx="0.5" fill="#f5f0e8"/>
      <rect x="37" y="27" width="5" height="4" rx="0.5" fill="#f5f0e8"/>
      {/* Gold accent line */}
      <rect x="3" y="35" width="34" height="1" fill="#c9a84c" opacity="0.6"/>
      {/* NFI text */}
      <text x="27" y="30" textAnchor="middle" fill="#000"
        style={{fontSize:"6.5px", fontFamily:"Montserrat,sans-serif", fontWeight:900, letterSpacing:"0.18em"}}>
        NFI
      </text>
    </svg>
  );
}

// ── LOADING ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20}}>
      <NFILogo size={56}/>
      <div style={{display:"flex",gap:6}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{width:4,height:4,background:G.gold,borderRadius:"50%",
            animation:"pulse 1.2s infinite",animationDelay:`${i*0.2}s`,opacity:0.8}}/>
        ))}
      </div>
      <style>{`.pulse-dot{animation:pulse 1.2s infinite}@keyframes pulse{0%,100%{opacity:0.2;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({name:"",email:"",password:"",program:"",gradYear:"",bio:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleLogin(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const { data, error } = await supabase.from("users").select("*")
        .eq("email", form.email.toLowerCase().trim()).single();
      if (error || !data) { setError("Invalid email or password."); setLoading(false); return; }
      if (data.password !== form.password) { setError("Invalid email or password."); setLoading(false); return; }
      if (data.status === "pending") { setError("Your account is awaiting admin approval. Hang tight!"); setLoading(false); return; }
      if (data.status === "rejected") { setError("Your account was not approved. Contact NFI."); setLoading(false); return; }
      localStorage.setItem("focus_user", JSON.stringify(data));
      onLogin(data);
    } catch { setError("Something went wrong. Try again."); }
    setLoading(false);
  }

  async function handleSignup(e) {
    e.preventDefault(); setError(""); setLoading(true);
    if (!form.name||!form.email||!form.password||!form.program||!form.gradYear) {
      setError("Please fill in all required fields."); setLoading(false); return;
    }
    try {
      const { data: existing } = await supabase.from("users").select("id").eq("email", form.email.toLowerCase().trim()).single();
      if (existing) { setError("An account with that email already exists."); setLoading(false); return; }
      const { error } = await supabase.from("users").insert([{
        username: form.name.trim(), email: form.email.toLowerCase().trim(),
        password: form.password, program: form.program, grad_year: form.gradYear,
        bio: form.bio.trim(), role: "student", status: "pending",
      }]);
      if (error) throw error;
      setPending(true);
    } catch { setError("Something went wrong. Try again."); }
    setLoading(false);
  }

  if (pending) return (
    <div style={{minHeight:"100vh",background:G.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:320}} className="fade-in">
        <NFILogo size={64}/>
        <div style={{height:1,background:`linear-gradient(90deg,transparent,${G.gold},transparent)`,margin:"24px 0",opacity:0.4}}/>
        <h2 style={{fontWeight:800,fontSize:20,letterSpacing:"0.02em",marginBottom:12}}>You're in the queue.</h2>
        <p style={{color:G.muted,lineHeight:1.8,fontSize:13,fontWeight:300,fontStyle:"italic"}}>
          Your account is pending admin approval. We'll get you set up soon — in the meantime, keep making things.
        </p>
        <button className="btn-ghost" style={{marginTop:28}} onClick={()=>{setPending(false);setMode("login");}}>Back to Login</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column"}}>
      {/* Top film strip */}
      <div className="film-strip" style={{height:22,borderBottom:`1px solid ${G.border}`,flexShrink:0}}>
        {Array.from({length:60}).map((_,i)=><div key={i} className="film-hole"/>)}
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 20px",overflowY:"auto"}}>

        {/* Logo + wordmark */}
        <div className="fade-in" style={{display:"flex",alignItems:"center",gap:16,marginBottom:40}}>
          <NFILogo size={64}/>
          <div>
            <div style={{fontWeight:900,fontSize:24,letterSpacing:"0.3em",color:G.white,lineHeight:1}}>FOCUS</div>
            <div style={{fontWeight:200,fontSize:8,letterSpacing:"0.35em",color:G.gold,textTransform:"uppercase",marginTop:4}}>Nashville Film Institute</div>
            <div className="gold-line" style={{marginTop:8,opacity:0.6}}/>
          </div>
        </div>

        {/* Tagline */}
        <div className="fade-in" style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontWeight:900,fontSize:"clamp(26px,7vw,36px)",lineHeight:1.05,letterSpacing:"-0.02em"}}>
            YOUR WORK.<br/>
            <span style={{fontWeight:100,fontStyle:"italic",color:G.gold,letterSpacing:"0.02em"}}>your crew.</span><br/>
            YOUR SCHOOL.
          </div>
        </div>

        {/* Form */}
        <div className="slide-up" style={{width:"100%",maxWidth:400,background:G.surface,border:`1px solid ${G.border2}`,position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold},transparent)`,opacity:0.5}}/>

          {/* Tabs */}
          <div style={{display:"flex",borderBottom:`1px solid ${G.border}`}}>
            {["login","signup"].map(m=>(
              <button key={m} onClick={()=>{setMode(m);setError("");}}
                style={{flex:1,padding:"16px 0",fontWeight:800,fontSize:9,letterSpacing:"0.2em",
                  textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s",fontFamily:G.sans,
                  background:mode===m?"transparent":"transparent",
                  color:mode===m?G.gold:G.muted2,
                  borderBottom:mode===m?`1px solid ${G.gold}`:"1px solid transparent",
                  marginBottom:-1}}>
                {m==="login"?"Sign In":"Create Account"}
              </button>
            ))}
          </div>

          <div style={{padding:"28px 24px"}}>
            {error&&<div style={{background:"rgba(192,57,43,0.08)",border:"1px solid rgba(192,57,43,0.3)",padding:"10px 14px",fontSize:12,color:"#e74c3c",marginBottom:16,letterSpacing:"0.02em"}}>{error}</div>}

            {mode==="login" ? (
              <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:16}}>
                {[{label:"Email",key:"email",type:"email",ph:"you@email.com"},{label:"Password",key:"password",type:"password",ph:"••••••••"}].map(f=>(
                  <div key={f.key}>
                    <label style={{fontSize:8,color:G.gold,display:"block",marginBottom:8,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700}}>{f.label}</label>
                    <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} required/>
                  </div>
                ))}
                <button type="submit" className="btn-primary" style={{marginTop:8,width:"100%",padding:"15px 0",opacity:loading?0.7:1}} disabled={loading}>
                  {loading?"Entering...":"Enter FOCUS"}
                </button>
              </form>
            ):(
              <form onSubmit={handleSignup} style={{display:"flex",flexDirection:"column",gap:14}}>
                {[{label:"Full Name",key:"name",type:"text",ph:"Your name"},{label:"Email",key:"email",type:"email",ph:"you@email.com"},{label:"Password",key:"password",type:"password",ph:"••••••••"}].map(f=>(
                  <div key={f.key}>
                    <label style={{fontSize:8,color:G.gold,display:"block",marginBottom:8,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700}}>{f.label} *</label>
                    <input type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e=>setForm({...form,[f.key]:e.target.value})} required/>
                  </div>
                ))}
                <div>
                  <label style={{fontSize:8,color:G.gold,display:"block",marginBottom:8,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700}}>Program *</label>
                  <select value={form.program} onChange={e=>setForm({...form,program:e.target.value})} required>
                    <option value="">Select program...</option>
                    {PROGRAMS.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:8,color:G.gold,display:"block",marginBottom:8,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700}}>Graduation Year *</label>
                  <select value={form.gradYear} onChange={e=>setForm({...form,gradYear:e.target.value})} required>
                    <option value="">Select year...</option>
                    {GRAD_YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:8,color:G.gold,display:"block",marginBottom:8,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700}}>Bio (optional)</label>
                  <textarea placeholder="Tell NFI who you are..." rows={2} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} style={{resize:"none"}}/>
                </div>
                <button type="submit" className="btn-primary" style={{marginTop:4,width:"100%",padding:"15px 0",opacity:loading?0.7:1}} disabled={loading}>
                  {loading?"Submitting...":"Request Access"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom film strip */}
      <div className="film-strip" style={{height:22,borderTop:`1px solid ${G.border}`,flexShrink:0}}>
        {Array.from({length:60}).map((_,i)=><div key={i} className="film-hole"/>)}
      </div>
    </div>
  );
}

// ── FILM FRAME ────────────────────────────────────────────────────────────────
function FilmFrame({ url, type }) {
  const [playing, setPlaying] = useState(false);
  const holes = Array.from({length: 10});
  const SprocketRow = () => (
    <div style={{background:"#000",display:"flex",alignItems:"center",justifyContent:"space-around",padding:"4px 8px",flexShrink:0}}>
      {holes.map((_,i) => (
        <div key={i} style={{width:8,height:7,border:"1px solid #333",background:"#080808",borderRadius:1}}/>
      ))}
    </div>
  );
  return (
    <div style={{background:"#000",border:"2px solid #1a1a1a",marginBottom:12,position:"relative",overflow:"hidden",
      boxShadow:"0 0 0 1px #111, 0 4px 24px rgba(0,0,0,0.8)"}}>
      {/* Top sprocket strip */}
      <SprocketRow/>
      {/* Film content area */}
      <div style={{position:"relative",background:"#0a0a0a",margin:"0 12px"}}>
        {type==="video" ? (
          <div style={{position:"relative"}}>
            <video src={url} style={{width:"100%",display:"block",maxHeight:320,objectFit:"cover"}}
              controls={playing} playsInline onClick={()=>setPlaying(true)}/>
            {!playing&&(
              <div onClick={()=>setPlaying(true)} style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
                background:"rgba(0,0,0,0.4)",cursor:"pointer"}}>
                <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(201,168,76,0.9)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:`0 0 20px ${G.goldGlow}`}}>
                  <span style={{color:"#000",fontSize:20,marginLeft:4}}>▶</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <img src={url} alt="post" style={{width:"100%",display:"block",maxHeight:400,objectFit:"cover"}}/>
        )}
        {/* Side film borders */}
        <div style={{position:"absolute",top:0,left:-12,width:12,bottom:0,background:"#000",
          display:"flex",flexDirection:"column",justifyContent:"space-around",alignItems:"center",padding:"4px 0"}}>
          {Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{width:6,height:5,border:"1px solid #2a2a2a",background:"#080808",borderRadius:1}}/>
          ))}
        </div>
        <div style={{position:"absolute",top:0,right:-12,width:12,bottom:0,background:"#000",
          display:"flex",flexDirection:"column",justifyContent:"space-around",alignItems:"center",padding:"4px 0"}}>
          {Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{width:6,height:5,border:"1px solid #2a2a2a",background:"#080808",borderRadius:1}}/>
          ))}
        </div>
      </div>
      {/* Bottom sprocket strip with NFI branding */}
      <div style={{background:"#000",position:"relative"}}>
        <SprocketRow/>
        {/* N.F.I. bottom right */}
        <div style={{position:"absolute",bottom:4,right:14,
          fontFamily:"'Montserrat',sans-serif",fontWeight:900,fontSize:7,
          letterSpacing:"0.25em",color:G.gold,opacity:0.7,textTransform:"uppercase",
          pointerEvents:"none"}}>
          N.F.I.
        </div>
        {/* Frame counter bottom left */}
        <div style={{position:"absolute",bottom:4,left:14,
          fontFamily:"'Montserrat',sans-serif",fontWeight:300,fontSize:7,
          letterSpacing:"0.15em",color:"#444",fontStyle:"italic",
          pointerEvents:"none"}}>
          FOCUS
        </div>
      </div>
    </div>
  );
}

// ── COMPRESS IMAGE ────────────────────────────────────────────────────────────
function compressImage(file, maxWidth=1080, quality=0.65) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── POST CARD ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onLike, onComment, onFeature, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments||[]);
  const liked = (post.likes||[]).includes(currentUser.id);
  const tagColors = {"Project Showcase":"tag-gold","Crew Finder":"tag-blue","Poll":"tag-green"};

  async function submitComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    const newComment = {post_id:post.id,user_id:currentUser.id,username:currentUser.username,text:comment.trim(),created_at:new Date().toISOString()};
    await supabase.from("comments").insert([newComment]);
    setComments(prev=>[...prev,newComment]);
    onComment(post.id, comment.trim());
    setComment("");
  }

  return (
    <div className={`post-card ${post.featured?"featured":""}`}>
      {post.featured&&(
        <div style={{background:"linear-gradient(90deg,rgba(201,168,76,0.06),transparent)",borderBottom:`1px solid ${G.border}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:G.gold,fontSize:10}}>★</span>
          <span style={{fontSize:8,fontWeight:800,color:G.gold,letterSpacing:"0.2em",textTransform:"uppercase"}}>Featured by NFI</span>
        </div>
      )}
      <div style={{padding:16}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
          <div className="avatar" style={{width:36,height:36,fontSize:11,borderRadius:0}}>{initials(post.username)}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontWeight:700,fontSize:13,letterSpacing:"0.02em"}}>{post.username}</span>
              {post.grad_year&&parseInt(post.grad_year)<=new Date().getFullYear()&&(
                <span className="tag tag-gold" style={{fontSize:8}}>🎓 Grad</span>
              )}
              <span style={{fontSize:11,color:G.muted2,marginLeft:"auto",fontStyle:"italic"}}>{timeAgo(post.created_at)}</span>
            </div>
            {post.program&&<div style={{fontSize:11,color:G.goldDim,marginTop:2,letterSpacing:"0.03em"}}>{post.program}</div>}
          </div>
        </div>

        {post.tags&&post.tags.length>0&&(
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
            {post.tags.map(t=><span key={t} className={`tag ${tagColors[t]||"tag-gold"}`}>{t}</span>)}
          </div>
        )}

        {post.content&&<p style={{fontSize:14,lineHeight:1.7,color:"#ddd",marginBottom:post.media_url?12:0,whiteSpace:"pre-wrap",fontWeight:300}}>{post.content}</p>}

        {/* Film frame media display */}
        {post.media_url&&<FilmFrame url={post.media_url} type={post.media_type}/>}

        {/* Poll */}
        {post.poll&&post.poll.length>0&&(
          <div style={{background:G.surface2,padding:14,marginBottom:12,border:`1px solid ${G.border}`}}>
            {post.poll.map((opt,i)=>{
              const total=post.poll_votes?Object.values(post.poll_votes).length:0;
              const votes=post.poll_votes?Object.values(post.poll_votes).filter(v=>v===i).length:0;
              const pct=total>0?Math.round((votes/total)*100):0;
              return (
                <div key={i} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span style={{fontWeight:300}}>{opt}</span>
                    <span style={{color:G.muted,fontStyle:"italic"}}>{pct}%</span>
                  </div>
                  <div style={{height:2,background:G.border}}>
                    <div style={{height:"100%",width:`${pct}%`,background:G.gold,transition:"width 0.4s"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",gap:4,paddingTop:10,borderTop:`1px solid ${G.border}`}}>
          <button onClick={()=>onLike(post.id)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",
              background:liked?G.goldGlow:"transparent",
              border:`1px solid ${liked?G.goldDim:"transparent"}`,
              color:liked?G.gold:G.muted,fontSize:12,cursor:"pointer",transition:"all 0.15s",fontFamily:G.sans}}>
            ♥ {(post.likes||[]).length}
          </button>
          <button onClick={()=>setShowComments(!showComments)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",
              background:"transparent",border:"1px solid transparent",
              color:G.muted,fontSize:12,cursor:"pointer",transition:"all 0.15s",fontFamily:G.sans}}
            onMouseEnter={e=>e.currentTarget.style.color=G.white}
            onMouseLeave={e=>e.currentTarget.style.color=G.muted}>
            ◇ {(post.comments||[]).length}
          </button>
          <div style={{flex:1}}/>
          {currentUser.role==="admin"&&(
            <>
              <button onClick={()=>onFeature(post.id)} className="btn-outline-gold" style={{fontSize:9,padding:"5px 10px"}}>
                {post.featured?"★ Featured":"☆ Feature"}
              </button>
              <button onClick={()=>onDelete(post.id)}
                style={{padding:"5px 10px",fontSize:9,cursor:"pointer",background:"transparent",
                  border:`1px solid ${G.border2}`,color:G.muted,transition:"all 0.15s",marginLeft:4,fontFamily:G.sans,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600}}
                onMouseEnter={e=>{e.currentTarget.style.color="#e74c3c";e.currentTarget.style.borderColor="#e74c3c";}}
                onMouseLeave={e=>{e.currentTarget.style.color=G.muted;e.currentTarget.style.borderColor=G.border2;}}>
                Remove
              </button>
            </>
          )}
        </div>

        {showComments&&(
          <div style={{marginTop:14}}>
            {comments.map((c,i)=>(
              <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
                <div className="avatar" style={{width:28,height:28,fontSize:10,borderRadius:0}}>{initials(c.username)}</div>
                <div style={{background:G.surface2,padding:"8px 12px",flex:1,border:`1px solid ${G.border}`}}>
                  <span style={{fontSize:11,fontWeight:700,color:G.gold,letterSpacing:"0.05em"}}>{c.username}</span>
                  <span style={{fontSize:11,color:G.muted2,marginLeft:8,fontStyle:"italic"}}>{timeAgo(c.created_at)}</span>
                  <p style={{fontSize:13,color:"#ccc",marginTop:4,fontWeight:300}}>{c.text}</p>
                </div>
              </div>
            ))}
            <form onSubmit={submitComment} style={{display:"flex",gap:8,marginTop:8}}>
              <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment..." style={{flex:1,padding:"9px 12px",fontSize:12}}/>
              <button type="submit" className="btn-primary" style={{padding:"9px 16px",fontSize:9,whiteSpace:"nowrap"}}>Post</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ── COMPOSE POST ──────────────────────────────────────────────────────────────
function ComposePost({ currentUser, onPost, onClose }) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [postType, setPostType] = useState("normal");
  const [pollOptions, setPollOptions] = useState(["",""]);
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const availableTags = ["Project Showcase","Crew Finder"];

  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) return;

    if (isVideo) {
      // Check duration
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      video.onloadedmetadata = () => {
        if (video.duration > 30) {
          alert("Video must be 30 seconds or less.");
          return;
        }
        setMediaFile(file);
        setMediaPreview(url);
        setMediaType("video");
      };
    } else {
      // Compress image
      const compressed = await compressImage(file);
      const url = URL.createObjectURL(compressed);
      setMediaFile(compressed);
      setMediaPreview(url);
      setMediaType("image");
    }
  }

  async function submit() {
    if (!content.trim() && !mediaFile) return;
    setLoading(true);
    setUploadProgress(0);

    let media_url = null;
    if (mediaFile) {
      const ext = mediaType === "video" ? "mp4" : "jpg";
      const path = `${currentUser.id}/${Date.now()}.${ext}`;
      setUploadProgress(30);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("media").upload(path, mediaFile, { contentType: mediaType === "video" ? "video/mp4" : "image/jpeg" });
      if (uploadError) { alert("Upload failed. Try again."); setLoading(false); return; }
      setUploadProgress(80);
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);
      media_url = urlData.publicUrl;
    }

    setUploadProgress(90);
    const newPost = {
      user_id: currentUser.id, username: currentUser.username,
      program: currentUser.program||null, grad_year: currentUser.grad_year||null,
      content: content.trim(), tags: postType==="poll"?[...tags,"Poll"]:tags,
      poll: postType==="poll"?pollOptions.filter(o=>o.trim()):null,
      likes:[], comments:[], featured:false,
      media_url, media_type: mediaType,
      expires_at: new Date(Date.now() + 365*24*60*60*1000).toISOString(),
    };
    const {data,error} = await supabase.from("posts").insert([newPost]).select().single();
    if (!error&&data) { onPost(data); onClose(); }
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal slide-up" style={{maxWidth:520}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div>
            <h3 style={{fontWeight:800,fontSize:18,letterSpacing:"0.05em"}}>New Post</h3>
            <div className="gold-line" style={{marginTop:8}}/>
          </div>
          <button onClick={onClose} style={{background:"transparent",color:G.muted,fontSize:18,cursor:"pointer",fontFamily:G.sans}}>✕</button>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:16}}>
          {["normal","poll"].map(t=>(
            <button key={t} onClick={()=>setPostType(t)}
              style={{padding:"7px 16px",fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",
                background:postType===t?G.goldGlow:"transparent",
                border:`1px solid ${postType===t?G.goldDim:G.border2}`,
                color:postType===t?G.gold:G.muted,transition:"all 0.15s",fontFamily:G.sans}}>
              {t==="normal"?"Post":"Poll"}
            </button>
          ))}
        </div>

        <textarea value={content} onChange={e=>setContent(e.target.value)}
          placeholder={postType==="poll"?"Ask your crew something...":"What are you working on?"}
          rows={3} style={{resize:"none",marginBottom:14,fontSize:14,lineHeight:1.6}}/>

        {/* Media preview in film frame */}
        {mediaPreview&&(
          <div style={{marginBottom:14,position:"relative"}}>
            <FilmFrame url={mediaPreview} type={mediaType}/>
            <button onClick={()=>{setMediaFile(null);setMediaPreview(null);setMediaType(null);}}
              style={{position:"absolute",top:28,right:20,background:"rgba(0,0,0,0.8)",color:"#fff",
                border:"1px solid #444",width:24,height:24,borderRadius:"50%",
                cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:G.sans}}>✕</button>
          </div>
        )}

        {/* Media upload buttons */}
        {!mediaPreview&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:8,color:G.gold,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.18em",fontWeight:700}}>Add Media</div>
            <div style={{display:"flex",gap:8}}>
              {/* Camera */}
              <input ref={cameraRef} type="file" accept="image/*" capture="environment"
                style={{display:"none"}} onChange={handleFileSelect}/>
              <button onClick={()=>cameraRef.current.click()}
                style={{flex:1,padding:"12px 0",fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",
                  cursor:"pointer",background:G.goldGlow,border:`1px solid ${G.goldDim}`,color:G.gold,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:G.sans}}>
                📷 Camera
              </button>
              {/* Gallery */}
              <input ref={fileRef} type="file" accept="image/*,video/*"
                style={{display:"none"}} onChange={handleFileSelect}/>
              <button onClick={()=>fileRef.current.click()}
                style={{flex:1,padding:"12px 0",fontSize:9,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",
                  cursor:"pointer",background:"transparent",border:`1px solid ${G.border2}`,color:G.muted,
                  display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:G.sans}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=G.gold}
                onMouseLeave={e=>e.currentTarget.style.borderColor=G.border2}>
                🎬 Gallery / Video
              </button>
            </div>
            <div style={{fontSize:9,color:G.muted2,marginTop:6,fontStyle:"italic"}}>Photos compressed for storage · Videos max 30 seconds</div>
          </div>
        )}

        {postType==="poll"&&(
          <div style={{marginBottom:14}}>
            {pollOptions.map((opt,i)=>(
              <input key={i} value={opt} onChange={e=>{const p=[...pollOptions];p[i]=e.target.value;setPollOptions(p);}}
                placeholder={`Option ${i+1}`} style={{marginBottom:8}}/>
            ))}
            {pollOptions.length<4&&(
              <button className="btn-ghost" style={{fontSize:10,padding:"6px 12px"}} onClick={()=>setPollOptions([...pollOptions,""])}>+ Add option</button>
            )}
          </div>
        )}

        <div style={{marginBottom:14}}>
          <div style={{fontSize:8,color:G.gold,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.18em",fontWeight:700}}>Tags</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {availableTags.map(t=>(
              <button key={t} onClick={()=>setTags(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t])}
                style={{padding:"6px 14px",fontSize:9,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",
                  background:tags.includes(t)?G.goldGlow:"transparent",
                  border:`1px solid ${tags.includes(t)?G.goldDim:G.border2}`,
                  color:tags.includes(t)?G.gold:G.muted,transition:"all 0.15s",fontFamily:G.sans}}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading&&uploadProgress>0&&(
          <div style={{marginBottom:14}}>
            <div style={{height:2,background:G.border}}>
              <div style={{height:"100%",width:`${uploadProgress}%`,background:G.gold,transition:"width 0.3s"}}/>
            </div>
            <div style={{fontSize:9,color:G.muted,marginTop:4,fontStyle:"italic"}}>Uploading to FOCUS...</div>
          </div>
        )}

        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}
            disabled={(!content.trim()&&!mediaFile)||loading}
            style={{opacity:(content.trim()||mediaFile)&&!loading?1:0.5}}>
            {loading?"Publishing...":"Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FEED TAB ──────────────────────────────────────────────────────────────────
function FeedTab({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(()=>{
    loadPosts();
    const sub = supabase.channel("posts").on("postgres_changes",{event:"*",schema:"public",table:"posts"},()=>loadPosts()).subscribe();
    return ()=>supabase.removeChannel(sub);
  },[]);

  async function loadPosts() {
    const {data} = await supabase.from("posts").select("*").order("created_at",{ascending:false});
    if (data) setPosts(data);
    setLoading(false);
  }

  async function handleLike(postId) {
    const post = posts.find(p=>p.id===postId);
    const likes = post.likes||[];
    const newLikes = likes.includes(currentUser.id)?likes.filter(id=>id!==currentUser.id):[...likes,currentUser.id];
    await supabase.from("posts").update({likes:newLikes}).eq("id",postId);
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,likes:newLikes}:p));
  }

  async function handleFeature(postId) {
    const post = posts.find(p=>p.id===postId);
    await supabase.from("posts").update({featured:!post.featured}).eq("id",postId);
    setPosts(prev=>prev.map(p=>p.id===postId?{...p,featured:!p.featured}:p));
  }

  async function handleDelete(postId) {
    await supabase.from("posts").delete().eq("id",postId);
    setPosts(prev=>prev.filter(p=>p.id!==postId));
  }

  function handleComment(postId) {
    setPosts(prev=>prev.map(p=>p.id!==postId?p:{...p,comments:[...(p.comments||[]),{}]}));
  }

  const filtered = filter==="all"?posts:posts.filter(p=>(p.tags||[]).includes(filter));
  const filters = ["all","Project Showcase","Crew Finder","Poll"];

  return (
    <div className="stagger">
      {/* Compose */}
      <div className="card" style={{marginBottom:20,padding:16}}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div className="avatar" style={{width:36,height:36,fontSize:11,borderRadius:0}}>{initials(currentUser.username)}</div>
          <button onClick={()=>setShowCompose(true)}
            style={{flex:1,textAlign:"left",padding:"11px 16px",background:G.surface2,
              border:`1px solid ${G.border}`,color:G.muted2,fontSize:13,cursor:"pointer",
              transition:"border-color 0.2s",fontFamily:G.sans,fontStyle:"italic",fontWeight:300}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=G.gold}
            onMouseLeave={e=>e.currentTarget.style.borderColor=G.border}>
            What are you working on, {currentUser.username.split(" ")[0]}?
          </button>
          <button className="btn-primary" onClick={()=>setShowCompose(true)}>+ Post</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
        {filters.map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{padding:"7px 16px",fontSize:9,fontWeight:700,letterSpacing:"0.12em",cursor:"pointer",whiteSpace:"nowrap",
              background:filter===f?G.goldGlow:"transparent",
              border:`1px solid ${filter===f?G.goldDim:G.border2}`,
              color:filter===f?G.gold:G.muted,transition:"all 0.15s",fontFamily:G.sans,textTransform:"uppercase"}}>
            {f==="all"?"All Posts":f}
          </button>
        ))}
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:"60px 0",color:G.muted}}>
          <div style={{fontStyle:"italic",fontSize:13}}>Loading posts...</div>
        </div>
      ):filtered.length===0?(
        <div style={{textAlign:"center",padding:"60px 0",color:G.muted}}>
          <NFILogo size={48}/>
          <p style={{marginTop:16,fontStyle:"italic",fontSize:13}}>No posts yet. Be the first to share something.</p>
        </div>
      ):filtered.map(p=>(
        <PostCard key={p.id} post={p} currentUser={currentUser}
          onLike={handleLike} onComment={handleComment} onFeature={handleFeature} onDelete={handleDelete}/>
      ))}

      {showCompose&&<ComposePost currentUser={currentUser} onPost={p=>setPosts(prev=>[p,...prev])} onClose={()=>setShowCompose(false)}/>}
    </div>
  );
}

// ── EVENTS TAB ────────────────────────────────────────────────────────────────
function EventsTab({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({title:"",date:"",time:"",location:"",description:""});

  useEffect(()=>{ loadEvents(); },[]);

  async function loadEvents() {
    const {data} = await supabase.from("events").select("*").order("date",{ascending:true});
    if (data) setEvents(data);
    setLoading(false);
  }

  async function handleCheckIn(eventId) {
    const ev = events.find(e=>e.id===eventId);
    const checked = (ev.checked_in||[]);
    const newChecked = checked.includes(currentUser.id)?checked.filter(id=>id!==currentUser.id):[...checked,currentUser.id];
    await supabase.from("events").update({checked_in:newChecked}).eq("id",eventId);
    setEvents(prev=>prev.map(e=>e.id===eventId?{...e,checked_in:newChecked}:e));
  }

  async function submitEvent(e) {
    e.preventDefault();
    const {data,error} = await supabase.from("events").insert([{...form,checked_in:[]}]).select().single();
    if (!error&&data) { setEvents(prev=>[...prev,data]); setShowAdd(false); setForm({title:"",date:"",time:"",location:"",description:""}); }
  }

  return (
    <div className="stagger">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <div>
          <h2 style={{fontWeight:800,fontSize:22,letterSpacing:"0.05em"}}>Upcoming at NFI</h2>
          <div className="gold-line" style={{marginTop:8,maxWidth:120}}/>
        </div>
        {currentUser.role==="admin"&&(
          <button className="btn-primary" onClick={()=>setShowAdd(true)}>+ Add Event</button>
        )}
      </div>

      {loading?<div style={{color:G.muted,fontStyle:"italic",fontSize:13}}>Loading events...</div>:events.map(ev=>{
        const checked=(ev.checked_in||[]).includes(currentUser.id);
        const dateObj=new Date(ev.date+"T12:00:00");
        const isPast=dateObj<new Date();
        return (
          <div key={ev.id} className="card" style={{marginBottom:12,padding:20,opacity:isPast?0.5:1}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
              <div style={{textAlign:"center",background:G.bg,border:`1px solid ${G.border2}`,padding:"10px 14px",minWidth:54,position:"relative"}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold},transparent)`,opacity:0.4}}/>
                <div style={{fontSize:8,color:G.gold,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.15em"}}>
                  {dateObj.toLocaleString("default",{month:"short"})}
                </div>
                <div style={{fontSize:26,fontWeight:900,lineHeight:1.1,marginTop:2}}>{dateObj.getDate()}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                  <h3 style={{fontSize:15,fontWeight:700,letterSpacing:"0.02em"}}>{ev.title}</h3>
                  {isPast?<span className="tag tag-red">Past</span>:<span className="tag tag-green">Upcoming</span>}
                </div>
                <div style={{display:"flex",gap:16,marginTop:6,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,color:G.muted,fontStyle:"italic"}}>🕐 {ev.time}</span>
                  <span style={{fontSize:12,color:G.muted,fontStyle:"italic"}}>📍 {ev.location}</span>
                  <span style={{fontSize:12,color:G.muted,fontStyle:"italic"}}>✓ {(ev.checked_in||[]).length} checked in</span>
                </div>
                {ev.description&&<p style={{fontSize:12,color:G.muted,marginTop:8,lineHeight:1.6,fontWeight:300,fontStyle:"italic"}}>{ev.description}</p>}
                {!isPast&&(
                  <button onClick={()=>handleCheckIn(ev.id)}
                    style={{marginTop:12,padding:"9px 20px",fontSize:9,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s",fontFamily:G.sans,
                      background:checked?G.goldGlow:"transparent",
                      border:`1px solid ${checked?G.gold:G.border2}`,
                      color:checked?G.gold:G.muted}}>
                    {checked?"★ Checked In":"Check In"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {showAdd&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal slide-up">
            <h3 style={{fontWeight:800,fontSize:18,marginBottom:20}}>Add Event</h3>
            <form onSubmit={submitEvent} style={{display:"flex",flexDirection:"column",gap:14}}>
              <input placeholder="Event title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required/>
              <div style={{display:"flex",gap:12}}>
                <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required style={{flex:1}}/>
                <input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} style={{flex:1}}/>
              </div>
              <input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
              <textarea placeholder="Description" rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{resize:"none"}}/>
              <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
                <button type="button" className="btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CREW FINDER ───────────────────────────────────────────────────────────────
function CrewTab({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    supabase.from("users").select("*").eq("status","approved").neq("role","admin")
      .then(({data})=>{ if(data) setUsers(data); setLoading(false); });
  },[]);

  const filtered = users.filter(u=>{
    const s=!search||u.username.toLowerCase().includes(search.toLowerCase())||(u.bio||"").toLowerCase().includes(search.toLowerCase())||(u.program||"").toLowerCase().includes(search.toLowerCase());
    const p=filterProgram==="all"||u.program===filterProgram;
    return s&&p;
  });

  return (
    <div className="stagger">
      <div style={{marginBottom:24}}>
        <h2 style={{fontWeight:800,fontSize:22,letterSpacing:"0.05em"}}>Find Your Crew</h2>
        <div className="gold-line" style={{marginTop:8,maxWidth:80}}/>
        <p style={{color:G.muted,fontSize:12,marginTop:10,fontStyle:"italic",fontWeight:300}}>Connect with NFI students across all programs.</p>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, program, or bio..." style={{flex:1,minWidth:200}}/>
        <select value={filterProgram} onChange={e=>setFilterProgram(e.target.value)} style={{width:"auto"}}>
          <option value="all">All Programs</option>
          {PROGRAMS.map(p=><option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      {loading?<div style={{color:G.muted,fontStyle:"italic",fontSize:13}}>Loading students...</div>:(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
          {filtered.map(u=>(
            <div key={u.id} className="card" style={{padding:16,transition:"border-color 0.2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=G.goldDim}
              onMouseLeave={e=>e.currentTarget.style.borderColor=G.border}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div className="avatar" style={{width:42,height:42,fontSize:14,borderRadius:0}}>{initials(u.username)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:2,letterSpacing:"0.02em"}}>{u.username}</div>
                  {u.program&&<div style={{fontSize:11,color:G.gold,letterSpacing:"0.03em"}}>{u.program}</div>}
                  {u.grad_year&&(
                    <div style={{fontSize:10,color:G.muted,marginTop:2}}>
                      {parseInt(u.grad_year)<=new Date().getFullYear()?<span className="tag tag-gold" style={{fontSize:9}}>🎓 Grad</span>:`Class of ${u.grad_year}`}
                    </div>
                  )}
                </div>
              </div>
              {u.bio&&<p style={{fontSize:11,color:G.muted,marginTop:10,lineHeight:1.6,borderTop:`1px solid ${G.border}`,paddingTop:10,fontWeight:300,fontStyle:"italic"}}>{u.bio}</p>}
            </div>
          ))}
          {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"40px 0",color:G.muted,fontStyle:"italic"}}>No students found.</div>}
        </div>
      )}
    </div>
  );
}

// ── ADMIN TAB ─────────────────────────────────────────────────────────────────
function AdminTab({ currentUser }) {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ loadUsers(); },[]);

  async function loadUsers() {
    const {data} = await supabase.from("users").select("*").neq("role","admin");
    if (data) {
      setPending(data.filter(u=>u.status==="pending"));
      setApproved(data.filter(u=>u.status==="approved"));
    }
    setLoading(false);
  }

  async function approve(id) {
    await supabase.from("users").update({status:"approved"}).eq("id",id);
    const user = pending.find(u=>u.id===id);
    setPending(prev=>prev.filter(u=>u.id!==id));
    setApproved(prev=>[...prev,{...user,status:"approved"}]);
  }

  async function reject(id) {
    await supabase.from("users").update({status:"rejected"}).eq("id",id);
    setPending(prev=>prev.filter(u=>u.id!==id));
  }

  async function removeAccess(id) {
    await supabase.from("users").update({status:"graduated"}).eq("id",id);
    setApproved(prev=>prev.filter(u=>u.id!==id));
  }

  return (
    <div className="stagger">
      <div style={{marginBottom:24}}>
        <h2 style={{fontWeight:800,fontSize:22,letterSpacing:"0.05em"}}>Admin Panel</h2>
        <div className="gold-line" style={{marginTop:8,maxWidth:60}}/>
      </div>

      {loading?<div style={{color:G.muted,fontStyle:"italic",fontSize:13}}>Loading...</div>:(
        <>
          {pending.length>0&&(
            <div style={{marginBottom:32}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <h3 style={{fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase"}}>Pending Approvals</h3>
                <span style={{background:G.gold,color:"#000",fontSize:10,fontWeight:900,padding:"2px 8px",letterSpacing:"0.05em"}}>{pending.length}</span>
              </div>
              {pending.map(u=>(
                <div key={u.id} className="card" style={{padding:16,marginBottom:10,display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                  <div className="avatar" style={{width:36,height:36,fontSize:11,borderRadius:0}}>{initials(u.username)}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,letterSpacing:"0.02em"}}>{u.username}</div>
                    <div style={{fontSize:11,color:G.muted,fontStyle:"italic"}}>{u.email} · {u.program} · Class of {u.grad_year}</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>approve(u.id)}
                      style={{padding:"8px 16px",fontSize:9,fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",
                        background:"rgba(39,174,96,0.1)",border:"1px solid #1a5c35",color:"#2ecc71",fontFamily:G.sans}}>Approve</button>
                    <button onClick={()=>reject(u.id)}
                      style={{padding:"8px 16px",fontSize:9,fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",cursor:"pointer",
                        background:"rgba(192,57,43,0.1)",border:"1px solid #5c1a1a",color:"#e74c3c",fontFamily:G.sans}}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <h3 style={{fontSize:13,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:14}}>Active Students ({approved.length})</h3>
            {approved.map(u=>(
              <div key={u.id} className="card" style={{padding:14,marginBottom:8,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <div className="avatar" style={{width:32,height:32,fontSize:10,borderRadius:0}}>{initials(u.username)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13}}>{u.username}</div>
                  <div style={{fontSize:11,color:G.muted,fontStyle:"italic"}}>{u.program} · Class of {u.grad_year}</div>
                </div>
                <button onClick={()=>removeAccess(u.id)} className="btn-ghost" style={{fontSize:9,padding:"6px 12px"}}
                  onMouseEnter={e=>{e.currentTarget.style.color="#e74c3c";e.currentTarget.style.borderColor="#e74c3c";}}
                  onMouseLeave={e=>{e.currentTarget.style.color=G.muted;e.currentTarget.style.borderColor=G.border2;}}>
                  Remove Access
                </button>
              </div>
            ))}
            {approved.length===0&&<p style={{color:G.muted,fontSize:13,fontStyle:"italic"}}>No active students yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────
function ProfileTab({ currentUser }) {
  const [posts, setPosts] = useState([]);
  useEffect(()=>{
    supabase.from("posts").select("*").eq("user_id",currentUser.id).order("created_at",{ascending:false})
      .then(({data})=>{ if(data) setPosts(data); });
  },[]);

  return (
    <div className="stagger">
      <div className="card" style={{padding:28,marginBottom:20}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold},transparent)`,opacity:0.5}}/>
        <div style={{display:"flex",gap:18,alignItems:"center",marginBottom:20}}>
          <div className="avatar" style={{width:64,height:64,fontSize:22,borderRadius:0,border:`1px solid ${G.goldDim}`}}>{initials(currentUser.username)}</div>
          <div>
            <h2 style={{fontWeight:900,fontSize:24,letterSpacing:"0.02em"}}>{currentUser.username}</h2>
            {currentUser.program&&<div style={{color:G.gold,fontSize:12,marginTop:4,letterSpacing:"0.05em"}}>{currentUser.program}</div>}
            {currentUser.grad_year&&(
              <div style={{fontSize:11,color:G.muted,marginTop:4,fontStyle:"italic"}}>
                {parseInt(currentUser.grad_year)<=new Date().getFullYear()
                  ?<span className="tag tag-gold">🎓 Graduate</span>
                  :`Class of ${currentUser.grad_year}`}
              </div>
            )}
          </div>
        </div>
        {currentUser.bio&&<p style={{fontSize:13,color:"#bbb",lineHeight:1.7,fontWeight:300,fontStyle:"italic",borderTop:`1px solid ${G.border}`,paddingTop:16}}>{currentUser.bio}</p>}
        <div style={{display:"flex",gap:32,marginTop:16,paddingTop:16,borderTop:`1px solid ${G.border}`}}>
          <div>
            <div style={{fontWeight:900,fontSize:26,color:G.gold}}>{posts.length}</div>
            <div style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:"0.15em",marginTop:2}}>Posts</div>
          </div>
          <div>
            <div style={{fontWeight:900,fontSize:26,color:G.gold}}>{posts.reduce((a,p)=>a+(p.likes||[]).length,0)}</div>
            <div style={{fontSize:9,color:G.muted,textTransform:"uppercase",letterSpacing:"0.15em",marginTop:2}}>Likes</div>
          </div>
        </div>
      </div>
      <h3 style={{fontSize:12,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14,color:G.muted}}>My Posts</h3>
      {posts.length===0?<p style={{color:G.muted,fontSize:13,fontStyle:"italic"}}>You haven't posted yet.</p>:posts.map(p=>(
        <div key={p.id} className="card" style={{padding:14,marginBottom:10}}>
          <p style={{fontSize:13,color:"#ccc",lineHeight:1.6,fontWeight:300}}>{p.content}</p>
          <div style={{fontSize:11,color:G.muted,marginTop:8,fontStyle:"italic"}}>♥ {(p.likes||[]).length} · ◇ {(p.comments||[]).length} · {timeAgo(p.created_at)}</div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function FocusNFI() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("feed");
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(()=>{
    // Restore session
    const saved = localStorage.getItem("focus_user");
    if (saved) {
      const user = JSON.parse(saved);
      // Re-verify user is still active
      supabase.from("users").select("*").eq("id",user.id).single().then(({data})=>{
        if (data && data.status==="approved") { setCurrentUser(data); localStorage.setItem("focus_user",JSON.stringify(data)); }
        else localStorage.removeItem("focus_user");
        setLoading(false);
      });
    } else { setLoading(false); }
  },[]);

  useEffect(()=>{
    if (currentUser?.role==="admin") {
      supabase.from("users").select("id",{count:"exact"}).eq("status","pending")
        .then(({count})=>setPendingCount(count||0));
      const sub = supabase.channel("pending").on("postgres_changes",{event:"*",schema:"public",table:"users"},()=>{
        supabase.from("users").select("id",{count:"exact"}).eq("status","pending").then(({count})=>setPendingCount(count||0));
      }).subscribe();
      return ()=>supabase.removeChannel(sub);
    }
  },[currentUser]);

  function handleLogin(user) { setCurrentUser(user); localStorage.setItem("focus_user",JSON.stringify(user)); }
  function handleLogout() { setCurrentUser(null); localStorage.removeItem("focus_user"); setTab("feed"); }

  if (loading) return <><style>{css}</style><Loader/></>;
  if (!currentUser) return <><style>{css}</style><AuthScreen onLogin={handleLogin}/></>;

  const navItems = [
    {id:"feed",icon:"⬛",label:"Feed"},
    {id:"events",icon:"◈",label:"Events"},
    {id:"crew",icon:"⬡",label:"Crew"},
    {id:"profile",icon:"◉",label:"Profile"},
    ...(currentUser.role==="admin"?[{id:"admin",icon:"⚙",label:"Admin",badge:pendingCount}]:[]),
  ];

  return (
    <>
      <style>{css}</style>
      {/* Sprocket bar */}
      <div className="sprocket-bar">
        {Array.from({length:60}).map((_,i)=><div key={i} className="sprocket-hole"/>)}
      </div>

      <div style={{display:"flex",minHeight:"100vh",paddingLeft:16}}>
        {/* Sidebar */}
        <div className="sidebar" style={{width:220,background:"#0a0a0a",borderRight:`1px solid ${G.border}`,display:"flex",flexDirection:"column",position:"sticky",top:0,height:"100vh",overflowY:"auto"}}>
          {/* Logo */}
          <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${G.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <NFILogo size={44}/>
              <div>
                <div style={{fontWeight:900,fontSize:14,letterSpacing:"0.25em",color:G.white}}>FOCUS</div>
                <div style={{fontWeight:200,fontSize:7,letterSpacing:"0.3em",color:G.gold,textTransform:"uppercase",marginTop:3}}>NFI</div>
              </div>
            </div>
          </div>

          {/* Gold scan line */}
          <div className="gold-line"/>

          {/* Nav */}
          <nav style={{flex:1,paddingTop:8}}>
            {navItems.map(item=>(
              <div key={item.id} className={`nav-item ${tab===item.id?"active":""}`}
                onClick={()=>setTab(item.id)} style={{position:"relative"}}>
                <span style={{fontSize:14}}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge>0&&<span style={{marginLeft:"auto",background:G.gold,color:"#000",fontSize:9,fontWeight:900,padding:"2px 7px",letterSpacing:"0.05em"}}>{item.badge}</span>}
              </div>
            ))}
          </nav>

          <div className="gold-line"/>

          {/* User */}
          <div style={{padding:"16px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:G.surface,border:`1px solid ${G.border}`}}>
              <div className="avatar" style={{width:30,height:30,fontSize:10,borderRadius:0}}>{initials(currentUser.username)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:"0.05em",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{currentUser.username}</div>
                {currentUser.role==="admin"&&<div style={{fontSize:8,color:G.gold,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700}}>Admin</div>}
              </div>
              <button onClick={handleLogout} title="Sign out"
                style={{background:"transparent",color:G.muted,fontSize:14,cursor:"pointer",padding:4,transition:"color 0.15s",fontFamily:G.sans}}
                onMouseEnter={e=>e.currentTarget.style.color=G.white}
                onMouseLeave={e=>e.currentTarget.style.color=G.muted}>⇥</button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{flex:1,padding:"32px 28px",maxWidth:720,margin:"0 auto"}} className="main-content">
          <div className="fade-in" key={tab}>
            {tab==="feed"&&<FeedTab currentUser={currentUser}/>}
            {tab==="events"&&<EventsTab currentUser={currentUser}/>}
            {tab==="crew"&&<CrewTab currentUser={currentUser}/>}
            {tab==="profile"&&<ProfileTab currentUser={currentUser}/>}
            {tab==="admin"&&currentUser.role==="admin"&&<AdminTab currentUser={currentUser}/>}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="mobile-nav" style={{position:"fixed",bottom:0,left:0,right:0,background:"#080808",borderTop:`1px solid ${G.border}`,padding:"6px 0",zIndex:100,justifyContent:"space-around"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,transparent,${G.gold},transparent)`,opacity:0.3}}/>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id)}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"8px 12px",cursor:"pointer",
                background:"transparent",color:tab===item.id?G.gold:G.muted2,position:"relative",fontFamily:G.sans,border:"none",transition:"color 0.15s"}}>
              <span style={{fontSize:16}}>{item.icon}</span>
              <span style={{fontSize:8,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase"}}>{item.label}</span>
              {item.badge>0&&<div className="notif-dot"/>}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

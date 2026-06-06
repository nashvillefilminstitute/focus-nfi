import { useState, useEffect, useRef } from "react";

// ── Minimal in-memory "database" ──────────────────────────────────────────────
const ADMIN_CREDENTIALS = { email: "admin@nfi.edu", password: "PolkAve191$$" };

const SEED_EVENTS = [
  { id: 1, title: "Short Film Showcase", date: "2026-06-14", time: "7:00 PM", location: "Studio A", description: "Student short films screened for faculty and peers.", checkedIn: [] },
  { id: 2, title: "Cinematography Workshop", date: "2026-06-20", time: "2:00 PM", location: "Lab 3", description: "Hands-on lighting and camera movement techniques.", checkedIn: [] },
  { id: 3, title: "Industry Guest: Casting Director", date: "2026-06-27", time: "5:00 PM", location: "Main Theater", description: "Q&A with a Nashville-based casting director.", checkedIn: [] },
];

const SEED_POSTS = [
  { id: 1, userId: "system", username: "NFI Admin", avatar: "🎬", content: "Welcome to FOCUS — the official student network of Nashville Film Institute. Post your work. Find your crew. Make something unforgettable.", type: "text", tags: [], likes: [], comments: [], featured: true, timestamp: Date.now() - 86400000 * 2 },
];

const PROGRAMS = ["Film Production", "Screenwriting", "Cinematography", "Post-Production / Editing", "Acting for Film", "Music for Film"];

const GRAD_YEARS = ["2025", "2026", "2027", "2028"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function initials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const G = {
  bg: "#000000",
  surface: "#0d0d0d",
  surfaceHover: "#1a1a1a",
  border: "#222222",
  borderLight: "#333333",
  accent: "#ffffff",
  accentDim: "#888888",
  red: "#ff3333",
  green: "#33ff77",
  text: "#ffffff",
  muted: "#999999",
  font: "'Montserrat', sans-serif",
  mono: "'Montserrat', sans-serif",
  sans: "'Montserrat', sans-serif",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,300;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${G.bg};
    color: ${G.text};
    font-family: ${G.sans};
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: ${G.bg}; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

  .grain {
    position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.055;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  }

  /* Sprocket holes decoration */
  .sprocket-strip {
    position: fixed; top: 0; left: 0; width: 18px; height: 100vh;
    background: #0d0d0d; border-right: 1px solid #1a1a1a;
    display: flex; flex-direction: column; align-items: center;
    padding: 12px 0; gap: 14px; z-index: 50; overflow: hidden;
  }
  .sprocket {
    width: 10px; height: 10px; border-radius: 2px;
    border: 1px solid #333; flex-shrink: 0;
  }

  .fade-in { animation: fadeIn 0.4s ease forwards; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .slide-up { animation: slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

  .pulse { animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

  input, textarea, select {
    background: ${G.surface};
    border: 1px solid ${G.border};
    color: ${G.text};
    font-family: ${G.sans};
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.02em;
    border-radius: 0px;
    padding: 11px 14px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s;
  }
  input:focus, textarea:focus, select:focus { border-color: #fff; }
  input::placeholder, textarea::placeholder { color: ${G.muted}; }
  select option { background: #111; }

  button { cursor: pointer; font-family: ${G.sans}; border: none; outline: none; }

  .btn-gold {
    background: #ffffff;
    color: #000000;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 11px 22px;
    border-radius: 0px;
    transition: all 0.2s;
  }
  .btn-gold:hover { background: #e0e0e0; }

  .btn-ghost {
    background: transparent;
    color: ${G.muted};
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 10px 16px;
    border-radius: 0px;
    border: 1px solid ${G.border};
    transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: #fff; color: #fff; }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 0px;
    border: 1px solid;
  }
  .tag-gold { color: #fff; border-color: #444; background: rgba(255,255,255,0.06); }
  .tag-green { color: ${G.green}; border-color: #1a4d2e; background: rgba(51,255,119,0.06); }
  .tag-red { color: ${G.red}; border-color: #4d1a1a; background: rgba(255,51,51,0.06); }
  .tag-blue { color: #80b3ff; border-color: #1a2d4d; background: rgba(128,179,255,0.06); }

  .card {
    background: ${G.surface};
    border: 1px solid ${G.border};
    border-radius: 0px;
    overflow: hidden;
  }

  .divider { border: none; border-top: 1px solid ${G.border}; margin: 16px 0; }

  .avatar {
    width: 36px; height: 36px; border-radius: 0px;
    background: #1a1a1a;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 11px; color: #fff;
    flex-shrink: 0;
    border: 1px solid ${G.border};
    letter-spacing: 0.05em;
    font-family: ${G.sans};
  }

  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${G.muted};
    cursor: pointer;
    transition: all 0.15s;
    border-left: 2px solid transparent;
  }
  .nav-item:hover { color: ${G.text}; background: #111; }
  .nav-item.active { color: #fff; border-left-color: #fff; background: #111; }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.92); backdrop-filter: blur(2px);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
  }
  .modal {
    background: #0d0d0d; border: 1px solid #333;
    border-radius: 0px; padding: 28px; max-width: 480px; width: 100%;
    max-height: 90vh; overflow-y: auto;
  }

  .post-card {
    background: ${G.surface}; border: 1px solid ${G.border};
    border-radius: 0px; overflow: hidden;
    transition: border-color 0.2s;
  }
  .post-card:hover { border-color: #333; }
  .post-card.featured { border-color: #555; border-left: 3px solid #fff; }

  .notification-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #fff; position: absolute; top: 2px; right: 2px;
  }

  /* Film counter style numbers */
  .film-counter {
    font-family: ${G.mono};
    font-weight: 200;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: #444;
    text-transform: uppercase;
  }

  /* Mobile nav */
  @media (max-width: 768px) {
    .sidebar { display: none !important; }
    .sprocket-strip { display: none !important; }
    .mobile-nav { display: flex !important; }
    .main-content { padding-bottom: 80px !important; }
  }
  .mobile-nav { display: none; }
`;

// ── NFI LOGO ──────────────────────────────────────────────────────────────────
function NFILogo({ size = 36, invert = false }) {
  const bg = invert ? "#000" : "#fff";
  const fg = invert ? "#fff" : "#000";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="40" height="40" fill={bg} />
      {/* Film camera body — bigger, fills frame */}
      <rect x="3" y="11" width="28" height="19" rx="1" fill={fg} />
      {/* Lens circle — scaled up */}
      <circle cx="16" cy="20.5" r="6.5" fill={bg} />
      <circle cx="16" cy="20.5" r="4.2" fill={fg} />
      <circle cx="16" cy="20.5" r="1.8" fill={bg} />
      {/* Viewfinder bump */}
      <rect x="17" y="7" width="8" height="5" rx="0.5" fill={fg} />
      {/* Film sprocket holes left */}
      <rect x="3" y="11" width="3.5" height="3.5" fill={bg} opacity="0.55" />
      <rect x="3" y="26.5" width="3.5" height="3.5" fill={bg} opacity="0.55" />
      {/* Camera side detail / trigger */}
      <rect x="31" y="14" width="4" height="3.5" rx="0.5" fill={fg} />
      <rect x="31" y="23" width="4" height="3.5" rx="0.5" fill={fg} />
      {/* NFI text — bigger, bolder */}
      <text x="21" y="31" textAnchor="middle" fill={bg}
        style={{ fontSize: "7.5px", fontFamily: "Montserrat, sans-serif", fontWeight: 900, letterSpacing: "0.15em" }}>
        NFI
      </text>
    </svg>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({ name: "", email: "", password: "", program: "", gradYear: "", bio: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // stored users: array in localStorage key "focus_users"
  function getUsers() {
    try { return JSON.parse(localStorage.getItem("focus_users") || "[]"); } catch { return []; }
  }
  function saveUsers(u) { localStorage.setItem("focus_users", JSON.stringify(u)); }

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (form.email === ADMIN_CREDENTIALS.email && form.password === ADMIN_CREDENTIALS.password) {
      onLogin({ id: "admin", username: "NFI Admin", email: form.email, role: "admin", avatar: "🎬" });
      return;
    }
    const users = getUsers();
    const user = users.find(u => u.email === form.email && u.password === form.password);
    if (!user) { setError("Invalid email or password."); return; }
    if (user.status === "pending") { setError("Your account is awaiting admin approval. Hang tight!"); return; }
    if (user.status === "rejected") { setError("Your account was not approved. Contact NFI for help."); return; }
    onLogin(user);
  }

  function handleSignup(e) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.program || !form.gradYear) {
      setError("Please fill in all required fields."); return;
    }
    if (!form.email.endsWith(".edu") && !form.email.includes("nfi")) {
      // allow any email for demo
    }
    const users = getUsers();
    if (users.find(u => u.email === form.email)) { setError("An account with that email already exists."); return; }
    const newUser = {
      id: `user_${Date.now()}`,
      username: form.name,
      email: form.email,
      password: form.password,
      program: form.program,
      gradYear: form.gradYear,
      bio: form.bio,
      role: "student",
      status: "pending",
      joinedAt: Date.now(),
    };
    saveUsers([...users, newUser]);
    setPending(true);
  }

  if (pending) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#000" }}>
      <div style={{ textAlign: "center", maxWidth: 340 }} className="fade-in">
        <div style={{ margin: "0 auto 24px" }}><NFILogo size={48} /></div>
        <h2 style={{ fontFamily: G.sans, fontWeight: 800, fontSize: 22, letterSpacing: "-0.01em", marginBottom: 12 }}>You're in the queue.</h2>
        <p style={{ color: "#999", lineHeight: 1.7, fontSize: 13, fontWeight: 300 }}>Your account is pending admin approval. We'll get you set up soon — in the meantime, keep making things.</p>
        <button className="btn-ghost" style={{ marginTop: 24 }} onClick={() => { setPending(false); setMode("login"); }}>Back to Login</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column" }}>
      {/* Film strip top */}
      <div style={{ height: 24, background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, overflow: "hidden", flexShrink: 0 }}>
        {Array.from({length: 30}).map((_, i) => <div key={i} style={{ width: 12, height: 8, border: "1px solid #2a2a2a", flexShrink: 0 }} />)}
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", overflowY: "auto" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <NFILogo size={40} />
          <div>
            <div style={{ fontFamily: G.sans, fontWeight: 900, fontSize: 18, letterSpacing: "0.25em", color: "#fff" }}>FOCUS</div>
            <div style={{ fontFamily: G.sans, fontWeight: 300, fontSize: 8, letterSpacing: "0.3em", color: "#999", textTransform: "uppercase" }}>Nashville Film Institute</div>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: G.sans, fontWeight: 800, fontSize: 28, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 10 }}>
            YOUR WORK.<br />
            <span style={{ fontWeight: 100, fontStyle: "italic", color: "#999" }}>your crew.</span><br />
            YOUR SCHOOL.
          </div>
          <p style={{ color: "#888", fontSize: 12, lineHeight: 1.7, fontWeight: 300, letterSpacing: "0.03em", maxWidth: 280, margin: "0 auto" }}>
            The private network for Nashville Film Institute students.
          </p>
        </div>

        {/* Form card */}
        <div style={{ width: "100%", maxWidth: 380, background: "#0d0d0d", border: "1px solid #222" }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", borderBottom: "1px solid #222" }}>
            {["login", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{ flex: 1, padding: "14px 0", fontWeight: 700, fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer",
                  background: mode === m ? "#fff" : "transparent",
                  color: mode === m ? "#000" : "#555",
                  border: "none", transition: "all 0.2s", fontFamily: G.sans }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <div style={{ padding: "24px 20px" }}>
            {error && <div style={{ background: "rgba(255,51,51,0.08)", border: "1px solid rgba(255,51,51,0.25)", padding: "10px 14px", fontSize: 12, color: "#ff5555", marginBottom: 16, letterSpacing: "0.02em" }}>{error}</div>}

            {mode === "login" ? (
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 9, color: "#999", display: "block", marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Email</label>
                  <input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "#999", display: "block", marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Password</label>
                  <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
                <button type="submit" className="btn-gold" style={{ marginTop: 8, width: "100%", padding: "14px 0" }}>Enter FOCUS</button>
              </form>
            ) : (
              <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Full Name", key: "name", type: "text", placeholder: "Your name" },
                  { label: "Email", key: "email", type: "email", placeholder: "you@email.com" },
                  { label: "Password", key: "password", type: "password", placeholder: "••••••••" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 9, color: "#999", display: "block", marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>{f.label} *</label>
                    <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 9, color: "#999", display: "block", marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Program *</label>
                  <select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} required>
                    <option value="">Select program...</option>
                    {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "#999", display: "block", marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Graduation Year *</label>
                  <select value={form.gradYear} onChange={e => setForm({ ...form, gradYear: e.target.value })} required>
                    <option value="">Select year...</option>
                    {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 9, color: "#999", display: "block", marginBottom: 6, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>Bio (optional)</label>
                  <textarea placeholder="Tell NFI who you are..." rows={2} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ resize: "none" }} />
                </div>
                <button type="submit" className="btn-gold" style={{ marginTop: 4, width: "100%", padding: "14px 0" }}>Request Access</button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Film strip bottom */}
      <div style={{ height: 24, background: "#0d0d0d", borderTop: "1px solid #1a1a1a", display: "flex", alignItems: "center", gap: 8, paddingLeft: 12, overflow: "hidden", flexShrink: 0 }}>
        {Array.from({length: 30}).map((_, i) => <div key={i} style={{ width: 12, height: 8, border: "1px solid #2a2a2a", flexShrink: 0 }} />)}
      </div>
    </div>
  );
}

// ── POST CARD ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onLike, onComment, onFeature, onDelete }) {
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const liked = post.likes.includes(currentUser.id);

  function submitComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    onComment(post.id, comment.trim());
    setComment("");
  }

  const tagColors = { "Project Showcase": "tag-gold", "Crew Finder": "tag-blue", "Poll": "tag-green" };

  return (
    <div className={`post-card ${post.featured ? "featured" : ""}`} style={{ marginBottom: 16 }}>
      {post.featured && (
        <div style={{ background: "#111", borderBottom: `1px solid #222`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#fff", fontSize: 11 }}>★</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: "0.15em", textTransform: "uppercase" }}>Featured by NFI</span>
        </div>
      )}
      <div style={{ padding: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div className="avatar">{post.userId === "system" ? "◉" : initials(post.username)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{post.username}</span>
              {post.gradYear && parseInt(post.gradYear) <= new Date().getFullYear() && (
                <span className="tag tag-gold" style={{ fontSize: 10 }}>🎓 Grad</span>
              )}
              <span style={{ fontSize: 12, color: G.muted, marginLeft: "auto" }}>{timeAgo(post.timestamp)}</span>
            </div>
            {post.program && <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{post.program}</div>}
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {post.tags.map(t => <span key={t} className={`tag ${tagColors[t] || "tag-gold"}`}>{t}</span>)}
          </div>
        )}

        {/* Content */}
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#e0e0e8", marginBottom: 12, whiteSpace: "pre-wrap" }}>{post.content}</p>

        {/* Media placeholder */}
        {post.mediaType === "image" && (
          <div style={{ background: G.bg, borderRadius: 8, height: 200, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, border: `1px solid ${G.border}` }}>
            <span style={{ color: G.muted, fontSize: 13 }}>📷 Image attached</span>
          </div>
        )}
        {post.mediaType === "video" && (
          <div style={{ background: G.bg, borderRadius: 8, height: 200, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, border: `1px solid ${G.border}` }}>
            <span style={{ color: G.muted, fontSize: 13 }}>🎬 Video (≤30s) attached</span>
          </div>
        )}

        {/* Poll */}
        {post.poll && (
          <div style={{ background: G.bg, borderRadius: 8, padding: 14, marginBottom: 12, border: `1px solid ${G.border}` }}>
            {post.poll.map((opt, i) => {
              const total = post.pollVotes ? Object.values(post.pollVotes).length : 0;
              const votes = post.pollVotes ? Object.values(post.pollVotes).filter(v => v === i).length : 0;
              const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
              return (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span>{opt}</span><span style={{ color: G.muted }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: G.border, borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: G.accent, borderRadius: 2, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingTop: 8, borderTop: `1px solid ${G.border}` }}>
          <button onClick={() => onLike(post.id)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6,
              background: liked ? "rgba(232,200,64,0.1)" : "transparent",
              border: `1px solid ${liked ? G.accentDim : "transparent"}`,
              color: liked ? G.accent : G.muted, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}>
            ♥ {post.likes.length}
          </button>
          <button onClick={() => setShowComments(!showComments)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6,
              background: "transparent", border: "1px solid transparent",
              color: G.muted, fontSize: 13, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = G.text}
            onMouseLeave={e => e.currentTarget.style.color = G.muted}>
            ◇ {post.comments.length}
          </button>
          <div style={{ flex: 1 }} />
          {currentUser.role === "admin" && (
            <>
              <button onClick={() => onFeature(post.id)}
                style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                  background: post.featured ? "rgba(232,200,64,0.15)" : "transparent",
                  border: `1px solid ${post.featured ? G.accentDim : G.border}`,
                  color: post.featured ? G.accent : G.muted, transition: "all 0.15s" }}>
                {post.featured ? "★ Featured" : "☆ Feature"}
              </button>
              <button onClick={() => onDelete(post.id)}
                style={{ padding: "5px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer",
                  background: "transparent", border: `1px solid ${G.border}`,
                  color: G.muted, transition: "all 0.15s", marginLeft: 4 }}
                onMouseEnter={e => { e.currentTarget.style.color = G.red; e.currentTarget.style.borderColor = G.red; }}
                onMouseLeave={e => { e.currentTarget.style.color = G.muted; e.currentTarget.style.borderColor = G.border; }}>
                ✕ Remove
              </button>
            </>
          )}
        </div>

        {/* Comments */}
        {showComments && (
          <div style={{ marginTop: 12 }}>
            {post.comments.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{initials(c.username)}</div>
                <div style={{ background: G.bg, borderRadius: 8, padding: "8px 12px", flex: 1, border: `1px solid ${G.border}` }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: G.accent }}>{c.username}</span>
                  <span style={{ fontSize: 12, color: G.muted, marginLeft: 8 }}>{timeAgo(c.timestamp)}</span>
                  <p style={{ fontSize: 13, color: "#d0d0e0", marginTop: 4 }}>{c.text}</p>
                </div>
              </div>
            ))}
            <form onSubmit={submitComment} style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..." style={{ flex: 1, padding: "8px 12px", fontSize: 13 }} />
              <button type="submit" className="btn-gold" style={{ padding: "8px 16px", fontSize: 13 }}>Post</button>
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
  const [mediaType, setMediaType] = useState(null);
  const [postType, setPostType] = useState("normal"); // normal | poll
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const availableTags = ["Project Showcase", "Crew Finder"];

  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function submit() {
    if (!content.trim()) return;
    const newPost = {
      id: Date.now(),
      userId: currentUser.id,
      username: currentUser.username,
      program: currentUser.program || null,
      gradYear: currentUser.gradYear || null,
      content,
      tags: postType === "poll" ? [...tags, "Poll"] : tags,
      mediaType,
      poll: postType === "poll" ? pollOptions.filter(o => o.trim()) : null,
      pollVotes: {},
      likes: [],
      comments: [],
      featured: false,
      timestamp: Date.now(),
    };
    onPost(newPost);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal slide-up">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontFamily: G.font, fontSize: 22 }}>New Post</h3>
          <button onClick={onClose} style={{ background: "transparent", color: G.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Post type toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["normal", "poll"].map(t => (
            <button key={t} onClick={() => setPostType(t)}
              style={{ padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                background: postType === t ? "rgba(232,200,64,0.1)" : "transparent",
                border: `1px solid ${postType === t ? G.accent : G.border}`,
                color: postType === t ? G.accent : G.muted, transition: "all 0.15s" }}>
              {t === "normal" ? "📝 Post" : "🗳️ Poll"}
            </button>
          ))}
        </div>

        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder={postType === "poll" ? "Ask your crew something..." : "What are you working on?"}
          rows={4} style={{ resize: "none", marginBottom: 14, fontSize: 14 }} />

        {/* Poll options */}
        {postType === "poll" && (
          <div style={{ marginBottom: 14 }}>
            {pollOptions.map((opt, i) => (
              <input key={i} value={opt} onChange={e => { const p = [...pollOptions]; p[i] = e.target.value; setPollOptions(p); }}
                placeholder={`Option ${i + 1}`} style={{ marginBottom: 8 }} />
            ))}
            {pollOptions.length < 4 && (
              <button className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}
                onClick={() => setPollOptions([...pollOptions, ""])}>+ Add option</button>
            )}
          </div>
        )}

        {/* Tags */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: G.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tags</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {availableTags.map(t => (
              <button key={t} onClick={() => toggleTag(t)}
                style={{ padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  background: tags.includes(t) ? "rgba(232,200,64,0.1)" : "transparent",
                  border: `1px solid ${tags.includes(t) ? G.accent : G.border}`,
                  color: tags.includes(t) ? G.accent : G.muted, transition: "all 0.15s" }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Media type */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: G.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Attach media</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["image", "📷 Photo"], ["video", "🎬 Video (≤30s)"]].map(([type, label]) => (
              <button key={type} onClick={() => setMediaType(mediaType === type ? null : type)}
                style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                  background: mediaType === type ? "rgba(232,200,64,0.1)" : "transparent",
                  border: `1px solid ${mediaType === type ? G.accent : G.border}`,
                  color: mediaType === type ? G.accent : G.muted, transition: "all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-gold" onClick={submit} disabled={!content.trim()} style={{ opacity: content.trim() ? 1 : 0.5 }}>Publish</button>
        </div>
      </div>
    </div>
  );
}

// ── FEED TAB ──────────────────────────────────────────────────────────────────
function FeedTab({ posts, currentUser, onLike, onComment, onFeature, onDelete, onNewPost }) {
  const [showCompose, setShowCompose] = useState(false);
  const [filter, setFilter] = useState("all");

  const filters = ["all", "Project Showcase", "Crew Finder", "Poll"];
  const filtered = filter === "all" ? posts : posts.filter(p => p.tags.includes(filter));

  return (
    <div>
      {/* Compose prompt */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="avatar">{initials(currentUser.username)}</div>
          <button onClick={() => setShowCompose(true)}
            style={{ flex: 1, textAlign: "left", padding: "10px 16px", borderRadius: 8,
              background: G.bg, border: `1px solid ${G.border}`, color: G.muted,
              fontSize: 14, cursor: "pointer", transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = G.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>
            What are you working on, {currentUser.username.split(" ")[0]}?
          </button>
          <button className="btn-gold" onClick={() => setShowCompose(true)} style={{ whiteSpace: "nowrap" }}>+ Post</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer",
              whiteSpace: "nowrap",
              background: filter === f ? G.accent : "transparent",
              border: `1px solid ${filter === f ? G.accent : G.border}`,
              color: filter === f ? "#0a0a0f" : G.muted, transition: "all 0.15s" }}>
            {f === "all" ? "All Posts" : f}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: G.muted }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
          <p>No posts yet. Be the first to share something.</p>
        </div>
      ) : (
        filtered.map(p => (
          <PostCard key={p.id} post={p} currentUser={currentUser}
            onLike={onLike} onComment={onComment} onFeature={onFeature} onDelete={onDelete} />
        ))
      )}

      {showCompose && <ComposePost currentUser={currentUser} onPost={onNewPost} onClose={() => setShowCompose(false)} />}
    </div>
  );
}

// ── EVENTS TAB ────────────────────────────────────────────────────────────────
function EventsTab({ events, currentUser, onCheckIn, onAddEvent }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "", description: "" });

  function submitEvent(e) {
    e.preventDefault();
    onAddEvent({ ...form, id: Date.now(), checkedIn: [] });
    setShowAdd(false);
    setForm({ title: "", date: "", time: "", location: "", description: "" });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: G.font, fontSize: 24 }}>Upcoming at NFI</h2>
        {currentUser.role === "admin" && (
          <button className="btn-gold" onClick={() => setShowAdd(true)}>+ Add Event</button>
        )}
      </div>

      {events.map(ev => {
        const checked = ev.checkedIn.includes(currentUser.id);
        const dateObj = new Date(ev.date + "T12:00:00");
        const isPast = dateObj < new Date();
        return (
          <div key={ev.id} className="card" style={{ marginBottom: 14, padding: 20, opacity: isPast ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ textAlign: "center", background: G.bg, border: `1px solid ${G.border}`, borderRadius: 10, padding: "10px 14px", minWidth: 56 }}>
                <div style={{ fontSize: 11, color: G.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {dateObj.toLocaleString("default", { month: "short" })}
                </div>
                <div style={{ fontSize: 24, fontFamily: G.mono, fontWeight: 700, lineHeight: 1.1 }}>
                  {dateObj.getDate()}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>{ev.title}</h3>
                  {isPast ? <span className="tag tag-red">Past</span> : <span className="tag tag-green">Upcoming</span>}
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: G.muted }}>🕐 {ev.time}</span>
                  <span style={{ fontSize: 13, color: G.muted }}>📍 {ev.location}</span>
                  <span style={{ fontSize: 13, color: G.muted }}>✓ {ev.checkedIn.length} checked in</span>
                </div>
                {ev.description && <p style={{ fontSize: 13, color: "#c0c0d0", marginTop: 8, lineHeight: 1.5 }}>{ev.description}</p>}
                {!isPast && (
                  <button onClick={() => onCheckIn(ev.id)} style={{ marginTop: 12, padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                    background: checked ? "rgba(64,232,128,0.1)" : "transparent",
                    border: `1px solid ${checked ? G.green : G.border}`,
                    color: checked ? G.green : G.muted }}>
                    {checked ? "✓ Checked In" : "Check In"}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal slide-up">
            <h3 style={{ fontFamily: G.font, fontSize: 22, marginBottom: 20 }}>Add Event</h3>
            <form onSubmit={submitEvent} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="Event title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <div style={{ display: "flex", gap: 12 }}>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={{ flex: 1 }} />
                <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={{ flex: 1 }} />
              </div>
              <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <textarea placeholder="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: "none" }} />
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn-gold">Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CREW FINDER TAB ───────────────────────────────────────────────────────────
function CrewTab({ users, currentUser }) {
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");

  const students = users.filter(u => u.role !== "admin" && u.status === "approved");
  const filtered = students.filter(u => {
    const matchSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) || (u.bio || "").toLowerCase().includes(search.toLowerCase()) || (u.program || "").toLowerCase().includes(search.toLowerCase());
    const matchProgram = filterProgram === "all" || u.program === filterProgram;
    return matchSearch && matchProgram;
  });

  return (
    <div>
      <h2 style={{ fontFamily: G.font, fontSize: 24, marginBottom: 6 }}>Find Your Crew</h2>
      <p style={{ color: G.muted, fontSize: 14, marginBottom: 20 }}>Connect with NFI students across all programs.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, program, or bio..." style={{ flex: 1, minWidth: 200 }} />
        <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ width: "auto" }}>
          <option value="all">All Programs</option>
          {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {filtered.map(u => (
          <div key={u.id} className="card" style={{ padding: 16, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#3a3a4a"}
            onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{initials(u.username)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{u.username}</div>
                {u.program && <div style={{ fontSize: 12, color: G.accent }}>{u.program}</div>}
                {u.gradYear && (
                  <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>
                    {parseInt(u.gradYear) <= new Date().getFullYear() ? <span className="tag tag-gold" style={{ fontSize: 10 }}>🎓 Grad</span> : `Class of ${u.gradYear}`}
                  </div>
                )}
              </div>
            </div>
            {u.bio && <p style={{ fontSize: 12, color: G.muted, marginTop: 10, lineHeight: 1.5, borderTop: `1px solid ${G.border}`, paddingTop: 10 }}>{u.bio}</p>}
          </div>
        ))}
        {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0", color: G.muted }}>No students found.</div>}
      </div>
    </div>
  );
}

// ── ADMIN TAB ─────────────────────────────────────────────────────────────────
function AdminTab({ users, setUsers }) {
  const pending = users.filter(u => u.status === "pending");
  const approved = users.filter(u => u.status === "approved" && u.role !== "admin");

  function approve(id) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "approved" } : u));
  }
  function reject(id) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "rejected" } : u));
  }
  function removeAccess(id) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "graduated" } : u));
  }

  return (
    <div>
      <h2 style={{ fontFamily: G.font, fontSize: 24, marginBottom: 20 }}>Admin Panel</h2>

      {pending.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Pending Approvals</h3>
            <span style={{ background: G.accent, color: "#0a0a0f", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{pending.length}</span>
          </div>
          {pending.map(u => (
            <div key={u.id} className="card" style={{ padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div className="avatar">{initials(u.username)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{u.username}</div>
                <div style={{ fontSize: 12, color: G.muted }}>{u.email} · {u.program} · Class of {u.gradYear}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => approve(u.id)} style={{ padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "rgba(64,232,128,0.1)", border: `1px solid ${G.green}`, color: G.green }}>Approve</button>
                <button onClick={() => reject(u.id)} style={{ padding: "7px 14px", borderRadius: 7, fontSize: 13, cursor: "pointer", background: "rgba(232,64,64,0.1)", border: `1px solid ${G.red}`, color: G.red }}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Active Students ({approved.length})</h3>
        {approved.map(u => (
          <div key={u.id} className="card" style={{ padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div className="avatar">{initials(u.username)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</div>
              <div style={{ fontSize: 12, color: G.muted }}>{u.program} · Class of {u.gradYear}</div>
            </div>
            <button onClick={() => removeAccess(u.id)}
              style={{ padding: "6px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", background: "transparent", border: `1px solid ${G.border}`, color: G.muted, transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = G.red; e.currentTarget.style.borderColor = G.red; }}
              onMouseLeave={e => { e.currentTarget.style.color = G.muted; e.currentTarget.style.borderColor = G.border; }}>
              Remove Access
            </button>
          </div>
        ))}
        {approved.length === 0 && <p style={{ color: G.muted, fontSize: 14 }}>No active students yet.</p>}
      </div>
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────
function ProfileTab({ currentUser, posts }) {
  const myPosts = posts.filter(p => p.userId === currentUser.id);
  return (
    <div>
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
          <div className="avatar" style={{ width: 60, height: 60, fontSize: 22 }}>{initials(currentUser.username)}</div>
          <div>
            <h2 style={{ fontFamily: G.font, fontSize: 26 }}>{currentUser.username}</h2>
            {currentUser.program && <div style={{ color: G.accent, fontSize: 14, marginTop: 2 }}>{currentUser.program}</div>}
            {currentUser.gradYear && (
              <div style={{ fontSize: 13, color: G.muted, marginTop: 2 }}>
                {parseInt(currentUser.gradYear) <= new Date().getFullYear()
                  ? <span className="tag tag-gold">🎓 Graduate</span>
                  : `Class of ${currentUser.gradYear}`}
              </div>
            )}
          </div>
        </div>
        {currentUser.bio && <p style={{ fontSize: 14, color: "#c0c0d0", lineHeight: 1.6 }}>{currentUser.bio}</p>}
        <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${G.border}` }}>
          <div><div style={{ fontFamily: G.mono, fontSize: 22, fontWeight: 700, color: G.accent }}>{myPosts.length}</div><div style={{ fontSize: 12, color: G.muted }}>Posts</div></div>
          <div><div style={{ fontFamily: G.mono, fontSize: 22, fontWeight: 700, color: G.accent }}>{myPosts.reduce((a, p) => a + p.likes.length, 0)}</div><div style={{ fontSize: 12, color: G.muted }}>Likes</div></div>
        </div>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>My Posts</h3>
      {myPosts.length === 0 ? <p style={{ color: G.muted }}>You haven't posted yet.</p> : myPosts.map(p => (
        <div key={p.id} className="card" style={{ padding: 14, marginBottom: 10 }}>
          <p style={{ fontSize: 14, color: "#e0e0e8", lineHeight: 1.6 }}>{p.content}</p>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 8 }}>♥ {p.likes.length} · ◇ {p.comments.length} · {timeAgo(p.timestamp)}</div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function FocusNFI() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState(SEED_POSTS);
  const [events, setEvents] = useState(SEED_EVENTS);
  const [users, setUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("focus_users") || "[]"); } catch { return []; }
  });

  // Keep localStorage in sync with users state
  useEffect(() => {
    localStorage.setItem("focus_users", JSON.stringify(users));
  }, [users]);

  function handleLogin(user) { setCurrentUser(user); }
  function handleLogout() { setCurrentUser(null); setTab("feed"); }

  function handleLike(postId) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(currentUser.id);
      return { ...p, likes: liked ? p.likes.filter(id => id !== currentUser.id) : [...p.likes, currentUser.id] };
    }));
  }

  function handleComment(postId, text) {
    setPosts(prev => prev.map(p => p.id !== postId ? p : {
      ...p, comments: [...p.comments, { username: currentUser.username, text, timestamp: Date.now() }]
    }));
  }

  function handleFeature(postId) {
    setPosts(prev => prev.map(p => p.id !== postId ? p : { ...p, featured: !p.featured }));
  }

  function handleDelete(postId) {
    setPosts(prev => prev.filter(p => p.id !== postId));
  }

  function handleNewPost(post) {
    setPosts(prev => [post, ...prev]);
  }

  function handleCheckIn(eventId) {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      const checked = ev.checkedIn.includes(currentUser.id);
      return { ...ev, checkedIn: checked ? ev.checkedIn.filter(id => id !== currentUser.id) : [...ev.checkedIn, currentUser.id] };
    }));
  }

  function handleAddEvent(ev) {
    setEvents(prev => [...prev, ev]);
  }

  if (!currentUser) return (
    <>
      <style>{css}</style>
      <div className="grain" />
      <AuthScreen onLogin={handleLogin} />
    </>
  );

  const sprocketCount = 40;

  const pendingCount = users.filter(u => u.status === "pending").length;

  const navItems = [
    { id: "feed", icon: "⬛", label: "Feed" },
    { id: "events", icon: "◈", label: "Events" },
    { id: "crew", icon: "⬡", label: "Crew Finder" },
    { id: "profile", icon: "◉", label: "Profile" },
    ...(currentUser.role === "admin" ? [{ id: "admin", icon: "⚙", label: "Admin", badge: pendingCount }] : []),
  ];

  return (
    <>
      <style>{css}</style>
      <div className="grain" />
      {/* Film sprocket strip */}
      <div className="sprocket-strip">
        {Array.from({length: sprocketCount}).map((_, i) => <div key={i} className="sprocket" />)}
      </div>
      <div style={{ display: "flex", minHeight: "100vh", paddingLeft: 18 }}>

        {/* Sidebar */}
        <div className="sidebar" style={{ width: 220, background: "#0a0a0a", borderRight: `1px solid #1a1a1a`, padding: "24px 0", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", marginBottom: 32 }}>
            <NFILogo size={32} />
            <div>
              <div style={{ fontFamily: G.sans, fontWeight: 900, fontSize: 13, letterSpacing: "0.25em", color: "#fff" }}>FOCUS</div>
              <div style={{ fontFamily: G.sans, fontWeight: 300, fontSize: 8, letterSpacing: "0.2em", color: "#999", textTransform: "uppercase" }}>NFI</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "0 0" }}>
            {navItems.map(item => (
              <div key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`}
                onClick={() => setTab(item.id)} style={{ position: "relative", marginBottom: 2 }}>
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge > 0 && <span style={{ marginLeft: "auto", background: "#fff", color: "#000", fontSize: 10, fontWeight: 800, padding: "2px 7px", letterSpacing: "0.05em" }}>{item.badge}</span>}
              </div>
            ))}
          </nav>

          {/* User */}
          <div style={{ borderTop: `1px solid #1a1a1a`, paddingTop: 16, margin: "16px 0 0 0", padding: "16px 14px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", background: "#111", border: "1px solid #222" }}>
              <div className="avatar" style={{ width: 30, height: 30, fontSize: 10 }}>{initials(currentUser.username)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.username}</div>
                {currentUser.role === "admin" && <div style={{ fontSize: 9, color: "#fff", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>Admin</div>}
              </div>
              <button onClick={handleLogout} title="Sign out"
                style={{ background: "transparent", color: "#999", fontSize: 14, cursor: "pointer", padding: 4, transition: "color 0.15s", fontFamily: G.sans }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#555"}>⇥</button>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "32px 24px", maxWidth: 720, margin: "0 auto" }} className="main-content">
          <div className="fade-in" key={tab}>
            {tab === "feed" && <FeedTab posts={posts} currentUser={currentUser} onLike={handleLike} onComment={handleComment} onFeature={handleFeature} onDelete={handleDelete} onNewPost={handleNewPost} />}
            {tab === "events" && <EventsTab events={events} currentUser={currentUser} onCheckIn={handleCheckIn} onAddEvent={handleAddEvent} />}
            {tab === "crew" && <CrewTab users={users} currentUser={currentUser} />}
            {tab === "profile" && <ProfileTab currentUser={currentUser} posts={posts} />}
            {tab === "admin" && currentUser.role === "admin" && <AdminTab users={users} setUsers={u => { setUsers(u); localStorage.setItem("focus_users", JSON.stringify(u)); }} />}
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0a0a0a", borderTop: "1px solid #1a1a1a", padding: "8px 0", zIndex: 100, justifyContent: "space-around" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 16px", cursor: "pointer",
                background: "transparent", color: tab === item.id ? "#fff" : "#555", position: "relative", fontFamily: G.sans, border: "none" }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: tab === item.id ? 700 : 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.label}</span>
              {item.badge > 0 && <div className="notification-dot" />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

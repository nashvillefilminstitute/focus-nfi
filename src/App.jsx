import { useState, useEffect, useRef } from “react”;

// ── Minimal in-memory “database” ──────────────────────────────────────────────
const ADMIN_CREDENTIALS = { email: “admin@nfi.edu”, password: “admin123” };

const SEED_EVENTS = [
{ id: 1, title: “Short Film Showcase”, date: “2026-06-14”, time: “7:00 PM”, location: “Studio A”, description: “Student short films screened for faculty and peers.”, checkedIn: [] },
{ id: 2, title: “Cinematography Workshop”, date: “2026-06-20”, time: “2:00 PM”, location: “Lab 3”, description: “Hands-on lighting and camera movement techniques.”, checkedIn: [] },
{ id: 3, title: “Industry Guest: Casting Director”, date: “2026-06-27”, time: “5:00 PM”, location: “Main Theater”, description: “Q&A with a Nashville-based casting director.”, checkedIn: [] },
];

const SEED_POSTS = [
{ id: 1, userId: “system”, username: “NFI Admin”, avatar: “🎬”, content: “Welcome to FOCUS — the official student network of Nashville Film Institute. Post your work. Find your crew. Make something unforgettable.”, type: “text”, tags: [], likes: [], comments: [], featured: true, timestamp: Date.now() - 86400000 * 2 },
];

const PROGRAMS = [“Film Production”, “Screenwriting”, “Cinematography”, “Post-Production / Editing”, “Acting for Film”, “Music for Film”];

const GRAD_YEARS = [“2025”, “2026”, “2027”, “2028”];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ts) {
const s = Math.floor((Date.now() - ts) / 1000);
if (s < 60) return `${s}s ago`;
if (s < 3600) return `${Math.floor(s / 60)}m ago`;
if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
return `${Math.floor(s / 86400)}d ago`;
}

function initials(name) {
return name.split(” “).map(n => n[0]).join(””).toUpperCase().slice(0, 2);
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const G = {
bg: “#0a0a0f”,
surface: “#13131a”,
surfaceHover: “#1a1a24”,
border: “#2a2a3a”,
accent: “#e8c840”,        // film-gold
accentDim: “#9c8620”,
red: “#e84040”,
green: “#40e880”,
text: “#f0f0f0”,
muted: “#8888aa”,
font: “‘DM Serif Display’, serif”,
mono: “‘DM Mono’, monospace”,
sans: “‘DM Sans’, sans-serif”,
};

const css = `
@import url(‘https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap’);

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
background: ${G.bg};
color: ${G.text};
font-family: ${G.sans};
min-height: 100vh;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: ${G.bg}; }
::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 2px; }

.grain {
position: fixed; inset: 0; pointer-events: none; z-index: 9999; opacity: 0.03;
background-image: url(“data:image/svg+xml,%3Csvg viewBox=‘0 0 256 256’ xmlns=‘http://www.w3.org/2000/svg’%3E%3Cfilter id=‘noise’%3E%3CfeTurbulence type=‘fractalNoise’ baseFrequency=‘0.9’ numOctaves=‘4’ stitchTiles=‘stitch’/%3E%3C/filter%3E%3Crect width=‘100%25’ height=‘100%25’ filter=‘url(%23noise)’/%3E%3C/svg%3E”);
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
font-size: 14px;
border-radius: 8px;
padding: 10px 14px;
width: 100%;
outline: none;
transition: border-color 0.2s;
}
input:focus, textarea:focus, select:focus { border-color: ${G.accent}; }
input::placeholder, textarea::placeholder { color: ${G.muted}; }

button { cursor: pointer; font-family: ${G.sans}; border: none; outline: none; }

.btn-gold {
background: ${G.accent};
color: #0a0a0f;
font-weight: 600;
font-size: 14px;
padding: 10px 20px;
border-radius: 8px;
transition: all 0.2s;
letter-spacing: 0.02em;
}
.btn-gold:hover { background: #f5d840; transform: translateY(-1px); }
.btn-ghost {
background: transparent;
color: ${G.muted};
font-size: 13px;
padding: 8px 14px;
border-radius: 8px;
border: 1px solid ${G.border};
transition: all 0.2s;
}
.btn-ghost:hover { border-color: ${G.accent}; color: ${G.accent}; }

.tag {
display: inline-flex;
align-items: center;
gap: 4px;
font-size: 11px;
font-weight: 600;
letter-spacing: 0.08em;
text-transform: uppercase;
padding: 3px 8px;
border-radius: 4px;
border: 1px solid;
}
.tag-gold { color: ${G.accent}; border-color: ${G.accentDim}; background: rgba(232,200,64,0.08); }
.tag-green { color: ${G.green}; border-color: #20804040; background: rgba(64,232,128,0.08); }
.tag-red { color: ${G.red}; border-color: #80202040; background: rgba(232,64,64,0.08); }
.tag-blue { color: #60a0ff; border-color: #204080; background: rgba(96,160,255,0.08); }

.card {
background: ${G.surface};
border: 1px solid ${G.border};
border-radius: 12px;
overflow: hidden;
}

.divider { border: none; border-top: 1px solid ${G.border}; margin: 16px 0; }

.avatar {
width: 38px; height: 38px; border-radius: 50%;
background: linear-gradient(135deg, #2a2a3a, #3a3a4a);
display: flex; align-items: center; justify-content: center;
font-weight: 700; font-size: 14px; color: ${G.accent};
flex-shrink: 0;
border: 1px solid ${G.border};
font-family: ${G.mono};
}

.nav-item {
display: flex; align-items: center; gap: 10px;
padding: 10px 14px;
border-radius: 8px;
font-size: 14px;
font-weight: 500;
color: ${G.muted};
cursor: pointer;
transition: all 0.15s;
border: 1px solid transparent;
}
.nav-item:hover { background: ${G.surfaceHover}; color: ${G.text}; }
.nav-item.active { background: rgba(232,200,64,0.1); color: ${G.accent}; border-color: rgba(232,200,64,0.2); }

.modal-overlay {
position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
display: flex; align-items: center; justify-content: center;
z-index: 1000; padding: 20px;
}
.modal {
background: ${G.surface}; border: 1px solid ${G.border};
border-radius: 16px; padding: 28px; max-width: 480px; width: 100%;
max-height: 90vh; overflow-y: auto;
}

.post-card {
background: ${G.surface}; border: 1px solid ${G.border};
border-radius: 12px; overflow: hidden;
transition: border-color 0.2s;
}
.post-card:hover { border-color: #3a3a4a; }
.post-card.featured { border-color: ${G.accentDim}; }

.notification-dot {
width: 8px; height: 8px; border-radius: 50%;
background: ${G.accent}; position: absolute; top: 2px; right: 2px;
}

/* Mobile nav */
@media (max-width: 768px) {
.sidebar { display: none !important; }
.mobile-nav { display: flex !important; }
.main-content { padding-bottom: 80px !important; }
}
.mobile-nav { display: none; }
`;

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
const [mode, setMode] = useState(“login”); // login | signup
const [form, setForm] = useState({ name: “”, email: “”, password: “”, program: “”, gradYear: “”, bio: “” });
const [error, setError] = useState(””);
const [pending, setPending] = useState(false);

// stored users: array in localStorage key “focus_users”
function getUsers() {
try { return JSON.parse(localStorage.getItem(“focus_users”) || “[]”); } catch { return []; }
}
function saveUsers(u) { localStorage.setItem(“focus_users”, JSON.stringify(u)); }

function handleLogin(e) {
e.preventDefault();
setError(””);
if (form.email === ADMIN_CREDENTIALS.email && form.password === ADMIN_CREDENTIALS.password) {
onLogin({ id: “admin”, username: “NFI Admin”, email: form.email, role: “admin”, avatar: “🎬” });
return;
}
const users = getUsers();
const user = users.find(u => u.email === form.email && u.password === form.password);
if (!user) { setError(“Invalid email or password.”); return; }
if (user.status === “pending”) { setError(“Your account is awaiting admin approval. Hang tight!”); return; }
if (user.status === “rejected”) { setError(“Your account was not approved. Contact NFI for help.”); return; }
onLogin(user);
}

function handleSignup(e) {
e.preventDefault();
setError(””);
if (!form.name || !form.email || !form.password || !form.program || !form.gradYear) {
setError(“Please fill in all required fields.”); return;
}
if (!form.email.endsWith(”.edu”) && !form.email.includes(“nfi”)) {
// allow any email for demo
}
const users = getUsers();
if (users.find(u => u.email === form.email)) { setError(“An account with that email already exists.”); return; }
const newUser = {
id: `user_${Date.now()}`,
username: form.name,
email: form.email,
password: form.password,
program: form.program,
gradYear: form.gradYear,
bio: form.bio,
role: “student”,
status: “pending”,
joinedAt: Date.now(),
};
saveUsers([…users, newUser]);
setPending(true);
}

if (pending) return (
<div style={{ minHeight: “100vh”, display: “flex”, alignItems: “center”, justifyContent: “center”, padding: 20 }}>
<div style={{ textAlign: “center”, maxWidth: 400 }} className=“fade-in”>
<div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
<h2 style={{ fontFamily: G.font, fontSize: 28, marginBottom: 12 }}>You’re in the queue.</h2>
<p style={{ color: G.muted, lineHeight: 1.6 }}>Your account is pending admin approval. We’ll get you set up soon — in the meantime, keep making things.</p>
<button className=“btn-ghost” style={{ marginTop: 24 }} onClick={() => { setPending(false); setMode(“login”); }}>Back to Login</button>
</div>
</div>
);

return (
<div style={{ minHeight: “100vh”, display: “flex” }}>
{/* Left panel */}
<div style={{ flex: 1, background: `linear-gradient(160deg, #0f0f18 0%, #13131a 100%)`, display: “flex”, flexDirection: “column”, justifyContent: “center”, padding: “60px 80px”, position: “relative”, overflow: “hidden” }}>
<div style={{ position: “absolute”, top: -100, right: -100, width: 400, height: 400, borderRadius: “50%”, background: “radial-gradient(circle, rgba(232,200,64,0.06) 0%, transparent 70%)”, pointerEvents: “none” }} />
<div style={{ position: “absolute”, bottom: -80, left: -80, width: 300, height: 300, borderRadius: “50%”, background: “radial-gradient(circle, rgba(232,200,64,0.04) 0%, transparent 70%)”, pointerEvents: “none” }} />

```
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 60 }}>
      <div style={{ width: 36, height: 36, background: G.accent, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#0a0a0f", fontSize: 18 }}>◉</span>
      </div>
      <span style={{ fontFamily: G.mono, fontWeight: 700, fontSize: 18, letterSpacing: "0.15em", color: G.text }}>FOCUS</span>
      <span style={{ fontFamily: G.mono, fontSize: 12, color: G.muted, letterSpacing: "0.1em" }}>/ NFI</span>
    </div>

    <h1 style={{ fontFamily: G.font, fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.1, marginBottom: 24 }}>
      Your work.<br />
      <em style={{ color: G.accent }}>Your crew.</em><br />
      Your school.
    </h1>
    <p style={{ color: G.muted, fontSize: 16, lineHeight: 1.7, maxWidth: 380 }}>
      The private network for Nashville Film Institute students. Share your projects, find collaborators, and never miss a moment on campus.
    </p>

    <div style={{ marginTop: 48, display: "flex", gap: 32 }}>
      {[["◉", "Post work"], ["⬡", "Find crew"], ["◈", "Campus events"]].map(([icon, label]) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: G.accent, fontSize: 16 }}>{icon}</span>
          <span style={{ color: G.muted, fontSize: 13 }}>{label}</span>
        </div>
      ))}
    </div>
  </div>

  {/* Right panel */}
  <div style={{ width: 440, background: G.surface, borderLeft: `1px solid ${G.border}`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 48px", overflowY: "auto" }}>
    <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
      {["login", "signup"].map(m => (
        <button key={m} onClick={() => { setMode(m); setError(""); }}
          style={{ flex: 1, padding: "10px 0", borderRadius: 8, fontWeight: 600, fontSize: 14,
            background: mode === m ? G.accent : "transparent",
            color: mode === m ? "#0a0a0f" : G.muted,
            border: `1px solid ${mode === m ? G.accent : G.border}`,
            transition: "all 0.2s", cursor: "pointer" }}>
          {m === "login" ? "Sign In" : "Create Account"}
        </button>
      ))}
    </div>

    {error && <div style={{ background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: G.red, marginBottom: 16 }}>{error}</div>}

    {mode === "login" ? (
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: G.muted, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Email</label>
          <input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label style={{ fontSize: 12, color: G.muted, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button type="submit" className="btn-gold" style={{ marginTop: 8, width: "100%", padding: "12px 0", fontSize: 15 }}>Enter FOCUS</button>
        <p style={{ fontSize: 12, color: G.muted, textAlign: "center" }}>Admin: admin@nfi.edu / admin123</p>
      </form>
    ) : (
      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, color: G.muted, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Full Name *</label>
          <input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label style={{ fontSize: 12, color: G.muted, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Email *</label>
          <input type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label style={{ fontSize: 12, color: G.muted, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Password *</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div>
          <label style={{ fontSize: 12, color: G.muted, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Program *</label>
          <select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })} required>
            <option value="">Select program…</option>
            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: G.muted, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Graduation Year *</label>
          <select value={form.gradYear} onChange={e => setForm({ ...form, gradYear: e.target.value })} required>
            <option value="">Select year…</option>
            {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: G.muted, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>Bio (optional)</label>
          <textarea placeholder="Tell NFI who you are…" rows={2} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ resize: "none" }} />
        </div>
        <button type="submit" className="btn-gold" style={{ marginTop: 4, width: "100%", padding: "12px 0", fontSize: 15 }}>Request Access</button>
      </form>
    )}
  </div>
</div>
```

);
}

// ── POST CARD ─────────────────────────────────────────────────────────────────
function PostCard({ post, currentUser, onLike, onComment, onFeature, onDelete }) {
const [showComments, setShowComments] = useState(false);
const [comment, setComment] = useState(””);
const liked = post.likes.includes(currentUser.id);

function submitComment(e) {
e.preventDefault();
if (!comment.trim()) return;
onComment(post.id, comment.trim());
setComment(””);
}

const tagColors = { “Project Showcase”: “tag-gold”, “Crew Finder”: “tag-blue”, “Poll”: “tag-green” };

return (
<div className={`post-card ${post.featured ? "featured" : ""}`} style={{ marginBottom: 16 }}>
{post.featured && (
<div style={{ background: “rgba(232,200,64,0.08)”, borderBottom: `1px solid ${G.border}`, padding: “8px 16px”, display: “flex”, alignItems: “center”, gap: 8 }}>
<span style={{ color: G.accent, fontSize: 12 }}>★</span>
<span style={{ fontSize: 11, fontWeight: 700, color: G.accent, letterSpacing: “0.1em”, textTransform: “uppercase” }}>Featured by NFI</span>
</div>
)}
<div style={{ padding: 16 }}>
{/* Header */}
<div style={{ display: “flex”, alignItems: “flex-start”, gap: 12, marginBottom: 12 }}>
<div className="avatar">{post.userId === “system” ? “◉” : initials(post.username)}</div>
<div style={{ flex: 1 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 8, flexWrap: “wrap” }}>
<span style={{ fontWeight: 600, fontSize: 14 }}>{post.username}</span>
{post.gradYear && parseInt(post.gradYear) <= new Date().getFullYear() && (
<span className=“tag tag-gold” style={{ fontSize: 10 }}>🎓 Grad</span>
)}
<span style={{ fontSize: 12, color: G.muted, marginLeft: “auto” }}>{timeAgo(post.timestamp)}</span>
</div>
{post.program && <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{post.program}</div>}
</div>
</div>

```
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
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment…" style={{ flex: 1, padding: "8px 12px", fontSize: 13 }} />
          <button type="submit" className="btn-gold" style={{ padding: "8px 16px", fontSize: 13 }}>Post</button>
        </form>
      </div>
    )}
  </div>
</div>
```

);
}

// ── COMPOSE POST ──────────────────────────────────────────────────────────────
function ComposePost({ currentUser, onPost, onClose }) {
const [content, setContent] = useState(””);
const [tags, setTags] = useState([]);
const [mediaType, setMediaType] = useState(null);
const [postType, setPostType] = useState(“normal”); // normal | poll
const [pollOptions, setPollOptions] = useState([””, “”]);

const availableTags = [“Project Showcase”, “Crew Finder”];

function toggleTag(t) {
setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : […prev, t]);
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
tags: postType === “poll” ? […tags, “Poll”] : tags,
mediaType,
poll: postType === “poll” ? pollOptions.filter(o => o.trim()) : null,
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
<div className=“modal-overlay” onClick={e => e.target === e.currentTarget && onClose()}>
<div className="modal slide-up">
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 20 }}>
<h3 style={{ fontFamily: G.font, fontSize: 22 }}>New Post</h3>
<button onClick={onClose} style={{ background: “transparent”, color: G.muted, fontSize: 20, cursor: “pointer” }}>✕</button>
</div>

```
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
      placeholder={postType === "poll" ? "Ask your crew something…" : "What are you working on?"}
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
```

);
}

// ── FEED TAB ──────────────────────────────────────────────────────────────────
function FeedTab({ posts, currentUser, onLike, onComment, onFeature, onDelete, onNewPost }) {
const [showCompose, setShowCompose] = useState(false);
const [filter, setFilter] = useState(“all”);

const filters = [“all”, “Project Showcase”, “Crew Finder”, “Poll”];
const filtered = filter === “all” ? posts : posts.filter(p => p.tags.includes(filter));

return (
<div>
{/* Compose prompt */}
<div className=“card” style={{ marginBottom: 20, padding: 16 }}>
<div style={{ display: “flex”, gap: 12, alignItems: “center” }}>
<div className="avatar">{initials(currentUser.username)}</div>
<button onClick={() => setShowCompose(true)}
style={{ flex: 1, textAlign: “left”, padding: “10px 16px”, borderRadius: 8,
background: G.bg, border: `1px solid ${G.border}`, color: G.muted,
fontSize: 14, cursor: “pointer”, transition: “border-color 0.2s” }}
onMouseEnter={e => e.currentTarget.style.borderColor = G.accent}
onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>
What are you working on, {currentUser.username.split(” “)[0]}?
</button>
<button className=“btn-gold” onClick={() => setShowCompose(true)} style={{ whiteSpace: “nowrap” }}>+ Post</button>
</div>
</div>

```
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
```

);
}

// ── EVENTS TAB ────────────────────────────────────────────────────────────────
function EventsTab({ events, currentUser, onCheckIn, onAddEvent }) {
const [showAdd, setShowAdd] = useState(false);
const [form, setForm] = useState({ title: “”, date: “”, time: “”, location: “”, description: “” });

function submitEvent(e) {
e.preventDefault();
onAddEvent({ …form, id: Date.now(), checkedIn: [] });
setShowAdd(false);
setForm({ title: “”, date: “”, time: “”, location: “”, description: “” });
}

return (
<div>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 20 }}>
<h2 style={{ fontFamily: G.font, fontSize: 24 }}>Upcoming at NFI</h2>
{currentUser.role === “admin” && (
<button className=“btn-gold” onClick={() => setShowAdd(true)}>+ Add Event</button>
)}
</div>

```
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
```

);
}

// ── CREW FINDER TAB ───────────────────────────────────────────────────────────
function CrewTab({ users, currentUser }) {
const [search, setSearch] = useState(””);
const [filterProgram, setFilterProgram] = useState(“all”);

const students = users.filter(u => u.role !== “admin” && u.status === “approved”);
const filtered = students.filter(u => {
const matchSearch = !search || u.username.toLowerCase().includes(search.toLowerCase()) || (u.bio || “”).toLowerCase().includes(search.toLowerCase()) || (u.program || “”).toLowerCase().includes(search.toLowerCase());
const matchProgram = filterProgram === “all” || u.program === filterProgram;
return matchSearch && matchProgram;
});

return (
<div>
<h2 style={{ fontFamily: G.font, fontSize: 24, marginBottom: 6 }}>Find Your Crew</h2>
<p style={{ color: G.muted, fontSize: 14, marginBottom: 20 }}>Connect with NFI students across all programs.</p>

```
  <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, program, or bio…" style={{ flex: 1, minWidth: 200 }} />
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
```

);
}

// ── ADMIN TAB ─────────────────────────────────────────────────────────────────
function AdminTab({ users, setUsers }) {
const pending = users.filter(u => u.status === “pending”);
const approved = users.filter(u => u.status === “approved” && u.role !== “admin”);

function approve(id) {
setUsers(prev => prev.map(u => u.id === id ? { …u, status: “approved” } : u));
}
function reject(id) {
setUsers(prev => prev.map(u => u.id === id ? { …u, status: “rejected” } : u));
}
function removeAccess(id) {
setUsers(prev => prev.map(u => u.id === id ? { …u, status: “graduated” } : u));
}

return (
<div>
<h2 style={{ fontFamily: G.font, fontSize: 24, marginBottom: 20 }}>Admin Panel</h2>

```
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
```

);
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────
function ProfileTab({ currentUser, posts }) {
const myPosts = posts.filter(p => p.userId === currentUser.id);
return (
<div>
<div className=“card” style={{ padding: 24, marginBottom: 20 }}>
<div style={{ display: “flex”, gap: 16, alignItems: “center”, marginBottom: 16 }}>
<div className=“avatar” style={{ width: 60, height: 60, fontSize: 22 }}>{initials(currentUser.username)}</div>
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
{currentUser.bio && <p style={{ fontSize: 14, color: “#c0c0d0”, lineHeight: 1.6 }}>{currentUser.bio}</p>}
<div style={{ display: “flex”, gap: 24, marginTop: 16, paddingTop: 16, borderTop: `1px solid ${G.border}` }}>
<div><div style={{ fontFamily: G.mono, fontSize: 22, fontWeight: 700, color: G.accent }}>{myPosts.length}</div><div style={{ fontSize: 12, color: G.muted }}>Posts</div></div>
<div><div style={{ fontFamily: G.mono, fontSize: 22, fontWeight: 700, color: G.accent }}>{myPosts.reduce((a, p) => a + p.likes.length, 0)}</div><div style={{ fontSize: 12, color: G.muted }}>Likes</div></div>
</div>
</div>
<h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>My Posts</h3>
{myPosts.length === 0 ? <p style={{ color: G.muted }}>You haven’t posted yet.</p> : myPosts.map(p => (
<div key={p.id} className=“card” style={{ padding: 14, marginBottom: 10 }}>
<p style={{ fontSize: 14, color: “#e0e0e8”, lineHeight: 1.6 }}>{p.content}</p>
<div style={{ fontSize: 12, color: G.muted, marginTop: 8 }}>♥ {p.likes.length} · ◇ {p.comments.length} · {timeAgo(p.timestamp)}</div>
</div>
))}
</div>
);
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function FocusNFI() {
const [currentUser, setCurrentUser] = useState(null);
const [tab, setTab] = useState(“feed”);
const [posts, setPosts] = useState(SEED_POSTS);
const [events, setEvents] = useState(SEED_EVENTS);
const [users, setUsers] = useState(() => {
try { return JSON.parse(localStorage.getItem(“focus_users”) || “[]”); } catch { return []; }
});

// Keep localStorage in sync with users state
useEffect(() => {
localStorage.setItem(“focus_users”, JSON.stringify(users));
}, [users]);

function handleLogin(user) { setCurrentUser(user); }
function handleLogout() { setCurrentUser(null); setTab(“feed”); }

function handleLike(postId) {
setPosts(prev => prev.map(p => {
if (p.id !== postId) return p;
const liked = p.likes.includes(currentUser.id);
return { …p, likes: liked ? p.likes.filter(id => id !== currentUser.id) : […p.likes, currentUser.id] };
}));
}

function handleComment(postId, text) {
setPosts(prev => prev.map(p => p.id !== postId ? p : {
…p, comments: […p.comments, { username: currentUser.username, text, timestamp: Date.now() }]
}));
}

function handleFeature(postId) {
setPosts(prev => prev.map(p => p.id !== postId ? p : { …p, featured: !p.featured }));
}

function handleDelete(postId) {
setPosts(prev => prev.filter(p => p.id !== postId));
}

function handleNewPost(post) {
setPosts(prev => [post, …prev]);
}

function handleCheckIn(eventId) {
setEvents(prev => prev.map(ev => {
if (ev.id !== eventId) return ev;
const checked = ev.checkedIn.includes(currentUser.id);
return { …ev, checkedIn: checked ? ev.checkedIn.filter(id => id !== currentUser.id) : […ev.checkedIn, currentUser.id] };
}));
}

function handleAddEvent(ev) {
setEvents(prev => […prev, ev]);
}

if (!currentUser) return (
<>
<style>{css}</style>
<div className="grain" />
<AuthScreen onLogin={handleLogin} />
</>
);

const pendingCount = users.filter(u => u.status === “pending”).length;

const navItems = [
{ id: “feed”, icon: “⬛”, label: “Feed” },
{ id: “events”, icon: “◈”, label: “Events” },
{ id: “crew”, icon: “⬡”, label: “Crew Finder” },
{ id: “profile”, icon: “◉”, label: “Profile” },
…(currentUser.role === “admin” ? [{ id: “admin”, icon: “⚙”, label: “Admin”, badge: pendingCount }] : []),
];

return (
<>
<style>{css}</style>
<div className="grain" />
<div style={{ display: “flex”, minHeight: “100vh” }}>

```
    {/* Sidebar */}
    <div className="sidebar" style={{ width: 240, background: G.surface, borderRight: `1px solid ${G.border}`, padding: "24px 16px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", marginBottom: 28 }}>
        <div style={{ width: 30, height: 30, background: G.accent, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#0a0a0f", fontSize: 16 }}>◉</span>
        </div>
        <div>
          <div style={{ fontFamily: G.mono, fontWeight: 700, fontSize: 15, letterSpacing: "0.15em" }}>FOCUS</div>
          <div style={{ fontFamily: G.mono, fontSize: 10, color: G.muted, letterSpacing: "0.1em" }}>NFI</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <div key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`}
            onClick={() => setTab(item.id)} style={{ position: "relative", marginBottom: 4 }}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge > 0 && <span style={{ marginLeft: "auto", background: G.accent, color: "#0a0a0f", fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 10 }}>{item.badge}</span>}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 16, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: G.bg }}>
          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials(currentUser.username)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.username}</div>
            {currentUser.role === "admin" && <div style={{ fontSize: 11, color: G.accent }}>Admin</div>}
          </div>
          <button onClick={handleLogout} title="Sign out"
            style={{ background: "transparent", color: G.muted, fontSize: 16, cursor: "pointer", padding: 4, borderRadius: 4, transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = G.text}
            onMouseLeave={e => e.currentTarget.style.color = G.muted}>⇥</button>
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
    <div className="mobile-nav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: G.surface, borderTop: `1px solid ${G.border}`, padding: "8px 0", zIndex: 100, justifyContent: "space-around" }}>
      {navItems.map(item => (
        <button key={item.id} onClick={() => setTab(item.id)}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 16px", borderRadius: 8, cursor: "pointer",
            background: "transparent", color: tab === item.id ? G.accent : G.muted, position: "relative" }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span style={{ fontSize: 10, fontWeight: tab === item.id ? 600 : 400 }}>{item.label}</span>
          {item.badge > 0 && <div className="notification-dot" />}
        </button>
      ))}
    </div>
  </div>
</>
```

);
}

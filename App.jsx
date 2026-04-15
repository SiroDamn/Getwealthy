import { useState, useEffect, useRef } from "react";

// ============================================================
// ANTHROPIC API KONFIGURATION
// ⚠️  SICHERHEITSWARNUNG: Der API-Key sollte in Produktion
//     NIEMALS im Frontend-Code stehen! Nutze stattdessen
//     eine Serverless Function (z.B. Vercel API Routes).
// ============================================================
const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const API_KEY = "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";

// ============================================================
// GOOGLE ADSENSE KONFIGURATION
// Sobald dein AdSense-Konto genehmigt ist:
//   1. Ersetze ADSENSE_PUBLISHER_ID mit deiner Publisher-ID
//      (Format: ca-pub-1234567890123456)
//   2. Erstelle Ad Units und trage die Slot-IDs unten ein
//   3. Setze ADSENSE_ENABLED = true
//   4. Aktiviere den Script-Tag in index.html (Kommentar entfernen)
// ============================================================
const ADSENSE_PUBLISHER_ID   = "ca-pub-XXXXXXXXXXXXXXXX";
const ADSENSE_SLOT_SIDEBAR   = "0000000001";
const ADSENSE_SLOT_IN_ARTICLE = "0000000002";
const ADSENSE_ENABLED        = false;

const TOPICS = [
  { label: "Investing", emoji: "📈", prompt: "Write an expert blog article about smart investing strategies for 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Crypto", emoji: "₿", prompt: "Write an expert blog article about cryptocurrency trends in 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Budgeting", emoji: "💰", prompt: "Write an expert blog article about budgeting and saving money in 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Real Estate", emoji: "🏠", prompt: "Write an expert blog article about real estate investment in 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Stocks", emoji: "📊", prompt: "Write an expert blog article about stock market strategies for 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
  { label: "Side Income", emoji: "💸", prompt: "Write an expert blog article about building passive and side income in 2026. First line = compelling headline (no # symbol). Then use ## for section headings. At least 5 sections, 2-3 paragraphs each, 700+ words total." },
];

const FEATURED = [
  { tag: "Investing", title: "How to Build a \$10K Portfolio From Scratch in 2026", desc: "Step-by-step breakdown for beginners entering the market.", time: "5 min read", bg: "#F0FDF4", tagColor: "#16A34A" },
  { tag: "Crypto", title: "Bitcoin in 2026: What Every Smart Investor Must Know", desc: "The landscape has shifted — here's how to position yourself.", time: "4 min read", bg: "#FFF7ED", tagColor: "#EA580C" },
  { tag: "Budgeting", title: "The 50/30/20 Rule Is Dead — Here's What Works Now", desc: "Modern budgeting for inflation-hit households.", time: "3 min read", bg: "#EFF6FF", tagColor: "#2563EB" },
];

function AdUnit({ slot, format = "auto", style = {} }) {
  const adRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ENABLED) return;
    if (initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense error:", e);
    }
  }, []);

  if (!ADSENSE_ENABLED) {
    return (
      <div style={{ border: "1.5px dashed #E5E7EB", borderRadius: "12px", padding: "24px 16px", textAlign: "center", background: "#FAFAFA", margin: "16px 0", ...style }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#ccc", marginBottom: "4px" }}>Advertisement</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#ddd" }}>Google AdSense</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", color: "#e5e5e5", marginTop: "2px" }}>Active after account approval</div>
      </div>
    );
  }

  return (
    <div style={{ margin: "16px 0", textAlign: "center", ...style }}>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#ccc", marginBottom: "4px" }}>Advertisement</div>
      <ins ref={adRef} className="adsbygoogle" style={{ display: "block" }} data-ad-client={ADSENSE_PUBLISHER_ID} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
    </div>
  );
}

function parseArticle(text) {
  const lines = text.split("\n").filter(l => l.trim());
  let headline = "", body = [], found = false;
  for (const line of lines) {
    const clean = line.trim();
    if (!found) { headline = clean.replace(/^#+\s*/, "").replace(/\*\*/g, ""); found = true; }
    else if (clean) body.push(clean);
  }
  return { headline, body };
}

export default function FinanceBlog() {
  const [article, setArticle] = useState(null);
  const [activeIdx, setActiveIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const articleRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  async function generateArticle(idx) {
    setActiveIdx(idx); setLoading(true); setArticle(null); setError(null);
    try {
      const res = await fetch(ANTHROPIC_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1500, messages: [{ role: "user", content: TOPICS[idx].prompt }] }),
      });
      if (!res.ok) {
        let msg = `API Error ${res.status}`;
        try { const d = await res.json(); msg = d?.error?.message || msg; } catch (_) {}
        throw new Error(msg);
      }
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text.trim()) throw new Error("No response from API. Please try again.");
      setArticle(parseArticle(text));
      setTimeout(() => articleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  function renderArticleBody(body) {
    const els = []; let pCount = 0, adCount = 0;
    for (let i = 0; i < body.length; i++) {
      const line = body[i];
      const clean = line.replace(/\*\*/g, "").replace(/^#+\s*/, "");
      if (!clean.trim()) continue;
      if (line.startsWith("##")) { els.push(<h3 key={`h${i}`}>{clean}</h3>); }
      else {
        pCount++;
        els.push(<p key={`p${i}`}>{clean}</p>);
        if (pCount % 4 === 0) {
          adCount++;
          els.push(<AdUnit key={`ad${adCount}`} slot={ADSENSE_SLOT_IN_ARTICLE} format="fluid" style={{ margin: "28px 0" }} />);
        }
      }
    }
    return els;
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .brand { font-family: 'Instrument Serif', serif; font-size: 24px; color: #111; }
    .nav-item { font-family: 'Inter', sans-serif; font-size: 13px; color: #666; cursor: pointer; transition: color 0.15s; }
    .nav-item:hover { color: #111; }
    .hero-heading { font-family: 'Instrument Serif', serif; font-size: clamp(44px, 6vw, 80px); line-height: 1.08; letter-spacing: -1px; color: #111; font-weight: 400; }
    .hero-heading em { font-style: italic; color: #16A34A; }
    .featured-card { border-radius: 18px; padding: 28px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 1px solid transparent; }
    .featured-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.07); }
    .topic-chip { display: inline-flex; align-items: center; gap: 7px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; padding: 9px 18px; border-radius: 100px; border: 1.5px solid #E5E7EB; background: #fff; cursor: pointer; transition: all 0.18s; color: #555; }
    .topic-chip:hover { border-color: #16A34A; color: #16A34A; background: #F0FDF4; }
    .topic-chip.active { background: #16A34A; border-color: #16A34A; color: #fff; }
    .article-body p { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 1.85; color: #444; font-weight: 300; margin-bottom: 18px; }
    .article-body h3 { font-family: 'Instrument Serif', serif; font-size: 22px; font-weight: 400; font-style: italic; color: #111; margin: 32px 0 10px; }
    .fade-up { opacity: 0; transform: translateY(20px); transition: opacity 0.65s ease, transform 0.65s ease; }
    .fade-up.show { opacity: 1; transform: translateY(0); }
    .loading-dot { display: inline-block; width: 7px; height: 7px; background: #16A34A; border-radius: 50%; margin: 0 3px; animation: bounce 1.1s ease-in-out infinite; }
    .loading-dot:nth-child(2) { animation-delay: 0.18s; }
    .loading-dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.3}40%{transform:scale(1);opacity:1} }
    .sidebar-topic { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; border: 1px solid #F3F4F6; font-family: 'Inter', sans-serif; font-size: 13px; color: #444; cursor: pointer; background: #fff; transition: background 0.15s; }
    .sidebar-topic:hover { background: #F0FDF4; border-color: #BBF7D0; color: #16A34A; }
    @media (max-width: 900px) {
      .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding: 48px 24px !important; }
      .featured-grid { grid-template-columns: 1fr !important; }
      .article-grid { grid-template-columns: 1fr !important; }
      .article-sidebar { display: none !important; }
      nav { padding: 0 20px !important; }
      .nav-links { display: none !important; }
      .footer-inner { flex-direction: column !important; gap: 16px !important; text-align: center !important; padding: 24px 20px !important; }
    }
  `;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#fff", minHeight: "100vh", color: "#111" }}>
      <style>{css}</style>

      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(14px)", borderBottom: "1px solid #F3F4F6", height: "60px", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="brand">Wealthly</div>
        <div className="nav-links" style={{ display: "flex", gap: "28px" }}>
          {["Markets", "Investing", "Crypto", "Personal Finance"].map(l => <span key={l} className="nav-item">{l}</span>)}
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", fontWeight: 500, color: "#fff", background: "#111", padding: "8px 20px", borderRadius: "100px", cursor: "pointer" }}>Subscribe</div>
      </nav>

      <div className={`fade-up hero-grid ${mounted ? "show" : ""}`} style={{ maxWidth: "1080px", margin: "0 auto", padding: "88px 48px 72px", display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "72px", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#16A34A", marginBottom: "20px" }}>AI-Powered Finance Blog</div>
          <h1 className="hero-heading" style={{ marginBottom: "22px" }}>Your money,<br /><em>working smarter</em></h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "16px", color: "#777", lineHeight: 1.7, fontWeight: 300, maxWidth: "420px", marginBottom: "36px" }}>Fresh, AI-written articles on investing, crypto, budgeting and building real wealth.</p>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ background: "#111", color: "#fff", padding: "12px 26px", borderRadius: "100px", fontFamily: "'Inter',sans-serif", fontSize: "14px", fontWeight: 500, cursor: "pointer" }} onClick={() => document.getElementById("topics-section")?.scrollIntoView({ behavior: "smooth" })}>Read Articles ↓</div>
            <div style={{ color: "#888", padding: "12px 20px", fontFamily: "'Inter',sans-serif", fontSize: "14px", cursor: "pointer" }}>About →</div>
          </div>
        </div>
        <div style={{ background: "#F9FAFB", borderRadius: "24px", padding: "36px", border: "1px solid #F3F4F6" }}>
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#bbb", marginBottom: "4px" }}>Articles generated</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "52px", color: "#111", lineHeight: 1 }}>12,400+</div>
          </div>
          <div style={{ height: "1px", background: "#EEE", marginBottom: "24px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {[["Topics","6"],["Avg. read","4 min"],["Updated","Daily"],["AI model","Claude"]].map(([l,v]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", color: "#bbb", marginBottom: "3px" }}>{l}</div>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "20px", color: "#111" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: "1px", background: "#F3F4F6" }} />

      <div className={`fade-up ${mounted ? "show" : ""}`} style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 48px", transitionDelay: "0.1s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: "6px" }}>Today's Picks</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "32px", color: "#111" }}>Featured Stories</div>
          </div>
          <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#16A34A", cursor: "pointer", fontWeight: 500 }}>View all →</span>
        </div>
        <div className="featured-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
          {FEATURED.map((f, i) => (
            <div key={i} className="featured-card" style={{ background: f.bg }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: f.tagColor, marginBottom: "10px" }}>{f.tag}</div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "19px", lineHeight: 1.3, color: "#111", marginBottom: "10px" }}>{f.title}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "13px", color: "#888", lineHeight: 1.6, fontWeight: 300, marginBottom: "16px" }}>{f.desc}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#bbb" }}>🕐 {f.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: "1px", background: "#F3F4F6" }} />

      <div id="topics-section" className={`fade-up ${mounted ? "show" : ""}`} style={{ maxWidth: "1080px", margin: "0 auto", padding: "64px 48px 96px", transitionDelay: "0.2s" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#aaa", marginBottom: "8px" }}>AI Article Generator</div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "32px", color: "#111", marginBottom: "10px" }}>Pick a topic, get an article</div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#aaa", fontWeight: 300 }}>Powered by Claude AI — tap any topic below for a fresh article instantly.</p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "48px" }}>
          {TOPICS.map((t, i) => (
            <button key={i} className={`topic-chip ${activeIdx===i&&(article||loading)?"active":""}`} onClick={() => generateArticle(i)} disabled={loading} style={{ opacity: loading && activeIdx!==i ? 0.5 : 1 }}>
              <span>{t.emoji}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ padding: "52px", background: "#F9FAFB", borderRadius: "20px", textAlign: "center", border: "1px solid #F3F4F6" }}>
            <div style={{ marginBottom: "14px" }}><span className="loading-dot"/><span className="loading-dot"/><span className="loading-dot"/></div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#aaa" }}>Writing <strong style={{ color: "#111" }}>{activeIdx!==null?TOPICS[activeIdx].label:""}</strong> article...</div>
          </div>
        )}

        {error && (
          <div style={{ padding: "16px 20px", background: "#FFF5F5", borderRadius: "12px", fontFamily: "'Inter',sans-serif", fontSize: "14px", color: "#DC2626", border: "1px solid #FEE2E2", display: "flex", gap: "8px" }}>
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {article && !loading && (
          <div ref={articleRef} className="article-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "56px" }}>
            <div>
              <div style={{ marginBottom: "18px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 12px", borderRadius: "100px", background: "#F0FDF4", color: "#16A34A" }}>{activeIdx!==null?TOPICS[activeIdx].label:""}</span>
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#ccc" }}>AI Generated · Just now</span>
              </div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(26px,3.5vw,42px)", lineHeight: 1.15, color: "#111", fontWeight: 400, marginBottom: "24px" }}>{article.headline}</div>
              <div style={{ width: "40px", height: "3px", background: "#16A34A", borderRadius: "2px", marginBottom: "28px" }} />
              <div className="article-body">{renderArticleBody(article.body)}</div>
            </div>

            <div className="article-sidebar" style={{ position: "sticky", top: "80px", display: "flex", flexDirection: "column", gap: "16px", alignSelf: "start" }}>
              <AdUnit slot={ADSENSE_SLOT_SIDEBAR} format="rectangle" />
              <div style={{ background: "#F9FAFB", borderRadius: "16px", padding: "20px", border: "1px solid #F3F4F6" }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "11px", fontWeight: 600, color: "#bbb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>More Topics</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {TOPICS.filter((_,j) => j!==activeIdx).map(t => (
                    <div key={t.label} className="sidebar-topic" onClick={() => generateArticle(TOPICS.indexOf(t))}>
                      <span>{t.emoji}</span><span>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <AdUnit slot={ADSENSE_SLOT_SIDEBAR} format="rectangle" />
            </div>
          </div>
        )}
      </div>

      <div className="footer-inner" style={{ borderTop: "1px solid #F3F4F6", background: "#F9FAFB", padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="brand" style={{ fontSize: "18px" }}>Wealthly</div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#ccc" }}>© 2026 Wealthly · AI-powered financial content</div>
        <div style={{ display: "flex", gap: "20px" }}>
          {["Privacy","Terms","Contact"].map(l => <span key={l} style={{ fontFamily: "'Inter',sans-serif", fontSize: "12px", color: "#bbb", cursor: "pointer" }}>{l}</span>)}
        </div>
      </div>
    </div>
  );
    }

import { useState, useRef, useCallback } from "react";

const SKIN_CONCERNS = [
  { id: "aging", label: "Aging & Wrinkles", icon: "⏳" },
  { id: "hyperpigmentation", label: "Dark Spots", icon: "🌑" },
  { id: "dryness", label: "Dryness", icon: "💧" },
  { id: "acne", label: "Acne", icon: "🔴" },
  { id: "sensitivity", label: "Sensitivity", icon: "🌿" },
  { id: "dullness", label: "Dullness", icon: "✨" },
];

const SKIN_TYPES = ["Dry", "Oily", "Combination", "Normal", "Sensitive"];

const INGREDIENTS_DB = {
  aging: [
    { name: "Retinol (Vitamin A)", strength: 95, description: "Gold standard anti-aging. Accelerates cell turnover and boosts collagen synthesis.", usage: "PM only, start 2x/week", caution: "Avoid during pregnancy" },
    { name: "Vitamin C (L-Ascorbic Acid)", strength: 90, description: "Potent antioxidant that brightens skin and neutralizes free radicals.", usage: "AM routine, before sunscreen", caution: "Can oxidize — store in dark bottle" },
    { name: "Peptides", strength: 80, description: "Signal proteins that stimulate collagen and elastin production.", usage: "AM & PM, all skin types", caution: "None significant" },
    { name: "Niacinamide", strength: 75, description: "Reduces fine lines, pores, and improves skin barrier function.", usage: "AM & PM", caution: "Use 10% or less to avoid flushing" },
  ],
  hyperpigmentation: [
    { name: "Alpha Arbutin", strength: 92, description: "Inhibits melanin production safely and effectively.", usage: "AM & PM", caution: "Avoid with AHAs simultaneously" },
    { name: "Kojic Acid", strength: 82, description: "Derived from fungi, disrupts melanin synthesis pathways.", usage: "PM, use SPF in AM", caution: "Can cause sensitivity" },
    { name: "Azelaic Acid", strength: 85, description: "Dual-action: fades spots and reduces redness/acne.", usage: "AM or PM", caution: "Safe during pregnancy" },
    { name: "Vitamin C (L-Ascorbic Acid)", strength: 88, description: "Brightens and prevents new dark spot formation.", usage: "AM routine", caution: "pH sensitive formulation" },
  ],
  dryness: [
    { name: "Hyaluronic Acid", strength: 95, description: "Holds 1000x its weight in water — ultimate humectant.", usage: "AM & PM on damp skin", caution: "Layer under moisturizer" },
    { name: "Ceramides", strength: 90, description: "Rebuild and reinforce the skin's natural lipid barrier.", usage: "AM & PM", caution: "None significant" },
    { name: "Squalane", strength: 85, description: "Lightweight plant-derived oil that mimics skin's natural sebum.", usage: "PM, last step", caution: "Very safe for all skin types" },
    { name: "Glycerin", strength: 80, description: "Classic humectant that draws moisture to the skin surface.", usage: "AM & PM", caution: "None significant" },
  ],
  acne: [
    { name: "Salicylic Acid (BHA)", strength: 93, description: "Oil-soluble acid that penetrates pores and dissolves sebum plugs.", usage: "PM, 2-3x per week", caution: "Avoid with other exfoliants" },
    { name: "Benzoyl Peroxide", strength: 88, description: "Kills acne-causing bacteria and reduces inflammation.", usage: "PM, spot treatment", caution: "Can bleach fabrics" },
    { name: "Niacinamide", strength: 82, description: "Regulates sebum, minimizes pores, reduces post-acne marks.", usage: "AM & PM", caution: "None significant" },
    { name: "Zinc", strength: 75, description: "Anti-inflammatory mineral that balances sebum production.", usage: "AM & PM", caution: "None significant" },
  ],
  sensitivity: [
    { name: "Centella Asiatica", strength: 90, description: "Ancient healing herb that calms redness and repairs barrier.", usage: "AM & PM", caution: "None significant" },
    { name: "Ceramides", strength: 88, description: "Reinforce the compromised barrier to reduce reactivity.", usage: "AM & PM", caution: "None significant" },
    { name: "Oat Extract (Colloidal)", strength: 85, description: "Clinically proven to soothe irritation and eczema flares.", usage: "AM & PM", caution: "None significant" },
    { name: "Allantoin", strength: 78, description: "Promotes healing and skin cell regeneration gently.", usage: "AM & PM", caution: "None significant" },
  ],
  dullness: [
    { name: "AHAs (Glycolic/Lactic Acid)", strength: 90, description: "Chemical exfoliants that dissolve dead skin cells revealing radiance.", usage: "PM, 2-3x per week", caution: "Always use SPF next day" },
    { name: "Vitamin C", strength: 92, description: "Brightens, evens tone, and gives an immediate luminosity boost.", usage: "AM routine", caution: "Unstable — check formulation" },
    { name: "Niacinamide", strength: 83, description: "Boosts NAD+ levels in skin cells, improving energy and glow.", usage: "AM & PM", caution: "None significant" },
    { name: "Bakuchiol", strength: 76, description: "Plant-based retinol alternative — brightens without irritation.", usage: "PM", caution: "Safe during pregnancy" },
  ],
};

function generateRoutine(concerns, skinType, age) {
  const ageGroup = age < 30 ? "20s" : age < 40 ? "30s" : age < 50 ? "40s" : "50s+";
  const allIngredients = [];
  concerns.forEach(c => {
    if (INGREDIENTS_DB[c]) allIngredients.push(...INGREDIENTS_DB[c]);
  });

  const seen = new Set();
  const unique = allIngredients.filter(i => {
    if (seen.has(i.name)) return false;
    seen.add(i.name);
    return true;
  }).sort((a, b) => b.strength - a.strength).slice(0, 5);

  const am = unique.filter(i => i.usage.toLowerCase().includes("am")).slice(0, 3);
  const pm = unique.filter(i => i.usage.toLowerCase().includes("pm")).slice(0, 3);

  return { am, pm, topPicks: unique, ageGroup };
}

const CLAUDE_SYSTEM = `You are Timeless — an expert AI skincare coach with deep knowledge of dermatological research and evidence-based skincare. 
You give personalized, science-backed advice in a warm, concise, and empowering tone.
You focus on timeless ingredients supported by clinical research, never chasing trends.
Keep responses under 150 words unless a detailed breakdown is requested.
Use emojis sparingly but effectively. Always end with one actionable tip.`;

export default function SkincareCoach() {
  const [step, setStep] = useState("intro"); // intro | quiz | analysis | routine | chat
  const [skinType, setSkinType] = useState("");
  const [age, setAge] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [routine, setRoutine] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("am");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const toggleConcern = (id) => {
    setConcerns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch {
      alert("Camera access denied or unavailable. You can skip this step.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
    stopCamera();
    setAnalyzing(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a professional skin analysis AI. Analyze the provided selfie image and give a brief, encouraging skin assessment. 
Identify: 1) Apparent skin type (dry/oily/combination/normal), 2) Visible concerns (briefly list 2-3), 3) Positive observations about their skin, 4) One priority recommendation.
Be warm, honest and encouraging. Format as JSON with keys: skinType, concerns (array), positives (array), priority. Keep each value under 20 words.`,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageData } },
            { type: "text", text: "Please analyze my skin from this selfie." }
          ]}]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "{}";
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setAnalysisResult(parsed);
        if (parsed.skinType && !skinType) setSkinType(parsed.skinType);
      } catch {
        setAnalysisResult({ skinType: "Mixed", concerns: ["General care needed"], positives: ["Natural skin detected"], priority: "Start with a simple cleanse + moisturize routine" });
      }
    } catch {
      setAnalysisResult({ skinType: skinType || "Normal", concerns: ["Could not analyze"], positives: ["Your skin is unique!"], priority: "Focus on hydration and SPF daily." });
    }
    setAnalyzing(false);
    setStep("analysis");
  }, [skinType]);

  const buildRoutine = () => {
    const r = generateRoutine(concerns, skinType, parseInt(age) || 30);
    setRoutine(r);
    const welcome = { role: "assistant", content: `✨ Your Timeless routine is ready! I've curated it based on your ${concerns.length} concern(s) and ${skinType} skin type. Ask me anything about your ingredients, how to layer them, or what to avoid mixing!` };
    setChatMessages([welcome]);
    setStep("routine");
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = { role: "user", content: chatInput };
    const newHistory = [...chatMessages, userMsg];
    setChatMessages(newHistory);
    setChatInput("");
    setChatLoading(true);

    try {
      const messages = newHistory.map(m => ({ role: m.role, content: m.content }));
      const context = routine ? `User profile: ${skinType} skin, age ${age}, concerns: ${concerns.join(", ")}. Top ingredients: ${routine.topPicks.map(i=>i.name).join(", ")}.` : "";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: CLAUDE_SYSTEM + (context ? "\n\nContext: " + context : ""),
          messages
        })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Let me think about that...";
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Connection issue. Please try again!" }]);
    }
    setChatLoading(false);
  };

  // ── STYLES ────────────────────────────────────────────────
  const s = {
    app: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0c1a 0%, #1a0f2e 50%, #0c1a1a 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#f0e8ff", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 40px" },
    card: { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "32px 28px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" },
    title: { fontSize: "28px", fontWeight: "700", background: "linear-gradient(135deg, #c084fc, #f0abfc, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "6px", letterSpacing: "-0.5px" },
    subtitle: { color: "rgba(240,232,255,0.6)", fontSize: "14px", marginBottom: "28px", lineHeight: "1.5" },
    btn: { background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", borderRadius: "14px", color: "#fff", padding: "14px 28px", fontSize: "15px", fontWeight: "600", cursor: "pointer", width: "100%", transition: "all 0.2s", letterSpacing: "0.2px" },
    btnOutline: { background: "transparent", border: "1px solid rgba(168,85,247,0.4)", borderRadius: "14px", color: "#c084fc", padding: "12px 28px", fontSize: "14px", fontWeight: "500", cursor: "pointer", width: "100%", transition: "all 0.2s" },
    chip: (active) => ({ background: active ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(255,255,255,0.07)", border: active ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: active ? "#fff" : "rgba(240,232,255,0.7)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "8px" }),
    input: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 16px", color: "#f0e8ff", fontSize: "15px", width: "100%", boxSizing: "border-box", outline: "none" },
    label: { fontSize: "12px", color: "rgba(240,232,255,0.5)", marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase", display: "block" },
    badge: { background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", color: "#c084fc", fontWeight: "600" },
    strengthBar: (val) => ({ height: "4px", borderRadius: "2px", background: `linear-gradient(90deg, #7c3aed ${val}%, rgba(255,255,255,0.1) ${val}%)`, marginTop: "6px" }),
  };

  // ── SCREENS ───────────────────────────────────────────────

  if (step === "intro") return (
    <div style={s.app}>
      <div style={s.card}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>🧬</div>
          <h1 style={s.title}>Timeless</h1>
          <p style={{ ...s.subtitle, fontSize: "16px" }}>Smart Skincare Coach</p>
          <p style={{ color: "rgba(240,232,255,0.55)", fontSize: "14px", lineHeight: "1.7" }}>
            Science-backed routines built around your unique skin — not trending products. 
            Powered by dermatological research and AI analysis.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {["🔬 AI-powered skin analysis via camera", "💊 Evidence-based ingredient recommendations", "📅 Personalized AM & PM routines", "💬 24/7 skincare coach chat"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "rgba(240,232,255,0.75)" }}>
              <span style={{ fontSize: "18px" }}>{f.split(" ")[0]}</span>
              <span>{f.slice(f.indexOf(" ") + 1)}</span>
            </div>
          ))}
        </div>
        <button style={s.btn} onClick={() => setStep("quiz")}>Start Your Skin Assessment →</button>
      </div>
    </div>
  );

  if (step === "quiz") return (
    <div style={s.app}>
      <div style={s.card}>
        <h2 style={{ ...s.title, fontSize: "22px" }}>Tell Us About Your Skin</h2>
        <p style={s.subtitle}>Takes 60 seconds — unlocks your personalized routine</p>

        <div style={{ marginBottom: "20px" }}>
          <label style={s.label}>Your Age</label>
          <input style={s.input} type="number" placeholder="e.g. 32" value={age} onChange={e => setAge(e.target.value)} min="15" max="90" />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={s.label}>Skin Type</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {SKIN_TYPES.map(t => (
              <button key={t} onClick={() => setSkinType(t)} style={{ ...s.chip(skinType === t), padding: "8px 14px", width: "auto" }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <label style={s.label}>Skin Concerns (select all that apply)</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {SKIN_CONCERNS.map(c => (
              <button key={c.id} onClick={() => toggleConcern(c.id)} style={s.chip(concerns.includes(c.id))}>
                <span>{c.icon}</span><span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button style={s.btn} onClick={() => setStep("camera")} disabled={!skinType || concerns.length === 0}>
            Continue to Skin Scan →
          </button>
          <button style={s.btnOutline} onClick={buildRoutine} disabled={!skinType || concerns.length === 0}>
            Skip Scan, Build My Routine
          </button>
        </div>
      </div>
    </div>
  );

  if (step === "camera") return (
    <div style={s.app}>
      <div style={s.card}>
        <h2 style={{ ...s.title, fontSize: "22px" }}>Skin Analysis Scan</h2>
        <p style={s.subtitle}>Optional AI photo analysis for deeper personalization. No images are stored.</p>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div style={{ borderRadius: "16px", overflow: "hidden", background: "#000", marginBottom: "16px", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
          {cameraActive
            ? <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
            : <div style={{ textAlign: "center", color: "rgba(240,232,255,0.4)" }}>
                <div style={{ fontSize: "48px", marginBottom: "8px" }}>📷</div>
                <div style={{ fontSize: "13px" }}>Camera preview will appear here</div>
              </div>
          }
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {!cameraActive
            ? <button style={s.btn} onClick={startCamera}>Enable Camera</button>
            : <button style={{ ...s.btn, background: "linear-gradient(135deg, #059669, #10b981)" }} onClick={captureAndAnalyze}>📸 Capture & Analyze</button>
          }
          <button style={s.btnOutline} onClick={() => { stopCamera(); buildRoutine(); }}>Skip — Build Routine Without Scan</button>
        </div>
      </div>
    </div>
  );

  if (step === "analysis") return (
    <div style={s.app}>
      <div style={s.card}>
        {analyzing ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>🔬</div>
            <p style={{ color: "rgba(240,232,255,0.7)" }}>Analyzing your skin...</p>
          </div>
        ) : analysisResult && (
          <>
            <h2 style={{ ...s.title, fontSize: "22px" }}>Your Skin Analysis</h2>
            <p style={s.subtitle}>AI-powered assessment based on your photo</p>
            <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "rgba(240,232,255,0.5)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Detected Skin Type</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#c084fc" }}>{analysisResult.skinType}</div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={s.label}>🔍 Identified Concerns</label>
              {(analysisResult.concerns || []).map((c, i) => <div key={i} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", marginBottom: "6px", fontSize: "14px" }}>{c}</div>)}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={s.label}>✨ Positives</label>
              {(analysisResult.positives || []).map((p, i) => <div key={i} style={{ padding: "8px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", marginBottom: "6px", fontSize: "14px", color: "#6ee7b7" }}>{p}</div>)}
            </div>
            <div style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "14px", padding: "14px", marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", color: "rgba(240,232,255,0.5)", marginBottom: "4px" }}>⭐ Priority Recommendation</div>
              <div style={{ fontSize: "14px", lineHeight: "1.5" }}>{analysisResult.priority}</div>
            </div>
            <button style={s.btn} onClick={buildRoutine}>Build My Personalized Routine →</button>
          </>
        )}
      </div>
    </div>
  );

  if (step === "routine" && routine) {
    const tabIngredients = activeTab === "am" ? routine.am : routine.pm;
    return (
      <div style={s.app}>
        <div style={s.card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
            <h2 style={{ ...s.title, fontSize: "20px", marginBottom: 0 }}>Your Timeless Routine</h2>
            <span style={s.badge}>{routine.ageGroup}</span>
          </div>
          <p style={s.subtitle}>{skinType} skin · {concerns.length} concern(s) addressed</p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px" }}>
            {["am", "pm"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px", background: activeTab === t ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent", color: activeTab === t ? "#fff" : "rgba(240,232,255,0.5)", transition: "all 0.2s" }}>
                {t === "am" ? "☀️ Morning" : "🌙 Evening"}
              </button>
            ))}
          </div>

          {/* Ingredient Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {(tabIngredients.length > 0 ? tabIngredients : routine.topPicks.slice(0,3)).map((ing, i) => (
              <div key={ing.name} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#e9d5ff" }}>{i+1}. {ing.name}</div>
                  <span style={{ ...s.badge, background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.3)", color: "#6ee7b7" }}>{ing.strength}%</span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(240,232,255,0.6)", marginBottom: "8px", lineHeight: "1.5" }}>{ing.description}</p>
                <div style={s.strengthBar(ing.strength)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "11px" }}>
                  <span style={{ color: "rgba(240,232,255,0.45)" }}>🕐 {ing.usage}</span>
                  {ing.caution !== "None significant" && <span style={{ color: "rgba(251,191,36,0.7)" }}>⚠️ {ing.caution}</span>}
                </div>
              </div>
            ))}
          </div>

          <button style={{ ...s.btn, background: "linear-gradient(135deg,#0891b2,#06b6d4)" }} onClick={() => setStep("chat")}>
            💬 Chat With Your Skin Coach
          </button>
        </div>
      </div>
    );
  }

  if (step === "chat") return (
    <div style={{ ...s.app, paddingBottom: "0" }}>
      <div style={{ ...s.card, display: "flex", flexDirection: "column", height: "calc(100vh - 40px)", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <button onClick={() => setStep("routine")} style={{ background: "none", border: "none", color: "rgba(240,232,255,0.5)", cursor: "pointer", fontSize: "20px" }}>←</button>
          <div>
            <h2 style={{ ...s.title, fontSize: "18px", marginBottom: "0" }}>Timeless Coach</h2>
            <p style={{ fontSize: "12px", color: "rgba(240,232,255,0.4)", margin: 0 }}>Powered by dermatological research</p>
          </div>
          <span style={{ ...s.badge, marginLeft: "auto" }}>🟢 Online</span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingBottom: "12px" }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "80%", background: msg.role === "user" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(255,255,255,0.07)", border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.1)", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "12px 16px", fontSize: "14px", lineHeight: "1.6", color: "#f0e8ff" }}>
                {msg.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", fontSize: "14px", color: "rgba(240,232,255,0.5)" }}>✨ Thinking...</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <input style={{ ...s.input, margin: 0 }} placeholder="Ask about ingredients, layering, routines..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
          <button onClick={sendChat} disabled={chatLoading} style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", borderRadius: "12px", padding: "0 16px", color: "#fff", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>→</button>
        </div>

        <div style={{ display: "flex", gap: "6px", paddingTop: "10px", flexWrap: "wrap" }}>
          {["Can I mix Vitamin C + Retinol?", "Best sunscreen type?", "Morning routine order?"].map(q => (
            <button key={q} onClick={() => { setChatInput(q); }} style={{ fontSize: "11px", padding: "6px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", color: "rgba(240,232,255,0.6)", cursor: "pointer" }}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return null;
}

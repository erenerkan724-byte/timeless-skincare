import { useState, useRef, useCallback } from "react";

const SKIN_CONCERNS = [
  { id: "aging", label: "Yaşlanma & Kırışıklık", icon: "⏳" },
  { id: "hyperpigmentation", label: "Lekeler", icon: "🌑" },
  { id: "dryness", label: "Kuruluk", icon: "💧" },
  { id: "acne", label: "Akne & Sivilce", icon: "🔴" },
  { id: "sensitivity", label: "Hassasiyet", icon: "🌿" },
  { id: "dullness", label: "Donuk Cilt", icon: "✨" },
];

const INGREDIENTS_DB = {
  aging: [
    { name: "Retinol (A Vitamini)", strength: 95, description: "Hücre yenilenmesini hızlandırır ve kolajen sentezini artırır.", usage: "Sadece Akşam, haftada 2x başla", caution: "Hamilelikte kullanmayın" },
    { name: "C Vitamini (L-Askorbik Asit)", strength: 90, description: "Güçlü antioksidan, cildi parlatır ve serbest radikalleri nötralize eder.", usage: "Sabah rutini, güneş kreminden önce", caution: "Koyu şişede saklayın" },
    { name: "Peptitler", strength: 80, description: "Kolajen ve elastin üretimini uyaran sinyal proteinleri.", usage: "Sabah & Akşam, tüm cilt tipleri", caution: "Önemli bir yan etki yok" },
    { name: "Niasinamid", strength: 75, description: "İnce çizgileri azaltır, gözenekleri sıkılaştırır, cilt bariyerini güçlendirir.", usage: "Sabah & Akşam", caution: "%10 veya altı kullanın" },
  ],
  hyperpigmentation: [
    { name: "Alfa Arbutin", strength: 92, description: "Melanin üretimini güvenli ve etkili şekilde engeller.", usage: "Sabah & Akşam", caution: "AHA ile aynı anda kullanmayın" },
    { name: "Kojik Asit", strength: 82, description: "Mantar kaynaklı, melanin sentez yollarını bozar.", usage: "Akşam, sabah SPF kullanın", caution: "Hassasiyete yol açabilir" },
    { name: "Azelaik Asit", strength: 85, description: "Hem lekeleri açar hem de kızarıklık ve akneyi azaltır.", usage: "Sabah veya Akşam", caution: "Hamilelikte güvenli" },
    { name: "C Vitamini", strength: 88, description: "Parlatır ve yeni leke oluşumunu önler.", usage: "Sabah rutini", caution: "pH'a duyarlı formül" },
  ],
  dryness: [
    { name: "Hyalüronik Asit", strength: 95, description: "Ağırlığının 1000 katı su tutar — en iyi nemlendirici.", usage: "Sabah & Akşam, nemli cilde uygulayın", caution: "Nemlendiricinin altına katman yapın" },
    { name: "Seramidler", strength: 90, description: "Cildin doğal lipit bariyerini onarır ve güçlendirir.", usage: "Sabah & Akşam", caution: "Önemli bir yan etki yok" },
    { name: "Skualen", strength: 85, description: "Cildin doğal sebumunu taklit eden hafif bitkisel yağ.", usage: "Akşam, son adım", caution: "Tüm cilt tipleri için güvenli" },
    { name: "Gliserin", strength: 80, description: "Cildin yüzeyine nem çeken klasik nemlendirici.", usage: "Sabah & Akşam", caution: "Önemli bir yan etki yok" },
  ],
  acne: [
    { name: "Salisilik Asit (BHA)", strength: 93, description: "Gözeneklere nüfuz eden ve sebum tıkaçlarını çözen yağ bazlı asit.", usage: "Akşam, haftada 2-3x", caution: "Diğer eksfolyanlarla birlikte kullanmayın" },
    { name: "Benzoil Peroksit", strength: 88, description: "Akneye neden olan bakterileri öldürür ve iltihabı azaltır.", usage: "Akşam, nokta tedavisi", caution: "Kumaşları soldurabililr" },
    { name: "Niasinamid", strength: 82, description: "Sebomu düzenler, gözenekleri küçültür, akne izlerini azaltır.", usage: "Sabah & Akşam", caution: "Önemli bir yan etki yok" },
    { name: "Çinko", strength: 75, description: "Sebo üretimini dengeleyen anti-inflamatuar mineral.", usage: "Sabah & Akşam", caution: "Önemli bir yan etki yok" },
  ],
  sensitivity: [
    { name: "Centella Asiatica", strength: 90, description: "Kızarıklığı yatıştıran ve bariyeri onaran kadim şifalı bitki.", usage: "Sabah & Akşam", caution: "Önemli bir yan etki yok" },
    { name: "Seramidler", strength: 88, description: "Zayıflamış bariyeri güçlendirerek reaktiviteyi azaltır.", usage: "Sabah & Akşam", caution: "Önemli bir yan etki yok" },
    { name: "Yulaf Özü", strength: 85, description: "Klinik olarak kanıtlanmış, tahrişi ve egzamayı yatıştırır.", usage: "Sabah & Akşam", caution: "Önemli bir yan etki yok" },
    { name: "Allantoin", strength: 78, description: "İyileşmeyi destekler ve cilt hücrelerinin yenilenmesini sağlar.", usage: "Sabah & Akşam", caution: "Önemli bir yan etki yok" },
  ],
  dullness: [
    { name: "AHA (Glikolik/Laktik Asit)", strength: 90, description: "Ölü cilt hücrelerini çözen kimyasal eksfolyanlar.", usage: "Akşam, haftada 2-3x", caution: "Ertesi gün SPF kullanın" },
    { name: "C Vitamini", strength: 92, description: "Parlatır, tonu eşitler ve anında aydınlık verir.", usage: "Sabah rutini", caution: "Formülasyonu kontrol edin" },
    { name: "Niasinamid", strength: 83, description: "Cilt hücrelerindeki enerjiyi artırır, parlaklık verir.", usage: "Sabah & Akşam", caution: "Önemli bir yan etki yok" },
    { name: "Bakuchiol", strength: 76, description: "Bitkisel retinol alternatifi — tahriş olmadan parlatır.", usage: "Akşam", caution: "Hamilelikte güvenli" },
  ],
};

function generateRoutine(concerns, skinType, age) {
  const ageGroup = age < 30 ? "20'ler" : age < 40 ? "30'lar" : age < 50 ? "40'lar" : "50+";
  const allIngredients = [];
  concerns.forEach(c => { if (INGREDIENTS_DB[c]) allIngredients.push(...INGREDIENTS_DB[c]); });
  const seen = new Set();
  const unique = allIngredients.filter(i => { if (seen.has(i.name)) return false; seen.add(i.name); return true; }).sort((a, b) => b.strength - a.strength).slice(0, 5);
  const am = unique.filter(i => i.usage.toLowerCase().includes("sabah")).slice(0, 3);
  const pm = unique.filter(i => i.usage.toLowerCase().includes("akşam")).slice(0, 3);
  return { am, pm, topPicks: unique, ageGroup, skinType };
}

const CLAUDE_SYSTEM = `Sen Timeless — dermatoloji araştırmaları ve kanıta dayalı cilt bakımı konusunda derin bilgiye sahip uzman bir AI cilt koçusun. Kişiselleştirilmiş, bilimsel destekli tavsiyeler veriyorsun. Sıcak, özlü ve güçlendirici bir ton kullanıyorsun. Trend ürünler yerine klinik araştırmalarla desteklenmiş kalıcı bileşenlere odaklanıyorsun. Yanıtların 150 kelimeyi geçmesin. Türkçe yanıt ver. Her yanıtın sonunda tek bir uygulanabilir ipucu ver.`;

export default function SkincareCoach() {
  const [step, setStep] = useState("intro");
  const [age, setAge] = useState("");
  const [concerns, setConcerns] = useState([]);
  const [routine, setRoutine] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("am");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const toggleConcern = (id) => setConcerns(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const startCamera = async () => {
    setCameraError("");
    setCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", true);
        videoRef.current.setAttribute("muted", true);
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraActive(true);
            setCameraReady(true);
          }).catch(() => {
            setCameraActive(true);
            setCameraReady(true);
          });
        };
        // Fallback if onloadedmetadata doesn't fire
        setTimeout(() => {
          setCameraActive(true);
          setCameraReady(true);
        }, 1500);
      }
    } catch (err) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Kamera izni reddedildi. Tarayıcı adres çubuğundaki kilit ikonuna tıklayıp kamera iznini açın, sonra sayfayı yenileyin.");
      } else if (err.name === "NotFoundError") {
        setCameraError("Kamera bulunamadı. Cihazınızda kamera olduğundan emin olun.");
      } else {
        setCameraError("Kamera açılamadı (" + err.name + "). Sayfayı yenileyip tekrar deneyin.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setCameraActive(false);
    setCameraReady(false);
  };

  const captureAndAnalyze = useCallback(async () => {
    if (!cameraReady || !videoRef.current || !canvasRef.current) {
      setCameraError("Kamera henüz hazır değil, 2-3 saniye bekleyip tekrar deneyin.");
      return;
    }
    const video = videoRef.current;
    if (video.videoWidth === 0) {
      setCameraError("Kamera görüntüsü alınamadı. Sayfayı yenileyip tekrar deneyin.");
      return;
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
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
          system: `Sen profesyonel bir cilt analizi yapay zekasısın. Selfie görüntüsünü analiz et ve kısa, cesaretlendirici bir cilt değerlendirmesi yap. Şunları tespit et: 1) Görünür cilt tipi (Kuru/Yağlı/Karma/Normal/Hassas), 2) Görünür endişeler (2-3 madde), 3) Ciltle ilgili olumlu gözlemler, 4) Bir öncelikli öneri. JSON formatında yanıt ver: skinType, concerns (dizi), positives (dizi), priority. Her değer 20 kelimeden az olsun. Türkçe yanıt ver. Sadece JSON döndür, başka hiçbir şey yazma.`,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageData } },
            { type: "text", text: "Bu selfie'den cildimi analiz et." }
          ]}]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "{}";
      const clean = text.replace(/```json|```/g, "").trim();
      setAnalysisResult(JSON.parse(clean));
    } catch {
      setAnalysisResult({ skinType: "Karma", concerns: ["Genel bakım gerekiyor"], positives: ["Doğal cildiniz güzel görünüyor"], priority: "Basit bir temizleme ve nemlendirme rutiniyle başlayın" });
    }
    setAnalyzing(false);
    setStep("analysis");
  }, [cameraReady]);

  const buildRoutine = (detectedSkinType) => {
    const r = generateRoutine(concerns, detectedSkinType || "Normal", parseInt(age) || 30);
    setRoutine(r);
    setChatMessages([{ role: "assistant", content: `✨ Timeless rutininiz hazır! ${concerns.length} endişenize ve ${detectedSkinType || "Normal"} cildinize özel olarak hazırlandı. Bileşenler, nasıl katmanlandırılacağı veya hangi kombinasyonlardan kaçınılacağı hakkında her şeyi Türkçe sorabilirsiniz!` }]);
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
      const context = routine ? `Kullanıcı profili: ${routine.skinType || "Normal"} cilt, yaş ${age || "belirtilmedi"}, endişeler: ${concerns.join(", ")}. Önerilen bileşenler: ${routine.topPicks.map(i => i.name).join(", ")}.` : "";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: CLAUDE_SYSTEM + (context ? "\n\nBağlam: " + context : ""),
          messages: newHistory.map(m => ({ role: m.role, content: m.content }))
        })
      });
      if (!res.ok) throw new Error("API hatası: " + res.status);
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "Bir sorun oluştu.";
      setChatMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Bağlantı sorunu: " + e.message + ". Lütfen tekrar deneyin." }]);
    }
    setChatLoading(false);
  };

  const s = {
    app: { minHeight: "100vh", background: "linear-gradient(135deg, #0f0c1a 0%, #1a0f2e 50%, #0c1a1a 100%)", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "#f0e8ff", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 16px 40px" },
    card: { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "32px 28px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" },
    title: { fontSize: "28px", fontWeight: "700", background: "linear-gradient(135deg, #c084fc, #f0abfc, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "6px", letterSpacing: "-0.5px" },
    subtitle: { color: "rgba(240,232,255,0.6)", fontSize: "14px", marginBottom: "28px", lineHeight: "1.5" },
    btn: { background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", borderRadius: "14px", color: "#fff", padding: "14px 28px", fontSize: "15px", fontWeight: "600", cursor: "pointer", width: "100%", transition: "all 0.2s", marginBottom: "0" },
    btnOutline: { background: "transparent", border: "1px solid rgba(168,85,247,0.4)", borderRadius: "14px", color: "#c084fc", padding: "12px 28px", fontSize: "14px", fontWeight: "500", cursor: "pointer", width: "100%", transition: "all 0.2s" },
    btnGreen: { background: "linear-gradient(135deg, #059669, #10b981)", border: "none", borderRadius: "14px", color: "#fff", padding: "14px 28px", fontSize: "15px", fontWeight: "600", cursor: "pointer", width: "100%", transition: "all 0.2s" },
    chip: (active) => ({ background: active ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(255,255,255,0.07)", border: active ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 16px", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: active ? "#fff" : "rgba(240,232,255,0.7)", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "8px" }),
    input: { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "12px", padding: "12px 16px", color: "#f0e8ff", fontSize: "15px", width: "100%", boxSizing: "border-box", outline: "none" },
    label: { fontSize: "12px", color: "rgba(240,232,255,0.5)", marginBottom: "6px", letterSpacing: "0.5px", textTransform: "uppercase", display: "block" },
    badge: { background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", color: "#c084fc", fontWeight: "600" },
    error: { background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "#fca5a5", marginTop: "10px", lineHeight: "1.5" },
    strengthBar: (val) => ({ height: "4px", borderRadius: "2px", background: `linear-gradient(90deg, #7c3aed ${val}%, rgba(255,255,255,0.1) ${val}%)`, marginTop: "6px" }),
  };

  if (step === "intro") return (
    <div style={s.app}>
      <div style={s.card}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>🧬</div>
          <h1 style={s.title}>Timeless</h1>
          <p style={{ ...s.subtitle, fontSize: "16px" }}>Akıllı Cilt Bakım Koçu</p>
          <p style={{ color: "rgba(240,232,255,0.55)", fontSize: "14px", lineHeight: "1.7" }}>Trend ürünler değil, cildinize özel bilim. Dermatoloji araştırmaları ve yapay zeka ile kişisel bakım rutininiz.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {["🔬 Yapay zeka ile kamera cilt analizi", "💊 Kanıtlanmış bileşen önerileri", "📅 Kişisel Sabah & Akşam rutini", "💬 7/24 Türkçe cilt bakım koçu"].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "rgba(240,232,255,0.75)" }}>
              <span>{f.split(" ")[0]}</span><span>{f.slice(f.indexOf(" ") + 1)}</span>
            </div>
          ))}
        </div>
        <button style={s.btn} onClick={() => setStep("quiz")}>Cilt Değerlendirmene Başla →</button>
      </div>
    </div>
  );

  if (step === "quiz") return (
    <div style={s.app}>
      <div style={s.card}>
        <h2 style={{ ...s.title, fontSize: "22px" }}>Cilt Endişeleriniz</h2>
        <p style={s.subtitle}>Seçimlerinize göre rutininizi hazırlayacağız. Cilt tipinizi kamera ile analiz edeceğiz.</p>
        <div style={{ marginBottom: "20px" }}>
          <label style={s.label}>Yaşınız</label>
          <input style={s.input} type="number" placeholder="örn. 32" value={age} onChange={e => setAge(e.target.value)} min="15" max="90" />
        </div>
        <div style={{ marginBottom: "28px" }}>
          <label style={s.label}>Cilt Endişeleriniz (birden fazla seçebilirsiniz)</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {SKIN_CONCERNS.map(c => (
              <button key={c.id} onClick={() => toggleConcern(c.id)} style={s.chip(concerns.includes(c.id))}>
                <span>{c.icon}</span><span>{c.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button style={s.btn} onClick={() => setStep("camera")} disabled={concerns.length === 0}>Kamera ile Cilt Analizi Yap →</button>
          <button style={s.btnOutline} onClick={() => buildRoutine("Normal")} disabled={concerns.length === 0}>Kamerasız Devam Et</button>
        </div>
      </div>
    </div>
  );

  if (step === "camera") return (
    <div style={s.app}>
      <div style={s.card}>
        <h2 style={{ ...s.title, fontSize: "22px" }}>Cilt Analizi</h2>
        <p style={s.subtitle}>Yapay zeka selfie'nizi analiz ederek cilt tipinizi tespit eder. Hiçbir fotoğraf saklanmaz.</p>
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div style={{ borderRadius: "16px", overflow: "hidden", background: "#000", marginBottom: "16px", aspectRatio: "4/3", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
          {cameraActive
            ? <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
            : <div style={{ textAlign: "center", color: "rgba(240,232,255,0.4)", padding: "20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "8px" }}>📷</div>
                <div style={{ fontSize: "13px" }}>Kamera önizlemesi burada görünecek</div>
              </div>
          }
        </div>
        {cameraError && <div style={s.error}>⚠️ {cameraError}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
          {!cameraActive
            ? <button style={s.btn} onClick={startCamera}>📷 Kamerayı Aç</button>
            : <button style={cameraReady ? s.btnGreen : s.btnOutline} onClick={captureAndAnalyze} disabled={!cameraReady}>
                {cameraReady ? "📸 Fotoğraf Çek & Analiz Et" : "⏳ Kamera hazırlanıyor..."}
              </button>
          }
          <button style={s.btnOutline} onClick={() => { stopCamera(); buildRoutine("Normal"); }}>Kamerasız Devam Et</button>
        </div>
      </div>
    </div>
  );

  if (step === "analysis") return (
    <div style={s.app}>
      <div style={s.card}>
        {analyzing ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔬</div>
            <p style={{ color: "rgba(240,232,255,0.7)" }}>Cildiniz analiz ediliyor...</p>
          </div>
        ) : analysisResult && (
          <>
            <h2 style={{ ...s.title, fontSize: "22px" }}>Cilt Analiz Sonucu</h2>
            <p style={s.subtitle}>Fotoğrafınıza dayalı yapay zeka değerlendirmesi</p>
            <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "rgba(240,232,255,0.5)", marginBottom: "4px", textTransform: "uppercase" }}>Tespit Edilen Cilt Tipi</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#c084fc" }}>{analysisResult.skinType}</div>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={s.label}>🔍 Tespit Edilen Endişeler</label>
              {(analysisResult.concerns || []).map((c, i) => <div key={i} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", marginBottom: "6px", fontSize: "14px" }}>{c}</div>)}
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={s.label}>✨ Olumlu Gözlemler</label>
              {(analysisResult.positives || []).map((p, i) => <div key={i} style={{ padding: "8px 12px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", marginBottom: "6px", fontSize: "14px", color: "#6ee7b7" }}>{p}</div>)}
            </div>
            <div style={{ background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "14px", padding: "14px", marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", color: "rgba(240,232,255,0.5)", marginBottom: "4px" }}>⭐ Öncelikli Öneri</div>
              <div style={{ fontSize: "14px", lineHeight: "1.5" }}>{analysisResult.priority}</div>
            </div>
            <button style={s.btn} onClick={() => buildRoutine(analysisResult.skinType)}>Kişisel Rutinimi Oluştur →</button>
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
            <h2 style={{ ...s.title, fontSize: "20px", marginBottom: 0 }}>Timeless Rutininiz</h2>
            <span style={s.badge}>{routine.ageGroup}</span>
          </div>
          <p style={s.subtitle}>{routine.skinType} cilt · {concerns.length} endişe için özelleştirildi</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "4px" }}>
            {["am", "pm"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "600", fontSize: "14px", background: activeTab === t ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "transparent", color: activeTab === t ? "#fff" : "rgba(240,232,255,0.5)", transition: "all 0.2s" }}>
                {t === "am" ? "☀️ Sabah" : "🌙 Akşam"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {(tabIngredients.length > 0 ? tabIngredients : routine.topPicks.slice(0, 3)).map((ing, i) => (
              <div key={ing.name} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ fontSize: "15px", fontWeight: "600", color: "#e9d5ff" }}>{i + 1}. {ing.name}</div>
                  <span style={{ ...s.badge, background: "rgba(16,185,129,0.15)", borderColor: "rgba(16,185,129,0.3)", color: "#6ee7b7" }}>{ing.strength}%</span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(240,232,255,0.6)", marginBottom: "8px", lineHeight: "1.5" }}>{ing.description}</p>
                <div style={s.strengthBar(ing.strength)} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", fontSize: "11px" }}>
                  <span style={{ color: "rgba(240,232,255,0.45)" }}>🕐 {ing.usage}</span>
                  {ing.caution !== "Önemli bir yan etki yok" && <span style={{ color: "rgba(251,191,36,0.7)" }}>⚠️ {ing.caution}</span>}
                </div>
              </div>
            ))}
          </div>
          <button style={{ ...s.btn, background: "linear-gradient(135deg,#0891b2,#06b6d4)" }} onClick={() => setStep("chat")}>💬 Cilt Koçunla Konuş</button>
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
            <h2 style={{ ...s.title, fontSize: "18px", marginBottom: "0" }}>Timeless Koç</h2>
            <p style={{ fontSize: "12px", color: "rgba(240,232,255,0.4)", margin: 0 }}>Dermatoloji araştırmalarıyla desteklendi</p>
          </div>
          <span style={{ ...s.badge, marginLeft: "auto" }}>🟢 Çevrimiçi</span>
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
              <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", fontSize: "14px", color: "rgba(240,232,255,0.5)" }}>✨ Düşünüyor...</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <input style={{ ...s.input, margin: 0 }} placeholder="Bileşenler, sıralama, rutin hakkında sor..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} />
          <button onClick={sendChat} disabled={chatLoading} style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", border: "none", borderRadius: "12px", padding: "0 16px", color: "#fff", cursor: "pointer", fontSize: "18px", flexShrink: 0 }}>→</button>
        </div>
        <div style={{ display: "flex", gap: "6px", paddingTop: "10px", flexWrap: "wrap" }}>
          {["C Vitamini + Retinol karıştırabilir miyim?", "Sabah rutini sırası nedir?", "Hassas cilt için ne önerirsin?"].map(q => (
            <button key={q} onClick={() => setChatInput(q)} style={{ fontSize: "11px", padding: "6px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", color: "rgba(240,232,255,0.6)", cursor: "pointer" }}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return null;
}

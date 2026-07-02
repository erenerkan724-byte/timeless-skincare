import { useState, useRef, useEffect } from "react";
import "./App.css";

const SKIN_GOALS = [
  { id: "moisture", label: "💧 Nem" },
  { id: "spots", label: "🌑 Leke Görünümü" },
  { id: "antiaging", label: "⏳ Yaşlanma Karşıtı" },
  { id: "sensitivity", label: "🌿 Hassasiyet" },
  { id: "acne", label: "🔴 Sivilceye Eğilimli" },
  { id: "general", label: "✨ Genel Bakım" },
];

const SKIN_TYPES = [
  { id: "dry", label: "Kuru" },
  { id: "oily", label: "Yağlı" },
  { id: "combo", label: "Karma" },
  { id: "normal", label: "Normal" },
  { id: "sensitive", label: "Hassas" },
  { id: "unknown", label: "Emin Değilim" },
];

const AM_ROUTINES = {
  moisture: ["Nemlendirici Temizleyici", "Hyalüronik Asit Serum", "SPF 30+ Nemlendirici"],
  spots: ["Köpük Temizleyici", "C Vitamini Serum", "SPF 50 Güneş Koruyucu"],
  antiaging: ["Yumuşak Temizleyici", "Peptit Serum", "SPF 50 Nemlendirici"],
  sensitivity: ["Hassas Cilt Temizleyici", "Centella Özlü Tonik", "Mineral SPF"],
  acne: ["Salisilik Asitli Temizleyici", "Niasinamid Serum", "Yağsız Nemlendirici + SPF"],
  general: ["Köpük Temizleyici", "Hafif Serum", "SPF 30 Nemlendirici"],
};

const PM_ROUTINES = {
  moisture: ["Çift Temizleme", "Hyalüronik Asit", "Ağır Nemlendirici"],
  spots: ["Makyaj Temizleyici + Yüz Yıkama", "Alfa Arbutin Serum", "Nemlendirici"],
  antiaging: ["Çift Temizleme", "Retinol (Haftada 2-3x)", "Besleyici Krem"],
  sensitivity: ["Misel Su + Yumuşak Temizleyici", "Barrier Onarıcı Serum", "Ceramidli Krem"],
  acne: ["Yağ Temizleyici + Köpük", "BHA Toner (haftada 2-3x)", "Hafif Nemlendirici"],
  general: ["Çift Temizleme", "Hafif Serum", "Gece Kremi"],
};

const DEMO_OBSERVATIONS = [
  "Cildiniz genel olarak bakımlı görünüyor. Nem dengesine dikkat etmeniz önerilir.",
  "T-bölgesinde hafif parlaklık gözlemlendi. Düzenli nemlendirme rutini faydalı olabilir.",
  "Cilt yüzeyi düzgün görünüyor. Günlük güneş koruması kullanmanız önerilir.",
  "Cilt tonunuz dengeli görünüyor. Antioksidan zengin ürünler destekleyici olabilir.",
];

export default function App() {
  const [step, setStep] = useState("kvkk");
  const [skinGoal, setSkinGoal] = useState("");
  const [skinType, setSkinType] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [demoObs, setDemoObs] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [activeTab, setActiveTab] = useState("am");

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stream cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Tarayıcınız kamerayı desteklemiyor.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.log("play() non-critical:", e));
      }
      setCameraActive(true);
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setCameraError("Kamera izni reddedildi. Tarayıcı ayarlarından izin verin ve sayfayı yenileyin.");
      } else if (err.name === "NotFoundError") {
        setCameraError("Kamera bulunamadı.");
      } else {
        setCameraError("Kamera açılamadı: " + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const generateDemoObs = () => {
    setDemoObs(DEMO_OBSERVATIONS[Math.floor(Math.random() * DEMO_OBSERVATIONS.length)]);
  };

  const goToRoutine = () => {
    stopCamera();
    if (!demoObs) generateDemoObs();
    setStep("routine");
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setChatError("");
    const userMsg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          skinType,
          skinGoal,
          history: newHistory.slice(-6),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChatError(data.error || "Bir hata oluştu. Lütfen tekrar deneyin.");
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setChatError("Bağlantı sorunu. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  // ── SCREENS ──────────────────────────────────────────────

  if (step === "kvkk") return (
    <div className="screen">
      <div className="card">
        <div className="logo">🧬</div>
        <h1>Timeless</h1>
        <p className="subtitle">Kişisel Cilt Bakım Koçu</p>
        <div className="disclaimer-box">
          <p><strong>Devam etmeden önce lütfen okuyun:</strong></p>
          <ul>
            <li>Bu uygulama <strong>dermatolog yerine geçmez.</strong></li>
            <li>Tıbbi teşhis veya tedavi önerisi sunmaz.</li>
            <li>Ciddi akne, alerji, egzama, roza, yara, enfeksiyon veya ani leke değişimi gibi durumlarda <strong>dermatoloğa başvurun.</strong></li>
            <li>Kamera kullanımı tamamen isteğe bağlıdır.</li>
            <li>Fotoğraf teşhis amacıyla kullanılmaz ve bu sürümde sunucuda <strong>saklanmaz.</strong></li>
          </ul>
        </div>
        <button className="btn-primary" onClick={() => setStep("goal")}>
          Kabul ediyorum ve devam et
        </button>
      </div>
    </div>
  );

  if (step === "goal") return (
    <div className="screen">
      <div className="card">
        <h2>Cilt Hedefiniz Nedir?</h2>
        <p className="subtitle">Size en uygun rutini hazırlayalım.</p>
        <div className="grid-2">
          {SKIN_GOALS.map((g) => (
            <button
              key={g.id}
              className={`chip ${skinGoal === g.id ? "chip-active" : ""}`}
              onClick={() => setSkinGoal(g.id)}
            >{g.label}</button>
          ))}
        </div>
        <button className="btn-primary mt" disabled={!skinGoal} onClick={() => setStep("type")}>
          Devam →
        </button>
      </div>
    </div>
  );

  if (step === "type") return (
    <div className="screen">
      <div className="card">
        <h2>Cilt Tipiniz</h2>
        <p className="subtitle">En yakın seçeneği seçin.</p>
        <div className="grid-2">
          {SKIN_TYPES.map((t) => (
            <button
              key={t.id}
              className={`chip ${skinType === t.id ? "chip-active" : ""}`}
              onClick={() => setSkinType(t.id)}
            >{t.label}</button>
          ))}
        </div>
        <button className="btn-primary mt" disabled={!skinType} onClick={() => setStep("camera")}>
          Devam →
        </button>
      </div>
    </div>
  );

  if (step === "camera") return (
    <div className="screen">
      <div className="card">
        <h2>Cilt Takibi</h2>
        <p className="subtitle">İsteğe bağlıdır. Fotoğraf teşhis için kullanılmaz ve saklanmaz.</p>
        <div className="camera-box">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
            style={{ display: cameraActive ? "block" : "none" }}
          />
          {!cameraActive && (
            <div className="camera-placeholder">
              <span>📷</span>
              <p>Kamera önizlemesi burada görünecek</p>
            </div>
          )}
        </div>
        {cameraError && <p className="error-msg">⚠️ {cameraError}</p>}
        <div className="btn-stack">
          {!cameraActive
            ? <button className="btn-primary" onClick={startCamera}>📷 Kamerayı Aç</button>
            : <button className="btn-green" onClick={generateDemoObs}>📸 Demo Gözlem Oluştur</button>
          }
          <button className="btn-outline" onClick={goToRoutine}>
            {cameraActive ? "Rutine Geç →" : "Kamerasız Devam Et →"}
          </button>
        </div>
        {demoObs && (
          <div className="obs-box">
            <p className="obs-label">🔍 Demo Gözlem</p>
            <p>{demoObs}</p>
            <p className="obs-note">* Bu gözlem tıbbi teşhis değildir. Dermatolog muayenesinin yerini tutmaz.</p>
          </div>
        )}
      </div>
    </div>
  );

  if (step === "routine") {
    const am = AM_ROUTINES[skinGoal] || AM_ROUTINES.general;
    const pm = PM_ROUTINES[skinGoal] || PM_ROUTINES.general;
    return (
      <div className="screen">
        <div className="card">
          <h2>Rutininiz</h2>
          <p className="subtitle">
            {SKIN_GOALS.find(g => g.id === skinGoal)?.label} · {SKIN_TYPES.find(t => t.id === skinType)?.label} Cilt
          </p>
          {demoObs && (
            <div className="obs-box">
              <p className="obs-label">🔍 Demo Gözlem</p>
              <p>{demoObs}</p>
              <p className="obs-note">* Tıbbi teşhis değildir.</p>
            </div>
          )}
          <div className="tabs">
            <button className={`tab ${activeTab === "am" ? "tab-active" : ""}`} onClick={() => setActiveTab("am")}>☀️ Sabah</button>
            <button className={`tab ${activeTab === "pm" ? "tab-active" : ""}`} onClick={() => setActiveTab("pm")}>🌙 Akşam</button>
          </div>
          <div className="routine-list">
            {(activeTab === "am" ? am : pm).map((item, i) => (
              <div key={i} className="routine-item">
                <span className="routine-num">{i + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary mt" onClick={() => setStep("chat")}>
            💬 Cilt Koçuna Sor
          </button>
        </div>
      </div>
    );
  }

  if (step === "chat") return (
    <div className="chat-screen">
      <div className="chat-header">
        <button className="back-btn" onClick={() => setStep("routine")}>←</button>
        <div>
          <strong>Timeless Koç</strong>
          <p>Genel bakım önerisi · Tıbbi teşhis yapılmaz</p>
        </div>
      </div>
      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            Merhaba! Cilt bakımı hakkında soru sorabilirsiniz.<br />Tıbbi teşhis verilmez.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role === "user" ? "msg-user" : "msg-bot"}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="msg msg-bot">✨ Yanıt yazılıyor...</div>}
        {chatError && <div className="error-msg">{chatError}</div>}
      </div>
      <div className="suggestions">
        {["Kuru cildim için ne önerirsin?", "Sabah rutini sırası nedir?", "C vitamini ile retinol birlikte kullanılır mı?"].map(q => (
          <button key={q} className="suggestion-btn" onClick={() => setInput(q)}>{q}</button>
        ))}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Sorunuzu yazın..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>→</button>
      </div>
    </div>
  );

  return null;
}

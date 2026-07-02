export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is not set");
    return res.status(500).json({ error: "Servis şu an kullanılamıyor. Lütfen daha sonra tekrar deneyin." });
  }

  const { message, skinType, skinGoal, history = [] } = req.body || {};

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Mesaj boş olamaz." });
  }

  const systemPrompt = `Sen Timeless adlı bir cilt bakım koçusun. Türkçe cevap ver.

KURALLARIN:
- Dermatolog gibi tıbbi teşhis koyma.
- Hastalık adı söyleme veya tedavi önerme.
- Genel, güvenli cilt bakım rutini öner.
- Ciddi durumlarda (akne kistleri, egzama, roza, yara, ani leke değişimi) dermatoloğa yönlendir.
- Kullanıcıyı gereksiz ürün almaya yönlendirme.
- Basit, uygulanabilir, güvenli öneriler ver.
- Cevabın 150 kelimeyi geçmesin.
- Her cevabın sonunda tek bir pratik ipucu ver.

Kullanıcı profili:
- Cilt hedefi: ${skinGoal || "belirtilmedi"}
- Cilt tipi: ${skinType || "belirtilmedi"}`;

  // Build clean message array for Anthropic API
  // Must start with user, no consecutive same roles
  const rawMessages = Array.isArray(history) ? history : [];
  const apiMessages = [];

  for (const msg of rawMessages) {
    if (msg.role !== "user" && msg.role !== "assistant") continue;
    if (apiMessages.length === 0 && msg.role === "assistant") continue; // skip leading assistant
    if (apiMessages.length > 0 && apiMessages[apiMessages.length - 1].role === msg.role) continue; // skip consecutive
    apiMessages.push({ role: msg.role, content: String(msg.content || "") });
  }

  // Ensure last message is user
  if (apiMessages.length === 0 || apiMessages[apiMessages.length - 1].role !== "user") {
    apiMessages.push({ role: "user", content: message.trim() });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: apiMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, data);
      return res.status(500).json({ error: "Şu an cevap veremiyorum. Lütfen tekrar deneyin." });
    }

    const reply = data.content?.find((b) => b.type === "text")?.text || "Bir cevap oluşturulamadı.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Sunucu hatası. Lütfen tekrar deneyin." });
  }
}

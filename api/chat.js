export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).json({ ok: true });
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Timeless chat API is running. Use POST.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "ANTHROPIC_API_KEY is not set.",
      });
    }

    let body = req.body;

    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const {
      message,
      skinType = "Belirtilmedi",
      skinGoal = "Genel bakım",
      history = [],
    } = body || {};

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Mesaj boş olamaz.",
      });
    }

    const safeHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .filter((item) => item && item.role && item.content)
          .map((item) => ({
            role: item.role === "assistant" ? "assistant" : "user",
            content: String(item.content).slice(0, 1000),
          }))
      : [];

    const systemPrompt = `
Sen Timeless adlı Türkçe bir cilt bakım koçusun.

Kurallar:
- Dermatolog gibi tıbbi teşhis koyma.
- Hastalık adı söyleme veya tedavi önermeye çalışma.
- Akne, egzama, roza, enfeksiyon, yara, ani leke değişimi, alerjik reaksiyon gibi ciddi durumlarda dermatoloğa yönlendir.
- Kullanıcıyı gereksiz ürün almaya yönlendirme.
- Basit, güvenli, uygulanabilir bakım önerileri ver.
- Cevabın Türkçe olsun.
- Cevabın kısa, net ve pratik olsun.
- Bu uygulamanın dermatolog yerine geçmediğini gerektiğinde hatırlat.
- Fotoğraf veya kamera üzerinden teşhis iddiasında bulunma.

Kullanıcının seçtiği bilgiler:
Cilt tipi: ${skinType}
Cilt hedefi: ${skinGoal}
`;

    const anthropicPayload = {
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 600,
      temperature: 0.4,
      system: systemPrompt,
      messages: [
        ...safeHistory,
        {
          role: "user",
          content: message.trim(),
        },
      ],
    };

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(anthropicPayload),
    });

    const responseText = await anthropicResponse.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }

    if (!anthropicResponse.ok) {
      console.error("Anthropic API error:", {
        status: anthropicResponse.status,
        body: responseText,
      });

      return res.status(anthropicResponse.status).json({
        ok: false,
        error: "AI servisi şu anda cevap veremiyor. Lütfen biraz sonra tekrar deneyin.",
        detail: data?.error?.message || responseText || "Unknown Anthropic error",
      });
    }

    const reply =
      data?.content
        ?.map((item) => item?.text)
        .filter(Boolean)
        .join("\n")
        .trim() ||
      "Şu anda yanıt oluşturamadım. Lütfen sorunuzu biraz daha kısa ve net şekilde tekrar yazın.";

    return res.status(200).json({
      ok: true,
      reply,
    });
  } catch (error) {
    console.error("Timeless chat API fatal error:", error);

    return res.status(500).json({
      ok: false,
      error: "Bağlantı sorunu. Lütfen tekrar deneyin.",
    });
  }
}

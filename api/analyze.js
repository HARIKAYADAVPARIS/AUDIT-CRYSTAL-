export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API Key Missing" });

  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // EXTRACTION LOGIC: We pull the text out HERE so the frontend is simple
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "The AI was unable to generate a response. Please check your safety settings in Google AI Studio.";

    return res.status(200).json({ result: aiText });
  } catch (error) {
    return res.status(500).json({ error: "Audit Engine Error" });
  }
}

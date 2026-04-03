import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // ✅ keep secret in Vercel env
});

export default async function handler(req, res) {
  // ---- CORS headers ----
  res.setHeader("Access-Control-Allow-Origin", "https://wombizombi.github.io"); // your GitHub Pages URL
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Missing question" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: `Explain "${question}" briefly for a flashcard.` },
      ],
    });

    res.status(200).json({ explanation: completion.choices[0].message.content });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "OpenAI request failed" });
  }
}
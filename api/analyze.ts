
import { GoogleGenerativeAI } from "@google/genai";

export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { fileBase64, mimeType } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContentStream([
      { inlineData: { data: fileBase64, mimeType: mimeType } },
      { text: "Perform a high-fidelity CSRD audit. Output in a professional audit-log style." }
    ]);

    const encoder = new TextEncoder();
    return new Response(new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          controller.enqueue(encoder.encode(chunk.text()));
        }
        controller.close();
      }
    }), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Audit engine offline" }), { status: 500 });
  }
}


    import { GoogleGenerativeAI } from "@google/genai";

export const config = {
  runtime: 'edge', // This is essential for real-time streaming
};

export default async function handler(req) {
  try {
    const { fileBase64, mimeType } = await req.json();
    
    // Safety check for your environment variable
    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "API Key Missing" }), { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContentStream([
      { inlineData: { data: fileBase64, mimeType: mimeType } },
      { text: "Perform a high-fidelity CSRD audit. Output in a professional audit-log style." },
    ]);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          controller.enqueue(encoder.encode(chunk.text()));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Audit Engine Offline" }), { status: 500 });
  }
}

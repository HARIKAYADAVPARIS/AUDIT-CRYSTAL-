import { GoogleGenerativeAI } from "@google/genai";

export const config = {
  runtime: 'edge', // Edge runtime is required for real-time streaming
};

export default async function handler(req: Request) {
  try {
    const { fileBase64, mimeType } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "API Key Missing" }), { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Initiate the streaming analysis
    const result = await model.generateContentStream([
      {
        inlineData: {
          data: fileBase64,
          mimeType: mimeType
        }
      },
      { text: "Perform a high-fidelity CSRD audit against ESRS 1-12. Be deterministic. Identify specific gaps and provide board-level remediation drafts. Output in a professional audit-log style." },
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
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

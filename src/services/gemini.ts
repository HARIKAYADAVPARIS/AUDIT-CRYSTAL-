export const analyzeDocument = async (
  fileBase64: string | null,
  mimeType: string | null,
  textInput: string | null,
  onChunk: (chunk: string) => void
) => {
  // If no file, we skip the stream for now or handle text
  if (!fileBase64) return null;

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileBase64, mimeType }),
  });

  if (!response.ok) throw new Error("Audit Protocol failed to initialize.");

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    const chunk = decoder.decode(value);
    onChunk(chunk); // This feeds your AnalysisTerminal component
  }

  // Final parsing logic for the AuditResult object can go here
  // For now, this drives the real-time visual scan
};

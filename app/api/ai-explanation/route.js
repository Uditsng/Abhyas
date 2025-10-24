import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { question, correctAnswer, options } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); //update the model name with new one

    const prompt = `
You are an expert teacher explaining multiple-choice questions to students.
Provide a clear and structured explanation in the following format:

**Step 1: Restate the question in simple terms**
[your explanation here]

**Step 2: Analyze the options**
[go through each option briefly]

**Step 3: Why the correct answer is correct**
[explain reasoning]

**Step 4: Why the wrong answers are wrong**
[briefly explain]

**Final Tip:**
[give a quick study tip or trick to remember this concept]

Question: ${question}
Correct Answer: ${correctAnswer}
Options: ${options}
`;

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    // Convert Gemini's stream into a Node ReadableStream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          console.error("Streaming error:", err);
          controller.enqueue(encoder.encode("\n[Error streaming AI response]"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("AI explanation error:", err);
    return new Response("Failed to generate explanation", { status: 500 });
  }
}

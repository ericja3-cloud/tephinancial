import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

async function run() {
  const google = createGoogleGenerativeAI({ apiKey: "fake-key" });
  const model = google("gemini-1.5-flash");

  try {
    const { object } = await generateObject({
      model,
      schema: z.object({ value: z.string() }),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Test" },
            { type: "file", data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", mimeType: "image/png" }
          ]
        }
      ]
    });
  } catch (err) {
    console.log("file with mimeType:", err.message);
  }
}
run();

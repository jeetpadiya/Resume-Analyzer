import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY?.trim();
async function test() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    console.log("AVAILABLE MODELS:", data.models.map(m => m.name).filter(n => n.includes("gemini")).join(", "));
  } else {
    console.log("ERROR:", data);
  }
}
test();

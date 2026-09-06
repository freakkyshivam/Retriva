import Groq from "groq-sdk";
import "dotenv/config";
import { LIMITS } from "./limits.js";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
  timeout: LIMITS.LLM_TIMEOUT_MS,
  maxRetries: 1,
});

export const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";


import Product from "../models/productModel.js";
import express from "express";
import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  Type,
} from "@google/genai";

const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Primary model, then fallbacks tried in order if the primary is overloaded
// or unavailable. Keep this list to *currently GA* models — check
// https://ai.google.dev/gemini-api/docs/models before changing it.
const GEMINI_MODELS = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];

// Your real categories — keep this as the single source of truth.
const CATEGORIES = ["sofas", "beds", "stools", "dining", "wardrobes", "doors"];

// ── Retry helper — Gemini can fail two different ways:
//  - 503/429: transient, worth retrying the SAME model with backoff.
//  - 404: model doesn't exist / was retired — retrying is pointless,
//    move straight to the next model in GEMINI_MODELS instead.
// Anything else (400/401/403 etc.) is a real problem — abort immediately.
function isRetryable(err) {
  const status = err?.status ?? err?.error?.code;
  return status === 503 || status === 429;
}

function isModelUnavailable(err) {
  const status = err?.status ?? err?.error?.code;
  return status === 404;
}

async function generateContentWithRetry(paramsWithoutModel, maxRetriesPerModel = 2) {
  let lastErr;
  for (const model of GEMINI_MODELS) {
    let attempt = 0;
    while (attempt <= maxRetriesPerModel) {
      try {
        return await ai.models.generateContent({ ...paramsWithoutModel, model });
      } catch (err) {
        lastErr = err;

        if (isModelUnavailable(err)) break; // skip retries, go to next model

        if (!isRetryable(err)) throw err; // real error — abort entirely

        attempt++;
        if (attempt <= maxRetriesPerModel) {
          const delayMs = 500 * 2 ** (attempt - 1) + Math.random() * 250;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
    // exhausted retries (or model unavailable) — fall through to the next model
  }
  throw lastErr;
}

const SYSTEM_PROMPT = `You are a helpful customer assistant for Luxura, a premium furniture store in Nairobi, Kenya.

You have access to tools that query the real product database. Always call the appropriate tool before answering any product-related question. Never guess prices, stock levels, or product availability — only use data returned by the tools.

Guidelines:
- When asked about a furniture category (${CATEGORIES.join(", ")}), call search_products_by_category with the matching category.
- When asked for recommendations, popular items, or deals, call get_featured_products or get_recommendations.
- Present prices and stock exactly as returned by the tools.
- If a product is out of stock, mention they can place a custom order via the Make Order page or contact the team on WhatsApp.
- Keep replies concise — 2 to 4 sentences max. List products clearly when showing results.
- Payment options: M-Pesa, Card (Stripe), Cash on Delivery.
- Delivery: 3–7 business days within Nairobi, longer for upcountry.
- If the customer has a complaint, wants to negotiate price, or has a complex custom request you cannot resolve, tell them to click "Chat with our team" in the chat widget.
- If no products match, say so politely rather than inventing anything.`;

// ── Tool declarations (what Gemini is allowed to call) ─────────────────────
const tools = [
  {
    functionDeclarations: [
      {
        name: "search_products_by_category",
        description:
          "Search Luxura's product database for items in a specific furniture category.",
        parametersJsonSchema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: CATEGORIES,
              description: "The furniture category to search for.",
            },
          },
          required: ["category"],
        },
      },
      {
        name: "get_featured_products",
        description: "Get Luxura's currently featured/popular products.",
        parametersJsonSchema: { type: "object", properties: {} },
      },
      {
        name: "get_recommendations",
        description: "Get the newest/most recently added products as recommendations.",
        parametersJsonSchema: { type: "object", properties: {} },
      },
    ],
  },
];

// ── Tool execution — hits your real product routes ─────────────────────────
function formatProduct(p) {
  return {
    id: p._id.toString(),
    name: p.name,
    price: `KES ${p.price.toLocaleString()}`,
    stock: p.stock > 0 ? `${p.stock} in stock` : "Out of stock",
    ...(p.description ? { description: p.description } : {}),
  };
}

async function searchProductsByCategory(category) {
  if (!CATEGORIES.includes(category)) {
    return { error: `Unknown category "${category}"` };
  }
  const products = await Product.find({
    category: new RegExp(`^${category}$`, "i"),
  }).limit(5);
  return { products: products.map(formatProduct) };
}

async function getFeaturedProducts() {
  const products = await Product.find({ isFeatured: true }).limit(5);
  return { products: products.map(formatProduct) };
}

async function getRecommendations() {
  const products = await Product.find().sort({ createdAt: -1 }).limit(4);
  return { products: products.map(formatProduct) };
}

// Dispatch table so the loop below doesn't need a big switch statement
const FUNCTIONS = {
  search_products_by_category: (args) =>
    searchProductsByCategory(args.category),
  get_featured_products: () => getFeaturedProducts(),
  get_recommendations: () => getRecommendations(),
};

// ── Helpers ──────────────────────────────────────────────────────────────
function toGeminiContents(messages) {
  return messages
    .filter((m) => typeof m?.content === "string" && m.content.trim() !== "")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

// ── POST /api/chatbot/chat ──────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const lastMessage = messages[messages.length - 1];
    const latest =
      typeof lastMessage?.content === "string"
        ? lastMessage.content.toLowerCase().trim()
        : "";

    // Cheap shortcut — skip the API call entirely for a bare greeting
    if (["hi", "hello", "hey"].includes(latest)) {
      return res.json({
        reply: "Hello! 👋 Welcome to Luxura Furniture. How can I help you today?",
      });
    }

    let contents = toGeminiContents(messages);
    if (contents.length === 0) {
      return res.status(400).json({ error: "no valid messages found" });
    }

    const baseConfig = {
      systemInstruction: SYSTEM_PROMPT,
      tools,
      toolConfig: {
        functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO },
      },
    };

    // First call — Gemini decides whether/what to call
    let response = await generateContentWithRetry({
      contents,
      config: baseConfig,
    });

    // Handle rounds of function calling (loop again if the model chains calls)
    let guard = 0;
    while (response.functionCalls?.length && guard < 3) {
      guard++;

      // Gemini 3 attaches a thought_signature to function-call parts, and it
      // must be echoed back exactly as received or the next call 400s.
      // So we replay the model's own response content verbatim rather than
      // rebuilding a functionCall part by hand from response.functionCalls.
      const modelContent = response.candidates[0].content;

      // The model may request several functions in parallel in one response —
      // run each one and return all results together as the next turn.
      const functionResponseParts = await Promise.all(
        response.functionCalls.map(async (call) => {
          const handler = FUNCTIONS[call.name];
          const result = handler
            ? await handler(call.args || {})
            : { error: `Unknown function "${call.name}"` };
          return {
            functionResponse: {
              name: call.name,
              response: result,
            },
          };
        })
      );

      contents = [
        ...contents,
        modelContent, // original model turn, thought_signature intact
        { role: "user", parts: functionResponseParts },
      ];

      response = await generateContentWithRetry({
        contents,
        config: baseConfig,
      });
    }

    return res.json({ reply: response.text });
  } catch (err) {
    console.error(err);

    if (isRetryable(err)) {
      return res.status(503).json({
        error:
          "Our assistant is a bit busy right now — please try again in a moment, or use the WhatsApp chat widget.",
      });
    }

    return res.status(500).json({ error: err.message });
  }
});

export default router;
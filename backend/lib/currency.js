import { redis } from "./redis.js";

const CACHE_KEY = "usd_kes_rate";
const CACHE_TTL_SECONDS = 60 * 60 * 12; // 12 hours
const FALLBACK_RATE = 130; // used only if API + cache both fail

export const getUsdToKesRate = async () => {
  try {
    // 1. Check Redis cache first
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return Number(cached);
    }

    // 2. Fetch fresh rate from free API
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error(`Exchange rate API returned ${res.status}`);

    const data = await res.json();
    const rate = data?.rates?.KES;

    if (!rate || typeof rate !== "number") {
      throw new Error("KES rate missing from API response");
    }

    // 3. Cache it
    await redis.set(CACHE_KEY, rate, "EX", CACHE_TTL_SECONDS);

    return rate;
  } catch (error) {
    console.error("Error fetching USD→KES rate, using fallback:", error.message);
    return FALLBACK_RATE;
  }
};

export const kesToUsd = async (kesAmount) => {
  const rate = await getUsdToKesRate(); // 1 USD = `rate` KES
  return kesAmount / rate;
};
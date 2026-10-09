// api/rates.js
// Private proxy for the exchange-rate upstream.
// The REAL upstream URL lives ONLY in the environment variable UPSTREAM_RATES_URL.
// It is never sent to the browser.

const CREATOR = "Aritra Nath";
const INSTAGRAM = "@its_aritra_nath";

export default async function handler(req, res) {
  /* ---------- CORS (so any website's browser JS can call this) ---------- */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  /* ---------- NEVER cache (auth-dependent response) ---------- */
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Vary", "x-api-key");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "GET") {
    return res.status(405).json({
      result: "error",
      error: "Method not allowed. Use GET.",
      creator: CREATOR,
      instagram: INSTAGRAM,
    });
  }

  /* ---------- 1. Auth: verify the private API key ---------- */
  const providedKey =
    req.headers["x-api-key"] || (req.query && req.query.key) || "";

  const realKey = process.env.API_KEY;

  if (!realKey) {
    return res.status(500).json({
      result: "error",
      error: "Server misconfigured: API_KEY env variable is missing.",
      creator: CREATOR,
      instagram: INSTAGRAM,
    });
  }

  if (providedKey !== realKey) {
    return res.status(401).json({
      result: "error",
      error: "Unauthorized. Invalid or missing API key.",
      creator: CREATOR,
      instagram: INSTAGRAM,
    });
  }

  /* ---------- 2. Build the HIDDEN upstream URL ---------- */
  const upstreamBase = process.env.UPSTREAM_RATES_URL;

  if (!upstreamBase) {
    return res.status(500).json({
      result: "error",
      error: "Server misconfigured: UPSTREAM_RATES_URL env variable is missing.",
      creator: CREATOR,
      instagram: INSTAGRAM,
    });
  }

  let upstreamUrl = upstreamBase;
  const base = String(req.query.base || "").toUpperCase();
  if (/^[A-Z]{3}$/.test(base)) {
    upstreamUrl = upstreamBase.replace(/\/[^/]+$/, "/" + base);
  }

  /* ---------- 3. Fetch upstream (browser never sees it) ---------- */
  try {
    const upstreamRes = await fetch(upstreamUrl, {
      headers: { Accept: "application/json" },
    });

    if (!upstreamRes.ok) {
      return res.status(502).json({
        result: "error",
        error: `Upstream service responded with HTTP ${upstreamRes.status}.`,
        creator: CREATOR,
        instagram: INSTAGRAM,
      });
    }

    const data = await upstreamRes.json();

    /* ---------- 4. Clean public response (upstream identity stripped) ---------- */
    return res.status(200).json({
      result: "success",
      creator: CREATOR,
      instagram: INSTAGRAM,
      base_code: data.base_code,
      last_updated_utc: data.time_last_update_utc,
      next_update_utc: data.time_next_update_utc,
      rates: data.rates,
    });
  } catch (err) {
    return res.status(502).json({
      result: "error",
      error: "Failed to reach the upstream service.",
      creator: CREATOR,
      instagram: INSTAGRAM,
    });
  }
}

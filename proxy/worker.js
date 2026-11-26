// Zwischenserver für den Spritfinder.
// Hält den Tankerkönig Schlüssel geheim (Secret TK_KEY) und speichert Antworten kurz zwischen,
// damit mehrere Nutzer in derselben Gegend nur eine Abfrage auslösen.

const API = "https://creativecommons.tankerkoenig.de/json/list.php";
const RADIUS_KM = 25;
const CACHE_SECONDS = 300;
const ALLOWED_ORIGINS = ["https://novasyntax811.github.io", "http://localhost:8977", "http://127.0.0.1:8977"];

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "GET") return json({ ok: false, message: "Nur GET erlaubt" }, 405, cors);

    const url = new URL(request.url);
    const lat = Number(url.searchParams.get("lat"));
    const lng = Number(url.searchParams.get("lng"));
    // Nur Deutschland, auf etwa 1 km gerundet: gleiche Gegend, gleicher Cache Eintrag.
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 47 || lat > 55.2 || lng < 5.5 || lng > 15.5) {
      return json({ ok: false, message: "Standort liegt nicht in Deutschland" }, 400, cors);
    }
    const rLat = lat.toFixed(2), rLng = lng.toFixed(2);

    const cache = caches.default;
    const cacheKey = new Request(`https://spritfinder-cache.invalid/${rLat}/${rLng}`);
    const hit = await cache.match(cacheKey);
    if (hit) return new Response(hit.body, { status: 200, headers: { ...Object.fromEntries(hit.headers), ...cors } });

    if (!env.TK_KEY) return json({ ok: false, message: "Schlüssel fehlt auf dem Server" }, 500, cors);
    let data;
    try {
      const res = await fetch(`${API}?lat=${rLat}&lng=${rLng}&rad=${RADIUS_KM}&sort=dist&type=all&apikey=${env.TK_KEY}`);
      data = await res.json();
    } catch {
      return json({ ok: false, message: "Tankerkönig ist gerade nicht erreichbar" }, 502, cors);
    }
    if (!data || data.ok !== true) {
      return json({ ok: false, message: (data && data.message) || "Tankerkönig hat einen Fehler gemeldet" }, 502, cors);
    }

    const body = JSON.stringify({ ok: true, fetchedAt: Date.now(), license: data.license, stations: data.stations || [] });
    const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=${CACHE_SECONDS}` };
    ctx.waitUntil(cache.put(cacheKey, new Response(body, { headers })));
    return new Response(body, { status: 200, headers: { ...headers, ...cors } });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors } });
}

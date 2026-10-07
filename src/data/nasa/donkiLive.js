// Live NASA DONKI lookup. Runs in the browser when the game is hosted (e.g. Vercel).
// Falls back silently to the saved records in donki_events.json if offline or blocked.
const KEY = (import.meta.env && import.meta.env.VITE_NASA_API_KEY) || 'DEMO_KEY';
const BASE = 'https://api.nasa.gov/DONKI';

const iso = (d) => d.toISOString().slice(0, 10);

async function getJSON(url, ms = 7000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

// Returns flares from the last `months` months that DONKI linked to a solar energetic particle event.
export async function fetchLiveDonkiEvents(months = 18) {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - months);
  const range = `startDate=${iso(start)}&endDate=${iso(end)}&api_key=${KEY}`;
  const [flares, seps] = await Promise.all([
    getJSON(`${BASE}/FLR?${range}`),
    getJSON(`${BASE}/SEP?${range}`).catch(() => []),
  ]);
  const sepById = new Map((Array.isArray(seps) ? seps : []).map((s) => [s.sepID, s]));
  return (Array.isArray(flares) ? flares : [])
    .filter((f) => f.classType && (f.linkedEvents || []).some((l) => /-SEP-/.test(l.activityID)))
    .map((f) => ({
      id: f.flrID,
      begin: f.beginTime, peak: f.peakTime || f.beginTime, end: f.endTime,
      classType: f.classType, sourceLocation: f.sourceLocation, activeRegion: f.activeRegionNum,
      seps: f.linkedEvents
        .filter((l) => /-SEP-/.test(l.activityID))
        .map((l) => {
          const s = sepById.get(l.activityID);
          return { id: l.activityID, instrument: s?.instruments?.map((i) => i.displayName).join(', ') || '' };
        }),
      url: f.link,
      live: true,
    }))
    .reverse(); // newest first
}

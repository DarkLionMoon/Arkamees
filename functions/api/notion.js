/**
 * ARCAMIS — Cloudflare Worker
 * Proxy per Notion API
 *
 * Deploy:
 *   wrangler deploy
 *
 * Variabili d'ambiente (Dashboard → Workers → Settings → Variables):
 *   NOTION_TOKEN  — Integration token (secret: Bearer xxx)
 *
 * Rotte supportate:
 *   GET  /api/notion/page/:pageId
 *   GET  /api/notion/blocks/:blockId/children?start_cursor=&page_size=
 *   GET  /api/notion/databases/:dbId/query  (redirect a POST)
 *   POST /api/notion/databases/:dbId/query
 */

const NOTION_VERSION = '2022-06-28';
const NOTION_BASE    = 'https://api.notion.com/v1';

/* ── CORS ── */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function error(msg, status = 400) {
  return json({ error: msg }, status);
}

/* ── Notion fetch helper ── */
async function notionFetch(env, path, options = {}) {
  const url = `${NOTION_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization':  `Bearer ${env.NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type':   'application/json',
      ...(options.headers ?? {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

/* ── Route parser ── */
function parseRoute(url) {
  const { pathname, searchParams } = new URL(url);
  // Strip leading /api/notion
  const path = pathname.replace(/^\/?api\/notion/, '').replace(/^\//, '');
  const parts = path.split('/').filter(Boolean);
  return { parts, searchParams };
}

/* ── Main handler ── */
export default {
  async fetch(request, env) {
    /* Preflight */
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      const { parts, searchParams } = parseRoute(request.url);

      /* GET /api/notion/page/:pageId */
      if (parts[0] === 'page' && parts[1]) {
        const data = await notionFetch(env, `/pages/${parts[1]}`);
        return json(data);
      }

      /* GET /api/notion/blocks/:blockId/children */
      if (parts[0] === 'blocks' && parts[1] && parts[2] === 'children') {
        const qs = new URLSearchParams();
        if (searchParams.get('start_cursor')) qs.set('start_cursor', searchParams.get('start_cursor'));
        if (searchParams.get('page_size'))    qs.set('page_size',    searchParams.get('page_size'));
        const data = await notionFetch(env, `/blocks/${parts[1]}/children?${qs}`);
        return json(data);
      }

      /* GET|POST /api/notion/databases/:dbId/query */
      if (parts[0] === 'databases' && parts[1] && parts[2] === 'query') {
        let body = {};
        if (request.method === 'POST') {
          try { body = await request.json(); } catch { /* empty body ok */ }
        }
        const data = await notionFetch(env, `/databases/${parts[1]}/query`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return json(data);
      }

      /* GET /api/notion/search — ricerca full-text */
      if (parts[0] === 'search') {
        let body = {};
        if (request.method === 'POST') {
          try { body = await request.json(); } catch { /* empty body ok */ }
        } else {
          const q = searchParams.get('query');
          if (q) body.query = q;
        }
        const data = await notionFetch(env, '/search', {
          method: 'POST',
          body: JSON.stringify(body),
        });
        return json(data);
      }

      return error('Route non trovata', 404);

    } catch (err) {
      console.error('Notion proxy error:', err);
      const status = err?.status ?? 500;
      const msg    = err?.data?.message ?? 'Errore interno';
      return error(msg, status);
    }
  },
};

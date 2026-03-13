/**
 * ARCAMIS — Cloudflare Pages Function
 * Proxy per Notion API
 *
 * Rotte supportate (tutte sotto /api/notion/*):
 *   GET  /api/notion/page/:pageId
 *   GET  /api/notion/blocks/:blockId/children?start_cursor=&page_size=
 *   GET  /api/notion/databases/:dbId/query
 *   POST /api/notion/databases/:dbId/query
 *   GET  /api/notion/search?query=
 *   POST /api/notion/search
 *
 * Variabile d'ambiente richiesta:
 *   NOTION_TOKEN — da impostare in:
 *   Dashboard Cloudflare → Pages → arkamees → Settings → Environment Variables
 */

const NOTION_VERSION = '2022-06-28';
const NOTION_BASE    = 'https://api.notion.com/v1';

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

async function notionFetch(token, path, options = {}) {
  const url = `${NOTION_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization':  `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type':   'application/json',
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data;
}

function parseRoute(url) {
  const { pathname, searchParams } = new URL(url);
  // Estrae la parte dopo /api/notion
  const path  = pathname.replace(/^\/?api\/notion\/?/, '');
  const parts = path.split('/').filter(Boolean);
  return { parts, searchParams };
}

/* ── Entry point Pages Functions ── */
export async function onRequest(context) {
  const { request, env } = context;

  /* Preflight CORS */
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const token = env.NOTION_TOKEN;
  if (!token) {
    return error('NOTION_TOKEN non configurato', 500);
  }

  try {
    const { parts, searchParams } = parseRoute(request.url);

    /* GET /api/notion/page/:pageId */
    if (parts[0] === 'page' && parts[1]) {
      const data = await notionFetch(token, `/pages/${parts[1]}`);
      return json(data);
    }

    /* GET /api/notion/blocks/:blockId/children */
    if (parts[0] === 'blocks' && parts[1] && parts[2] === 'children') {
      const qs = new URLSearchParams();
      if (searchParams.get('start_cursor')) qs.set('start_cursor', searchParams.get('start_cursor'));
      if (searchParams.get('page_size'))    qs.set('page_size',    searchParams.get('page_size'));
      const data = await notionFetch(token, `/blocks/${parts[1]}/children?${qs}`);
      return json(data);
    }

    /* GET|POST /api/notion/databases/:dbId/query */
    if (parts[0] === 'databases' && parts[1] && parts[2] === 'query') {
      let body = {};
      if (request.method === 'POST') {
        try { body = await request.json(); } catch { /* body vuoto ok */ }
      }
      const data = await notionFetch(token, `/databases/${parts[1]}/query`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return json(data);
    }

    /* GET|POST /api/notion/search */
    if (parts[0] === 'search') {
      let body = {};
      if (request.method === 'POST') {
        try { body = await request.json(); } catch { /* body vuoto ok */ }
      } else {
        const q = searchParams.get('query');
        if (q) body.query = q;
      }
      const data = await notionFetch(token, '/search', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return json(data);
    }

    return error('Route non trovata', 404);

  } catch (err) {
    console.error('Notion proxy error:', err);
    const status = err?.status ?? 500;
    const msg    = err?.data?.message ?? 'Errore interno del proxy';
    return error(msg, status);
  }
}

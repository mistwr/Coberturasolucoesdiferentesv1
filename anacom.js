// api/anacom.js — Vercel Serverless Proxy para GEO.ANACOM
// Resolve o problema de CORS ao fazer relay server-side
// Deploy: coloca este ficheiro em /api/anacom.js no teu projeto Vercel

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat e lon são obrigatórios' });
    }

    const latF = parseFloat(lat);
    const lonF = parseFloat(lon);

    if (isNaN(latF) || isNaN(lonF)) {
      return res.status(400).json({ error: 'lat/lon inválidos' });
    }

    // Converter WGS84 → Web Mercator (EPSG:3857)
    const R = 6378137;
    const mx = lonF * Math.PI / 180 * R;
    const my = Math.log(Math.tan((90 + latF) * Math.PI / 360)) * R;
    const tol = 100;
    const mapExtent = `${mx - tol},${my - tol},${mx + tol},${my + tol}`;

    const params = new URLSearchParams({
      f: 'json',
      geometry: JSON.stringify({ x: mx, y: my }),
      geometryType: 'esriGeometryPoint',
      sr: '3857',
      layers: 'all',
      tolerance: '5',
      mapExtent,
      imageDisplay: '800,600,96',
      returnGeometry: 'false',
    });

    const anacamUrl = `https://geo.anacom.pt/server/rest/services/publico/Coberturas_Disponiveis/MapServer/identify?${params}`;

    const response = await fetch(anacamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 GeoCobertura/1.0',
        'Referer': 'https://geo.anacom.pt/',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `ANACOM HTTP ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('ANACOM proxy error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

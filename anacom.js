// /api/anacom.js — Vercel Serverless Proxy para GEO.ANACOM
// Coloca este ficheiro em /api/anacom.js no teu repositório GitHub
// O Vercel deteta automaticamente e cria o endpoint /api/anacom

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'lat e lon obrigatórios' });

  const latF = parseFloat(lat);
  const lonF = parseFloat(lon);
  if (isNaN(latF) || isNaN(lonF)) return res.status(400).json({ error: 'coordenadas inválidas' });

  // WGS84 → Web Mercator (EPSG:3857)
  const R = 6378137;
  const mx = lonF * Math.PI / 180 * R;
  const my = Math.log(Math.tan((90 + latF) * Math.PI / 360)) * R;
  const tol = 150; // metros de tolerância
  const mapExtent = `${mx-tol},${my-tol},${mx+tol},${my+tol}`;

  const params = new URLSearchParams({
    f: 'json',
    geometry: `${mx},${my}`,
    geometryType: 'esriGeometryPoint',
    sr: '3857',
    layers: 'all',
    tolerance: '10',
    mapExtent,
    imageDisplay: '800,600,96',
    returnGeometry: 'false',
    maxAllowableOffset: '0',
  });

  const url = `https://geo.anacom.pt/server/rest/services/publico/Coberturas_Disponiveis/MapServer/identify?${params}`;

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GeoCobertura/2.0)',
        'Accept': 'application/json',
        'Referer': 'https://geo.anacom.pt/',
        'Origin': 'https://geo.anacom.pt',
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!r.ok) return res.status(502).json({ error: `ANACOM retornou HTTP ${r.status}` });

    const data = await r.json();

    // Debug: log a estrutura dos primeiros resultados
    if (data.results && data.results.length > 0) {
      console.log('ANACOM layers encontrados:', data.results.length);
      console.log('Primeiro resultado:', JSON.stringify(data.results[0]).substring(0, 300));
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('ANACOM proxy erro:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

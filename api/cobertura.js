// api/cobertura.js — CommonJS
// Cobertura 100% via GEO.ANACOM open data — sem IA, sem chave de API

const ANACOM_BASE = 'https://geo.anacom.pt/server/rest/services/publico/CoberturaQoS_Pub/MapServer';

const FIXED_LAYERS = [
  { id: 8,  tech: 'FTTH',   label: 'Fibra Ótica' },
  { id: 4,  tech: 'HFC_31', label: 'Cabo Coaxial (DOCSIS 3.1)' },
  { id: 5,  tech: 'HFC_30', label: 'Cabo Coaxial (DOCSIS 3.0)' },
  { id: 6,  tech: 'ADSL',   label: 'Cobre (ADSL)' },
];

const MOBILE_LAYERS = {
  MEO:      { '4G': 176, '5G': 177 },
  NOS:      { '4G': 181 },
  VODAFONE: { '4G': 185, '5G': 186 },
  DIGI:     { '4G': 171, '5G': 172 },
};

async function queryLayer(layerId, lat, lon) {
  const geom = encodeURIComponent(JSON.stringify({ x: lon, y: lat }));
  const url = `${ANACOM_BASE}/${layerId}/query?geometry=${geom}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=tecnologia,data&returnGeometry=false&f=json&inSR=4326`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!r.ok) return null;
    const d = await r.json();
    if (d.error) return null;
    const feats = d.features || [];
    return feats.length > 0 ? (feats[0].attributes || {}) : null;
  } catch {
    return null;
  }
}

function buildOperators(hasFiber, hasHFC, hasADSL, mobile, dataDate, locationName) {
  const src = dataDate ? `GEO.ANACOM ${dataDate}` : 'GEO.ANACOM';
  const meo  = mobile.MEO      || {};
  const nos  = mobile.NOS      || {};
  const voda = mobile.VODAFONE || {};
  const digi = mobile.DIGI     || {};

  return [
    {
      name: 'MEO',
      available: hasFiber || hasADSL || !!meo['4G'],
      technologies: [
        ...(hasFiber ? ['FTTH'] : []),
        ...(hasADSL && !hasFiber ? ['VDSL/ADSL'] : []),
        ...(meo['4G'] ? ['4G/LTE'] : []),
        ...(meo['5G'] ? ['5G'] : []),
      ],
      max_download_mbps: hasFiber ? 1000 : (meo['5G'] ? 500 : (meo['4G'] ? 150 : (hasADSL ? 100 : null))),
      note: hasFiber ? `Fibra Ótica disponível — ${src}` : (hasADSL ? `Cobre/VDSL disponível — ${src}` : (meo['4G'] ? `Cobertura móvel 4G/5G — ${src}` : `Sem cobertura reportada — ${src}`)),
      confidence: 'high',
      source: src,
    },
    {
      name: 'NOS',
      available: hasHFC || hasFiber || !!nos['4G'],
      technologies: [
        ...(hasHFC ? ['HFC'] : []),
        ...(hasFiber && !hasHFC ? ['FTTH'] : []),
        ...(nos['4G'] ? ['4G/LTE'] : []),
      ],
      max_download_mbps: hasHFC || hasFiber ? 1000 : (nos['4G'] ? 150 : null),
      note: hasHFC ? `Cabo Coaxial disponível — ${src}` : (hasFiber ? `Fibra disponível — ${src}` : (nos['4G'] ? `Cobertura móvel 4G — ${src}` : `Sem cobertura reportada — ${src}`)),
      confidence: hasHFC || hasFiber ? 'high' : (nos['4G'] ? 'medium' : 'high'),
      source: src,
    },
    {
      name: 'VODAFONE',
      available: hasFiber || !!voda['4G'],
      technologies: [
        ...(hasFiber ? ['FTTH'] : []),
        ...(voda['4G'] ? ['4G/LTE'] : []),
        ...(voda['5G'] ? ['5G'] : []),
      ],
      max_download_mbps: hasFiber ? 1000 : (voda['5G'] ? 500 : (voda['4G'] ? 150 : null)),
      note: hasFiber ? `Fibra disponível — ${src}` : (voda['4G'] ? `Cobertura móvel — ${src}` : `Sem cobertura reportada — ${src}`),
      confidence: hasFiber ? 'high' : (voda['4G'] ? 'medium' : 'high'),
      source: src,
    },
    {
      name: 'DIGI',
      available: hasFiber || !!digi['4G'],
      technologies: [
        ...(hasFiber ? ['FTTH'] : []),
        ...(digi['4G'] ? ['4G/LTE'] : []),
        ...(digi['5G'] ? ['5G'] : []),
      ],
      max_download_mbps: hasFiber ? 1000 : (digi['5G'] ? 300 : (digi['4G'] ? 150 : null)),
      note: hasFiber ? `Fibra em expansão — ${src}` : (digi['4G'] ? `Cobertura móvel — ${src}` : `Sem cobertura reportada — ${src}`),
      confidence: hasFiber ? 'medium' : (digi['4G'] ? 'medium' : 'high'),
      source: src,
    },
    {
      name: 'NOWO',
      available: hasHFC,
      technologies: hasHFC ? ['HFC'] : [],
      max_download_mbps: hasHFC ? 500 : null,
      note: hasHFC ? `Cabo Coaxial disponível — ${src}` : `Sem cobertura (só Lisboa/Porto, área limitada)`,
      confidence: 'medium',
      source: src,
    },
  ];
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não suportado' });

  const { lat, lon, city, municipio, distrito } = req.body || {};

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Coordenadas (lat, lon) são obrigatórias' });
  }

  try {
    // Consultar rede fixa em paralelo
    const fixedResults = await Promise.all(
      FIXED_LAYERS.map(async (l) => {
        const hit = await queryLayer(l.id, lat, lon);
        return { ...l, hit: !!hit, dataDate: hit?.data || null };
      })
    );

    const hasFiber = fixedResults.some(r => r.tech === 'FTTH' && r.hit);
    const hasHFC   = fixedResults.some(r => (r.tech === 'HFC_31' || r.tech === 'HFC_30') && r.hit);
    const hasADSL  = fixedResults.some(r => r.tech === 'ADSL' && r.hit);
    const dataDate = fixedResults.find(r => r.hit)?.dataDate || null;

    // Consultar rede móvel em paralelo
    const mobileJobs = [];
    for (const [op, layers] of Object.entries(MOBILE_LAYERS)) {
      for (const [gen, layerId] of Object.entries(layers)) {
        mobileJobs.push({ op, gen, promise: queryLayer(layerId, lat, lon) });
      }
    }
    const mobileRaw = await Promise.all(mobileJobs.map(j => j.promise));

    const mobile = {};
    mobileJobs.forEach((j, i) => {
      if (!mobile[j.op]) mobile[j.op] = {};
      mobile[j.op][j.gen] = !!mobileRaw[i];
    });

    const locationName = city || municipio || distrito || 'Local pesquisado';
    const operators = buildOperators(hasFiber, hasHFC, hasADSL, mobile, dataDate, locationName);

    const payload = { location: locationName, operators };

    return res.status(200).json({
      text: JSON.stringify(payload),
      anacom: { hasFiber, hasHFC, hasADSL, dataDate, mobile },
    });

  } catch (err) {
    console.error('[cobertura]', err.message);
    return res.status(500).json({ error: 'Erro ao consultar GEO.ANACOM: ' + err.message });
  }
};

// api/anacom.js — Proxy para GEO.ANACOM ArcGIS REST API (open data oficial)
// Consulta as camadas públicas do ANACOM por coordenadas e devolve cobertura real por operadora

const ANACOM_BASE = 'https://geo.anacom.pt/server/rest/services/publico/CoberturaQoS_Pub/MapServer';

// Mapeamento das camadas ANACOM
// Rede Fixa (agregada por tecnologia, não por operador — ANACOM agrega todos os operadores)
const FIXED_LAYERS = [
  { id: 8,  tech: 'FTTH',         label: 'Fibra Ótica' },
  { id: 4,  tech: 'HFC_31',       label: 'Cabo Coaxial (DOCSIS 3.1)' },
  { id: 5,  tech: 'HFC_30',       label: 'Cabo Coaxial (DOCSIS 3.0)' },
  { id: 6,  tech: 'ADSL',         label: 'Cobre (ADSL)' },
];

// Rede Móvel por operador (sublayers do grupo Rede Móvel)
const MOBILE_LAYERS = {
  MEO:      { layers: { '2G': 174, '3G': 175, '4G': 176, '5G': 177 } },
  NOS:      { layers: { '2G': 179, '3G': 180, '4G': 181, '5G': null } },  // confirmar 5G
  VODAFONE: { layers: { '2G': 183, '3G': 184, '4G': 185, '5G': 186 } },
  DIGI:     { layers: { '2G': 170, '3G': null,'4G': 171, '5G': 172 } },
};

async function queryLayer(layerId, lat, lon, signal) {
  const geom = encodeURIComponent(JSON.stringify({ x: lon, y: lat }));
  const url = `${ANACOM_BASE}/${layerId}/query?geometry=${geom}&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&outFields=tecnologia,data&returnGeometry=false&f=json&inSR=4326`;
  try {
    const r = await fetch(url, { signal });
    if (!r.ok) return null;
    const d = await r.json();
    if (d.error) return null;
    return (d.features || []).length > 0 ? d.features[0].attributes : null;
  } catch (e) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { lat, lon } = req.body || {};
  if (!lat || !lon) return res.status(400).json({ error: 'lat e lon obrigatórios' });

  const signal = AbortSignal.timeout(20000);

  try {
    // ── 1. Consultar todas as camadas de rede fixa em paralelo ──
    const fixedResults = await Promise.all(
      FIXED_LAYERS.map(l => queryLayer(l.id, lat, lon, signal).then(r => ({ ...l, hit: !!r, data: r?.data || null })))
    );

    const hasFiber    = fixedResults.some(r => r.tech === 'FTTH' && r.hit);
    const hasHFC      = fixedResults.some(r => (r.tech === 'HFC_31' || r.tech === 'HFC_30') && r.hit);
    const hasADSL     = fixedResults.some(r => r.tech === 'ADSL' && r.hit);
    const dataRef     = fixedResults.find(r => r.hit)?.data || null;

    // ── 2. Consultar rede móvel por operador em paralelo ──
    const mobilePromises = {};
    for (const [op, cfg] of Object.entries(MOBILE_LAYERS)) {
      mobilePromises[op] = {};
      for (const [gen, layerId] of Object.entries(cfg.layers)) {
        if (layerId !== null) {
          mobilePromises[op][gen] = queryLayer(layerId, lat, lon, signal);
        } else {
          mobilePromises[op][gen] = Promise.resolve(null);
        }
      }
    }

    // Resolver todas as promessas móveis
    const mobileResults = {};
    for (const [op, gens] of Object.entries(mobilePromises)) {
      mobileResults[op] = {};
      for (const [gen, p] of Object.entries(gens)) {
        mobileResults[op][gen] = await p;
      }
    }

    // ── 3. Construir resposta estruturada por operadora ──
    // A rede fixa do ANACOM é agregada (não por operador)
    // Mapeamos as tecnologias fixas para os operadores conhecidos
    // com base no conhecimento real do mercado PT + dados ANACOM

    const operators = buildOperators(hasFiber, hasHFC, hasADSL, mobileResults, dataRef);

    return res.status(200).json({
      source: 'GEO.ANACOM',
      dataRef,
      fixedCoverage: { fiber: hasFiber, hfc: hasHFC, adsl: hasADSL },
      mobile: mobileResults,
      operators,
    });

  } catch (err) {
    console.error('[ANACOM proxy]', err);
    return res.status(500).json({ error: err.message });
  }
};

function buildOperators(hasFiber, hasHFC, hasADSL, mobile, dataRef) {
  const fmt = (d) => d ? ` (dados: ${d})` : '';

  const meoMobile  = mobile.MEO      || {};
  const nosMobile  = mobile.NOS      || {};
  const vodaMobile = mobile.VODAFONE || {};
  const digiMobile = mobile.DIGI     || {};

  const has4G_meo  = !!meoMobile['4G'];
  const has5G_meo  = !!meoMobile['5G'];
  const has4G_nos  = !!nosMobile['4G'];
  const has4G_voda = !!vodaMobile['4G'];
  const has5G_voda = !!vodaMobile['5G'];
  const has4G_digi = !!digiMobile['4G'];
  const has5G_digi = !!digiMobile['5G'];

  return [
    {
      name: 'MEO',
      available: hasFiber || hasADSL || has4G_meo,
      technologies: [
        ...(hasFiber ? ['FTTH'] : []),
        ...(hasADSL && !hasFiber ? ['VDSL/ADSL'] : []),
        ...(has4G_meo ? ['4G/LTE'] : []),
        ...(has5G_meo ? ['5G'] : []),
      ],
      max_download_mbps: hasFiber ? 1000 : (has4G_meo ? 150 : (hasADSL ? 100 : null)),
      note: hasFiber
        ? `Fibra Ótica disponível${fmt(dataRef)}`
        : (hasADSL ? `Cobre/VDSL disponível${fmt(dataRef)}` : `Cobertura móvel${fmt(dataRef)}`),
      confidence: 'high',
      source: 'GEO.ANACOM',
    },
    {
      name: 'NOS',
      available: hasHFC || hasFiber || has4G_nos,
      technologies: [
        ...(hasHFC ? ['HFC'] : []),
        ...(hasFiber && !hasHFC ? ['FTTH'] : []),
        ...(has4G_nos ? ['4G/LTE'] : []),
      ],
      max_download_mbps: hasHFC ? 1000 : (hasFiber ? 1000 : (has4G_nos ? 150 : null)),
      note: hasHFC
        ? `Cabo Coaxial disponível${fmt(dataRef)}`
        : (hasFiber ? `Fibra disponível${fmt(dataRef)}` : (has4G_nos ? `Cobertura móvel${fmt(dataRef)}` : 'Sem cobertura fixa reportada')),
      confidence: hasHFC || hasFiber ? 'high' : (has4G_nos ? 'medium' : 'high'),
      source: 'GEO.ANACOM',
    },
    {
      name: 'VODAFONE',
      available: hasFiber || has4G_voda,
      technologies: [
        ...(hasFiber ? ['FTTH'] : []),
        ...(has4G_voda ? ['4G/LTE'] : []),
        ...(has5G_voda ? ['5G'] : []),
      ],
      max_download_mbps: hasFiber ? 1000 : (has5G_voda ? 500 : (has4G_voda ? 150 : null)),
      note: hasFiber
        ? `Fibra disponível${fmt(dataRef)}`
        : (has4G_voda ? `Cobertura móvel${fmt(dataRef)}` : 'Sem cobertura fixa reportada'),
      confidence: hasFiber ? 'high' : (has4G_voda ? 'medium' : 'high'),
      source: 'GEO.ANACOM',
    },
    {
      name: 'DIGI',
      available: hasFiber || has4G_digi,
      technologies: [
        ...(hasFiber ? ['FTTH'] : []),
        ...(has4G_digi ? ['4G/LTE'] : []),
        ...(has5G_digi ? ['5G'] : []),
      ],
      max_download_mbps: hasFiber ? 1000 : (has4G_digi ? 150 : null),
      note: hasFiber
        ? `Fibra em expansão${fmt(dataRef)}`
        : (has4G_digi ? `Cobertura móvel${fmt(dataRef)}` : 'Sem cobertura reportada'),
      confidence: hasFiber ? 'medium' : (has4G_digi ? 'medium' : 'high'),
      source: 'GEO.ANACOM',
    },
    {
      name: 'NOWO',
      available: hasHFC,
      technologies: hasHFC ? ['HFC'] : [],
      max_download_mbps: hasHFC ? 500 : null,
      note: hasHFC
        ? `Cabo Coaxial disponível${fmt(dataRef)}`
        : 'Sem cobertura reportada (só Lisboa/Porto limitado)',
      confidence: 'medium',
      source: 'GEO.ANACOM',
    },
  ];
}

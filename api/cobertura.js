// api/cobertura.js — CommonJS
// Usa GEO.ANACOM (dados oficiais, open data) para cobertura real — sem IA, sem chave de API

const ANACOM_BASE = 'https://geo.anacom.pt/server/rest/services/publico/CoberturaQoS_Pub/MapServer';

// Camadas rede fixa ANACOM (agregadas por tecnologia)
const FIXED_LAYERS = [
  { id: 8,  tech: 'FTTH',   label: 'Fibra Ótica' },
  { id: 4,  tech: 'HFC_31', label: 'Cabo Coaxial (DOCSIS 3.1)' },
  { id: 5,  tech: 'HFC_30', label: 'Cabo Coaxial (DOCSIS 3.0)' },
  { id: 6,  tech: 'ADSL',   label: 'Cobre (ADSL)' },
];

// Camadas rede móvel ANACOM por operador
const MOBILE_LAYERS = {
  MEO:      { '2G': 174, '3G': 175, '4G': 176, '5G': 177 },
  NOS:      { '2G': 179, '3G': 180, '4G': 181 },
  VODAFONE: { '2G': 183, '3G': 184, '4G': 185, '5G': 186 },
  DIGI:     { '4G': 171, '5G': 172 },
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
  } catch {
    return null;
  }
}

function buildResponse(city, hasFiber, hasHFC, hasADSL, mobile, dataDate) {
  const fmt = (d) => d ? ` (ANACOM ${d})` : ' (GEO.ANACOM)';

  const meo  = mobile.MEO      || {};
  const nos  = mobile.NOS      || {};
  const voda = mobile.VODAFONE || {};
  const digi = mobile.DIGI     || {};

  const operators = [
    {
      name: 'MEO',
      available: hasFiber || hasADSL || !!meo['4G'],
      technologies: [
        ...(hasFiber ? ['FTTH'] : []),
        ...(hasADSL && !hasFiber ? ['VDSL/ADSL'] : []),
        ...(meo['4G'] ? ['4G/LTE'] : []),
        ...(meo['5G'] ? ['5G'] : []),
      ],
      max_download_mbps: hasFiber ? 1000 : (meo['4G'] ? 150 : (hasADSL ? 100 : null)),
      note: hasFiber
        ? `Fibra Ótica disponível${fmt(dataDate)}`
        : (hasADSL ? `Cobre/VDSL disponível${fmt(dataDate)}` : (meo['4G'] ? `Cobertura móvel${fmt(dataDate)}` : 'Sem cobertura reportada')),
      confidence: 'high',
      source: 'GEO.ANACOM',
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
      note: hasHFC
        ? `Cabo Coaxial disponível${fmt(dataDate)}`
        : (hasFiber ? `Fibra disponível${fmt(dataDate)}` : (nos['4G'] ? `Cobertura móvel${fmt(dataDate)}` : 'Sem cobertura reportada')),
      confidence: hasHFC || hasFiber ? 'high' : (nos['4G'] ? 'medium' : 'high'),
      source: 'GEO.ANACOM',
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
      note: hasFiber
        ? `Fibra disponível${fmt(dataDate)}`
        : (voda['4G'] ? `Cobertura móvel${fmt(dataDate)}` : 'Sem cobertura reportada'),
      confidence: hasFiber ? 'high' : (voda['4G'] ? 'medium' : 'high'),
      source: 'GEO.ANACOM',
    },
    {
      name: 'DIGI',
      available: hasFiber || !!digi['4G'],
      technologies: [
        ...(hasFiber ? ['FTTH'] : []),
        ...(digi['4G'] ? ['4G/LTE'] : []),
        ...(digi['5G'] ? ['5G'] : []),
      ],
      max_download_mbps: hasFiber ? 1000 : (digi['4G'] ? 150 : null),
      note: hasFiber
        ? `Fibra em expansão${fmt(dataDate)}`
        : (digi['4G'] ? `Cobertura móvel${fmt(dataDate)}` : 'Sem cobertura reportada'),
      confidence: hasFiber ? 'medium' : (digi['4G'] ? 'medium' : 'high'),
      source: 'GEO.ANACOM',
    },
    {
      name: 'NOWO',
      available: hasHFC,
      technologies: hasHFC ? ['HFC'] : [],
      max_download_mbps: hasHFC ? 500 : null,
      note: hasHFC
        ? `Cabo Coaxial disponível${fmt(dataDate)}`
        : 'Sem cobertura (só Lisboa/Porto, área muito limitada)',
      confidence: 'medium',
      source: 'GEO.ANACOM',
    },
  ];

  // Formato de texto que o frontend espera parsear
  const availableOps = operators.filter(o => o.available).map(o => {
    const techs = o.technologies.join(', ') || 'sem tecnologia';
    const speed = o.max_download_mbps ? ` — até ${o.max_download_mbps} Mbps` : '';
    return `**${o.name}**: ${techs}${speed}. ${o.note}`;
  }).join('\n');

  const unavailableOps = operators.filter(o => !o.available).map(o => `**${o.name}**: ${o.note}`).join('\n');

  const fixedSummary = [
    hasFiber ? 'Fibra Ótica' : null,
    hasHFC   ? 'Cabo Coaxial (HFC)' : null,
    hasADSL  ? 'Cobre/ADSL' : null,
  ].filter(Boolean).join(', ') || 'Nenhuma tecnologia fixa detectada';

  const text = `{"location":"${city || 'Local pesquisado'}","operators":${JSON.stringify(operators)}}`;

  return { text, operators, fixedSummary, availableOps, unavailableOps };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { lat, lon, city, municipio, distrito } = req.body || {};

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Coordenadas (lat, lon) obrigatórias' });
  }

  const signal = AbortSignal.timeout(22000);

  try {
    // Consultar rede fixa em paralelo
    const fixedResults = await Promise.all(
      FIXED_LAYERS.map(l =>
        queryLayer(l.id, lat, lon, signal).then(r => ({ ...l, hit: !!r, dataDate: r?.data || null }))
      )
    );

    const hasFiber  = fixedResults.some(r => r.tech === 'FTTH' && r.hit);
    const hasHFC    = fixedResults.some(r => (r.tech === 'HFC_31' || r.tech === 'HFC_30') && r.hit);
    const hasADSL   = fixedResults.some(r => r.tech === 'ADSL' && r.hit);
    const dataDate  = fixedResults.find(r => r.hit)?.dataDate || null;

    // Consultar rede móvel por operador em paralelo
    const mobileEntries = [];
    for (const [op, layers] of Object.entries(MOBILE_LAYERS)) {
      for (const [gen, layerId] of Object.entries(layers)) {
        mobileEntries.push({ op, gen, promise: queryLayer(layerId, lat, lon, signal) });
      }
    }
    const mobileRaw = await Promise.all(mobileEntries.map(e => e.promise));

    const mobile = {};
    mobileEntries.forEach((e, i) => {
      if (!mobile[e.op]) mobile[e.op] = {};
      mobile[e.op][e.gen] = !!mobileRaw[i];
    });

    const locationName = city || municipio || distrito || 'Local pesquisado';
    const { text, operators } = buildResponse(locationName, hasFiber, hasHFC, hasADSL, mobile, dataDate);

    return res.status(200).json({
      text,
      anacom: { hasFiber, hasHFC, hasADSL, dataDate, mobile },
    });

  } catch (err) {
    console.error('[cobertura]', err.message);
    return res.status(500).json({ error: 'Erro ao consultar GEO.ANACOM: ' + err.message });
  }
};

// api/cobertura.js — CommonJS (sem "type":"module" necessário)
// Integra GEO.ANACOM (dados oficiais) + Claude AI para enriquecimento

const ANACOM_BASE = 'https://geo.anacom.pt/server/rest/services/publico/CoberturaQoS_Pub/MapServer';

// Camadas rede fixa ANACOM
const FIXED_LAYERS = [
  { id: 8,  tech: 'FTTH',   label: 'Fibra Ótica' },
  { id: 4,  tech: 'HFC_31', label: 'Cabo Coaxial (DOCSIS 3.1)' },
  { id: 5,  tech: 'HFC_30', label: 'Cabo Coaxial (DOCSIS 3.0)' },
  { id: 6,  tech: 'ADSL',   label: 'Cobre (ADSL)' },
];

// Camadas rede móvel ANACOM por operador
const MOBILE_LAYERS = {
  MEO:      { '4G': 176, '5G': 177, '3G': 175 },
  NOS:      { '4G': 181, '5G': null },
  VODAFONE: { '4G': 185, '5G': 186 },
  DIGI:     { '4G': 171, '5G': 172 },
};

async function queryAnacomLayer(layerId, lat, lon, signal) {
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

async function getAnacomData(lat, lon) {
  const signal = AbortSignal.timeout(18000);

  // Consultar rede fixa em paralelo
  const fixedPromises = FIXED_LAYERS.map(l =>
    queryAnacomLayer(l.id, lat, lon, signal).then(r => ({ ...l, hit: !!r, dataDate: r?.data || null }))
  );

  // Consultar rede móvel por operador em paralelo
  const mobileEntries = [];
  for (const [op, layers] of Object.entries(MOBILE_LAYERS)) {
    for (const [gen, layerId] of Object.entries(layers)) {
      if (layerId !== null) {
        mobileEntries.push({ op, gen, promise: queryAnacomLayer(layerId, lat, lon, signal) });
      }
    }
  }

  const [fixedResults, ...mobileResults] = await Promise.all([
    Promise.all(fixedPromises),
    ...mobileEntries.map(e => e.promise),
  ]);

  const hasFiber = fixedResults.some(r => r.tech === 'FTTH' && r.hit);
  const hasHFC   = fixedResults.some(r => (r.tech === 'HFC_31' || r.tech === 'HFC_30') && r.hit);
  const hasADSL  = fixedResults.some(r => r.tech === 'ADSL' && r.hit);
  const dataDate = fixedResults.find(r => r.hit)?.dataDate || null;

  const mobile = {};
  mobileEntries.forEach((e, i) => {
    if (!mobile[e.op]) mobile[e.op] = {};
    mobile[e.op][e.gen] = !!mobileResults[i];
  });

  return { hasFiber, hasHFC, hasADSL, mobile, dataDate };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY não configurada. Vai ao Vercel → Settings → Environment Variables e adiciona a chave.'
    });
  }

  const { query, lat, lon, city, municipio, distrito } = req.body || {};

  // ── STEP 1: Consultar GEO.ANACOM ──
  let anacom = null;
  let anacomError = null;
  try {
    anacom = await getAnacomData(lat, lon);
  } catch (e) {
    anacomError = e.message;
    console.error('[ANACOM]', e.message);
  }

  // ── STEP 2: Enriquecer com Claude AI (usa dados ANACOM como contexto) ──
  const anacomContext = anacom
    ? `DADOS REAIS GEO.ANACOM (fonte oficial ANACOM, referência ${anacom.dataDate || 'recente'}):
- Rede Fixa: Fibra Ótica=${anacom.hasFiber ? 'SIM' : 'NÃO'}, Cabo Coaxial HFC=${anacom.hasHFC ? 'SIM' : 'NÃO'}, ADSL/Cobre=${anacom.hasADSL ? 'SIM' : 'NÃO'}
- Rede Móvel MEO: 4G=${anacom.mobile.MEO?.['4G'] ? 'SIM' : 'NÃO'}, 5G=${anacom.mobile.MEO?.['5G'] ? 'SIM' : 'NÃO'}
- Rede Móvel NOS: 4G=${anacom.mobile.NOS?.['4G'] ? 'SIM' : 'NÃO'}
- Rede Móvel VODAFONE: 4G=${anacom.mobile.VODAFONE?.['4G'] ? 'SIM' : 'NÃO'}, 5G=${anacom.mobile.VODAFONE?.['5G'] ? 'SIM' : 'NÃO'}
- Rede Móvel DIGI: 4G=${anacom.mobile.DIGI?.['4G'] ? 'SIM' : 'NÃO'}, 5G=${anacom.mobile.DIGI?.['5G'] ? 'SIM' : 'NÃO'}

NOTA IMPORTANTE: A rede fixa do ANACOM é agregada (todos operadores juntos). Fibra=MEO/NOS/Vodafone, HFC=NOS/NOWO, ADSL=MEO/NOS.
Usa estes dados como base e aplica o teu conhecimento para atribuir por operadora.`
    : `AVISO: GEO.ANACOM indisponível (${anacomError || 'timeout'}). Usa o teu conhecimento do mercado PT.`;

  const systemPrompt = `És um especialista em telecomunicações portuguesas.
Devolve APENAS JSON válido, sem markdown, sem texto extra, sem backticks.

Formato obrigatório:
{"location":"nome do local","operators":[{"name":"MEO","available":true,"technologies":["FTTH","4G/LTE"],"max_download_mbps":1000,"note":"Fibra disponível (GEO.ANACOM)","confidence":"high","source":"GEO.ANACOM"},{"name":"NOS","available":true,"technologies":["HFC","4G/LTE"],"max_download_mbps":1000,"note":"Cabo/Fibra disponível","confidence":"high","source":"GEO.ANACOM"},{"name":"VODAFONE","available":true,"technologies":["FTTH","4G/LTE"],"max_download_mbps":1000,"note":"Fibra disponível","confidence":"high","source":"GEO.ANACOM"},{"name":"DIGI","available":false,"technologies":[],"max_download_mbps":null,"note":"Sem cobertura fixa","confidence":"medium","source":"GEO.ANACOM"},{"name":"NOWO","available":false,"technologies":[],"max_download_mbps":null,"note":"Sem cobertura","confidence":"high","source":"GEO.ANACOM"}]}

${anacomContext}

CONHECIMENTO ADICIONAL Portugal:
- MEO: sempre tem VDSL/ADSL onde há cobre. Se há fibra, MEO tem FTTH. 4G/LTE nacional.
- NOS: HFC+FTTH em cidades. Se há HFC, é NOS (e/ou NOWO). 4G/LTE nacional.
- VODAFONE: FTTH em zonas urbanas, 4G/LTE e 5G cidades.
- DIGI: FTTH em expansão (Porto, Braga, Lisboa e arredores). 4G/LTE via rede própria.
- NOWO: só HFC em partes de Lisboa e Porto. Muito limitado.
- Se há HFC, NOS quase sempre tem cobertura. NOWO pode ter se for Lisboa/Porto.
- Prioriza SEMPRE os dados reais do GEO.ANACOM quando disponíveis.`;

  const userMsg = `Verifica cobertura para: "${query || ''}"
Coordenadas: ${lat}, ${lon}
Cidade/Localidade: ${city || municipio || ''}
Município: ${municipio || ''}
Distrito: ${distrito || ''}
Devolve JSON com cobertura real de cada operadora, usando os dados GEO.ANACOM como base.`;

  try {
    const requestBody = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 900,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMsg }]
    });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: requestBody,
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({
        error: `Anthropic API erro ${response.status}`,
        detail: errText.substring(0, 300)
      });
    }

    const data = await response.json();
    const text = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    return res.status(200).json({
      text,
      anacom: anacom
        ? { hasFiber: anacom.hasFiber, hasHFC: anacom.hasHFC, hasADSL: anacom.hasADSL, dataDate: anacom.dataDate, mobile: anacom.mobile }
        : null,
    });

  } catch (err) {
    console.error('Proxy erro:', err);
    return res.status(500).json({ error: err.message });
  }
};

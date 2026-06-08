// api/cobertura.js — CommonJS (sem "type":"module" necessário)
const https = require('https');

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

  let body = '';
  try {
    const { query, lat, lon, city, municipio, distrito } = req.body || {};

    const systemPrompt = `És um especialista em telecomunicações portuguesas.
Devolve APENAS JSON válido, sem markdown, sem texto extra, sem backticks.

Formato obrigatório:
{"location":"nome do local","operators":[{"name":"MEO","available":true,"technologies":["FTTH","4G/LTE"],"max_download_mbps":1000,"note":"Fibra disponível","confidence":"high"},{"name":"NOS","available":true,"technologies":["HFC","5G"],"max_download_mbps":1000,"note":"Fibra e 5G","confidence":"high"},{"name":"VODAFONE","available":true,"technologies":["FTTH","5G"],"max_download_mbps":1000,"note":"Fibra disponível","confidence":"high"},{"name":"DIGI","available":false,"technologies":[],"max_download_mbps":null,"note":"Sem cobertura fixa","confidence":"medium"},{"name":"NOWO","available":false,"technologies":[],"max_download_mbps":null,"note":"Sem cobertura","confidence":"high"}]}

CONHECIMENTO REAL Portugal:
- MEO: VDSL em todo o país + FTTH nas cidades e vilas. 4G/LTE nacional. Sempre disponível.
- NOS: HFC+FTTH em cidades (Lisboa, Porto, Braga, Coimbra, Setúbal, Aveiro, Faro). 4G/LTE nacional. 5G cidades grandes.
- VODAFONE: FTTH em zonas urbanas. 4G/LTE nacional. 5G cidades grandes.
- DIGI: FTTH em expansão (Porto e arredores: Trofa, Maia, Matosinhos, Vila Nova de Gaia, Braga, Lisboa e arredores). 4G/LTE via roaming.
- NOWO: só HFC em partes de Lisboa e Porto. Muito limitado.
- CP 4445 = Trofa, distrito Porto: MEO FTTH sim, NOS sim, Vodafone sim, DIGI em expansão, NOWO não.
- Zonas rurais: MEO VDSL sim, fibra menos provável, NOS/Vodafone menos provável.`;

    const userMsg = `Verifica cobertura para: "${query || ''}"
Coordenadas: ${lat}, ${lon}
Cidade/Localidade: ${city || municipio || ''}
Município: ${municipio || ''}
Distrito: ${distrito || ''}
Devolve JSON com cobertura real de cada operadora.`;

    const requestBody = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
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

    return res.status(200).json({ text });

  } catch (err) {
    console.error('Proxy erro:', err);
    return res.status(500).json({ error: err.message });
  }
};

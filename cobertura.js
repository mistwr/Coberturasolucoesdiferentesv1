// api/cobertura.js
// Proxy seguro — a ANTHROPIC_API_KEY fica em variável de ambiente no Vercel
// Nunca exposta no browser

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key não configurada. Adiciona ANTHROPIC_API_KEY nas variáveis de ambiente do Vercel.' });

  try {
    const { query, lat, lon, city, municipio, distrito } = req.body;

    const systemPrompt = `És um especialista em telecomunicações portuguesas com acesso a dados actuais.
Quando te derem uma localização em Portugal, devolve dados REAIS de cobertura.

OPERADORAS: MEO (Altice), NOS, VODAFONE, DIGI, NOWO

Responde APENAS com JSON neste formato exacto (sem markdown, sem texto extra):
{
  "location": "nome do local",
  "operators": [
    {
      "name": "MEO",
      "available": true,
      "technologies": ["FTTH","4G/LTE"],
      "max_download_mbps": 1000,
      "note": "Fibra FTTH disponível",
      "confidence": "high"
    }
  ]
}

CONHECIMENTO REAL das redes PT:
- MEO: rede VDSL nacional + fibra FTTH nas principais cidades e arredores. 4G/LTE em todo o país.
- NOS: fibra HFC+FTTH em cidades. 4G/LTE nacional. 5G em Lisboa/Porto/Braga/Coimbra.
- VODAFONE: fibra FTTH em cidades. 4G/LTE nacional. 5G em grandes cidades.
- DIGI: fibra FTTH em expansão (Porto, Lisboa, Braga, Setúbal, Aveiro e arredores). 4G/LTE roaming.
- NOWO: HFC em certas zonas de Lisboa e Porto. Limitada a certas áreas.
- Zonas rurais: MEO VDSL quase sempre, fibra menos provável exceto vilas maiores.
- Código postal 4445 = Trofa, distrito Porto — zona periurbana, MEO/NOS/Vodafone com boa cobertura.`;

    const userMsg = `Localização: "${query}"
Coordenadas: ${lat}, ${lon}
Cidade: ${city || municipio || ''}
Município: ${municipio || ''}
Distrito: ${distrito || ''}

Qual a cobertura de telecomunicações real nesta área?`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: systemPrompt,
        messages: [{ role: 'user', content: userMsg }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: `Anthropic API: ${response.status}`, detail: err.substring(0, 200) });
    }

    const data = await response.json();

    // Extrai o texto da resposta (pode ter tool_use blocos intermédios)
    let text = '';
    for (const block of (data.content || [])) {
      if (block.type === 'text') text += block.text;
    }

    return res.status(200).json({ text, raw: data.stop_reason });

  } catch (err) {
    console.error('Proxy erro:', err);
    return res.status(500).json({ error: err.message });
  }
}

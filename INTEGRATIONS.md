# Integrações Externas - PARCENDi CRM 5.0

Este documento descreve como integrar as APIs externas (WhatsApp, Meta Ads, Google Ads) com o PARCENDi CRM.

## 🔔 WhatsApp Business API

### Configuração

1. **Obter Credenciais**
   - Ir para: https://www.whatsapp.com/business/
   - Criar conta Business
   - Obter: Phone Number ID, Business Account ID, Access Token

2. **Configurar Variáveis de Ambiente**
   ```bash
   WHATSAPP_PHONE_ID=<seu-phone-id>
   WHATSAPP_BUSINESS_ACCOUNT_ID=<seu-business-id>
   WHATSAPP_API_KEY=<seu-access-token>
   WHATSAPP_WEBHOOK_VERIFY_TOKEN=<seu-verify-token>
   ```

3. **Implementação de Webhook**
   ```typescript
   // app/api/webhooks/whatsapp/route.ts
   export async function POST(request: Request) {
     // Processar mensagens recebidas
     // Criar leads automaticamente
     // Vincular com histórico de comunicações
   }
   ```

### Funcionalidades Suportadas

- **Templates de Mensagem**
  - Primeiro contacto
  - Pedido de documentos
  - Proposta enviada
  - Renovação
  - Follow-up

- **Histórico Automático**
  - Registrar todas as mensagens
  - Vincular com lead/business
  - Rastrear estado da comunicação

### Exemplo de Uso

```typescript
import axios from 'axios';

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const response = await axios.post(
    `https://graph.instagram.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
      },
    }
  );
  return response.data;
}
```

---

## 📊 Meta Ads Integration

### Configuração

1. **Obter Credenciais**
   - Meta Business Manager: https://business.facebook.com/
   - Criar App: Settings → Add App
   - Gerar Access Token
   - Obter Ad Account ID

2. **Configurar Variáveis**
   ```bash
   META_ADS_APP_ID=<seu-app-id>
   META_ADS_APP_SECRET=<seu-app-secret>
   META_ADS_ACCESS_TOKEN=<seu-token>
   META_ADS_ACCOUNT_ID=<seu-account-id>
   ```

3. **Lead Ads Webhook**
   ```typescript
   // app/api/webhooks/meta-ads/route.ts
   export async function POST(request: Request) {
     // Receber leads do Meta Ads
     // Criar automaticamente em leads table
     // Atribuir origem "META_ADS"
   }
   ```

### Funcionalidades

- **Captura Automática de Leads**
  - Webhook quando novo lead em Meta Ads
  - Sincronizar com CRM
  - Atribuir responsável

- **Rastreamento de ROI**
  - Vincular lead → negócio → comissão
  - Calcular ROAS por campanha
  - Relatórios automáticos

### Exemplo de Sync

```typescript
async function syncMetaLeads() {
  const leads = await fetchLeadsFromMeta();
  
  for (const lead of leads) {
    await createLead({
      nome: lead.full_name,
      email: lead.email,
      telefone: lead.phone_number,
      origem: 'META_ADS',
      segmento: lead.segment || 'ENERGIA',
      rgpd_consent: true,
    });
  }
}
```

---

## 🔍 Google Ads Integration

### Configuração

1. **Google Ads API Setup**
   - Criar Google Cloud Project
   - Ativar Google Ads API
   - Criar OAuth 2.0 credentials
   - Obter Customer ID

2. **Variáveis de Ambiente**
   ```bash
   GOOGLE_ADS_CUSTOMER_ID=<seu-customer-id>
   GOOGLE_ADS_DEVELOPER_TOKEN=<seu-developer-token>
   GOOGLE_ADS_CLIENT_ID=<seu-client-id>
   GOOGLE_ADS_CLIENT_SECRET=<seu-client-secret>
   GOOGLE_ADS_REFRESH_TOKEN=<seu-refresh-token>
   ```

3. **Configurar Lead Conversion Tracking**
   ```typescript
   // lib/services/googleAds.ts
   export async function createConversion(
     leadId: string,
     conversionValue: number
   ) {
     // Reportar conversão ao Google Ads
     // Vincular com negócio fechado
   }
   ```

### Funcionalidades

- **Conversão de Leads**
  - Rastrear negócios fechados
  - Reportar valor para Google Ads
  - Otimizar campanhas automaticamente

- **Relatórios**
  - CPA (Cost Per Acquisition)
  - ROAS (Return on Ad Spend)
  - Performance por palavra-chave

### Exemplo

```typescript
async function reportConversion(businessId: string, value: number) {
  const googleAdsClient = new GoogleAdsClient({
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });

  await googleAdsClient.createConversionUpload(
    process.env.GOOGLE_ADS_CUSTOMER_ID!,
    {
      conversion_action_id: 'conversion-id',
      conversion_value: value,
      conversion_currency_code: 'EUR',
    }
  );
}
```

---

## 🔗 Webhooks Gerais

### Estrutura de Webhook

Todos os webhooks seguem este padrão:

```typescript
// app/api/webhooks/[service]/route.ts

export async function POST(request: Request) {
  const body = await request.json();
  
  // 1. Validar assinatura/token
  if (!validateSignature(body, request.headers)) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Processar payload
  try {
    // Lógica de negócio
  } catch (error) {
    console.error('Webhook error:', error);
  }

  // 3. Responder com 200 OK
  return new Response('OK', { status: 200 });
}

function validateSignature(body: any, headers: Headers): boolean {
  // Implementar validação específica de cada serviço
  return true;
}
```

### Configuração no Painel

1. **WhatsApp**
   - Dashboard: https://developers.facebook.com/
   - Webhook URL: `https://seu-dominio.com/api/webhooks/whatsapp`
   - Verify Token: `seu-token-secreto`

2. **Meta Ads**
   - Business Manager: https://business.facebook.com/
   - Webhook URL: `https://seu-dominio.com/api/webhooks/meta-ads`

3. **Google Ads**
   - Google Cloud Console
   - Não usa webhooks (pull-based API)

---

## 📋 Mapeamento de Dados

### WhatsApp → Lead
```
WhatsApp Phone Number → Lead.telefone
Contact Name → Lead.nome
Message Text → Lead.notas (primeira mensagem)
Timestamp → Lead.created_at
Origem = "WHATSAPP"
```

### Meta Ads → Lead
```
Lead Form Name → Lead.nome
Lead Form Email → Lead.email
Lead Form Phone → Lead.telefone
Form Data → Lead.notas
Origem = "META_ADS"
Segmento = Field value (or default)
```

### Google Ads → Deal
```
Conversion Value → Business.valor_faturacao
Conversion Time → Business.created_at
Campaign Name → Business.notas
```

---

## 🧪 Testes Locais

### WhatsApp Test
```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "5511999999999",
            "text": { "body": "Test message" }
          }]
        }
      }]
    }]
  }'
```

### Meta Ads Test
```bash
curl -X POST http://localhost:3000/api/webhooks/meta-ads \
  -H "Content-Type: application/json" \
  -d '{
    "field": "lead",
    "value": {
      "created_time": "2024-06-01T12:00:00Z",
      "full_name": "Test User",
      "email": "test@example.com",
      "phone_number": "5511999999999"
    }
  }'
```

---

## ⚠️ Considerações de Segurança

1. **Validação de Webhooks**
   - Sempre validar assinatura/token
   - Verificar origem da requisição
   - Usar HTTPS para produção

2. **Rate Limiting**
   ```typescript
   import { Ratelimit } from "@upstash/ratelimit";
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(100, "1 h"),
   });
   ```

3. **Dados Sensíveis**
   - Nunca logar tokens de API
   - Armazenar em `.env.local` (nunca no git)
   - Usar Supabase Secrets em produção

4. **RGPD Compliance**
   - Obter consentimento antes de contactar
   - Respeitar preferências de comunicação
   - Registrar consentimento no campo `rgpd_consent`

---

## 📚 Documentação Externa

- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Meta Ads API](https://developers.facebook.com/docs/marketing-apis)
- [Google Ads API](https://developers.google.com/google-ads/api/docs)

---

## 🤝 Suporte

Para dúvidas sobre integrações, contactar equipa de desenvolvimento.

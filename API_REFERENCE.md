# API Reference - PARCENDi CRM 5.0

Documentação completa de todos os endpoints REST disponíveis.

## 📍 Base URL

```
Development: http://localhost:3000/api
Production: https://seu-dominio.com/api
```

## 🔐 Autenticação

Todos os endpoints requerem autenticação via Supabase Auth (Bearer Token).

```bash
# Exemplo com curl
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://seu-dominio.com/api/leads
```

## 📋 Leads

### Listar Leads

```
GET /leads
```

**Query Parameters:**
- `search` (string) - Buscar por nome ou email
- `segmento` (string) - Filtrar por segmento
- `origem` (string) - Filtrar por origem
- `estado` (string) - Filtrar por estado
- `limit` (number) - Registos por página (default: 50)
- `offset` (number) - Deslocamento (default: 0)

**Exemplo:**
```bash
GET /api/leads?segmento=ENERGIA&estado=PROPOSTA_ENVIADA&limit=20
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "44444444-4444-4444-4444-444444444444",
      "organization_id": "11111111-1111-1111-1111-111111111111",
      "nome": "João Silva",
      "email": "joao@example.com",
      "telefone": "919999999",
      "origem": "WEBSITE",
      "segmento": "ENERGIA",
      "estado": "CONTACTADO",
      "score": 75,
      "created_at": "2024-06-01T10:00:00Z"
    }
  ]
}
```

### Criar Lead

```
POST /leads
```

**Request Body:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@example.com",
  "telefone": "918888888",
  "origem": "META_ADS",
  "segmento": "TELECOMUNICACOES",
  "rgpd_consent": true,
  "notas": "Lead qualificado",
  "tags": ["hot", "vip"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "55555555-5555-5555-5555-555555555555",
    "id_parcendi": "L-1717231200000-abc123def",
    "organization_id": "11111111-1111-1111-1111-111111111111",
    ...
  }
}
```

### Obter Lead (Detalhe)

```
GET /leads/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "44444444-4444-4444-4444-444444444444",
    ...
  }
}
```

### Atualizar Lead

```
PATCH /leads/:id
```

**Request Body:**
```json
{
  "estado": "PROPOSTA_ENVIADA",
  "score": 85,
  "notas": "Proposta enviada em 01/06/2024"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "44444444-4444-4444-4444-444444444444",
    "estado": "PROPOSTA_ENVIADA",
    ...
  }
}
```

### Eliminar Lead (Soft Delete)

```
DELETE /leads/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "44444444-4444-4444-4444-444444444444",
    "deleted_at": "2024-06-01T11:30:00Z"
  }
}
```

---

## 💼 Businesses (Deals)

### Listar Businesses

```
GET /businesses
```

**Query Parameters:**
- `leadId` (uuid) - Filtrar por lead
- `segmento` (string) - Filtrar por segmento
- `estado` (string) - Filtrar por estado
- `limit` (number) - Registos por página
- `offset` (number) - Deslocamento

**Exemplo:**
```bash
GET /api/businesses?estado=PROPOSTA_ENVIADA&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      "lead_id": "44444444-4444-4444-4444-444444444444",
      "segmento": "ENERGIA",
      "estado": "PROPOSTA_ENVIADA",
      "valor_faturacao": 50000,
      "comissao_bruta": 5000,
      "responsavel_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
      "created_at": "2024-06-01T10:30:00Z"
    }
  ]
}
```

### Criar Business

```
POST /businesses
```

**Request Body:**
```json
{
  "lead_id": "44444444-4444-4444-4444-444444444444",
  "segmento": "ENERGIA",
  "valor_faturacao": 50000,
  "comissao_bruta": 5000,
  "data_prevista_fechamento": "2024-07-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    ...
  }
}
```

### Atualizar Status do Business

```
PATCH /businesses/:id
```

**Request Body:**
```json
{
  "estado": "CONTRATO_FECHADO",
  "data_real_fechamento": "2024-06-15"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
    "estado": "CONTRATO_FECHADO",
    ...
  }
}
```

---

## 👥 Customers

### Listar Clientes

```
GET /customers
```

**Query Parameters:**
- `search` (string) - Buscar por nome ou email
- `segmento` (string) - Filtrar por segmento
- `limit` (number) - Registos por página
- `offset` (number) - Deslocamento

### Criar Cliente

```
POST /customers
```

**Request Body:**
```json
{
  "nome": "ClienteCorp SA",
  "email": "contact@clientecorp.com",
  "telefone": "212222222",
  "segmento": "ENERGIA",
  "nif": "123456789",
  "morada": "Avenida da Liberdade, Lisboa"
}
```

---

## 📋 Tasks (Tarefas)

### Listar Tarefas

```
GET /tasks
```

**Query Parameters:**
- `atribuidoA` (uuid) - Filtrar por utilizador
- `estado` (string) - Filtrar por estado
- `prioridade` (string) - Filtrar por prioridade

**Exemplo:**
```bash
GET /api/tasks?atribuidoA=cccccccc-cccc-cccc-cccc-cccccccccccc&estado=ABERTA
```

### Criar Tarefa

```
POST /tasks
```

**Request Body:**
```json
{
  "titulo": "Contactar cliente sobre proposta",
  "descricao": "Confirmar interesse em proposta enviada",
  "atribuido_a": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "prioridade": "ALTA",
  "data_prazo": "2024-06-05T17:00:00Z",
  "business_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"
}
```

---

## 💰 Commissions

### Obter Resumo de Comissões

```
GET /commissions?summary=true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_bruta": 50000,
    "total_liquida": 37500,
    "total_parcendi": 5000,
    "by_status": {
      "PREVISTA": 15,
      "PAGA": 8,
      "CANCELADA": 2
    }
  }
}
```

### Listar Comissões

```
GET /commissions
```

**Query Parameters:**
- `businessId` (uuid) - Filtrar por negócio
- `estado` (string) - Filtrar por estado

### Criar Comissão

```
POST /commissions
```

**Request Body (apenas ADMIN_CEO e DIRECAO):**
```json
{
  "business_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
  "comissao_bruta": 5000,
  "comissao_liquida": 3750,
  "comissao_parcendi": 500,
  "comissao_originador": 1875,
  "comissao_executor": 1250,
  "comissao_unidade": 625,
  "retencao_marketing": 250,
  "retencao_social": 125,
  "bonus_recrutamento": 0
}
```

---

## 🔄 Workflow Típico

### Criar Lead → Business → Commission

```bash
# 1. Criar Lead
POST /api/leads
{
  "nome": "Cliente Novo",
  "email": "cliente@example.com",
  "telefone": "919999999",
  "origem": "WEBSITE",
  "segmento": "ENERGIA",
  "rgpd_consent": true
}
# Response: lead_id = "44444444-4444-4444-4444-444444444444"

# 2. Criar Business vinculado ao Lead
POST /api/businesses
{
  "lead_id": "44444444-4444-4444-4444-444444444444",
  "segmento": "ENERGIA",
  "valor_faturacao": 50000,
  "comissao_bruta": 5000
}
# Response: business_id = "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"

# 3. Criar Commission
POST /api/commissions
{
  "business_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
  "comissao_bruta": 5000,
  "comissao_liquida": 3750,
  ...
}
# Response: commission_id

# 4. Atualizar Lead para PROPOSTA_ENVIADA
PATCH /api/leads/44444444-4444-4444-4444-444444444444
{
  "estado": "PROPOSTA_ENVIADA"
}

# 5. Atualizar Business para PROPOSTA_ENVIADA
PATCH /api/businesses/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
{
  "estado": "PROPOSTA_ENVIADA"
}

# 6. Quando negócio fecha: CONTRATO_FECHADO
PATCH /api/businesses/eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
{
  "estado": "CONTRATO_FECHADO",
  "data_real_fechamento": "2024-06-15"
}

# 7. Marcar comissão como RECEBIDA/PAGA
PATCH /api/commissions/commission_id
{
  "estado": "PAGA"
}
```

---

## ⚠️ Códigos de Erro

| Código | Significado | Ação |
|--------|-------------|------|
| 200 | OK | Sucesso |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados inválidos, ver response |
| 401 | Unauthorized | Sem autenticação/token inválido |
| 403 | Forbidden | Utilizador sem permissão |
| 404 | Not Found | Recurso não encontrado |
| 500 | Server Error | Erro servidor, contactar suporte |

**Exemplo de erro (400):**
```json
{
  "error": "Invalid input data",
  "details": "Email inválido"
}
```

---

## 📊 Rate Limiting

- **Limite:** 100 requisições por hora por utilizador
- **Header:** `X-RateLimit-Remaining`
- **Reset:** `X-RateLimit-Reset`

---

## 🔐 Permissões por Role

| Endpoint | ADMIN_CEO | DIRECAO | OPERADORA | ESPECIALISTA | UNIDADE |
|----------|-----------|---------|-----------|--------------|---------|
| GET /leads | ✅ todas | ✅ todas | ✅ assigned | ❌ | ✅ unit |
| POST /leads | ✅ | ✅ | ✅ | ❌ | ✅ |
| PATCH /leads | ✅ | ✅ | ✅ assigned | ❌ | ✅ unit |
| DELETE /leads | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /commissions | ✅ | ✅ | ✅ assigned | ❌ | ✅ unit |
| POST /commissions | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🧪 Teste com Postman

1. Importar collection: `postman/collection.json` (se disponível)
2. Configurar ambiente com suas variáveis
3. Executar requests

---

## 📞 Suporte

Para dúvidas sobre APIs, contactar equipa de desenvolvimento.

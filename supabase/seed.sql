-- Seed data for PARCENDi CRM development
-- This script creates sample organizations, users, and leads for testing

-- Insert sample organization
INSERT INTO organizations (id, name, slug, created_by) VALUES
  ('11111111-1111-1111-1111-111111111111', 'PARCENDi Demo', 'parcendi-demo', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
ON CONFLICT DO NOTHING;

-- Insert sample unit
INSERT INTO units (id, organization_id, name, code, active) VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Lisbon Unit', 'PT-LIS-001', true),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Porto Unit', 'PT-POR-001', true)
ON CONFLICT DO NOTHING;

-- Insert sample users
INSERT INTO user_profiles (id, organization_id, unit_id, email, full_name, role, active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', NULL, 'admin@parcendi.com', 'Admin CEO', 'ADMIN_CEO', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', NULL, 'director@parcendi.com', 'Director', 'DIRECAO', true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'operator@parcendi.com', 'John Operator', 'OPERADORA', true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'specialist@parcendi.com', 'Jane Specialist', 'ESPECIALISTA', true)
ON CONFLICT DO NOTHING;

-- Insert sample leads
INSERT INTO leads (id, organization_id, unit_id, id_parcendi, nome, email, telefone, origem, segmento, responsavel_id, estado, score, rgpd_consent, created_by) VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'L-001', 'João Silva', 'joao@example.com', '919999999', 'WEBSITE', 'ENERGIA', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'CONTACTADO', 75, true, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'L-002', 'Maria Santos', 'maria@example.com', '918888888', 'META_ADS', 'TELECOMUNICACOES', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'PROPOSTA_ENVIADA', 85, true, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'L-003', 'Pedro Costa', 'pedro@example.com', '917777777', 'GOOGLE_ADS', 'SEGUROS', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'DOCUMENTACAO_RECEBIDA', 60, true, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'L-004', 'Ana Oliveira', 'ana@example.com', '916666666', 'MANUAL', 'CREDITO', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'EM_ANALISE', 70, true, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'L-005', 'Carlos Ferreira', 'carlos@example.com', '915555555', 'WHATSAPP', 'IMOBILIARIO', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'NOVA_LEAD', 45, true, 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT DO NOTHING;

-- Insert sample customers
INSERT INTO customers (id, organization_id, unit_id, nome, email, telefone, segmento, nif, created_by) VALUES
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'ClienteCorp SA', 'contact@clientecorp.com', '212222222', 'ENERGIA', '123456789', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT DO NOTHING;

-- Insert sample businesses
INSERT INTO businesses (id, organization_id, unit_id, lead_id, customer_id, segmento, estado, valor_faturacao, comissao_bruta, responsavel_id, created_by) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 'ENERGIA', 'PROPOSTA_ENVIADA', 50000, 5000, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT DO NOTHING;

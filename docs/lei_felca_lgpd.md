# Base de Conhecimento: Conformidade Regulatória (Lei Felca & LGPD) para Hub de Atletas

## 1. Termo de Escopo e Diretrizes de Aplicação

> ⚠️ **AVISO IMPORTANTE:** Este documento constitui estritamente uma **Base de Conhecimento e Estudo de Referência**. O conteúdo aqui apresentado serve como guia consultivo de melhores práticas arquiteturais e regulatórias. **Este estudo não substitui, não sobrepõe e não altera os padrões arquiteturais, de design pattern, de segurança ou de engenharia de software formalmente estipulados na aplicação principal em desenvolvimento.** Qualquer implementação deve ser adaptada e validada conforme as convenções de código e decisões técnicas preexistentes do projeto.

---

## 2. Visão Geral do Cenário Regulatório

A criação de uma plataforma de agregação de links (estilo *Linktree*) focada em atletas das categorias de base exige conformidade estrita com dois pilares brasileiros:

1. **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018):** Especificamente o Artigo 14, que exige consentimento específico e em destaque dado por pelo menos um dos pais ou pelo responsável legal para o tratamento de dados de crianças e adolescentes.
2. **Lei Felca (Lei nº 15.211/2025 - ECA Digital):** Legislação em vigor que coíbe a exploração comercial, publicidade direcionada e o design viciante para menores de idade, além de transferir às plataformas a obrigatoriedade da verificação ativa de idade e controle parental.

---

## 3. Fluxo de Autenticação e Onboarding (Verificação de Idade)

O processo de cadastro deve seguir uma ordem cronológica rígida (*Privacy by Design*) para impedir a coleta acidental de dados de menores sem a devida autorização legal.

```
[Início do Cadastro]
         │
         ▼
 ┌───────────────────────────────┐
 │   Coleta de Data de Nascimento│ (Nenhum outro dado é solicitado)
 └───────────────┬───────────────┘
                 │
                 ├─── [Maior de 16 anos] ───► Fluxo de cadastro padrão
                 │
                 └─── [Menor de 16 anos] ───┐
                                            ▼
                        ┌───────────────────────────────────────┐
                        │ Bloqueio de Fluxo Direto do Atleta    │
                        │ Exigência de Dados do Responsável     │
                        └───────────────────┬───────────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────┐
                        │ Coleta: Nome, CPF e E-mail do Adulto  │
                        └───────────────────┬───────────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────┐
                        │ Validação Externa (E-mail / SMS)      │
                        └───────────────────┬───────────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────┐
                        │ Consentimento Granular (LGPD Art. 14) │
                        └───────────────────┬───────────────────┘
                                            │
                                            ▼
                        ┌───────────────────────────────────────┐
                        │   Ativação do Perfil do Atleta Base   │
                        └───────────────────────────────────────┘
```

### Etapas do Fluxo Sequencial:
1. **Filtro de Idade Inicial:** Entrada exclusiva da data de nascimento. Se o usuário possuir idade inferior a 16 anos, a interface bloqueia o prosseguimento autônomo.
2. **Redirecionamento ao Responsável:** A interface solicita a identificação do pai, mãe ou tutor legal (Nome Completo, CPF e E-mail).
3. **Autenticação de Maioridade:** Envio de token de validação para o e-mail/SMS do responsável antes da liberação do painel.
4. **Termo de Consentimento Granular:** Exibição clara e inequívoca das caixas de seleção detalhando o que será feito com os dados do menor (ex: exibição pública de nome, fotos e vídeos de lances esportivos).

---

## 4. Modelagem Estatística e Arquitetura de Banco de Dados

Para fins de auditoria perante a Autoridade Nacional de Proteção de Dados (ANPD), a tabela de logs de consentimento deve operar sob a premissa de **Append-Only** (apenas inserção). Atualizações (*updates*) ou deleções físicas (*hard deletes*) são proibidas nesta estrutura.

### 4.1. Tabela: `guardians` (Responsáveis Legais)
Garante o vínculo de responsabilidade e identificação civil do adulto.

| Campo | Tipo de Dados | Restrições | Função / Justificativa LGPD |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Unique | Identificador universal e imutável do responsável. |
| `full_name` | VARCHAR(255) | NOT NULL | Nome completo para registro de termos de aceite. |
| `document_hash` | VARCHAR(64) | NOT NULL, Index | CPF do responsável armazenado via hash/criptografia, mitigando riscos de vazamento e validando a unicidade. |
| `email` | VARCHAR(255) | NOT NULL, Unique | Canal de comunicação jurídica e notificações de auditoria. |
| `verified_at` | TIMESTAMP | NULLABLE | Registro do momento em que a identidade/contato do adulto foi confirmada. |

### 4.2. Tabela: `players` (Atletas da Base / Menores)
Dados específicos da vitrine esportiva do menor.

| Campo | Tipo de Dados | Restrições | Função / Justificativa LGPD |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Unique | Identificador do atleta. |
| `guardian_id` | UUID | FK -> `guardians(id)` | Vínculo mandatório. O menor não existe no sistema sem um responsável atrelado. |
| `date_of_birth` | DATE | NOT NULL | Prova cronológica da menoridade e cálculo dinâmico de categoria de base. |
| `is_active` | BOOLEAN | DEFAULT FALSE | Controla a publicação do perfil de links `/p/atleta`. |

### 4.3. Tabela: `consent_logs` (Histórico de Auditoria Append-Only)
Registra o ciclo de vida do consentimento dado pelo responsável.

| Campo | Tipo de Dados | Restrições | Função / Justificativa LGPD |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Unique | Identificador único do evento de log. |
| `guardian_id` | UUID | FK -> `guardians(id)` | Identifica o autor do aceite ou da revogação. |
| `player_id` | UUID | FK -> `players(id)` | Identifica o menor impactado pela decisão. |
| `action` | ENUM | `GRANTED`, `REVOKED` | Estado do consentimento. Se o pai revogar, um novo registro `REVOKED` é inserido. |
| `policy_version` | VARCHAR(20) | NOT NULL | Versão exata da Política de Privacidade aceita (ex: `v1.0.2`). |
| `ip_address` | VARCHAR(45) | NOT NULL | Endereço IP (IPv4 ou IPv6) de onde partiu a requisição de aceite. |
| `user_agent` | TEXT | NOT NULL | Identificação técnica do navegador/dispositivo para fins periciais. |
| `permissions` | JSONB | NOT NULL | Estrutura granular das autorizações (ex: `{"display_photos": true, "public_stats": false}`). |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Carimbo de data e hora do evento de auditoria. |

---

## 5. Diretrizes de Privacidade e Engenharia da Informação

Ao processar a exibição da página pública de links do atleta, as seguintes regras técnicas devem ser observadas pelo ecossistema da aplicação:

### 5.1. Minimização de Dados e Proteção de Contato
* **Canal de Contato Indireto:** É proibida a veiculação de dados de contato direto do menor (como telefone celular pessoal ou e-mail do menor). Todos os botões de redirecionamento para contato (WhatsApp, redes sociais, chamadas) devem apontar obrigatoriamente para o número ou e-mail do responsável legal, empresário homologado ou clube.
* **Campos Livres Controlados:** Evitar a presença de inputs de texto livre na exibição pública que possibilitem ao menor inserir informações sensíveis, como endereço residencial, nome da instituição de ensino ou rotinas de treino geolocalizadas.

### 5.2. Mídia e Integrações de Terceiros (Embeds)
* **Desativação de Autoplay:** Caso a listagem de links incorpore reprodutores de vídeo (como frames do YouTube ou Instagram com lances do atleta), os parâmetros de código de incorporação devem desativar nativamente o `autoplay`. O início do consumo de mídia deve depender de uma ação voluntária do visitante.
* **Neutralização de Rastreamento (Analytics):** Scripts de rastreamento comportamental, pixels de conversão de redes sociais e ferramentas de anúncios analíticos injetados na rota pública `/p/` devem ser configurados para atuar em modo restrito. É vedada a coleta de identificadores de publicidade móvel ou cookies comportamentais para fins de remarketing direcionado aos perfis de menores.

### 5.3. Política de Descarte de Dados (Soft Delete)
Quando houver a solicitação de exclusão da conta por parte do responsável:
1. Os dados biográficos na tabela `players` devem ser ofuscados ou sofrer deleção lógica (*soft delete*).
2. A tabela `consent_logs` **não** deve ser limpa, permanecendo intacta para fins de cumprimento de obrigação legal e proteção jurídica da plataforma em disputas judiciais futuras, conforme autorizado pelo framework regulatório da LGPD.

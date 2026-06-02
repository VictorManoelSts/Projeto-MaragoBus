# MaragoBus — Documentação Técnica

Sistema de reserva de vagas em ônibus universitário para Maragogi/AL. Desenvolvido em React Native (Expo) com backend Firebase.

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Estrutura de Pastas](#3-estrutura-de-pastas)
4. [Configuração do Ambiente](#4-configuração-do-ambiente)
5. [Firebase](#5-firebase)
6. [Autenticação](#6-autenticação)
7. [Papéis de Usuário](#7-papéis-de-usuário)
8. [Regras de Negócio](#8-regras-de-negócio)
9. [Navegação](#9-navegação)
10. [Telas](#10-telas)
11. [Serviços](#11-serviços)
12. [Contextos](#12-contextos)
13. [Modelos de Dados](#13-modelos-de-dados)
14. [Cloud Functions](#14-cloud-functions)
15. [Utilitários](#15-utilitários)
16. [Testes](#16-testes)
17. [Como Rodar](#17-como-rodar)
18. [Deploy](#18-deploy)

---

## 1. Visão Geral

O MaragoBus é um aplicativo mobile que gerencia o transporte universitário entre Maragogi e Japaratinga (AL). Alunos reservam vagas no ônibus diariamente, motoristas visualizam a lista de passageiros e administradores gerenciam os cadastros.

**Problema resolvido:** Substituir o controle manual (listas em papel ou WhatsApp) por um sistema digital com reservas em tempo real, controle de vagas, advertências automáticas e comprovante digital.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework mobile | React Native | 0.81.5 |
| Plataforma de desenvolvimento | Expo | ~54.0.33 |
| Linguagem | TypeScript | ~5.9.2 |
| Backend / Banco de dados | Firebase (Firestore) | ^11.0.0 |
| Autenticação | Firebase Auth | ^11.0.0 |
| Funções serverless | Firebase Cloud Functions | v2 (Node 20) |
| Persistência de sessão | AsyncStorage | ^2.1.2 |
| Navegação | React Navigation | ^7.0.0 |
| Testes | Jest + jest-expo | ^29.7.0 / ^55.0.17 |

---

## 3. Estrutura de Pastas

```
maragobus/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx          # Tela de login
│   │   ├── aluno/
│   │   │   ├── ReservaScreen.tsx        # Reservar / cancelar vaga
│   │   │   └── ComprovanteScreen.tsx    # Comprovante com QR simulado
│   │   ├── admin/
│   │   │   ├── ReservasScreen.tsx       # Lista de reservas do dia
│   │   │   ├── AlunosScreen.tsx         # Gestão de alunos
│   │   │   └── CadastroScreen.tsx       # Cadastrar novo aluno
│   │   └── motorista/
│   │       └── MotoristaScreen.tsx      # Lista de passageiros
│   ├── services/
│   │   ├── firebase.ts                  # Inicialização do Firebase
│   │   ├── auth.service.ts             # Login, logout, onAuthChange
│   │   ├── alunos.service.ts           # CRUD de alunos
│   │   ├── reservas.service.ts         # Criar / cancelar / listar reservas
│   │   └── admins.service.ts           # Buscar dados do admin
│   ├── contexts/
│   │   ├── AuthContext.tsx             # Estado global de autenticação
│   │   └── ReservaContext.tsx          # Reserva ativa do aluno (compartilhada)
│   ├── components/
│   │   ├── AppHeader.tsx               # Cabeçalho com logo e logout
│   │   ├── Avatar.tsx                  # Foto ou iniciais do aluno
│   │   ├── Badge.tsx                   # Etiqueta colorida
│   │   ├── Button.tsx                  # Botão reutilizável (variantes)
│   │   ├── Divider.tsx                 # Separador horizontal
│   │   ├── InfoRow.tsx                 # Linha label + valor
│   │   └── Input.tsx                   # Campo de texto e seletor
│   ├── constants/
│   │   ├── theme.ts                    # Cores, espaçamentos, tipografia
│   │   └── appData.ts                  # Listas (faculdades, cursos, etc.) e formatações
│   ├── utils/
│   │   ├── auth.ts                     # cpfParaEmail()
│   │   ├── dates.ts                    # Lógica de datas e janela de reservas
│   │   └── alunos.ts                   # calcularAdvertencia(), calcularNovoStatus()
│   ├── types/
│   │   └── Index.ts                    # Interfaces e tipos globais
│   └── __tests__/
│       ├── appData.test.ts             # getIniciais, formatarCPF, formatarTelefone
│       ├── dates.test.ts               # toYMD, dataAmanha, dataProximaViagem, etc.
│       ├── alunos.test.ts              # cpfParaEmail, calcularAdvertencia, calcularNovoStatus
│       ├── auth.service.test.ts        # login, logout, onAuthChange
│       ├── alunos.service.test.ts      # Todos os métodos do service de alunos
│       ├── reservas.service.test.ts    # Todos os métodos do service de reservas
│       └── admins.service.test.ts      # getAdmin, criarAdmin
├── functions/
│   └── src/
│       └── index.ts                    # Cloud Functions (criarAluno, criarMotorista, excluirAluno, criarAdmin)
├── App.tsx                             # Entry point, navegadores e providers
├── .env                                # Credenciais Firebase (não versionado)
├── .env.example                        # Template de variáveis de ambiente
├── firebase.json                       # Configuração do Firebase CLI
├── .firebaserc                         # Projeto Firebase ativo
├── firestore.rules                     # Regras de segurança do Firestore
├── firestore.indexes.json              # Índices do Firestore
└── storage.rules                       # Regras do Firebase Storage
```

---

## 4. Configuração do Ambiente

### Pré-requisitos

- Node.js 20+
- Expo CLI (`npm install -g expo-cli`)
- Firebase CLI (`npm install -g firebase-tools`)
- App **Expo Go** instalado no celular (iOS ou Android)

### Instalação

```bash
# Instalar dependências do app
npm install

# Instalar dependências das Cloud Functions
cd functions && npm install && cd ..
```

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha com as credenciais do console Firebase:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

> O prefixo `EXPO_PUBLIC_` é obrigatório para o Expo injetar as variáveis no bundle (Expo SDK 49+). O arquivo `.env` está no `.gitignore` e nunca deve ser versionado.

---

## 5. Firebase

**Projeto:** `projeto-maragobus`
**Região das Functions:** `southamerica-east1` (São Paulo)

### Serviços utilizados

| Serviço | Finalidade |
|---|---|
| **Firebase Auth** | Autenticação por e-mail/senha (CPF convertido em e-mail) |
| **Firestore** | Banco de dados em tempo real (alunos, reservas, usuários, advertências) |
| **Cloud Functions v2** | Criação e exclusão de usuários com Admin SDK |
| **Firebase Storage** | Reservado para fotos de alunos (regras configuradas) |

### Coleções do Firestore

#### `usuarios`
Tabela de papéis — consultada logo após o login para saber o papel do usuário.

| Campo | Tipo | Descrição |
|---|---|---|
| `papel` | `'aluno' \| 'motorista' \| 'admin'` | Papel do usuário |
| `nome` | string | Nome completo |
| `status` | `'ativo' \| 'suspenso'` | Status (alunos e motoristas) |
| `criadoEm` | Timestamp | Data de criação |
| `updatedAt` | Timestamp | Última atualização |

#### `alunos`
Dados completos dos alunos. O ID do documento é o UID do Firebase Auth.

| Campo | Tipo | Descrição |
|---|---|---|
| `nome` | string | Nome completo |
| `cpf` | string | CPF formatado |
| `foto` | string \| null | URI da foto de perfil |
| `telefone` | string | Telefone formatado |
| `endereco` | string | Endereço completo |
| `faculdade` | string | Nome da faculdade |
| `curso` | string | Nome do curso |
| `modalidade` | `'Presencial' \| 'Semipresencial' \| 'Online'` | Modalidade do curso |
| `semestreAtual` | number | Semestre em andamento |
| `anoConclusao` | number | Ano previsto de conclusão |
| `pontoEmbarque` | string | Ponto de embarque escolhido |
| `status` | `'ativo' \| 'suspenso'` | Status do aluno |
| `advertencias` | number | Contador de advertências (0–n) |
| `uid` | string | UID do Firebase Auth |
| `criadoEm` | Timestamp | Data de cadastro |
| `updatedAt` | Timestamp | Última atualização |

#### `reservas`
O ID do documento é composto: `{alunoId}_{YYYY-MM-DD}`. Isso garante unicidade de uma reserva por aluno por dia.

| Campo | Tipo | Descrição |
|---|---|---|
| `alunoId` | string | UID do aluno |
| `data` | string | Data no formato `YYYY-MM-DD` |
| `hora` | string | Hora da reserva no formato `HH:mm` |
| `confirmada` | boolean | Sempre `true` (reservas canceladas são excluídas) |
| `nomeAluno` | string | Denormalizado para leitura rápida |
| `foto` | string \| null | Denormalizado |
| `faculdade` | string | Denormalizado |
| `curso` | string | Denormalizado |
| `modalidade` | string | Denormalizado |
| `pontoEmbarque` | string | Denormalizado |
| `telefone` | string | Denormalizado |
| `semestreAtual` | number | Denormalizado |

> **Denormalização:** Os campos do aluno são copiados na reserva para evitar leituras extras ao exibir a lista de passageiros.

#### `motoristas`
Dados dos motoristas. ID = UID do Firebase Auth.

| Campo | Tipo |
|---|---|
| `nome` | string |
| `cpf` | string |
| `telefone` | string |
| `uid` | string |

#### `admins`
Dados dos administradores. ID = UID do Firebase Auth.

| Campo | Tipo |
|---|---|
| `nome` | string |
| `cpf` | string |
| `uid` | string |

#### `advertencias`
Log imutável de advertências aplicadas (ID gerado automaticamente).

| Campo | Tipo | Descrição |
|---|---|---|
| `alunoId` | string | UID do aluno |
| `numero` | number | Número da advertência naquele momento |
| `criadoEm` | Timestamp | Data de aplicação |

---

## 6. Autenticação

O Firebase Auth foi configurado para aceitar **e-mail/senha**, mas os usuários fazem login com **CPF**. A conversão ocorre na função `cpfParaEmail()`:

```
CPF: 123.456.789-01  →  E-mail: 12345678901@maragobus.internal
```

O domínio `@maragobus.internal` é fictício e nunca recebe e-mails — serve apenas como chave única no Firebase Auth.

### Fluxo de login

```
1. Usuário informa CPF + senha + perfil (aluno / motorista / admin)
2. CPF é convertido em e-mail e enviado ao Firebase Auth
3. Firebase retorna o UID do usuário autenticado
4. O app consulta `usuarios/{uid}` no Firestore para obter o papel
5. O papel é comparado com o perfil selecionado — se divergir, login é recusado
6. Conforme o papel, o app navega para AlunoTabs, MotoristaRoot ou AdminTabs
```

### Persistência de sessão

A sessão é persistida via `AsyncStorage` (`initializeAuth` com `getReactNativePersistence`). O usuário permanece logado mesmo após fechar o app.

### AuthContext

O `AuthContext` escuta `onAuthStateChanged` e expõe `{ user, loading }`. Enquanto `loading` é `true`, o app exibe uma splash screen com o logo e um indicador de carregamento.

---

## 7. Papéis de Usuário

### Aluno (`papel: 'aluno'`)

- Faz e cancela reservas de vaga dentro da janela de horário
- Visualiza comprovante com QR simulado
- Pode ter até 2 advertências antes de ser suspenso automaticamente
- Alunos suspensos não conseguem confirmar reservas

### Motorista (`papel: 'motorista'`)

- Visualiza os passageiros confirmados para o dia atual
- Pode alternar a visualização entre **Por Faculdade** e **Por Ponto de Embarque**
- Toca em um aluno para ver seus dados completos (bottom sheet)
- Alunos suspensos são excluídos da lista do motorista automaticamente

### Administrador (`papel: 'admin'`)

- **Reservas:** Visualiza reservas de hoje e amanhã, agrupadas por faculdade
- **Alunos:** Lista, filtra e busca alunos; aplica advertências, suspende/reativa, exclui
- **Cadastrar:** Cadastra novos alunos via formulário completo (chama Cloud Function)

---

## 8. Regras de Negócio

### Janela de reservas

| Situação | Comportamento |
|---|---|
| Seg–Qui antes das 17h | Reserva para **hoje** |
| Seg–Qui a partir das 17h | Reserva para o **próximo dia útil** |
| Sexta antes das 17h | Reserva para **hoje (sexta)** |
| Sexta a partir das 17h | Reserva para a **segunda-feira** seguinte |
| Sábado ou domingo | Reserva para a **segunda-feira** seguinte |

A janela de abertura das inscrições é das **17h até 11h** do dia seguinte. Fora desse intervalo, o botão de confirmar é desabilitado e exibe uma mensagem.

### Cancelamento

Cancelamentos são permitidos até as **16h** do dia da reserva. Após esse horário, o botão de cancelamento não é exibido.

### Advertências e suspensão

- O administrador aplica advertências manualmente na tela de Alunos
- Ao atingir **3 advertências**, o aluno é suspenso automaticamente pelo sistema
- A suspensão pode ser revertida manualmente pelo admin
- O admin também pode suspender/reativar manualmente a qualquer momento
- Alunos suspensos não podem confirmar reservas e não aparecem na lista do motorista
- Cada advertência aplicada gera um registro na coleção `advertencias` (log imutável)

### Pontos de embarque disponíveis

- Posto Shell
- Praça Central
- Supermercado BH
- Igreja Matriz
- Rodoviária

---

## 9. Navegação

A navegação é gerenciada pelo **React Navigation v7** com dois tipos de navigator:

### RootStack (NativeStackNavigator)

Tela raiz sem header visível. Gerencia qual fluxo o usuário vê após o login.

```
RootStack
├── Login
├── AlunoTabs      ← recebe { aluno: Aluno } como parâmetro
├── MotoristaRoot
└── AdminTabs      ← recebe { admin: Admin } como parâmetro
```

### AlunoTabs (BottomTabNavigator)

Wrappado no `ReservaProvider` para que a reserva ativa seja compartilhada entre as abas.

```
AlunoTabs
├── Reserva (🎫)     ← ReservaScreen
└── Comprovante (📋) ← ComprovanteScreen
```

### AdminTabs (BottomTabNavigator)

```
AdminTabs
├── Reservas (📊)  ← ReservasScreen
├── Alunos (👤)    ← AlunosScreen
└── Cadastrar (➕) ← CadastroScreen
```

### MotoristaRoot

Tela única sem tabs, exibe diretamente o `MotoristaScreen`.

---

## 10. Telas

### LoginScreen (`src/screens/auth/LoginScreen.tsx`)

Tela inicial do app. Fundo azul claro com logo centralizado e card branco de login.

**Componentes:**
- Seletor de perfil (Aluno / Motorista / Admin) — segmentado
- Campo CPF com máscara automática `000.000.000-00`
- Campo senha (secureTextEntry)
- Botão Entrar com loading state

**Comportamento:**
- Valida CPF (11 dígitos) e senha (mínimo 4 caracteres) antes de chamar a API
- Exibe `Alert` para erros específicos do Firebase Auth (credencial inválida, muitas tentativas, etc.)
- Verifica se o papel do usuário bate com o perfil selecionado

---

### ReservaScreen (`src/screens/aluno/ReservaScreen.tsx`)

Tela principal do aluno. Exibe o status da reserva e permite confirmar ou cancelar.

**Componentes:**
- `AppHeader` com nome do aluno e botão de logout
- Banner verde/laranja indicando se as inscrições estão abertas ou fechadas
- Card com dados do aluno (faculdade, curso, semestre, ponto de embarque)
- Botão "Confirmar Vaga" (quando sem reserva) ou card "Vaga Confirmada" (quando reservado)
- Botão "Cancelar Reserva" com fluxo de confirmação em dois passos
- Banner de advertências (quando `advertencias > 0`)
- Relógio atualizado a cada minuto (para recalcular disponibilidade sem recarregar)

**Estado compartilhado:** A reserva ativa é armazenada no `ReservaContext`, tornando-a acessível também na aba de Comprovante sem nova requisição ao Firestore.

---

### ComprovanteScreen (`src/screens/aluno/ComprovanteScreen.tsx`)

Exibe o comprovante visual da reserva ativa.

**Quando há reserva:**
- Card com cabeçalho azul contendo Avatar (iniciais ou foto), nome, curso e badge "Reserva Confirmada"
- Seção de dados: data, hora, faculdade, curso, modalidade, ponto de embarque, telefone, semestre
- QR Code simulado (padrão fixo de pixels — substituir por `react-native-qrcode-svg` em produção)
- Instrução: "Apresente ao embarcar em Japaratinga"

**Quando não há reserva:**
- Tela vazia com ícone e instrução para reservar na aba "Reserva"

---

### ReservasScreen (`src/screens/admin/ReservasScreen.tsx`)

Visão geral das reservas para o administrador.

**Componentes:**
- Cards de resumo: total de hoje, total de amanhã/segunda, total geral
- Seletor de abas: **Hoje** / **Amanhã** (bloqueada com 🔒 antes das 17h)
- Lista de reservas agrupadas por faculdade
- Cada grupo exibe: nome do aluno, ponto de embarque e badge de modalidade

**Lógica de carregamento:**
1. Busca reservas de hoje (`getReservasPorData`)
2. Se hora ≥ 17h ou fim de semana, busca também reservas de amanhã
3. Para cada lista de reservas, busca os dados completos dos alunos em lote (`getAlunosByIds`)
4. Exibe os dados denormalizados da reserva como fallback se o aluno não for encontrado

---

### AlunosScreen (`src/screens/admin/AlunosScreen.tsx`)

Gestão completa de alunos para o administrador.

**Componentes:**
- Campo de busca por nome ou CPF
- Filtros rápidos: Todos / Suspensos / Concluindo (ano atual)
- Lista com `FlatList` — cada item exibe Avatar, nome, faculdade, curso, semestre e badges de status/advertências
- Bottom sheet (Modal) com detalhes completos do aluno e ações

**Ações disponíveis no bottom sheet:**
| Ação | Comportamento |
|---|---|
| Advertir | Aplica +1 advertência; suspende automaticamente ao chegar em 3 |
| Suspender / Reativar | Alterna o status do aluno |
| Excluir | Confirmação + exclusão via Cloud Function (remove do Auth e do Firestore) |

**Atualização otimista:** ao aplicar advertência ou alterar status, o estado local é atualizado imediatamente sem recarregar a lista inteira.

---

### CadastroScreen (`src/screens/admin/CadastroScreen.tsx`)

Formulário de cadastro de novo aluno.

**Seções do formulário:**
1. **Dados Pessoais:** nome, CPF (com máscara), senha inicial, telefone, endereço
2. **Dados Acadêmicos:** faculdade (chips horizontais), curso (chips horizontais), modalidade (seletor), semestre atual, ano de conclusão
3. **Ponto de Embarque:** lista de opções com seleção exclusiva

**Validações:**
- Nome obrigatório
- CPF com 11 dígitos
- Senha mínima de 6 caracteres
- Faculdade, curso, modalidade e ponto obrigatórios
- Semestre entre 1 e 12
- Ano de conclusão ≥ 2024

**Feedback:** banner verde de sucesso por 4 segundos após o cadastro; o formulário é limpo automaticamente.

---

### MotoristaScreen (`src/screens/motorista/MotoristaScreen.tsx`)

Lista de passageiros do dia para o motorista.

**Componentes:**
- `AppHeader` com nome do motorista (via `user.displayName` do Firebase Auth)
- Card azul com total de reservas confirmadas
- Seletor de visão: **Por Faculdade** / **Por Ponto de Embarque**
- Lista agrupada com Avatar, nome, ponto (visão por faculdade) ou faculdade + curso + telefone (visão por ponto)
- Bottom sheet com dados completos do passageiro ao tocar em um item

**Filtro de alunos suspensos:** reservas de alunos com `status === 'suspenso'` são removidas da lista antes da exibição.

---

## 11. Serviços

### `src/services/firebase.ts`

Inicializa o app Firebase com credenciais lidas das variáveis de ambiente e exporta as instâncias compartilhadas:

```typescript
export const app       // FirebaseApp
export const auth      // Auth (com persistência AsyncStorage)
export const db        // Firestore
export const functions // Functions (região southamerica-east1)
```

---

### `src/services/auth.service.ts`

| Função | Descrição |
|---|---|
| `login(cpf, senha)` | Converte CPF em e-mail, autentica no Firebase e retorna `{ uid, papel }` |
| `logout()` | Encerra a sessão do Firebase Auth |
| `onAuthChange(callback)` | Escuta mudanças de autenticação; retorna a função de cancelamento |

---

### `src/services/alunos.service.ts`

| Função | Descrição |
|---|---|
| `getAlunos()` | Retorna todos os alunos da coleção `alunos` |
| `getAluno(uid)` | Retorna um aluno pelo UID ou `null` |
| `getAlunosByIds(ids)` | Busca múltiplos alunos em lotes de 10 (limite do Firestore para `in`) |
| `updateAluno(id, dados)` | Atualiza campos parciais do aluno e define `updatedAt` |
| `aplicarAdvertencia(aluno)` | Incrementa advertências; suspende automaticamente ao atingir 3; registra log |
| `alternarStatus(aluno)` | Alterna entre `ativo` e `suspenso` |
| `excluirAluno(alunoId)` | Chama Cloud Function `excluirAluno` (remove do Auth e Firestore) |
| `criarAluno(dados)` | Chama Cloud Function `criarAluno`; retorna `{ uid }` |

---

### `src/services/reservas.service.ts`

| Função | Descrição |
|---|---|
| `getReservaAtiva(alunoId)` | Busca reserva do aluno para a próxima viagem (baseado em `dataProximaViagem()`) |
| `criarReserva(aluno)` | Cria reserva com dados denormalizados do aluno; ID: `{alunoId}_{data}` |
| `cancelarReserva(alunoId)` | Remove o documento da reserva ativa |
| `getReservasPorData(data)` | Busca todas as reservas de uma data específica |

---

### `src/services/admins.service.ts`

| Função | Descrição |
|---|---|
| `getAdmin(uid)` | Busca dados do admin em `admins/{uid}`; fallback para `usuarios/{uid}` se não encontrado |
| `criarAdmin(dados)` | Chama Cloud Function `criarAdmin` (apenas para setup inicial) |

---

## 12. Contextos

### AuthContext (`src/contexts/AuthContext.tsx`)

Escuta `onAuthStateChanged` e expõe o estado global de autenticação para toda a árvore de componentes.

```typescript
interface AuthState {
  user: User | null   // Usuário Firebase ou null
  loading: boolean    // true enquanto aguarda resposta inicial do Firebase
}
```

**Uso:** `const { user, loading } = useAuth()`

---

### ReservaContext (`src/contexts/ReservaContext.tsx`)

Compartilha a reserva ativa do aluno entre `ReservaScreen` e `ComprovanteScreen` sem precisar recarregar do Firestore ao mudar de aba.

```typescript
interface ReservaState {
  reserva: Reserva | null
  setReserva: (r: Reserva | null) => void
}
```

**Uso:** `const { reserva, setReserva } = useReserva()`

O `ReservaProvider` envolve o `AlunoNavigator`, garantindo que o estado seja reiniciado a cada login.

---

## 13. Modelos de Dados

```typescript
// Papéis disponíveis
type UserRole    = 'aluno' | 'motorista' | 'admin'
type StatusAluno = 'ativo' | 'suspenso'
type Modalidade  = 'Presencial' | 'Semipresencial' | 'Online'

interface Aluno {
  id: string
  nome: string
  cpf: string
  foto: string | null
  telefone: string
  endereco: string
  faculdade: string
  curso: string
  modalidade: Modalidade
  semestreAtual: number
  anoConclusao: number
  pontoEmbarque: string
  status: StatusAluno
  advertencias: number
  uid?: string
}

interface Reserva {
  id: string           // {alunoId}_{YYYY-MM-DD}
  alunoId: string
  data: string         // 'YYYY-MM-DD'
  hora: string         // 'HH:mm'
  confirmada: boolean
  // campos denormalizados:
  nomeAluno?: string
  foto?: string | null
  faculdade?: string
  curso?: string
  modalidade?: string
  pontoEmbarque?: string
  telefone?: string
  semestreAtual?: number
}

interface Motorista {
  id: string; nome: string; cpf: string; telefone: string; uid?: string
}

interface Admin {
  id: string; nome: string; cpf: string; uid?: string
}
```

---

## 14. Cloud Functions

Todas as functions estão em `functions/src/index.ts`, deployadas na região `southamerica-east1`.

### `criarAluno`

**Requer:** chamador autenticado com papel `admin`

Cria o usuário no Firebase Auth com e-mail gerado a partir do CPF e insere os documentos em `alunos/{uid}` e `usuarios/{uid}`.

**Validação:** verifica CPF duplicado antes de criar (erro `already-exists` se o e-mail já existir).

### `criarMotorista`

**Requer:** chamador autenticado com papel `admin`

Cria o usuário no Firebase Auth e insere em `motoristas/{uid}` e `usuarios/{uid}`.

### `excluirAluno`

**Requer:** chamador autenticado com papel `admin`

Remove em paralelo: documento em `alunos/{uid}`, documento em `usuarios/{uid}` e o usuário do Firebase Auth (ignora silenciosamente se já não existir no Auth).

### `criarAdmin`

**Não requer autenticação**, mas só funciona se não houver nenhum admin cadastrado na coleção `usuarios`. Destinada ao setup inicial do sistema. Após o primeiro admin ser criado, retorna erro `permission-denied` para chamadas subsequentes.

---

## 15. Utilitários

### `src/utils/auth.ts`

```typescript
cpfParaEmail(cpf: string): string
// '123.456.789-01' → '12345678901@maragobus.internal'
```

### `src/utils/dates.ts`

```typescript
toYMD(d: Date): string              // Date → 'YYYY-MM-DD' (hora local, sem deslocamento UTC)
dataAtual(): string                 // Data de hoje em YYYY-MM-DD
dataAmanha(): string                // Próximo dia útil (pula fins de semana)
proximaSegunda(d: Date): Date       // Retorna a segunda-feira após sexta/sáb/dom
dataProximaViagem(): string         // Data alvo para reserva (aplica regra da janela de 17h)
horaAtualStr(): string              // Hora atual em 'HH:mm'
```

### `src/utils/alunos.ts`

```typescript
calcularAdvertencia(aluno: Aluno): Partial<Aluno>
// Retorna { advertencias: n+1, status?: 'suspenso' } sem modificar o objeto original

calcularNovoStatus(status: StatusAluno): StatusAluno
// Toggle: 'ativo' → 'suspenso', 'suspenso' → 'ativo'

LIMITE_ADVERTENCIAS = 3
```

### `src/constants/appData.ts`

```typescript
PONTOS_EMBARQUE: string[]   // Lista de pontos de embarque disponíveis
FACULDADES: string[]        // 18 faculdades cadastradas
CURSOS: string[]            // Cursos disponíveis
MODALIDADES                 // ['Presencial', 'Semipresencial', 'Online']

getIniciais(nome: string): string        // 'João Silva' → 'JS'
formatarCPF(raw: string): string         // '12345678901' → '123.456.789-01'
formatarTelefone(raw: string): string    // '82999990000' → '(82) 99999-0000'
dataHoje(): string                       // Data formatada pt-BR para exibição
```

---

## 16. Testes

O projeto usa **Jest** com o preset **jest-expo**. Os testes estão em `src/__tests__/`.

### Rodar os testes

```bash
npm test               # Roda todos os testes
npm run test:watch     # Modo watch (re-executa ao salvar)
```

### Cobertura atual

| Arquivo de teste | O que testa |
|---|---|
| `appData.test.ts` | `getIniciais`, `formatarCPF`, `formatarTelefone` |
| `dates.test.ts` | `toYMD`, `proximaSegunda`, `dataAtual`, `dataAmanha`, `dataProximaViagem` (todos os casos de horário) |
| `alunos.test.ts` | `cpfParaEmail`, `calcularAdvertencia`, `calcularNovoStatus` |
| `auth.service.test.ts` | `login` (sucesso, CPF com máscara, user não encontrado, erro Auth), `logout`, `onAuthChange` |
| `alunos.service.test.ts` | `getAlunos`, `getAluno`, `getAlunosByIds` (empty/chunk), `updateAluno`, `aplicarAdvertencia`, `alternarStatus`, `excluirAluno`, `criarAluno` |
| `reservas.service.test.ts` | `getReservaAtiva`, `criarReserva`, `cancelarReserva`, `getReservasPorData` |
| `admins.service.test.ts` | `getAdmin` (coleção admins, fallback usuarios, defaults, null), `criarAdmin` |

**Total: 101 testes passando.**

### Estratégia de mock

Os testes de serviço mocam completamente o módulo `../services/firebase` (substituindo `auth`, `db`, `functions` por objetos vazios) e os módulos do Firebase SDK (`firebase/auth`, `firebase/firestore`, `firebase/functions`). Isso garante que nenhuma requisição real é feita e os testes rodam offline.

---

## 17. Como Rodar

### Expo Go (recomendado para desenvolvimento)

```bash
# Na mesma rede Wi-Fi (LAN)
npx expo start --lan

# Qualquer rede (via túnel ngrok)
npx expo start --tunnel
```

Escaneie o QR code exibido no terminal com o app **Expo Go** (disponível na App Store e Google Play).

### Web (visualização rápida no browser)

```bash
npx expo start --web
# Acesse: http://localhost:8081
```

> Requer `react-native-web`, `react-dom` e `@expo/metro-runtime` instalados.

### Credenciais de teste

| Papel | CPF | Senha |
|---|---|---|
| Admin | `123.570.354-12` | `V1ct0r2308` |

---

## 18. Deploy

### Cloud Functions

```bash
# Instalar dependências e fazer deploy
cd functions && npm install && cd ..
firebase deploy --only functions
```

### Regras e índices do Firestore

```bash
firebase deploy --only firestore
```

### Deploy completo

```bash
firebase deploy
```

### Primeiro admin (setup inicial)

A function `criarAdmin` só funciona se não houver nenhum admin cadastrado. Use apenas uma vez:

```bash
curl -X POST \
  "https://southamerica-east1-projeto-maragobus.cloudfunctions.net/criarAdmin" \
  -H "Content-Type: application/json" \
  -d '{"data": {"nome": "Nome Admin", "cpf": "00000000000", "senha": "sua_senha"}}'
```

Após o primeiro admin criado, novos admins devem ser adicionados diretamente pelo **Firebase Console** (Authentication + documento manual em `usuarios` e `admins`).

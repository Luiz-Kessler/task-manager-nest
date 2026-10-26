# 📅 Cronograma: Gerenciador de Tarefas com NestJS + Prisma

> **Projeto 2.** Mesmo enunciado do projeto em Express, agora com as ferramentas que o mercado usa em vagas fullstack.
> **Como usar:** marque `[x]` ao concluir cada item. Um commit por tarefa concluída, desde o primeiro dia.
> **Ritmo assumido:** 1h30 a 2h por dia, 5 dias por semana.
> **Regra de ouro:** se travar por mais de **45 minutos**, pare, anote a dúvida (com a mensagem de erro completa) e me pergunte.

**Stack:** Node.js · NestJS · TypeScript · Prisma 7 · MySQL (em Docker) + MySQL Workbench · Angular · Git/GitHub

---

## 🗺️ Visão geral

| Fase | Tema | Banco | Duração estimada |
|---|---|---|---|
| 0 | Preparação do ambiente (inclui Docker) | - | 1 dia |
| 1 | API REST de tarefas (CRUD + validação + Prisma) | MySQL | 2 semanas |
| 2 | Relacionamentos entre tabelas (usuários, categorias) | MySQL | 1 semana |
| 3 | Autenticação e segurança (JWT, Guards) | MySQL | 1,5 semana |
| 4 | Front end em Angular | MySQL | 2 semanas |
| 5 | Testes, Swagger, Dockerfile completo e deploy | MySQL | 1,5 semana |

**Total: cerca de 9 semanas.**

### Por que MySQL em Docker?
- O **MySQL Workbench** só se conecta a bancos MySQL, então o banco do projeto inteiro é MySQL.
- Instalar o MySQL Server direto no Windows deu trabalho antes. Com **Docker**, você sobe o servidor com um comando (`docker compose up -d`) e o Workbench conecta nele como se fosse um MySQL instalado.
- Docker é muito pedido em vagas, e você já começa a usá-lo na Fase 0.

### Onde o Docker entra
| Quando | Para quê |
|---|---|
| Fase 0 | Instalar o Docker Desktop |
| Fase 1 (dia 6) | Subir o MySQL em container (`docker-compose.yml`) |
| Fase 5 | Containerizar a API e o front, com `docker-compose` de ponta a ponta |

---

## 🔧 Fase 0: Preparação do ambiente (1 dia)

- [ ] Conferir a versão do Node (`node -v`) e **atualizar se for menor que a exigida pelo Nest CLI** (veja a especificação, seção 2)
- [ ] Instalar o Nest CLI (`npm i -g @nestjs/cli`)
- [ ] Instalar o **Docker Desktop** e rodar `docker run hello-world`
- [ ] Confirmar que o **MySQL Workbench** abre (ele será a sua janela para o banco)
- [ ] Criar o repositório `task-manager-nest` no GitHub
- [ ] Deixar o projeto Express (Projeto 1) commitado e publicado no GitHub, como está
- [ ] Estudar o básico de TypeScript (tipos, interfaces, classes)

**Pronto quando:** `nest --version` e `docker --version` funcionam, e você entende o que é `string`, `number`, `interface` e `class` em TypeScript.

---

## 🟢 Fase 1: API REST de tarefas com NestJS + Prisma (2 semanas)

### Semana 1: Nest em memória

| Dia | Atividade | Entrega do dia |
|---|---|---|
| 1 | Conceitos do Nest (módulo, controller, provider) + criar o projeto com `nest new` | "Hello World" rodando em `localhost:3000` |
| 2 | Criar módulo, controller e service de `tasks`. Implementar `GET /tasks` e `POST /tasks` com array em memória | Duas rotas testadas no `requests.http` |
| 3 | `GET /tasks/:id`, `PUT /tasks/:id` e `DELETE /tasks/:id` + exceções (`404`) + `ParseIntPipe` (`400`) | CRUD completo em memória |
| 4 | DTOs com `class-validator` + `ValidationPipe` global | Todas as validações de entrada funcionando (`400`) |
| 5 | Filtro de exceções para o formato padrão de erro + validação do filtro `?status=` | Todos os erros no formato `{ error, message }` |

### Semana 2: Prisma e banco de verdade

| Dia | Atividade | Entrega do dia |
|---|---|---|
| 6 | Subir o MySQL no Docker, conectar o Workbench, instalar Prisma 7, modelar `Task` e rodar a primeira migration | Tabela `tasks` visível no Workbench |
| 7 | Criar `PrismaService` e `PrismaModule`. Migrar `GET /tasks` e `POST /tasks` | Duas rotas usando o banco |
| 8 | Migrar `GET /:id`, `PUT` e `DELETE` + tratar o erro `P2025` (registro não encontrado) | CRUD 100% no banco |
| 9 | README, `.env.example`, `requests.http` completo, perguntas de entrevista | Repositório publicado no GitHub |

- [ ] **Fase 1 concluída.** Envie o repositório para eu fazer o code review.

---

## 🟡 Fase 2: Relacionamentos entre tabelas (1 semana)

| Dia | Atividade |
|---|---|
| 1 | Estudar relacionamentos (chave estrangeira, 1:N, N:N) e `enum` no Prisma com MySQL |
| 2 | Trocar o `status` de `String` para `enum` (bom exercício de migration) |
| 3 | Ver o diagrama das tabelas no Workbench (Database → Reverse Engineer) |
| 4 | Modelar `User` e `Category` e relacionar com `Task` (1:N) |
| 5 | CRUD de categorias + `include` do Prisma para trazer a categoria junto da tarefa |
| 6 | Seed com dados de teste, filtros, ordenação e `groupBy` (rota de estatísticas) |
| 7 | Revisão, README atualizado, commit final |

- [ ] **Fase 2 concluída.**

---

## 🟠 Fase 3: Autenticação e segurança (1,5 semana)

| Dia | Atividade |
|---|---|
| 1 | Estudar: autenticação vs. autorização, hash de senha, o que é JWT |
| 2 | `POST /auth/register` com senha criptografada (bcrypt) |
| 3 | `POST /auth/login` retornando um JWT (`@nestjs/jwt`) |
| 4 | `AuthGuard` que valida o token (equivalente ao middleware do Express) |
| 5 | Proteger as rotas de tarefas: cada usuário só vê e altera as próprias |
| 6 | Decorator customizado `@CurrentUser()` e revisão de segurança (CORS, mensagens de erro) |
| 7 | Revisão e commit final |

- [ ] **Fase 3 concluída.**

---

## 🔵 Fase 4: Front end em Angular (2 semanas)

| Dia | Atividade |
|---|---|
| 1 | Criar projeto Angular, configurar `HttpClient`, habilitar CORS na API |
| 2 | Telas de cadastro e login |
| 3 | Guardar o token, `HttpInterceptor` e `AuthGuard` (route guard) |
| 4 | Tela de listagem de tarefas (loading e erro) |
| 5 | Criar, editar e excluir tarefas pela interface |
| 6 | Filtros por status e categoria |
| 7 | Ajustes de layout e tratamento de erros da API |

- [ ] **Fase 4 concluída.**

---

## 🟣 Fase 5: Diferenciais para o currículo (1,5 semana)

| Dia | Atividade |
|---|---|
| 1 | Testes unitários do service (Jest ou Vitest, conforme o projeto) |
| 2 | Testes e2e com Supertest (login e rotas protegidas) |
| 3 | Paginação e busca na listagem |
| 4 | Documentação com Swagger (`@nestjs/swagger`) |
| 5 | Dockerfile da API + `docker-compose` completo (API + MySQL) |
| 6 | Deploy (Render, Railway ou similar) |
| 7 | README profissional com prints e link do projeto no ar |

- [ ] **Fase 5 concluída. Projeto pronto para o portfólio! 🎉**

---

## 🧭 Depois do projeto

- [ ] Refazer o front em **React** (mesma API)
- [ ] Comparar Projeto 1 (Express) e Projeto 2 (Nest) por escrito: o que o Nest faz por você e o que o Express te obrigou a entender
- [ ] Ajustar LinkedIn e currículo com os dois projetos
- [ ] Simulação de entrevista técnica comigo

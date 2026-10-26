# 📘 Especificação: Fase 1 (API REST de Tarefas com NestJS + Prisma)

> Este documento explica **o que fazer, em que ordem e por quê**. Os links levam à documentação oficial.
> Acompanhe junto com o `CRONOGRAMA_NEST.md`.
> Você já construiu esta API em Express. Aqui o objetivo é **ver o que o Nest faz por você** e entender o que ele esconde por baixo.

**Stack desta fase:** Node.js · NestJS · TypeScript · Prisma 7 · MySQL (Docker) + MySQL Workbench

---

## 📑 Índice

1. [Mapa mental: Express vs. NestJS](#1-mapa-mental-express-vs-nestjs)
2. [Fase 0: Preparar o ambiente](#2-fase-0-preparar-o-ambiente)
3. [O que você vai construir](#3-o-que-você-vai-construir)
4. [Dia 1: Conceitos e criar o projeto](#4-dia-1-conceitos-e-criar-o-projeto)
5. [Dia 2: Módulo tasks, GET e POST em memória](#5-dia-2-módulo-tasks-get-e-post-em-memória)
6. [Dia 3: Rotas com id, PUT e DELETE](#6-dia-3-rotas-com-id-put-e-delete)
7. [Dia 4: DTOs e validação](#7-dia-4-dtos-e-validação)
8. [Dia 5: Formato padrão de erro](#8-dia-5-formato-padrão-de-erro)
9. [Dia 6: MySQL no Docker, Workbench e Prisma](#9-dia-6-mysql-no-docker-workbench-e-prisma)
10. [Dia 7: PrismaService e GET/POST no banco](#10-dia-7-prismaservice-e-getpost-no-banco)
11. [Dia 8: Terminar o CRUD no banco](#11-dia-8-terminar-o-crud-no-banco)
12. [Dia 9: Documentar e publicar](#12-dia-9-documentar-e-publicar)
13. [Critérios de aceite](#13-critérios-de-aceite)
14. [Desafios bônus](#14-desafios-bônus)
15. [Perguntas de entrevista](#15-perguntas-de-entrevista)
16. [Como pedir ajuda](#16-como-pedir-ajuda)

---

## 1. Mapa mental: Express vs. NestJS

Tudo que você escreveu no Projeto 1 tem um "equivalente" no Nest. Volte nesta tabela sempre que ficar perdido.

| No Express (Projeto 1) | No NestJS (Projeto 2) |
|---|---|
| `app.js` com `app.use(...)` | `AppModule` (módulo raiz) |
| `routes/taskRoutes.js` | Decorators no controller (`@Get()`, `@Post()`...) |
| `controllers/taskController.js` | `TasksController` (recebe a requisição) |
| Lógica + query dentro do controller | `TasksService` (regra de negócio e banco) |
| `validators/taskValidator.js` com vários `if` | **DTO** com decorators do `class-validator` |
| `parseId()` | `ParseIntPipe` |
| `res.status(404).json({...})` | `throw new NotFoundException(...)` |
| `errorHandler` (middleware com 4 parâmetros) | **Exception Filter** |
| `require` / `module.exports` | `import` / `export` + `@Module({ ... })` |
| `db.prepare("SELECT...").all()` | `this.prisma.task.findMany()` |
| `formatTask()` (snake_case → camelCase) | Não precisa: o Prisma já devolve `createdAt` |
| `updated_at = datetime('now')` manual | `@updatedAt` no schema: o Prisma atualiza sozinho |

### As 3 peças centrais do Nest

- **Module (módulo):** uma "caixa" que agrupa peças relacionadas. Exemplo: `TasksModule` guarda tudo de tarefas.
- **Controller:** recebe a requisição HTTP e devolve a resposta. Não deve ter lógica pesada.
- **Provider (service):** classe com a lógica. Marcada com `@Injectable()`, pode ser **injetada** em outras classes.

**Injeção de dependência (você já viu no Angular!):** em vez de você escrever `new TasksService()`, você pede no construtor e o Nest entrega pronto:

```ts
constructor(private readonly tasksService: TasksService) {}
```

### 📚 Para estudar
- [Introdução ao NestJS](https://docs.nestjs.com/)
- [Controllers](https://docs.nestjs.com/controllers)
- [Providers](https://docs.nestjs.com/providers)
- [Modules](https://docs.nestjs.com/modules)
- [TypeScript em 5 minutos](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [TypeScript para quem já sabe JavaScript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

---

## 2. Fase 0: Preparar o ambiente

### Passo 1: conferir e atualizar o Node

```bash
node -v
```

O Nest CLI atual exige, para os comandos que geram código (`nest new`, `nest generate`), Node **v22.22.3 ou superior, v24.15 ou superior, ou v26+**. Rodar a aplicação em si exige menos (v20.19+), mas você precisa do CLI.

Pelos erros que você me mandou antes, seu Node era a **v24.12.0**, que é **menor** que o exigido. Então atualize:

- 🔗 [Baixar o Node.js (versão LTS)](https://nodejs.org/pt)
- Instale por cima, **feche e reabra o terminal** e rode `node -v` de novo.

⚠️ **Depois de atualizar o Node**, o Projeto 1 (Express) pode reclamar do `better-sqlite3`. Se isso acontecer, dentro da pasta dele rode:
```bash
npm rebuild better-sqlite3
```

### Passo 2: instalar o Nest CLI
```bash
npm i -g @nestjs/cli
nest --version
```

### Passo 3: repositório
1. No GitHub, crie o repositório `task-manager-nest` (**sem** README, sem `.gitignore`, sem license).
2. Ainda **não** clone. O `nest new` vai criar a pasta e já inicia o Git dentro dela.

### Passo 4: extensões do VS Code (se ainda não tem)
- **REST Client** (para o `requests.http`)
- **Prisma** (destaque de sintaxe do `schema.prisma`)

### Passo 5: instalar o Docker Desktop

**Por que Docker?** O MySQL Workbench é só a "tela"; ele precisa de um servidor MySQL rodando. Em vez de instalar o MySQL no Windows (o que deu trabalho antes), você vai rodar o servidor dentro de um **container**: uma "caixinha" isolada que já vem com o MySQL pronto.

- 🔗 [Baixar o Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 🔗 [Guia de instalação no Windows](https://docs.docker.com/desktop/setup/install/windows-install/)

No Windows, o Docker Desktop usa o **WSL 2** e precisa que a **virtualização** esteja habilitada no computador (em alguns PCs ela vem desligada na BIOS). O instalador avisa se faltar algo.

Depois de instalar, **abra o Docker Desktop** (ele precisa estar aberto) e teste no terminal:
```bash
docker --version
docker run hello-world
```
Se o segundo comando imprimir uma mensagem de boas-vindas, está funcionando.

> **Se o Docker não funcionar** (virtualização desligada, erro de WSL): me mande a mensagem. As alternativas são instalar o MySQL Server pelo instalador oficial ou usar um MySQL na nuvem. O Workbench conecta em qualquer um deles.

### Passo 6: MySQL Workbench
Você já tem instalado. Só confirme que ele abre. A conexão com o banco será criada no Dia 6.

### 📚 Para estudar
- [Docker: Get started](https://docs.docker.com/get-started/)
- [O que é um container?](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/)

✅ **Pronto quando:** `node -v` está acima do mínimo, `nest --version` mostra uma versão e `docker run hello-world` funciona.

---

## 3. O que você vai construir

**O mesmo enunciado do Projeto 1.** Nada muda no comportamento da API.

### Modelo de dados

| Campo | Tipo | Regras |
|---|---|---|
| `id` | número | gerado automaticamente |
| `title` | texto | obrigatório, de 3 a 100 caracteres |
| `description` | texto | opcional, até 500 caracteres |
| `status` | texto | `pending`, `in_progress` ou `done` (padrão: `pending`) |
| `createdAt` | data | gerada automaticamente |
| `updatedAt` | data | atualizada a cada alteração |

### Rotas

| Método | Rota | O que faz | Sucesso |
|---|---|---|---|
| `GET` | `/tasks` | Lista todas (aceita `?status=done`) | `200` |
| `GET` | `/tasks/:id` | Busca uma | `200` |
| `POST` | `/tasks` | Cria uma | `201` |
| `PUT` | `/tasks/:id` | Atualiza uma | `200` |
| `DELETE` | `/tasks/:id` | Remove uma | `204` (sem corpo) |

### Regras de negócio
1. `?status=` com valor inválido → `400`.
2. `title` ausente ou fora de 3–100 caracteres → `400`.
3. `description` com mais de 500 caracteres → `400`.
4. `status` fora da lista → `400`.
5. `id` inexistente → `404`.
6. `id` que não é número (`/tasks/abc`) → `400`.

### Formato padrão de erro (todas as respostas de erro)
```json
{
  "error": "Validation error",
  "message": "O campo title deve ter entre 3 e 100 caracteres"
}
```
O Nest tem um formato de erro próprio (`statusCode`, `message`, `error`). No **Dia 5** você vai adaptá-lo para este.

---

## 4. Dia 1: Conceitos e criar o projeto

### Passo 1: TypeScript em 20 minutos
O Nest é feito em TypeScript. Você só precisa do básico agora:

```ts
// Tipos
const nome: string = "Ana";
const idade: number = 28;
const ativo: boolean = true;
const tags: string[] = ["a", "b"];

// Interface: descreve o "formato" de um objeto
interface Pessoa {
  nome: string;
  idade?: number; // o "?" significa opcional
}

// Classe com propriedades
class Carro {
  constructor(public marca: string) {}
}
```

Leia (ou assista) o link "TypeScript em 5 minutos" da seção 1 antes de continuar.

### Passo 2: criar o projeto
No terminal, **na pasta onde ficam seus projetos** (não dentro do projeto Express):

```bash
nest new task-manager-nest
```

O CLI faz algumas perguntas:

| Pergunta | Resposta sugerida | Por quê |
|---|---|---|
| Package manager | `npm` | É o que você já usa |
| Module system | **CommonJS** | Veja a nota abaixo |
| NestJS Observe | **No** | Ferramenta de monitoramento, não precisamos agora |

> **Sobre ESM vs CommonJS:** o Nest hoje oferece **ESM** (padrão, usa Vitest para testes) e **CommonJS** (usa Jest). Sugiro **CommonJS** para você: é o formato da maioria dos tutoriais, dos projetos que você vai encontrar em vagas, e dos `import`s sem `.js` no final, o que evita uma confusão a mais enquanto aprende. Se você escolher ESM, todo `import` relativo precisa terminar em `.js` (ex.: `'./tasks.service.js'`) e a configuração do Prisma muda um pouco.

O comando cria a pasta `task-manager-nest`, instala as dependências e já inicia um repositório Git dentro dela. Entre nela:
```bash
cd task-manager-nest
git status
```

### Passo 3: rodar
```bash
npm run start:dev
```
(`start:dev` reinicia sozinho ao salvar, igual ao `--watch` que você usava.)

Abra `http://localhost:3000`. Deve aparecer **Hello World!**

### Passo 4: explorar o que foi gerado

```
src/
├── main.ts              ← ponto de entrada (igual ao seu server.js)
├── app.module.ts        ← módulo raiz (igual ao seu app.js)
├── app.controller.ts    ← uma rota de exemplo
├── app.service.ts       ← a lógica da rota de exemplo
└── app.controller.spec.ts ← teste de exemplo
```

Abra o `main.ts`: ele cria o app (`NestFactory.create(AppModule)`) e sobe na porta 3000. Abra o `app.controller.ts` e o `app.service.ts` e **leia com calma**: o controller chama o service, e o service devolve `'Hello World!'`. Esse é o padrão que você vai repetir.

### Passo 5: conectar ao GitHub
```bash
git remote add origin https://github.com/SEU_USUARIO/task-manager-nest.git
git branch -M main
git push -u origin main
```
(Se o `git push` reclamar que não há commit, faça `git add . && git commit -m "chore: projeto inicial do Nest"` antes.)

Confira que o `.gitignore` gerado contém `node_modules` e `.env`. Se não tiver `.env`, adicione.

### 📚 Para estudar
- [First steps (NestJS)](https://docs.nestjs.com/first-steps)
- [Visão geral do Nest CLI](https://docs.nestjs.com/cli/overview)

✅ **Pronto quando:** o Hello World aparece no navegador e o primeiro commit está no GitHub.

---

## 5. Dia 2: Módulo tasks, GET e POST em memória

**Objetivo:** criar o módulo de tarefas e fazer `GET /tasks` e `POST /tasks` funcionarem com um array, como no Dia 3 do Projeto 1.

### Passo 1: gerar os arquivos com o CLI
```bash
nest g module tasks
nest g controller tasks --no-spec
nest g service tasks --no-spec
```
(`g` = generate; `--no-spec` evita criar arquivos de teste por enquanto.)

Isso cria `src/tasks/` com `tasks.module.ts`, `tasks.controller.ts` e `tasks.service.ts`, **e já registra tudo** no `AppModule`. Abra o `tasks.module.ts` e veja: ele lista o controller e o provider.

### Passo 2: o tipo da tarefa
Crie `src/tasks/task.types.ts`:

```ts
export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}
```
- `as const` trava a lista como valores fixos.
- `TaskStatus` vira o tipo `'pending' | 'in_progress' | 'done'`: o TypeScript passa a avisar se você escrever um status inválido no código.

### Passo 3: o service (a lógica)
`src/tasks/tasks.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { Task } from './task.types';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];
  private nextId = 1;

  findAll(): Task[] {
    return this.tasks;
  }

  create(data: { title: string; description?: string }): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: this.nextId++,
      title: data.title,
      description: data.description ?? null,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }
}
```
Repare: `tasks` e `nextId` são **propriedades da classe** (o `private` impede acesso de fora). Equivalem às variáveis `let tasks` e `let nextId` do Projeto 1.

### Passo 4: o controller (a porta de entrada)
`src/tasks/tasks.controller.ts`:

```ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  create(@Body() body: { title: string; description?: string }) {
    return this.tasksService.create(body);
  }
}
```

**Leia linha por linha:**
- `@Controller('tasks')`: todas as rotas desta classe começam com `/tasks` (o `app.use('/tasks', ...)` do Express).
- `constructor(private readonly tasksService: TasksService)`: **injeção de dependência**. O Nest vê o tipo `TasksService`, cria a instância e entrega. Você nunca escreve `new TasksService()`.
- `@Get()` / `@Post()`: o verbo HTTP. Sem argumento, é a rota raiz do controller (`/tasks`).
- `@Body()`: entrega o `req.body` como parâmetro.
- **Não tem `req`, `res` nem `res.json()`**: o que a função **retorna** vira o corpo da resposta, e o Nest já usa o status certo (`200` para GET, **`201` para POST**).

### Passo 5: testar
Crie o `requests.http` na raiz:

```http
### Listar
GET http://localhost:3000/tasks

### Criar
POST http://localhost:3000/tasks
Content-Type: application/json

{
  "title": "Estudar NestJS",
  "description": "Ler sobre módulos"
}
```
Crie duas tarefas e liste. Lembre: como é um array em memória, ao salvar um arquivo o servidor reinicia e as tarefas somem (esperado).

### 📚 Para estudar
- [Controllers](https://docs.nestjs.com/controllers)
- [Providers](https://docs.nestjs.com/providers)
- [Decoradores em TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html)

✅ **Pronto quando:** `POST` retorna `201` com a tarefa e `GET` lista as criadas.

---

## 6. Dia 3: Rotas com id, PUT e DELETE

### O que muda: exceções no lugar de `res.status(404)`

No Express você escrevia `return res.status(404).json({...})`. No Nest, você **lança uma exceção** e o Nest transforma em resposta:

```ts
import { NotFoundException } from '@nestjs/common';

throw new NotFoundException('Tarefa não encontrada'); // vira um 404
```
Como `throw` já interrompe a função, **você não precisa mais do `return` do bug do Dia 5**. 😉

Outras exceções úteis: `BadRequestException` (400), `InternalServerErrorException` (500).

### O `ParseIntPipe`: o `parseId` do Nest

Um **pipe** transforma/valida um valor **antes** de chegar na sua função. O `ParseIntPipe` converte o `:id` (que chega como texto) em número e, se não conseguir (`/tasks/abc`), responde **`400`** automaticamente.

```ts
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.tasksService.findOne(id);
}
```
Importe `Param` e `ParseIntPipe` de `@nestjs/common`.

### Sua vez 💪

**No service**, adicione (use `find`, `findIndex` e `splice`, como no Projeto 1):

```ts
findOne(id: number): Task {
  const task = this.tasks.find((t) => t.id === id);
  if (!task) {
    throw new NotFoundException('Tarefa não encontrada');
  }
  return task;
}

update(id: number, data: { ... }): Task {
  // 1. busque a tarefa (reaproveite this.findOne(id), que já lança o 404!)
  // 2. atualize title, description, status
  // 3. atualize o updatedAt
  // 4. retorne a tarefa
}

remove(id: number): void {
  // 1. ache a posição com findIndex
  // 2. se for -1, lance NotFoundException
  // 3. remova com splice
}
```

**No controller**, adicione `@Get(':id')`, `@Put(':id')` e `@Delete(':id')`.

Para o `DELETE` responder `204` sem corpo, use `@HttpCode`:
```ts
@Delete(':id')
@HttpCode(204)
remove(@Param('id', ParseIntPipe) id: number) {
  this.tasksService.remove(id);
}
```

### Testar (adicione ao `requests.http`)
```http
### Buscar uma
GET http://localhost:3000/tasks/1

### id inexistente (404)
GET http://localhost:3000/tasks/9999

### id inválido (400)
GET http://localhost:3000/tasks/abc

### Atualizar
PUT http://localhost:3000/tasks/1
Content-Type: application/json

{ "title": "Título novo", "description": "Nova", "status": "in_progress" }

### Deletar (204)
DELETE http://localhost:3000/tasks/1
```

**Perceba:** os erros agora voltam no formato do Nest (`statusCode`, `message`, `error`), diferente do que a especificação pede. Isso será corrigido no Dia 5.

### 📚 Para estudar
- [Pipes](https://docs.nestjs.com/pipes)
- [Exceções (Exception filters)](https://docs.nestjs.com/exception-filters)
- [Route parameters](https://docs.nestjs.com/controllers#route-parameters)

✅ **Pronto quando:** as 5 rotas funcionam, `404` e `400` do id aparecem, e `DELETE` responde `204`.

---

## 7. Dia 4: DTOs e validação

### O que é um DTO?

**DTO** (Data Transfer Object) é uma **classe que descreve o formato dos dados que chegam**. No Projeto 1, a validação era uma função com vários `if`. Aqui, você **declara as regras com decorators** e o Nest valida sozinho **antes** do seu código rodar.

### Passo 1: instalar
```bash
npm install class-validator class-transformer
```

### Passo 2: ligar a validação para o app inteiro
No `src/main.ts`:

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```
- `useGlobalPipes`: aplica o pipe em **todas** as rotas.
- `whitelist: true`: campos que **não** estão no DTO são descartados (ex.: alguém mandar `"id": 999` no corpo é ignorado).

### Passo 3: criar o DTO
`src/tasks/dto/create-task.dto.ts`:

```ts
import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { TASK_STATUSES, type TaskStatus } from '../task.types';

export class CreateTaskDto {
  @IsString()
  @Length(3, 100, { message: 'O campo title deve ter entre 3 e 100 caracteres' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'O campo description deve ter no máximo 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsIn([...TASK_STATUSES], { message: 'O campo status deve ser pending, in_progress ou done' })
  status?: TaskStatus;
}
```

**O que é cada coisa:**
- `@IsString()`, `@Length(3, 100)`, `@MaxLength(500)`, `@IsIn([...])`: as regras (substituem seus `if`).
- `@IsOptional()`: se o campo **não vier**, pula as outras regras dele (é o `!== undefined` do Projeto 1).
- `title!`: o `!` diz ao TypeScript "confie, esse campo será preenchido" (o projeto novo usa modo `strict`, que reclama de propriedade sem valor inicial).
- `message`: o texto do erro. Sem isso, o Nest gera mensagens em inglês.

### Passo 4: o DTO de atualização
No `PUT`, as regras são as mesmas (substituição completa). Crie `update-task.dto.ts`:

```ts
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends CreateTaskDto {}
```

### Passo 5: usar nos controllers e services
Troque os tipos soltos `{ title: string; ... }` pelos DTOs:

```ts
@Post()
create(@Body() dto: CreateTaskDto) {
  return this.tasksService.create(dto);
}

@Put(':id')
update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
  return this.tasksService.update(id, dto);
}
```
Faça o mesmo nos parâmetros dos métodos `create` e `update` do **service**.

> **Atenção:** o `ValidationPipe` só funciona se o tipo do parâmetro for uma **classe** (DTO). Se você usar uma `interface` ou um tipo inline, **nenhuma validação acontece** (as interfaces somem quando o TypeScript compila). Esse é o erro mais comum.

### Passo 6: validar o filtro `?status=`
Crie `src/tasks/dto/list-tasks-query.dto.ts`:

```ts
import { IsIn, IsOptional } from 'class-validator';
import { TASK_STATUSES, type TaskStatus } from '../task.types';

export class ListTasksQueryDto {
  @IsOptional()
  @IsIn([...TASK_STATUSES], { message: 'O filtro status é inválido' })
  status?: TaskStatus;
}
```
No controller:
```ts
@Get()
findAll(@Query() query: ListTasksQueryDto) {
  return this.tasksService.findAll(query.status);
}
```
E no service, `findAll(status?: TaskStatus)` passa a filtrar com `.filter(...)` quando o status vier.

### Testar
```http
### title ausente (400)
POST http://localhost:3000/tasks
Content-Type: application/json

{ "description": "sem título" }

### title curto (400)
POST http://localhost:3000/tasks
Content-Type: application/json

{ "title": "ab" }

### status inválido (400)
POST http://localhost:3000/tasks
Content-Type: application/json

{ "title": "Tarefa válida", "status": "xyz" }

### filtro inválido (400)
GET http://localhost:3000/tasks?status=xyz
```

### 📚 Para estudar
- [Validation (NestJS)](https://docs.nestjs.com/application/validation)
- [class-validator (lista de decorators)](https://github.com/typestack/class-validator#validation-decorators)

✅ **Pronto quando:** todos os casos `400` acima funcionam e você sabe explicar por que DTO precisa ser **classe**, e não interface.

---

## 8. Dia 5: Formato padrão de erro

### O problema
Os erros do Nest vêm assim:
```json
{ "message": ["O campo title deve ter entre 3 e 100 caracteres"], "error": "Bad Request", "statusCode": 400 }
```
A especificação pede:
```json
{ "error": "Validation error", "message": "O campo title deve ter entre 3 e 100 caracteres" }
```

### A solução: Exception Filter
É o equivalente do `errorHandler` do Express: uma classe que **intercepta as exceções** e monta a resposta.

Crie `src/common/all-exceptions.filter.ts`:

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

const ERROR_NAMES: Record<number, string> = {
  400: 'Validation error',
  404: 'Not found',
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const raw =
        typeof body === 'string' ? body : (body as { message?: string | string[] }).message;
      const message = Array.isArray(raw) ? raw.join('; ') : raw;

      res.status(status).json({
        error: ERROR_NAMES[status] ?? exception.name,
        message,
      });
      return;
    }

    console.error(exception);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Algo deu errado no servidor',
    });
  }
}
```

**Leia com calma:**
- `@Catch()` sem argumento = captura **qualquer** erro.
- `exception instanceof HttpException`: erros "esperados" (404, 400...). Aqui montamos o formato padrão.
- Qualquer outro erro (um bug, o banco caiu) cai no `500` genérico, sem vazar detalhes internos.
- Quando há várias mensagens de validação, juntamos em um texto só com `; `.

Registre no `main.ts`, junto com o pipe:
```ts
app.useGlobalFilters(new AllExceptionsFilter());
```

### Testar tudo de novo
Rode o checklist inteiro do `requests.http` e confira que **todo erro** vem como `{ error, message }`.

**Checklist de erros:**
- [ ] `POST` sem title → `400`
- [ ] `POST` com title de 2 e de 101 caracteres → `400`
- [ ] `POST` com status inválido → `400`
- [ ] `GET ?status=xyz` → `400`
- [ ] `GET /tasks/abc` → `400`
- [ ] `GET /tasks/9999` → `404`
- [ ] `PUT /tasks/9999` → `404`
- [ ] `DELETE /tasks/9999` → `404`

### 📚 Para estudar
- [Exception filters](https://docs.nestjs.com/exception-filters)
- [Ciclo de vida de uma requisição no Nest](https://docs.nestjs.com/faq/request-lifecycle)

✅ **Pronto quando:** a API em memória está completa e **todos** os erros seguem o formato padrão. 🎉 (Fim da semana 1.)

---

## 9. Dia 6: MySQL no Docker, Workbench e Prisma

### O que é o Prisma?
Um **ORM**: em vez de escrever SQL, você descreve as tabelas num arquivo (`schema.prisma`) e usa funções TypeScript para consultar. Ele gera:
- as **migrations** (os SQLs que criam/alteram as tabelas);
- um **client** com tipos: o editor autocompleta `prisma.task.findMany()` e avisa se você errar um campo.

> **Importante:** o Prisma não substitui entender SQL, apenas gera SQL por você. Em entrevista, você deve saber explicar o que ele faz por baixo (você já escreveu esse SQL na mão no Projeto 1).

### Passo 1: instalar o Prisma 7
```bash
npm install prisma@7 dotenv --save-dev
npm install @prisma/client@7 @prisma/adapter-mariadb @nestjs/config
```
⚠️ Instale com `@7`, exatamente assim. A documentação oficial alerta que a tag `latest` do pacote `prisma` pode apontar para uma pré-release incompatível com os comandos deste guia. Mantenha `prisma` e `@prisma/client` na **mesma versão principal**.

O `@prisma/adapter-mariadb` é o adapter que o Prisma 7 usa para **MySQL e MariaDB**. Se, mais adiante, aparecer o erro `Cannot find module 'mariadb'`, rode `npm install mariadb`.

### Passo 2: iniciar o Prisma
```bash
npx prisma init --datasource-provider mysql --output ../src/generated/prisma
```
Isso cria:
- `prisma/schema.prisma`: o seu schema;
- um arquivo de configuração do Prisma na raiz (`prisma.config.ts` ou `prisma7.config.ts`, dependendo da versão);
- `.env` com uma `DATABASE_URL` de exemplo;
- e já adiciona `.env` e a pasta gerada ao `.gitignore`.

### Passo 3: ajustar o `.env`
Abra o `.env` e deixe **exatamente** estas duas variáveis:

```
MYSQL_ROOT_PASSWORD=root123
DATABASE_URL="mysql://root:root123@localhost:3306/tasks_db"
```
- A senha aparece nas duas, e **precisa ser igual**.
- Use uma senha **sem caracteres especiais** (`@`, `:`, `/`, `#`), porque ela vai dentro da URL.
- Estrutura da URL: `mysql://USUÁRIO:SENHA@HOST:PORTA/NOME_DO_BANCO`.

### Passo 4: subir o MySQL com Docker
Crie o arquivo `docker-compose.yml` na raiz do projeto:

```yaml
services:
  db:
    image: mysql:8.4
    container_name: task-manager-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: tasks_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

**Leia linha por linha:**
- `image: mysql:8.4`: qual "receita" baixar (MySQL 8.4, versão de suporte longo).
- `MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}`: a senha do `root`. O Docker Compose lê o `.env` da mesma pasta sozinho, então a senha **não fica escrita neste arquivo**.
- `MYSQL_DATABASE: tasks_db`: já cria o banco `tasks_db` na primeira vez.
- `ports: "3306:3306"`: liga a porta 3306 do seu PC à da caixinha. É por aqui que o Workbench e o Nest vão conectar.
- `volumes`: guarda os dados **fora** da caixinha. Sem isso, apagar o container apagaria suas tarefas.
- `restart: unless-stopped`: o container volta sozinho quando o Docker Desktop abre.

Suba o banco:
```bash
docker compose up -d
docker compose ps
docker compose logs db
```
- `up -d`: sobe em segundo plano (na primeira vez ele baixa a imagem, pode demorar uns minutos).
- `ps`: mostra se o container está rodando.
- `logs db`: mostra o que o MySQL está dizendo. Espere aparecer `ready for connections`. Essa mensagem aparece **duas vezes**; a que importa é a última, com `port: 3306`.

**Comandos do dia a dia:**
| Comando | O que faz |
|---|---|
| `docker compose stop` / `start` | Desliga / liga o banco (os dados ficam) |
| `docker compose down` | Remove o container (os dados ficam no volume) |
| `docker compose down -v` | Remove o container **e apaga os dados** ⚠️ |

> **Rotina:** antes de `npm run start:dev`, confirme que o Docker Desktop está aberto e o container está de pé (`docker compose ps`).

> **Pegadinha clássica:** a `MYSQL_ROOT_PASSWORD` só vale na **primeira criação** do volume. Se você mudar a senha depois, o MySQL continua com a antiga. Para recomeçar do zero: `docker compose down -v` e depois `docker compose up -d`.

### Passo 5: conectar o Workbench
1. Abra o MySQL Workbench e clique no **`+`** ao lado de "MySQL Connections".
2. Preencha:
   - **Connection Name:** `Docker MySQL`
   - **Hostname:** `127.0.0.1`
   - **Port:** `3306`
   - **Username:** `root`
3. Em **Password**, clique em **Store in Vault...** e digite `root123` (a senha do `.env`).
4. Clique em **Test Connection**. Deve aparecer "Successfully made the MySQL connection".
5. Clique em **OK** e dê um duplo clique na conexão para abrir.

No painel **SCHEMAS**, à esquerda, deve aparecer o banco `tasks_db` (vazio, por enquanto).

Se aparecer **"Unable to connect"**, o container não está rodando. Rode `docker compose ps` e confira se o Docker Desktop está aberto.

### Passo 6: modelar a tabela
Abra `prisma/schema.prisma` e deixe assim:

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}

datasource db {
  provider = "mysql"
}

model Task {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(100)
  description String?  @db.VarChar(500)
  status      String   @default("pending") @db.VarChar(20)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("tasks")
}
```

**Leia linha por linha:**
- `moduleFormat = "cjs"`: necessário porque você escolheu CommonJS no `nest new`.
- `@id @default(autoincrement())`: chave primária que o banco gera (o `AUTO_INCREMENT` do MySQL).
- `String?`: o `?` significa que aceita `null` (campo opcional).
- **`@db.VarChar(100)` / `@db.VarChar(500)`**: no MySQL, o `String` do Prisma vira `VARCHAR(191)` por padrão. Como a `description` aceita até 500 caracteres, o limite precisa ser declarado.
- `@default("pending")` e `@default(now())`: valores padrão.
- **`@updatedAt`**: o Prisma atualiza o campo **sozinho** a cada `update`. Lembra de ter escrito `updated_at = datetime('now')` na mão no Projeto 1? Aqui isso some.
- `@@map("tasks")`: o nome real da tabela no banco. Sem isso ela se chamaria `Task` (maiúscula), e **o MySQL dentro do Docker (Linux) diferencia maiúsculas de minúsculas nos nomes de tabela**, o que gera erros confusos nas queries do Workbench.
- `status` é `String` por enquanto, validado pelo DTO. Na Fase 2 você troca por um `enum`.

### Passo 7: criar a migration e gerar o client
```bash
npx prisma migrate dev --name init
npx prisma generate
```
- `migrate dev`: lê o schema, gera o SQL (em `prisma/migrations/...`) e **executa no banco**, criando a tabela.
- `generate`: gera o client tipado em `src/generated/prisma`. **Rode de novo sempre que mudar o schema.**

### Passo 8: espiar o resultado
1. Abra `prisma/migrations/<data>_init/migration.sql`. Você vai ver um `CREATE TABLE` parecido com o que escreveu à mão. **Leia.**
2. No Workbench, clique com o botão direito em **Schemas** → **Refresh All**, e abra `tasks_db` → **Tables**. Devem aparecer `tasks` e `_prisma_migrations` (a tabela onde o Prisma registra o que já rodou).
3. Numa aba de query, rode:
   ```sql
   USE tasks_db;
   SELECT * FROM tasks;
   ```
   Vazio e sem erro é o resultado esperado.

### Problemas comuns
| Erro | Causa provável |
|---|---|
| `P1001: Can't reach database server` | O container não está rodando. `docker compose ps` e confira o Docker Desktop |
| `P1000: Authentication failed` | Senha do `DATABASE_URL` diferente da `MYSQL_ROOT_PASSWORD`, ou você trocou a senha depois de criar o volume (veja a pegadinha do Passo 4) |
| `Error: port is already allocated` ao subir o Docker | Já existe algo usando a porta 3306 (outro MySQL instalado) |
| Erro citando `RSA public key` | Adicione `?allowPublicKeyRetrieval=true` no final da `DATABASE_URL` |
| `Cannot find module 'mariadb'` | `npm install mariadb` |

### 📚 Para estudar
- [Prisma com NestJS (guia oficial)](https://docs.nestjs.com/data/prisma)
- [Prisma + MySQL: quickstart](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch-prisma-migrate-node-mysql)
- [Referência do `schema.prisma`](https://www.prisma.io/docs/orm/prisma-schema/overview)
- [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate/getting-started)
- [Docker Compose](https://docs.docker.com/compose/)
- [Imagem oficial do MySQL (Docker Hub)](https://hub.docker.com/_/mysql)
- [Manual do MySQL Workbench](https://dev.mysql.com/doc/workbench/en/)

✅ **Pronto quando:** o container está rodando, o Workbench conecta, a tabela `tasks` aparece lá e você entende o que `migrate` e `generate` fazem.

---

## 10. Dia 7: PrismaService e GET/POST no banco

### Passo 1: ler o `.env` dentro do Nest
O Nest **não lê o `.env` sozinho**. Registre o `ConfigModule` no `src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
// ...outros imports que já existem

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), TasksModule],
  // controllers e providers que já existem
})
export class AppModule {}
```
Mantenha o que o `nest g` já tinha colocado nas outras listas. `isGlobal: true` deixa a configuração disponível em todo o app.

### Passo 2: criar o PrismaService
`src/prisma/prisma.service.ts`:

```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: ConfigService) {
    const adapter = new PrismaMariaDb(
      configService.getOrThrow<string>('DATABASE_URL'),
    );
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```
**O que é:** uma classe que **herda** o `PrismaClient` (então tem `this.task.findMany()` etc.) e liga/desliga a conexão junto com o app.
- `getOrThrow`: se faltar `DATABASE_URL` no `.env`, o app **para na hora de subir**, com erro claro.
- O Prisma 7 **exige um adapter** de driver; para MySQL é o `PrismaMariaDb`. Ele recebe a mesma `DATABASE_URL` que o Prisma CLI usa.
- Se o app não subir, confira se o container está rodando (`docker compose ps`): o `$connect()` no `onModuleInit` falha **na hora de subir** se o banco estiver fora do ar. É proposital.

### Passo 3: o módulo
`src/prisma/prisma.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```
`exports` permite que **outros módulos** usem o `PrismaService`. Agora importe no `TasksModule`:

```ts
@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
```

### Passo 4: usar no service (GET e POST)
Injete o Prisma e **substitua** as duas primeiras funções:

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task.types';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: status ? { status } : undefined,
      orderBy: { id: 'asc' },
    });
  }

  create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? 'pending',
      },
    });
  }

  // as outras funções ainda usam o array: você migra amanhã
}
```

**Compare com o Projeto 1:**
- `findMany` = `SELECT * FROM tasks` (com `where` = `WHERE status = ?`).
- `create` = `INSERT ...` **e** o `SELECT` seguinte, tudo em uma chamada: o Prisma já devolve a tarefa completa.
- Não existe `formatTask`: o resultado já vem com `createdAt` e `updatedAt`.
- **Prisma é seguro contra SQL Injection**: os valores sempre viajam como parâmetros (o mesmo princípio dos `?` que você aprendeu).

> Ao usar `await` com o Prisma, as funções do service passam a ser assíncronas. Retornar a Promise direto (como acima) funciona, e o Nest espera por ela sozinho.

### Testar
Crie tarefas, **reinicie o servidor** e liste: agora elas devem continuar lá. Confira também no Workbench com `SELECT * FROM tasks;`.

### 📚 Para estudar
- [Prisma Client: CRUD](https://www.prisma.io/docs/orm/prisma-client/queries/crud)
- [Filtros e ordenação](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting)
- [Configuration (`@nestjs/config`)](https://docs.nestjs.com/application/configuration)

✅ **Pronto quando:** `GET` e `POST` usam o banco e as tarefas sobrevivem a reiniciar o servidor.

---

## 11. Dia 8: Terminar o CRUD no banco

### Os métodos do Prisma que você vai usar

| Operação | Método | Retorno |
|---|---|---|
| Buscar uma | `findUnique({ where: { id } })` | a tarefa ou `null` |
| Atualizar | `update({ where: { id }, data: {...} })` | a tarefa atualizada |
| Remover | `delete({ where: { id } })` | a tarefa removida |

### `findOne`
```ts
async findOne(id: number) {
  const task = await this.prisma.task.findUnique({ where: { id } });
  if (!task) {
    throw new NotFoundException('Tarefa não encontrada');
  }
  return task;
}
```

### O erro `P2025` (registro não encontrado)
`update` e `delete` **lançam um erro** quando o `id` não existe. O código do erro é **`P2025`**. Em vez de fazer um `SELECT` antes só para checar (lembra da pergunta sobre *race condition* do quiz?), você **tenta direto** e traduz o erro:

```ts
import { Prisma } from '../generated/prisma/client';

async update(id: number, dto: UpdateTaskDto) {
  try {
    return await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? 'pending',
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new NotFoundException('Tarefa não encontrada');
    }
    throw error;
  }
}
```
- O `await` dentro do `try` é **obrigatório**: sem ele o erro escapa do `catch`.
- `throw error` no fim **relança** erros que você não conhece (viram `500` no filtro).
- Não tem `updatedAt` aqui: o `@updatedAt` cuida disso.

### Sua vez 💪
Escreva o `remove(id)` seguindo o **mesmo padrão** do `update` (`try`, `delete`, `catch` do `P2025`). No controller, ele continua com `@HttpCode(204)`.

Lembre de **remover** o array e o `nextId` do service. Não devem sobrar no arquivo.

### Roteiro de teste
1. Crie 2 ou 3 tarefas.
2. `GET /tasks/:id` → `200`; com `9999` → `404`; com `abc` → `400`.
3. `PUT` → `200`. Compare `createdAt` e `updatedAt`: devem ser **diferentes** agora.
4. No Workbench, rode `SELECT * FROM tasks;` e confira a mudança.
5. `DELETE` → `204`. `DELETE` de novo no mesmo id → `404`.
6. Reinicie o servidor e confirme que os dados persistem.

### 📚 Para estudar
- [Erros do Prisma Client (códigos P2xxx)](https://www.prisma.io/docs/orm/reference/error-reference)
- [Prisma: update e delete](https://www.prisma.io/docs/orm/prisma-client/queries/crud#update)

✅ **Pronto quando:** as 5 rotas usam o Prisma, os erros `400` e `404` continuam no formato padrão, e não sobrou nenhum array em memória.

---

## 12. Dia 9: Documentar e publicar

### Passo 1: `.env.example`
Crie na raiz, **sem a senha real**:
```
MYSQL_ROOT_PASSWORD=troque_esta_senha
DATABASE_URL="mysql://root:troque_esta_senha@localhost:3306/tasks_db"
PORT=3000
```
Confirme que o `.env` real **não** está no Git (`git status`).

### Passo 2: `requests.http` completo
Um exemplo de **cada rota**, incluindo todos os casos de erro (veja o checklist do Dia 5).

### Passo 3: facilitar a instalação para outra pessoa
Quem clonar o projeto precisa gerar o client do Prisma (a pasta gerada não vai pro Git). Adicione ao `package.json`, dentro de `"scripts"`:
```json
"postinstall": "prisma generate"
```
Assim, `npm install` já gera o client.

### Passo 4: README
Inclua:
- o que é o projeto e as tecnologias (NestJS, TypeScript, Prisma, MySQL, Docker);
- como rodar:
  ```bash
  npm install
  cp .env.example .env        # depois ajuste a senha nas duas variáveis
  docker compose up -d
  npx prisma migrate dev
  npm run start:dev
  ```
- a tabela de rotas e o modelo de dados;
- um parágrafo: **"Por que refiz o projeto?"** (compare com o Projeto 1 em Express; recrutadores adoram isso).

### Passo 5: publicar
```bash
git add .
git commit -m "docs: adiciona README e requests.http"
git push
```
No GitHub, confira que **não** aparecem `.env`, `node_modules` nem `src/generated`, e que `docker-compose.yml` e `prisma/migrations` **aparecem**.

### 📚 Para estudar
- [Como escrever um bom README](https://docs.github.com/pt/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/)

---

## 13. Critérios de aceite

- [ ] Todas as rotas funcionam conforme a tabela
- [ ] Todo erro retorna o status correto e o formato `{ error, message }`
- [ ] Os dados persistem depois de reiniciar o servidor
- [ ] Validação feita por **DTO** com `class-validator` (nenhum `if` manual de validação)
- [ ] Nenhum SQL escrito à mão: tudo via Prisma
- [ ] Módulos separados: `TasksModule` e `PrismaModule`
- [ ] Exception filter global registrado
- [ ] `.env` fora do Git; `.env.example` e `docker-compose.yml` presentes
- [ ] `schema.prisma` e as migrations **versionadas** no repositório
- [ ] `requests.http` com exemplos de todas as rotas e erros
- [ ] README com instruções de instalação
- [ ] Commits pequenos e com mensagens claras (um por dia de trabalho, no mínimo)

---

## 14. Desafios bônus

- [ ] `PATCH /tasks/:id` para atualização parcial (dica: `PartialType` do pacote `@nestjs/mapped-types`)
- [ ] `GET /tasks/stats` com a contagem por status (dica: `prisma.task.groupBy`)
- [ ] Ordenação: `?sort=createdAt&order=desc` (valide os valores permitidos com um DTO)
- [ ] Trocar `@IsString()` do `title` por uma checagem que também rejeite títulos só com espaços (dica: decorator `@Transform` do `class-transformer` para `trim()`)

---

## 15. Perguntas de entrevista

Responda **por escrito, com suas palavras** (num `ENTREVISTA.md` ou aqui no chat):

1. O que são **módulo, controller e provider** no Nest? Dê um exemplo do seu projeto.
2. O que é **injeção de dependência** e que problema ela resolve?
3. Para que serve um **DTO**? Por que ele precisa ser uma **classe** e não uma `interface`?
4. Qual a diferença entre **Pipe**, **Exception Filter** e **Guard**? (Guard aparece na Fase 3; responda o que souber.)
5. O que é um **ORM**? Cite uma vantagem e uma desvantagem do Prisma em relação ao SQL puro.
6. O que é uma **migration** e por que ela fica versionada no Git?
7. O Prisma protege contra **SQL Injection**? Por quê?
8. Por que tratar o erro `P2025` em vez de fazer um `SELECT` antes do `UPDATE`?
9. Qual a diferença entre `PUT` e `PATCH`?
10. O que o Nest faz por você que no Express você escreveu à mão?

---

## 16. Como pedir ajuda

Quando travar, me mande:
1. **O que você queria fazer**
2. **O que aconteceu** (a mensagem de erro **completa**)
3. **O código relevante** (e o comando que você rodou)
4. **O que você já tentou**

💡 **Dicas de ouro para o Nest:**
- Erro de **injeção** (`Nest can't resolve dependencies of the TasksService`): quase sempre falta `imports: [PrismaModule]` no módulo, ou falta o `@Injectable()` na classe.
- Mudou o `schema.prisma`? Rode `npx prisma migrate dev` **e** `npx prisma generate`.
- Validação "não funciona"? Confira se o tipo do `@Body()` é uma **classe**, se o `ValidationPipe` está no `main.ts` e se salvou os arquivos.

---

## ✅ Ao terminar

Envie o link do repositório (ou os arquivos principais) e as respostas das perguntas. Eu faço o **code review** e depois liberamos a **Fase 2**, onde entram os **relacionamentos entre tabelas**. 🚀

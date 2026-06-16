# Discord Clone — Microservices Architecture

A full-stack Discord clone built across four independent services. Real-time messaging runs through a Redis pub/sub and WebSocket pipeline, with Kafka providing durable ordered persistence into PostgreSQL. The project covers server and channel management, real-time text channels, direct messaging, role-based membership, and invite links.

---

## Table of Contents

1. [What It Is](#1-what-it-is)
2. [Architecture](#2-architecture)
3. [Tech Stack Per Service](#3-tech-stack-per-service)
4. [Database Schema](#4-database-schema)
5. [Data Flow — Message Creation](#5-data-flow--message-creation)
6. [Authentication Flow](#6-authentication-flow)
7. [URL Routing](#7-url-routing)
8. [API Endpoints](#8-api-endpoints)
9. [Key Components](#9-key-components)
10. [Real-Time System](#10-real-time-system)
11. [Environment Variables](#11-environment-variables)
12. [Prerequisites](#12-prerequisites)
13. [Running the Project](#13-running-the-project)

---

## 1. What It Is

This project replicates the core Discord experience: creating community servers, organising channels by type (Text, Audio, Video), inviting members with shareable links, assigning roles (Admin / Moderator / Guest), and exchanging real-time messages — both in channels and as direct messages between members.

The work is split across four specialised services:

| Concern | Service |
|---|---|
| UI, SSR, REST CRUD, auth | **App** — Next.js 14, port 3000 |
| Message intake and validation | **Processor** — Express, port 8000 |
| Real-time broadcast and Kafka produce | **ws** — WebSocket server, port 8080 |
| Durable database writes | **Worker** — Kafka consumer |

The real-time path (Processor → Redis → ws → browser) is decoupled from the persistence path (Kafka → Worker → PostgreSQL). A spike in writes does not block readers, and the Worker can lag behind without users losing their live feed.

---

## 2. Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT BROWSER                                 │
│                                                                            │
│   Next.js App (port 3000)                                                  │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │  ChatInput.tsx  ──useMutation──► POST http://localhost:8000/message │  │
│   │  ChatProvider.tsx  ◄──WebSocket──  ws://localhost:8080             │  │
│   │  ChatMessageContainer.tsx  ◄──REST paginated GET── /api/...        │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬─────────────────┬──────────────────────────┘
                               │                 │
                  HTTP POST /message        REST CRUD
                               │                 │
                   ┌───────────▼──────┐   ┌──────▼────────────┐
                   │   PROCESSOR      │   │   APP (API routes) │
                   │   Express :8000  │   │   Next.js :3000    │
                   │                  │   │                    │
                   │  • validate msg  │   │  • auth endpoints  │
                   │  • build object  │   │  • server CRUD     │
                   │  • Redis publish │   │  • channel CRUD    │
                   └────────┬─────────┘   │  • invite join     │
                            │             │  • message history │
                   Redis PUBLISH          └────────────────────┘
                   "channel-message"
                   "direct-message"
                            │
                   ┌────────▼─────────┐
                   │       ws         │
                   │  WebSocket :8080  │
                   │                  │
                   │  • Redis SUB     │
                   │  • WS broadcast  │
                   │  • Kafka PRODUCE │
                   └────┬──────┬──────┘
                        │      │
              WebSocket │      │ Kafka PRODUCE
              broadcast │      │ topic "MESSAGES"
                        │      │
             ┌──────────▼─┐  ┌─▼──────────────┐
             │  Browser   │  │    WORKER       │
             │  clients   │  │  Kafka consumer │
             │  (React     │  │                 │
             │  state)    │  │  • consume msg  │
             └────────────┘  │  • db.create()  │
                             │  • PostgreSQL   │
                             └────────────────┘

             ─────────────────────────────────────
             Infrastructure:
               Redis (Upstash)  ←→  Processor + ws
               Kafka :9092      ←→  ws + Worker
               PostgreSQL       ←→  App + Worker (+ Processor for validation)
             ─────────────────────────────────────
```

### Service boundaries

| Service | Port | Role | DB access |
|---|---|---|---|
| App | 3000 | UI + REST CRUD + auth | Prisma / PostgreSQL |
| Processor | 8000 | Message validation + Redis publish | Prisma / PostgreSQL |
| ws | 8080 | Redis subscribe + Kafka produce + WS broadcast | None |
| Worker | — | Kafka consumer + DB write | Prisma / PostgreSQL |

---

## 3. Tech Stack Per Service

### App — `./App`

| Layer | Technology |
|---|---|
| Framework | Next.js 14.1.0 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI primitives | Radix UI (20 components) |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Custom JWT (`jsonwebtoken`) + `bcryptjs` |
| HTTP client | `axios` + `@tanstack/react-query` |
| Forms | `react-hook-form` + `zod` |
| Redis | Upstash Redis REST (`@upstash/redis`) |
| File uploads | UploadThing |
| Real-time | Native WebSocket (browser) |
| Icons | `lucide-react` |
| Date formatting | `date-fns` |

### Processor — `./Processor`

| Layer | Technology |
|---|---|
| Framework | Express.js |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Redis | Upstash Redis REST (`@upstash/redis`) |
| ID generation | `@paralleldrive/cuid2` |

### ws — `./ws`

| Layer | Technology |
|---|---|
| WebSocket | `ws` npm package |
| Language | TypeScript |
| Redis | Upstash Redis REST (subscriber) |
| Kafka | KafkaJS |

### Worker — `./Worker`

| Layer | Technology |
|---|---|
| Kafka | KafkaJS (consumer group `"default"`) |
| Language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |

---

## 4. Database Schema

The schema is defined in Prisma and targets PostgreSQL.

### Enums

```prisma
enum ROLE {
  ADMIN
  MODERATOR
  GUEST
}

enum CHANNEL_TYPE {
  TEXT
  VIDEO
  AUDIO
}
```

### Models

#### User

| Field | Type | Notes |
|---|---|---|
| `id` | String | `@id @default(cuid())` |
| `name` | String | — |
| `email` | String | `@unique` |
| `password` | String | bcrypt hash |
| `avatar` | String? | nullable URL |

Relations: `Server[]` (owned), `Member[]` (memberships)

#### Server

| Field | Type | Notes |
|---|---|---|
| `id` | String | `@id @default(cuid())` |
| `name` | String | — |
| `imgUrl` | String | icon / banner URL |
| `inviteUrl` | String | JWT-encoded invite token |
| `ownerId` | String | FK → `User.id` |

Relations: `owner` → `User`, `members` → `Member[]`, `channels` → `Channel[]`

#### Member

| Field | Type | Notes |
|---|---|---|
| `id` | String | `@id @default(cuid())` |
| `userId` | String | FK → `User.id` |
| `serverId` | String | FK → `Server.id` |
| `role` | `ROLE` | `@default(GUEST)` |

Relations: `user`, `server`, `channels` → `Channel[]`, `messages` → `Message[]`, `directMessages` → `DirectMessage[]`, `conversationsInitiated` and `conversationsReceived` → `Conversation[]`

#### Channel

| Field | Type | Notes |
|---|---|---|
| `id` | String | `@id @default(cuid())` |
| `name` | String | — |
| `type` | `CHANNEL_TYPE` | `@default(TEXT)` |
| `memberId` | String | FK → `Member.id` (creator) |
| `serverId` | String | FK → `Server.id` |

Relations: `member`, `server`, `messages` → `Message[]`

#### Message

| Field | Type | Notes |
|---|---|---|
| `id` | String | `@id @default(uuid())` |
| `content` | String | `@db.Text` |
| `fileUrl` | String? | nullable attachment URL |
| `memberId` | String | FK → `Member.id` |
| `channelId` | String | FK → `Channel.id` |
| `deleted` | Boolean | `@default(false)` — soft delete |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

Relations: `member`, `channel`

#### Conversation

| Field | Type | Notes |
|---|---|---|
| `id` | String | `@id @default(uuid())` |
| `memberOneId` | String | FK → `Member.id` |
| `memberTwoId` | String | FK → `Member.id` |

Constraint: `@@unique([memberOneId, memberTwoId])` — one conversation per pair

Relations: `memberOne`, `memberTwo`, `directMessages` → `DirectMessage[]`

#### DirectMessage

| Field | Type | Notes |
|---|---|---|
| `id` | String | `@id @default(uuid())` |
| `content` | String | `@db.Text` |
| `fileUrl` | String? | nullable |
| `memberId` | String | FK → `Member.id` (sender) |
| `conversationId` | String | FK → `Conversation.id` |
| `deleted` | Boolean | `@default(false)` — soft delete |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

Relations: `member`, `conversation`

### Entity relationship overview

```
User ──< Member >── Server
            │
            ├──< Channel ──< Message
            │
            ├── Conversation.memberOne
            ├── Conversation.memberTwo
            │        └──< DirectMessage
            │
            └──< DirectMessage
```

---

## 5. Data Flow — Message Creation

### Step-by-step

```
1  User submits ChatInput.tsx form
2  useMutation fires POST http://localhost:8000/message
3  Processor validates server, member, and channel membership via Prisma
4  Processor builds message object (CUID2 id) and publishes to Redis "channel-message"
5  ws receives the Redis event
6  ws broadcasts WebSocket event "chat:{channelId}:message" to all connected clients
7  ws produces the message to Kafka topic "MESSAGES"
8  Worker consumes from Kafka and persists to PostgreSQL via db.message.create()
9  ChatProvider.tsx receives the WebSocket event and prepends the message to the React Query cache
```

### Redis payload

```json
{
  "type":    "CREATE",
  "address": "<channelId>",
  "message": { /* full message object with nested member */ }
}
```

For direct messages the Redis channel is `"direct-message"` and `address` is the `conversationId`.

### WebSocket event shape

```json
{
  "event":   "chat:<channelId>:message",
  "message": { /* full message object */ }
}
```

### Kafka payload (topic `MESSAGES`)

```json
{
  "type":    "CREATE",
  "message": { /* full message object */ }
}
```

The Kafka message key is `"channel-message"` or `"direct-message"`, which tells the Worker which table to write to.

### Edit and delete

The same pipeline handles mutations. Processor publishes `type: "MODIFY"`. The ws layer broadcasts the same event shape. The Worker calls `db.message.update()`. For soft-deletes, `deleted` is set to `true` and content is replaced with `"This message has been deleted"` on the client.

---

## 6. Authentication Flow

Authentication is implemented from scratch using `jsonwebtoken` and `bcryptjs`. There is no NextAuth.

### Sign-up

```
POST /api/(auth)/signup
Body: { name, email, password }
```

1. Validate `name` (3–15 chars), `email` (valid format), `password` (min length) using `RegisterValidator`.
2. Check `db.user.findUnique({ where: { email } })` — reject if already taken.
3. Hash password: `bcrypt.hash(password, 10)`.
4. `db.user.create({ data: { name, email, password: hashed } })`.
5. Sign JWT: `jwt.sign({ id: user.id }, process.env.SECRETE_KEY)`.
6. Set an `httpOnly` cookie named `discord_auth_token` with a 24-hour expiry.

### Sign-in

```
POST /api/(auth)/signin
Body: { email, password }
```

1. `db.user.findUnique({ where: { email } })` — reject if not found.
2. `bcrypt.compare(password, user.password)` — reject if mismatch.
3. Sign JWT and set cookie identical to sign-up.

### Session reading (server-side)

`getServerSideUser.ts` is used by Next.js page components and API routes to identify the current user from the cookie.

### Cookie properties

| Property | Value |
|---|---|
| Name | `discord_auth_token` |
| HttpOnly | `true` |
| Expiry | 24 hours from issue |

### Invite URL auth

Server invite links are also JWT-encoded:

```ts
inviteUrl = jwt.sign({ serverId, inviteCode }, process.env.SECRETE_KEY);
```

When a user visits `/(invite)/invite/[link]`, the App decodes the token to retrieve the `serverId` and adds the visitor as a `GUEST` member.

---

## 7. URL Routing

The Next.js App uses route groups (parenthesised folders) and dynamic segments.

### Route groups

| Group | Purpose |
|---|---|
| `(auth)` | Login and register pages |
| `(main)` | Authenticated app shell with server sidebar |
| `(initial)` | First-time server creation prompt |
| `(invite)` | Invite link handler |

### Pages

| Path | Description |
|---|---|
| `/login` | Sign-in form |
| `/register` | Sign-up form |
| `/` | Create-first-server modal (initial page) |
| `/invite/[link]` | Join server via invite token |
| `/server/[serverId]/channel/[channelId]` | Text channel chat view |
| `/server/[serverId]/conversation/[memberId]` | Direct message view |

### Navigation flow

```
Browser lands on /
  → no cookie               → redirect /login
  → logged in, no servers   → InitialModal (create first server)
  → logged in, has servers  → redirect /server/[firstServerId]/channel/[generalChannelId]
```

---

## 8. API Endpoints

### App service — Next.js API routes (port 3000)

#### Authentication

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/(auth)/signup` | `{ name, email, password }` | Register, set cookie |
| `POST` | `/api/(auth)/signin` | `{ email, password }` | Login, set cookie |

#### Server management

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/server` | `{ name, imgUrl }` | Create server; adds creator as ADMIN; creates default `#general` TEXT channel |
| `GET` | `/api/server/[serverId]` | — | Fetch server with members and channels |
| `PUT` | `/api/server/[serverId]` | `{ name, imgUrl }` | Update server (ADMIN only) |
| `DELETE` | `/api/server/[serverId]` | — | Delete server and cascade (ADMIN only) |
| `HEAD` | `/api/server/[serverId]` | — | Regenerate invite URL with a new JWT (ADMIN only) |

#### Channel management

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/api/server/[serverId]/channel` | `{ name, type }` | Create channel (ADMIN or MODERATOR) |

#### Message history

| Method | Path | Query | Description |
|---|---|---|---|
| `GET` | `/api/server/[serverId]/channel/[channelId]/message` | `cursor` (optional) | Cursor-paginated channel messages, 10 per page |
| `GET` | `/api/server/[serverId]/member/conversation/[conversationId]` | `cursor` (optional) | Cursor-paginated direct messages, 5 per page |

#### Invite

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/server/[serverId]/invite/[url]` | Decode invite JWT, add current user as GUEST member |

#### File uploads

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/uploadthing` | UploadThing file upload handler |

---

### Processor service — Express (port 8000)

All endpoints validate membership via Prisma before publishing to Redis.

#### Channel messages

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/message` | `{ content, userId, memberId, channelId, serverId, fileUrl? }` | Create and broadcast a channel message |
| `PUT` | `/message/:id` | `{ content, userId, memberId, channelId, serverId }` | Edit a channel message |
| `DELETE` | `/message/:id` | `{ userId, memberId, channelId, serverId }` | Soft-delete a channel message |

#### Direct messages

| Method | Path | Body | Description |
|---|---|---|---|
| `POST` | `/direct-message` | `{ content, userId, memberId, conversationId, fileUrl? }` | Create and broadcast a direct message |
| `PUT` | `/direct-message/:id` | `{ content, userId, memberId, conversationId }` | Edit a direct message |
| `DELETE` | `/direct-message/:id` | `{ userId, memberId, conversationId }` | Soft-delete a direct message |

---

### ws service — WebSocket (port 8080)

No HTTP endpoints. Clients connect to `ws://localhost:8080`. The service subscribes to Redis and fans messages out over WebSocket. See [Section 10 — Real-Time System](#10-real-time-system).

---

### Worker service

No HTTP interface. Runs as a long-lived Kafka consumer.

---

## 9. Key Components

### Chat — `App/components/chat/`

#### `ChatProvider.tsx`

Top-level context provider for any channel or DM view. Opens and maintains the WebSocket connection to `ws://localhost:8080`. Listens for incoming events, filters by event name, and updates the matching React Query cache key. Exposes connection status via context so `SocketIndicator` can render it.

#### `ChatInput.tsx`

Message composition bar pinned to the bottom of every chat view. Renders a `react-hook-form` form validated with Zod. On submit, fires `useMutation` to POST to `http://localhost:8000/message` (or `/direct-message` for DMs). Integrates the UploadThing file upload button.

#### `ChatMessageContainer.tsx`

Scrollable message list. Uses `useInfiniteQuery` to cursor-paginate the REST message history endpoint. Attaches an `IntersectionObserver` to the top of the list to auto-fetch older pages as the user scrolls up.

#### `ChatHeader.tsx`

Top bar of a chat view. Displays the channel name (prefixed with `#`) or the other member's name for DMs, a `SocketIndicator`, and a mobile menu toggle.

#### `MessageCard.tsx`

Single message row. Renders the author's avatar, name, timestamp, and `MessageContent`. Shows Edit and Delete action buttons to the message author and to ADMIN / MODERATOR members.

#### `MessageContent.tsx`

Renders the message body. Handles plain text, file or image attachments from `fileUrl`, and inline editing mode (swaps text for a form input, calls PUT on submit).

---

### Server components — `App/components/serverComponents/`

#### `ServerContainer.tsx`

Left panel showing all channels and members for the current server. Sections: Text Channels, Audio Channels, Video Channels, Members. Contains `Header` and `Search`.

#### `FieldCard.tsx`

Single channel row in the sidebar. Shows channel type icon and name. ADMIN and MODERATOR see a settings icon that opens the edit channel modal.

#### `FieldAction.tsx`

The `+` button next to each channel section heading. Opens the Create Channel modal.

#### `Header.tsx`

Server name bar at the top of `ServerContainer`. Dropdown contains: Invite People, Edit Server (ADMIN), Manage Members (ADMIN), Create Channel (ADMIN / MODERATOR), Delete Server (ADMIN), Leave Server (non-ADMIN).

#### `Search.tsx`

Keyboard-shortcut-aware command palette (`Ctrl+K` / `Cmd+K`). Filters channels and members within the current server. Selecting a channel navigates to it; selecting a member opens a DM.

---

### Sidebar — `App/components/sidebar/`

#### `Sidebar.tsx`

Far-left icon strip. Renders a `ServerCard` for every server the current user belongs to, plus a `ServerAction` button.

#### `ServerCard.tsx`

Circular server icon button. Navigates to the server's first TEXT channel on click. Shows a left-border indicator when active.

#### `ServerAction.tsx`

The `+` button at the bottom of the sidebar. Opens the create-server modal.

---

### Modals — `App/components/models/`

Eleven modal dialogs, each with its own form and API call:

| Modal | Triggered by | Action |
|---|---|---|
| `CreateServerModal` | ServerAction `+` | POST `/api/server` |
| `EditServerModal` | Header dropdown | PUT `/api/server/[id]` |
| `DeleteServerModal` | Header dropdown | DELETE `/api/server/[id]` |
| `LeaveServerModal` | Header dropdown | DELETE member record |
| `ManageMembersModal` | Header dropdown | Promote, demote, or kick members |
| `InviteModal` | Header dropdown | Display invite link with copy button |
| `CreateChannelModal` | FieldAction `+` | POST `/api/server/[id]/channel` |
| `EditChannelModal` | FieldCard gear | PUT channel |
| `DeleteChannelModal` | FieldCard gear | DELETE channel |
| `MessageFileModal` | ChatInput attachment | POST message with `fileUrl` |
| `InitialModal` | First-visit redirect | POST `/api/server` (first server) |

---

### Shared components

| Component | Description |
|---|---|
| `SocketIndicator` | Badge in `ChatHeader` — green: connected, red: disconnected |
| `UserAvatar` | Avatar image from `user.avatar` or initials fallback via Radix `Avatar` |
| `UserButton` | Sidebar footer — shows current user, opens sign-out popover |
| `Provider` | Wraps app with `QueryClientProvider` and `ThemeProvider` (next-themes) |

---

## 10. Real-Time System

### WebSocket connection

Clients connect to `ws://localhost:8080`. All writes go through the Processor HTTP API — the client never sends messages over WebSocket.

### WebSocket event names

| Event | Source | Description |
|---|---|---|
| `chat:<channelId>:message` | Channel message created or updated | Full `Message` object with nested `member` |
| `chat:<conversationId>:direct-message` | Direct message created or updated | Full `DirectMessage` object with nested `member` |

### Redis pub/sub

**Provider:** Upstash Redis (HTTP-based REST API)

| Channel | Publisher | Subscriber | When used |
|---|---|---|---|
| `channel-message` | Processor | ws | Channel message create / edit / delete |
| `direct-message` | Processor | ws | Direct message create / edit / delete |

Payload schema:

```json
{
  "type":    "CREATE" | "MODIFY",
  "address": "<channelId or conversationId>",
  "message": { /* full message object */ }
}
```

`MODIFY` covers both edits and soft-deletes. The `deleted` boolean in the message object distinguishes the two.

### Kafka

**Broker:** `localhost:9092` (hardcoded in source)  
**Topic:** `MESSAGES`  
**Consumer group:** `"default"`

The ws service is the sole producer. It sends every message it receives from Redis into Kafka, using `"channel-message"` or `"direct-message"` as the message key.

The Worker is the sole consumer. It reads from `MESSAGES` and persists each record to PostgreSQL. On any consumer error it pauses for 60 seconds then resumes, preventing a bad message from causing a tight restart loop.

Kafka value schema:

```json
{
  "type":    "CREATE" | "MODIFY",
  "message": { /* full message object */ }
}
```

---

## 11. Environment Variables

### App — `./App/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRETE_KEY` | JWT signing secret (note: variable name spelled as `SECRETE_KEY` in source) |
| `UPSTASH_REDIS_URL` | Upstash Redis URL |
| `UPLOADTHING_SECRET` | UploadThing secret key |
| `UPLOADTHING_APP_ID` | UploadThing app ID |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the App service |

### Processor — `./Processor/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (same DB as App) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `PORT` | HTTP port (default `8000`) |

### ws — `./ws/.env`

| Variable | Description |
|---|---|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `PORT` | WebSocket port (default `8080`) |

### Worker — `./Worker/.env`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |

### Variable reference across services

| Variable | App | Processor | ws | Worker |
|---|---|---|---|---|
| `DATABASE_URL` | Yes | Yes | No | Yes |
| `SECRETE_KEY` | Yes | No | No | No |
| `UPSTASH_REDIS_URL` | Yes | No | No | No |
| `UPSTASH_REDIS_REST_URL` | No | Yes | Yes | No |
| `UPSTASH_REDIS_REST_TOKEN` | No | Yes | Yes | No |
| `UPLOADTHING_SECRET` | Yes | No | No | No |
| `UPLOADTHING_APP_ID` | Yes | No | No | No |
| `PORT` | 3000 | 8000 | 8080 | — |

---

## 12. Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ |
| npm or pnpm | 8+ |
| PostgreSQL | 14+ |
| Apache Kafka | 3.x, broker at `localhost:9092` |
| Upstash account | Free tier works for development |
| UploadThing account | Required for file attachment support |

### Starting Kafka locally

With Homebrew on macOS:

```bash
# Start ZooKeeper
zookeeper-server-start /usr/local/etc/kafka/zookeeper.properties

# Start Kafka broker (separate terminal)
kafka-server-start /usr/local/etc/kafka/server.properties

# Create the topic
kafka-topics --create --topic MESSAGES --bootstrap-server localhost:9092
```

With Docker:

```bash
docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  confluentinc/cp-kafka:latest
```

---

## 13. Running the Project

### Installation

```bash
git clone <repo-url>
cd discord-clone
```

Install dependencies and configure each service:

```bash
# App
cd App && npm install && cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate

# Processor
cd ../Processor && npm install && cp .env.example .env
npx prisma generate

# ws
cd ../ws && npm install && cp .env.example .env

# Worker
cd ../Worker && npm install && cp .env.example .env
npx prisma generate
```

Migrations are owned by the App service. The Processor and Worker only need `prisma generate` to produce the client.

### Start order

Start services in this order to avoid connection errors on boot. Each requires its own terminal.

**1. Infrastructure** — ensure PostgreSQL is running and Kafka is up with the `MESSAGES` topic created.

**2. App**

```bash
cd App
npm run dev
# http://localhost:3000
```

**3. Processor**

```bash
cd Processor
npm run dev
# http://localhost:8000
```

**4. ws**

```bash
cd ws
npm run dev
# ws://localhost:8080
```

**5. Worker**

```bash
cd Worker
npm run dev
# long-running Kafka consumer
```

### Verification

- Open `http://localhost:3000` — login page appears.
- Register an account and create a server.
- Open two browser tabs as different users in the same channel.
- Send a message from one tab — it appears in the other tab in real-time without a page refresh.
- Check Worker logs — the message is persisted to PostgreSQL.
- Reload the page — the message loads from PostgreSQL via the paginated REST endpoint.

---

## Architecture

```
+---------------------------------------------------------------+
|                        CLIENT BROWSER                         |
|                                                               |
|   Next.js App (port 3000)                                     |
|   +----------------------------------------------------------+|
|   | ChatInput.tsx                                            ||
|   |   -- useMutation --> POST http://localhost:8000/message  ||
|   |                                                          ||
|   | ChatProvider.tsx                                         ||
|   |   <-- WebSocket events -- ws://localhost:8080            ||
|   |                                                          ||
|   | ChatMessageContainer.tsx                                 ||
|   |   <-- GET /api/server/[id]/channel/[id]/message (REST)   ||
|   |                                                          ||
|   | File uploads --> UploadThing (external CDN)              ||
|   +----------------------------------------------------------+|
+-------------------------------+-------------------------------+
                                |
          +---------------------+---------------------+
          |                                           |
          | HTTP POST /message                        | REST CRUD / auth
          |                                           |
          v                                           v
+-----------------------+               +-------------------------+
|   PROCESSOR           |               |   APP (API routes)      |
|   Express  :8000      |               |   Next.js  :3000        |
|                       |               |                         |
|  - validate server    |               |  - POST /signup /signin |
|  - validate member    |               |  - server CRUD          |
|  - validate channel   |               |  - channel CRUD         |
|  - build msg object   |               |  - invite join          |
|    (CUID2 id)         |               |  - message history      |
|  - Redis PUBLISH      |               |  - UploadThing handler  |
+-----------+-----------+               +-------------------------+
            |
            | Redis PUBLISH
            |   channel: "channel-message"  (channel msgs)
            |   channel: "direct-message"   (DMs)
            |
            v
+----------------------+
|   Redis Pub/Sub      |
|   (Upstash)          |
+----------+-----------+
           |
           | Redis SUBSCRIBE
           |
           v
+-----------------------------+
|   WebSocket Server (ws)     |
|   port 8080                 |
|                             |
|  - subscribes to Redis      |
|  - broadcasts WS events     |
|  - produces to Kafka        |
+----------+------------------+
           |
     +-----+-----+
     |             |
     | WebSocket   | Kafka PRODUCE
     | broadcast   | topic "MESSAGES"
     | to clients  | key: "channel-message"
     |             |      or "direct-message"
     v             v
+----------+   +-------------------+
| Browser  |   |   WORKER          |
| clients  |   |   Kafka consumer  |
|          |   |   group "default" |
| React    |   |                   |
| state    |   |  - consume msgs   |
| updated  |   |  - db.message     |
|          |   |    .create()      |
|          |   |  - db.message     |
|          |   |    .update()      |
+----------+   +--------+----------+
                        |
                        | Prisma ORM
                        v
               +------------------+
               |   PostgreSQL     |
               |  (messages,      |
               |   direct_msgs,   |
               |   users,         |
               |   servers,       |
               |   members,       |
               |   channels)      |
               +------------------+

Infrastructure summary:
  Redis (Upstash)  <-->  Processor (PUBLISH) + ws (SUBSCRIBE)
  Kafka :9092      <-->  ws (PRODUCE) + Worker (CONSUME)
  PostgreSQL       <-->  App + Processor (validation) + Worker (writes)
  UploadThing      <-->  App (file upload handler)
```

### Service roles at a glance

| Service   | Port | Responsibility                                    | DB access            |
|-----------|------|---------------------------------------------------|----------------------|
| App       | 3000 | UI, SSR, REST CRUD, auth, file uploads            | Prisma / PostgreSQL  |
| Processor | 8000 | Message intake, membership validation, Redis pub  | Prisma / PostgreSQL  |
| ws        | 8080 | Redis sub, WebSocket broadcast, Kafka produce     | None                 |
| Worker    | --   | Kafka consume, durable DB write                   | Prisma / PostgreSQL  |

---

## User Flow

### 1. New User Registration

```
/register page
    |
    | user fills: name, email, password
    v
POST /api/(auth)/signup
    |
    | RegisterValidator (Zod): name 3-15 chars, valid email, password min-length
    | db.user.findUnique({ where: { email } })  -- reject if taken
    | bcrypt.hash(password, 10)
    | db.user.create({ data: { name, email, password: hashed } })
    | jwt.sign({ id: user.id }, process.env.SECRETE_KEY)
    | Set-Cookie: discord_auth_token (httpOnly, 24h expiry)
    v
Redirect --> / (initial page)
    |
    | no servers yet
    v
InitialModal -- create first server
```

### 2. Create Server

```
/(initial) page -- InitialModal rendered
    |
    | user enters: server name
    | user uploads: icon image via UploadThing
    |   (App /api/uploadthing handler --> UploadThing CDN --> returns imgUrl)
    v
POST /api/server  { name, imgUrl }
    |
    | db.server.create({ data: { name, imgUrl, ownerId: user.id,
    |   inviteUrl: jwt.sign({ serverId, inviteCode }, SECRETE_KEY) } })
    | db.member.create({ role: ADMIN })          -- creator becomes ADMIN
    | db.channel.create({ name: "general", type: TEXT })  -- default channel
    v
Redirect --> /server/[serverId]/channel/[generalChannelId]
```

### 3. Create Channel

```
ServerContainer sidebar
    |
    | user clicks "+" (FieldAction) next to a channel section
    v
CreateChannelModal
    |
    | user enters: channel name
    | user selects: type (TEXT / VIDEO / AUDIO)
    v
POST /api/server/[serverId]/channel  { name, type }
    |
    | auth: must be ADMIN or MODERATOR
    | db.channel.create({ data: { name, type, serverId, memberId } })
    v
Channel appears in ServerContainer sidebar under the matching section
```

### 4. Send a Message

```
User types in ChatInput.tsx, submits form
    |
    | react-hook-form + Zod validation (non-empty content)
    v
useMutation --> POST http://localhost:8000/message
    { content, userId, memberId, channelId, serverId, fileUrl? }
    |
    v
Processor (Express :8000)
    |
    | db.server.findUnique  -- verify server exists
    | db.member.findFirst   -- verify userId is a member
    | db.channel.findFirst  -- verify channelId belongs to serverId
    | createId()            -- generate CUID2 id for the message
    | build message object: { id, content, fileUrl, memberId, channelId,
    |   deleted: false, createdAt, updatedAt, member: { ...user } }
    v
redis.publish("channel-message", JSON.stringify({
    type: "CREATE",
    address: channelId,
    message: { ...messageObject }
}))
    |
    v
Redis Pub/Sub (Upstash)
    |
    v
ws (WebSocket Server :8080) -- subscribed to "channel-message"
    |
    +-- broadcasts to ALL connected WebSocket clients:
    |   { event: "chat:{channelId}:message", message: { ...messageObject } }
    |   ChatProvider.tsx receives event --> prepends to React Query cache
    |   --> message appears instantly in ChatMessageContainer for all clients
    |
    +-- kafka.produce("MESSAGES", {
            key: "channel-message",
            value: JSON.stringify({ type: "CREATE", message: { ...messageObject } })
        })
            |
            v
        Worker (Kafka consumer, group: "default")
            |
            | consumes from topic "MESSAGES"
            v
        db.message.create({ data: messageObject })  --> PostgreSQL
```

### 5. Edit / Delete a Message

```
User clicks message --> MessageContent popover shows Edit / Delete buttons
    |
    +-- EDIT: user modifies text inline, submits
    |       PUT http://localhost:8000/message/:id
    |       { content, userId, memberId, channelId, serverId }
    |
    +-- DELETE: user clicks Delete (own message, or ADMIN/MODERATOR)
            DELETE http://localhost:8000/message/:id
            { userId, memberId, channelId, serverId }
    |
    v
Processor
    |
    | validate membership (same checks as CREATE)
    | EDIT:   update message object with new content
    | DELETE: set deleted=true, content="This message has been deleted"
    v
redis.publish("channel-message", { type: "MODIFY", address: channelId, message: {...} })
    |
    v
ws broadcasts: { event: "chat:{channelId}:messages:update", message: {...} }
    |
    v
ChatProvider.tsx receives "chat:{channelId}:messages:update"
    --> updates the matching message in React Query cache
    --> all clients see updated/deleted message immediately
    |
    v
Worker consumes from Kafka --> db.message.update({ where: { id }, data: {...} })
```

### 6. Invite a Member

```
Server Header dropdown --> "Invite People"
    |
    v
InviteModal displays invite link
    inviteUrl = jwt.sign({ serverId, inviteCode }, SECRETE_KEY)
    (stored as server.inviteUrl, regenerated via HEAD /api/server/[serverId])
    |
    | owner copies link and shares it
    v
Recipient opens: /(invite)/invite/[link]
    |
    | App decodes JWT to extract serverId and inviteCode
    v
POST /api/server/[serverId]/invite/[url]
    |
    | jwt.decode(url) --> verify serverId matches
    | db.member.create({ userId: recipient.id, serverId, role: GUEST })
    v
Redirect --> /server/[serverId]/channel/[generalChannelId]
    recipient now appears in Members list with GUEST role
```

### 7. Direct Message

```
User clicks a member name in ServerContainer --> Members section
    |
    v
Navigate to /server/[serverId]/conversation/[memberId]
    |
    | getOrCreateConversation(currentMemberId, targetMemberId)
    |   --> db.conversation.findFirst or db.conversation.create
    v
DM view loads with ChatMessageContainer + ChatInput
    |
    | user types and submits
    v
useMutation --> POST http://localhost:8000/direct-message
    { content, userId, memberId, conversationId, fileUrl? }
    |
    v
Processor validates conversationId membership
    |
    v
redis.publish("direct-message", { type: "CREATE", address: conversationId, message: {...} })
    |
    v
ws broadcasts: { event: "chat:{conversationId}:direct-message", message: {...} }
    ChatProvider.tsx updates React Query cache for the DM view
    |
    v
Kafka "MESSAGES" (key: "direct-message") --> Worker --> db.directMessage.create()
```

---

## Data Flow

### Message Creation Pipeline

```
User types --> ChatInput.tsx
    |
    | react-hook-form validates (non-empty, max length)
    v
POST http://localhost:8000/message
    { content, userId, memberId, channelId, serverId, fileUrl? }
    |
    v
Processor (port 8000)
    |
    | 1. db.server.findUnique({ where: { id: serverId } })
    | 2. db.member.findFirst({ where: { userId, serverId } })
    | 3. db.channel.findFirst({ where: { id: channelId, serverId } })
    | 4. createId() --> CUID2 message id
    | 5. build message object:
    |      { id, content, fileUrl, memberId, channelId,
    |        deleted: false, createdAt, updatedAt,
    |        member: { id, role, user: { name, email, avatar } } }
    v
redis.publish("channel-message", JSON.stringify({
    type:    "CREATE",
    address: channelId,
    message: { ...fullMessageObject }
}))
    |
    v
Redis Pub/Sub (Upstash REST API)
    |
    v
ws (port 8080) -- polling Redis SUBSCRIBE on "channel-message"
    |
    +--[broadcast]-------------------------------------------->
    |  wsServer.clients.forEach(client => client.send(JSON.stringify({
    |      event:   "chat:{channelId}:message",
    |      message: fullMessageObject
    |  })))
    |
    |  ChatProvider.tsx (browser) receives WS event
    |      --> queryClient.setQueryData([queryKey], old => ({
    |              ...old, pages: [[message, ...old.pages[0]], ...rest]
    |          }))
    |      --> message appears immediately in ChatMessageContainer
    |
    +--[persist]----------------------------------------------->
       kafka.producer.send({
           topic: "MESSAGES",
           messages: [{
               key:   "channel-message",
               value: JSON.stringify({ type: "CREATE", message: fullMessageObject })
           }]
       })
           |
           v
       Worker (Kafka consumer group: "default")
           |
           | eachMessage({ topic: "MESSAGES", ... })
           | key === "channel-message"
           v
       db.message.create({ data: {
           id, content, fileUrl, memberId, channelId,
           deleted: false, createdAt, updatedAt
       }})  --> PostgreSQL (messages table)
```

### Edit / Delete Pipeline

```
PUT or DELETE http://localhost:8000/message/:id
    |
    v
Processor validates membership (same 3 checks as CREATE)
    |
    | EDIT:   update message object { content: newContent, updatedAt: now }
    | DELETE: update message object { deleted: true,
    |           content: "This message has been deleted", updatedAt: now }
    v
redis.publish("channel-message", {
    type:    "MODIFY",
    address: channelId,
    message: { ...updatedMessageObject }
})
    |
    v
ws broadcasts:
    { event: "chat:{channelId}:messages:update", message: updatedMessageObject }
    |
    v
ChatProvider.tsx finds the message in React Query cache by id and replaces it
    --> clients see the edit or the "deleted" placeholder immediately
    |
    v
Kafka "MESSAGES" (key: "channel-message", type: "MODIFY")
    |
    v
Worker: db.message.update({ where: { id }, data: updatedFields }) --> PostgreSQL
```

### Authentication Flow

```
Browser sends request with cookie: discord_auth_token=<jwt>
    |
    v
getServerSideUser.ts  (called by every protected API route and page)
    |
    | cookies().get("discord_auth_token")
    | jwt.decode(token)  --> { id: userId }
    |   (note: source uses jwt.decode, not jwt.verify,
    |    for session reading in some paths)
    v
db.user.findUnique({ where: { id: userId } })
    |
    | user not found --> return null --> redirect /login
    v
returns user object to the route handler or page component

Sign-up / sign-in sets the cookie:
    jwt.sign({ id: user.id }, process.env.SECRETE_KEY)
    --> Set-Cookie: discord_auth_token=<jwt>; HttpOnly; Max-Age=86400
```

### Direct Message Data Flow (difference from channel messages)

```
POST http://localhost:8000/direct-message
    { content, userId, memberId, conversationId, fileUrl? }
    |
    v
Processor validates: db.conversation.findUnique({ where: { id: conversationId } })
    checks memberOneId or memberTwoId === memberId
    |
    v
redis.publish("direct-message", { type: "CREATE", address: conversationId, message: {...} })
    |
    v
ws broadcasts: { event: "chat:{conversationId}:direct-message", message: {...} }
    |
    v
Kafka key: "direct-message"
    |
    v
Worker: db.directMessage.create({ data: {...} }) --> PostgreSQL (direct_messages table)
```

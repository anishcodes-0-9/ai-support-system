### AI Support System – An AI‑powered customer support backend with structured multi‑agent routing, streaming responses, and deterministic database grounding.

It simulates an e‑commerce support assistant capable of handling:

- Order tracking
- Delivery estimation
- Invoice queries
- General support questions

The system is built with clean layered architecture and designed to avoid hallucinations by grounding responses in real database data.

### Architecture Overview\*\*

The system follows a layered backend architecture:

Routes → Controllers → Agents → Tools → Repositories → Database

Core Components

- Router Agent – classifies user intent (order / billing / support)
- Order Agent – deterministic delivery logic using real order data
- Billing Agent – invoice‑based responses
- Support Agent – general support handling
- Prisma ORM – database access layer
- Streaming Layer – real‑time AI responses
- Conversation Persistence – stores full message history
- Rate Limiting Middleware – basic request throttling

### Tech Stack

- Node.js
- TypeScript
- Hono
- Prisma
- PostgreSQL
- OpenAI (AI SDK)
- Turborepo

### Implemented Features

- Structured intent classification using schema validation
- Multi‑agent routing
- Streaming AI responses
- Conversation history injection into agents
- Deterministic order delivery logic
- Estimated delivery date support
- Database seeding
- Rate limiting middleware
- Global error handler
- Minimal web‑based frontend demo

**Getting Started**

1️⃣ Install Dependencies

```
pnpm install
```

2️⃣ Setup Environment Variables (apps/backend/.env)

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/ai_support"
OPENAI_API_KEY="your_openai_api_key"
```

3️⃣ Run Database Migration (apps/backend)

```
pnpm prisma migrate dev --name init
```

4️⃣ Seed Database

```
pnpm prisma db seed
```

5️⃣ Start Backend

```
pnpm dev
```

Server runs at: `http://localhost:3000`  
 Health check: `http://localhost:3000/api/health`

**Demo**  
Open `http://localhost:3000` and try example queries:

- Where is my latest order?
- When will it reach me?
- Tell me about my delivered order
- Show me my invoices

**API Endpoint**  
`POST /api/chat/messages`

Request Body:

```json
{
  "userId": "uuid",
  "conversationId": "uuid",
  "message": "Where is my latest order?"
}
```

### Design Decisions

- Deterministic order data injection to prevent hallucinations
- Schema‑based intent classification for strict routing
- Clean separation of concerns via layered architecture
- Streaming responses while persisting assistant output
- Minimal but functional frontend for demonstration

### Tradeoffs

- No authentication layer
- No Redis‑based distributed rate limiting
- No automated tests
- Minimal frontend styling
- No deployment included

**Future Improvements**

- Add authentication and session management
- Redis‑based rate limiting
- Unit and integration tests
- Production deployment
- React frontend
- Structured logging and monitoring

**Notes**  
This project focuses on backend architecture, correctness, and deterministic AI behavior rather than UI polish.

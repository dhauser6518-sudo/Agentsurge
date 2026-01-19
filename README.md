# AgentSurge

Recruit tracking and dispute system for life insurance agents.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account (for webhook integration)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:
   - `DATABASE_URL` - PostgreSQL connection string
   - `AUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `AUTH_URL` - Your app URL (http://localhost:3000 for dev)
   - `STRIPE_SECRET_KEY` - From Stripe dashboard
   - `STRIPE_WEBHOOK_SECRET` - From Stripe webhook settings
   - `INGEST_API_KEY` - API key for external recruit ingestion

3. **Set up the database**
   ```bash
   npm run db:push    # Push schema to database
   npm run db:seed    # Seed with test data
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   - Open http://localhost:3000
   - Login with test credentials:
     - Admin: `admin@agentsurge.com` / `admin123`
     - Agent: `agent@example.com` / `agent123`

## Database Commands

```bash
npm run db:migrate  # Create migration
npm run db:push     # Push schema without migration
npm run db:seed     # Seed test data
npm run db:studio   # Open Prisma Studio
```

## External Integration

### Stripe Webhook

Configure your Stripe webhook to point to:
```
POST /api/webhooks/stripe
```

The webhook expects `checkout.session.completed` events with metadata:
```json
{
  "agent_email": "agent@example.com",
  "agent_first_name": "Jane",
  "agent_last_name": "Smith",
  "quantity": 5
}
```

### Recruit Ingestion API

External systems can push recruits via:
```
POST /api/recruits/ingest
Authorization: Bearer <INGEST_API_KEY>
Content-Type: application/json

{
  "agent_email": "agent@example.com",
  "recruits": [
    {
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+1234567890"
    }
  ],
  "order_reference": "optional_stripe_session_id"
}
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login page
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── dashboard/    # Agent views
│   │   └── admin/        # Admin views
│   └── api/              # API routes
├── components/
│   ├── ui/               # Base UI components
│   ├── recruits/         # Recruit-related components
│   ├── disputes/         # Dispute-related components
│   └── layout/           # Layout components
├── lib/                  # Utilities and config
└── types/                # TypeScript types
```

## Features

### Agent Features
- View purchased recruits
- Update recruit status (New, Contacted, Follow Up, Signed Up, Not Interested, Do Not Call)
- Add internal notes to recruits
- Click-to-call functionality
- Submit disputes on recruits
- View dispute status

### Admin Features
- View all recruits across agents
- Dispute queue with filtering
- Review and resolve disputes (Approve/Deny)
- Add admin notes and resolution actions
- Dashboard with system stats

### Dispute Reasons
- Wrong Information
- Unreachable
- Duplicate Recruit
- Invalid Insurance Recruit
- Other

### Resolution Actions
- Replace Recruit
- Credit Agent
- Mark as Invalid


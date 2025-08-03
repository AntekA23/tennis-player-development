# 🚨 DEPRECATED - OLD COMPLEX TENNIS PLATFORM

## ⚠️ **THIS PROJECT IS DEPRECATED**

**STATUS: FRESH START REQUIRED (2025-08-03)**

**PROBLEM**: After 5 days debugging basic CRUD operations in this complex multi-role system, we're starting fresh with discipline-first approach.

**DECISION**: 
- ❌ Complex OAuth/NextAuth → ✅ Simple email/password
- ❌ Multi-role system → ✅ Single players table
- ❌ tRPC complexity → ✅ Simple API routes
- ❌ Broken persistence → ✅ Evidence-based testing

**NEW PROJECT**: See `CLAUDE-FRESH-START.md` for discipline-first fresh start.

---

## OLD COMPLEX PLATFORM (ABANDONED)

## Quick Start for Coach Testing

This project is designed for Railway.com deployment to enable immediate coach testing and feedback collection.

### Railway.com Deployment

1. **Create Railway Account**: [railway.app](https://railway.app)
2. **Connect GitHub**: Link your GitHub repository
3. **Add PostgreSQL**: Add PostgreSQL service to your project
4. **Set Environment Variables**:
   ```
   DATABASE_URL=<Railway PostgreSQL URL>
   NEXTAUTH_SECRET=<random-secret-string>
   NEXTAUTH_URL=https://your-app.up.railway.app
   ```
5. **Deploy**: Railway will automatically deploy when you push to main branch

### Environment Variables

Copy `.env.example` to `.env.local` for local development or set in Railway dashboard:

- `DATABASE_URL`: Railway PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret for session encryption
- `NEXTAUTH_URL`: Your Railway app URL
- `GOOGLE_CLIENT_ID/SECRET`: Optional for Google OAuth

### Database Setup

The app uses Drizzle ORM with automatic migrations:

```bash
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
```

### FINAL STATUS: ABANDONED DUE TO COMPLEXITY

**WHAT DIDN'T WORK:**
- ❌ **5+ Days Debugging**: Basic CRUD operations took too long
- ❌ **Player Profile Persistence**: Data saved but disappeared after refresh
- ❌ **Complex Authentication**: OAuth causing deployment issues
- ❌ **Multi-Table Migrations**: Drizzle migration conflicts
- ❌ **tRPC Complexity**: Over-engineered for simple CRUD

**ROOT CAUSE**: Started with complex architecture before proving basic functionality.

**LESSON**: Simple email/password + single table + evidence-based testing first.

### OLD COMPLEX TECH STACK (ABANDONED)

- ❌ **Framework**: Next.js 14 with TypeScript (keeping)
- ❌ **Database**: PostgreSQL with Drizzle ORM (keeping, simplified)
- ❌ **API**: tRPC for type-safe APIs (REMOVED - too complex)
- ❌ **Auth**: NextAuth.js (REMOVED - OAuth complexity)
- ❌ **UI**: Tailwind CSS + Shadcn/ui (keeping)
- ❌ **Deployment**: Railway.com (keeping)

### NEW FRESH START TECH STACK

- ✅ **Framework**: Next.js 15 with TypeScript
- ✅ **Database**: PostgreSQL with Drizzle ORM (single table)
- ✅ **API**: Simple API routes (no tRPC)
- ✅ **Auth**: bcrypt email/password
- ✅ **UI**: Tailwind CSS
- ✅ **Deployment**: Railway.com

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Support

For questions or issues, contact the development team.

Built for competitive tennis families • From opportunity-driven to process-driven development

# 🚨 DEPRECATED - OLD COMPLEX DEPLOYMENT RUNBOOK

## ⚠️ **THIS RUNBOOK IS DEPRECATED**

**STATUS: REPLACED BY FRESH START APPROACH**

This runbook describes deployment for complex NextAuth/OAuth system that caused 5+ days of debugging basic CRUD.

**DECISION: FRESH START (2025-08-03)**
- Complex CI/CD → Simple deployment
- NextAuth setup → bcrypt authentication
- Multi-service → Single service

**NEW DEPLOYMENT**: See `CLAUDE-FRESH-START.md` for simple deployment procedures.

---

## OLD COMPLEX DEPLOYMENT (ABANDONED)

## Overview
This runbook covers deployment procedures for the Tennis Career Platform on Railway.com with GitHub Actions CI/CD integration.

## Current Deployment Setup ✅

### Automatic Deployment
- **Trigger**: Push to `main` branch
- **Platform**: Railway.com
- **Build Command**: `npm run build`
- **Start Command**: `npm run start` (includes automatic migrations)
- **Health Check**: `/api/health`

### CI/CD Pipeline Integration
- **GitHub Actions**: `.github/workflows/ci.yml`
- **Runs**: Build, lint, typecheck, migration validation
- **Blocks**: Broken deployments automatically
- **Status**: ✅ Operational and tested (2025-01-29)

## Pre-Deployment Checklist

### Before Pushing to Main
- [ ] **Local testing complete**
  ```bash
  npm run dev  # Test locally
  npm run lint # ESLint passes
  npm run typecheck # TypeScript compiles
  npm run build # Build succeeds
  ```

- [ ] **Database considerations**
  - [ ] Migration files generated if schema changed
  - [ ] Rollback script ready for new migrations
  - [ ] Database backup created (if significant changes)

- [ ] **Debug endpoint accessible** 
  - [ ] `/api/debug/simple?password=tennis-debug-2025` returns valid data

### CI/CD Validation
- [ ] **GitHub Actions green**
  - All checks pass on https://github.com/AntekA23/tennis-career-dev/actions
  - Build succeeds with test environment variables
  - Migration generation works

## Deployment Process

### 1. Standard Deployment
```bash
# Commit changes
git add .
git commit -m "Description of changes"

# Push to trigger deployment
git push origin main
```

### 2. Monitor Deployment
1. **GitHub Actions**: Check pipeline passes
2. **Railway Dashboard**: Monitor build logs
3. **Health Check**: Verify `/api/health` responds
4. **Debug Check**: Verify database state via debug endpoints

### 3. Post-Deployment Verification
- [ ] **Application accessible** at production URL
- [ ] **Authentication working** (Google OAuth)
- [ ] **Database connected** (debug endpoint shows data)
- [ ] **New features functional** (if applicable)

## Emergency Procedures

### Rollback Process
If deployment fails or causes issues:

1. **Immediate Action**
   ```bash
   # Revert to last known good commit
   git revert <commit-hash>
   git push origin main
   ```

2. **Database Rollback** (if migrations involved)
   - Access Railway database directly
   - Run prepared rollback SQL scripts
   - Verify with debug endpoints

3. **Health Check**
   - Confirm application is stable
   - Verify all critical functionality works

### Common Issues and Solutions

#### Build Failures
**Symptoms**: CI/CD pipeline fails, Railway build fails
**Solutions**:
- Check TypeScript errors: `npm run typecheck`
- Check linting: `npm run lint` 
- Check missing dependencies: `npm ci`
- Review GitHub Actions logs for specific errors

#### Database Connection Issues
**Symptoms**: 500 errors, database timeouts
**Solutions**:
- Verify `DATABASE_URL` environment variable
- Check Railway PostgreSQL service status
- Use debug endpoints to test connection
- Restart Railway service if needed

#### Migration Failures
**Symptoms**: Application starts but features broken
**Solutions**:
- Check Railway logs for migration errors
- Use manual migration endpoints if available
- Run rollback scripts via Railway database console
- Verify schema matches expectations with debug tools

#### Authentication Issues (Fresh Start)
**Symptoms**: Login fails, password errors
**Solutions**:
- Verify `JWT_SECRET` environment variable
- Check bcrypt password hashing
- Verify players table exists with email/password_hash columns
- Test with simple email/password combination

## Environment Variables

### OLD COMPLEX VARIABLES (ABANDONED)
```bash
# DEPRECATED: Complex OAuth system
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-app.up.railway.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### NEW FRESH START VARIABLES
```bash
# SIMPLE: Just database and JWT
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-secret-here
```

### Local Development (.env.local)
```bash
# Copy from .env.example
# Use local database URL for development
DATABASE_URL=postgresql://localhost:5432/tennis_dev
NEXTAUTH_URL=http://localhost:3000
```

## Monitoring and Maintenance

### Daily Checks
- [ ] **Application accessible** and responsive
- [ ] **Error rates low** (check Railway logs)
- [ ] **Database healthy** (connection working)

### Weekly Checks
- [ ] **Dependencies updated** (security patches)
- [ ] **Database backup verified** (Railway automatic backups)
- [ ] **Performance metrics** (response times acceptable)

### Monthly Reviews
- [ ] **Cost optimization** (Railway usage vs budget)
- [ ] **Security updates** (dependencies, environment)
- [ ] **Documentation current** (this runbook up to date)

## Performance Optimization

### Current Configuration
- **Railway Plan**: Starter (upgrade as needed)
- **Database**: PostgreSQL (shared)
- **Build Cache**: Enabled via GitHub Actions
- **Static Assets**: Served by Next.js (consider CDN later)

### Scaling Triggers
- **Response times > 2 seconds** consistently
- **Database connections maxed out**
- **Memory usage > 80%** regularly
- **More than 100 concurrent users**

### Scaling Options
1. **Vertical**: Upgrade Railway plan
2. **Database**: Add read replicas, connection pooling
3. **Caching**: Add Redis, CDN for static assets
4. **Horizontal**: Multiple Railway services (future)

## Debugging Tools

### Debug Endpoints (Password Protected)
- `/api/debug/simple?password=tennis-debug-2025` - Basic connection test
- `/api/debug/db?password=tennis-debug-2025` - Full database state
- `/api/debug/direct?password=tennis-debug-2025` - Direct query testing

### Railway Tools
- **Logs**: Real-time application and build logs
- **Metrics**: CPU, memory, network usage
- **Database**: Direct PostgreSQL access via web interface
- **Environment**: Variable management interface

### Local Tools
- `npm run db:studio` - Drizzle Studio (database GUI)
- `npm run db:generate` - Create migration files
- `npm run db:migrate` - Apply migrations locally

## Security Considerations

### Secrets Management
- **Never commit**: API keys, database URLs, secrets
- **Environment variables**: Store securely in Railway
- **Debug endpoints**: Password protected
- **Database access**: Restricted to application

### Access Control
- **Railway dashboard**: Limited to authorized users
- **GitHub repository**: Private with controlled access
- **Database**: No direct external access
- **Google OAuth**: Restricted to authorized domains

### Backup Strategy
- **Automatic**: Railway daily backups
- **Manual**: Before major migrations
- **Testing**: Regularly test backup restoration
- **Retention**: Keep backups for 30 days minimum

This runbook ensures safe, reliable deployments while maintaining system stability and security.
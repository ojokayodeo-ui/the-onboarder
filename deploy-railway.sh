#!/bin/bash
# deploy-railway.sh
# Run this script from the project root on your local machine.
# Prerequisites: Node.js, git, a Railway account (railway.app)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════╗"
echo "║   Client Onboarding OS — Railway Deploy      ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${RESET}"

# ── 1. Check Railway CLI ───────────────────────────────────────────────────
echo -e "${BOLD}[1/6] Checking Railway CLI...${RESET}"
if ! command -v railway &> /dev/null; then
  echo -e "${YELLOW}  Railway CLI not found. Installing...${RESET}"
  npm install -g @railway/cli
  echo -e "${GREEN}  ✓ Railway CLI installed${RESET}"
else
  echo -e "${GREEN}  ✓ Railway CLI found: $(railway --version)${RESET}"
fi

# ── 2. Login ───────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[2/6] Logging in to Railway...${RESET}"
echo -e "  (A browser window will open — sign in with GitHub/Google/Email)"
railway login

# ── 3. Create / link project ──────────────────────────────────────────────
echo ""
echo -e "${BOLD}[3/6] Setting up Railway project...${RESET}"
echo -e "${YELLOW}  Choose: (n) create a new project  OR  (y) link to existing${RESET}"
read -p "  Link to an existing Railway project? [y/N] " link_existing

if [[ "$link_existing" =~ ^[Yy]$ ]]; then
  railway link
else
  railway init
fi

# ── 4. Provision PostgreSQL ───────────────────────────────────────────────
echo ""
echo -e "${BOLD}[4/6] Adding PostgreSQL database...${RESET}"
echo -e "  Adding PostgreSQL plugin to your Railway project..."
railway add --plugin postgresql
echo -e "${GREEN}  ✓ PostgreSQL provisioned — DATABASE_URL will be auto-injected${RESET}"

# ── 5. Set environment variables ──────────────────────────────────────────
echo ""
echo -e "${BOLD}[5/6] Setting environment variables...${RESET}"

# NEXTAUTH_SECRET
SECRET=$(openssl rand -base64 32)
railway variables set NEXTAUTH_SECRET="$SECRET"
echo -e "${GREEN}  ✓ NEXTAUTH_SECRET set (auto-generated)${RESET}"

# Get the public domain Railway assigned
DOMAIN=$(railway domain 2>/dev/null || echo "")
if [ -z "$DOMAIN" ]; then
  echo -e "${YELLOW}  Generating Railway domain...${RESET}"
  railway domain
  DOMAIN=$(railway domain 2>/dev/null || echo "")
fi

if [ -n "$DOMAIN" ]; then
  APP_URL="https://$DOMAIN"
else
  echo -e "${YELLOW}  Could not auto-detect domain. Enter your Railway app URL:${RESET}"
  read -p "  https://" DOMAIN_INPUT
  APP_URL="https://$DOMAIN_INPUT"
fi

railway variables set NEXTAUTH_URL="$APP_URL"
railway variables set NEXT_PUBLIC_APP_URL="$APP_URL"
echo -e "${GREEN}  ✓ NEXTAUTH_URL and NEXT_PUBLIC_APP_URL set to: ${APP_URL}${RESET}"

# Anthropic API key
echo ""
echo -e "${YELLOW}  Enter your Anthropic API key (from console.anthropic.com):${RESET}"
echo -e "  (leave blank to skip — AI features will not work until set)"
read -p "  ANTHROPIC_API_KEY: " ANTHROPIC_KEY
if [ -n "$ANTHROPIC_KEY" ]; then
  railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
  echo -e "${GREEN}  ✓ ANTHROPIC_API_KEY set${RESET}"
else
  echo -e "${YELLOW}  ⚠ Skipped — set it later in Railway dashboard → Variables${RESET}"
fi

# ── 6. Deploy ─────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}[6/6] Deploying to Railway...${RESET}"
echo -e "  This will build and deploy your app. It takes ~2–3 minutes."
echo ""
railway up --detach

echo ""
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════╗"
echo "║   🚀 Deployment triggered successfully!       ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${RESET}"
echo -e "  ${BOLD}App URL:${RESET}     ${APP_URL}"
echo -e "  ${BOLD}Dashboard:${RESET}   https://railway.app/dashboard"
echo ""
echo -e "  ${BOLD}Build logs:${RESET}  railway logs"
echo -e "  ${BOLD}Open app:${RESET}    railway open"
echo ""
echo -e "  ${YELLOW}Demo login:${RESET}  admin@demoagency.com / password123"
echo -e "  ${YELLOW}Note:${RESET} Run \`railway run npx ts-node prisma/seed.ts\` to seed demo data"
echo ""

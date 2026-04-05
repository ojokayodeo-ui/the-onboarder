#!/bin/bash
# deploy-railway.sh
# Run this script from the project root on your local machine.
# Prerequisites: Node.js, git, a Railway account (railway.app)

set -e

# shellcheck disable=SC2034
_clr_red='\033[0;31m'
_clr_green='\033[0;32m'
_clr_yellow='\033[1;33m'
_clr_cyan='\033[0;36m'
_clr_bold='\033[1m'
_clr_reset='\033[0m'

echo -e "${_clr_cyan}${_clr_bold}"
echo "╔══════════════════════════════════════════════╗"
echo "║   Client Onboarding OS — Railway Deploy      ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${_clr_reset}"

# ── 1. Check Railway CLI ───────────────────────────────────────────────────
echo -e "${_clr_bold}[1/6] Checking Railway CLI...${_clr_reset}"
if ! command -v railway &> /dev/null; then
  echo -e "${_clr_yellow}  Railway CLI not found. Installing...${_clr_reset}"
  npm install -g @railway/cli
  echo -e "${_clr_green}  ✓ Railway CLI installed${_clr_reset}"
else
  echo -e "${_clr_green}  ✓ Railway CLI found: $(railway --version)${_clr_reset}"
fi

# ── 2. Login ───────────────────────────────────────────────────────────────
echo ""
echo -e "${_clr_bold}[2/6] Logging in to Railway...${_clr_reset}"
echo -e "  (A browser window will open — sign in with GitHub/Google/Email)"
railway login

# ── 3. Create / link project ──────────────────────────────────────────────
echo ""
echo -e "${_clr_bold}[3/6] Setting up Railway project...${_clr_reset}"
echo -e "${_clr_yellow}  Choose: (n) create a new project  OR  (y) link to existing${_clr_reset}"
read -p "  Link to an existing Railway project? [y/N] " _link_existing

if [[ "$_link_existing" =~ ^[Yy]$ ]]; then
  railway link
else
  railway init
fi

# ── 4. Provision PostgreSQL ───────────────────────────────────────────────
echo ""
echo -e "${_clr_bold}[4/6] Adding PostgreSQL database...${_clr_reset}"
echo -e "  Adding PostgreSQL plugin to your Railway project..."
railway add --plugin postgresql
echo -e "${_clr_green}  ✓ PostgreSQL provisioned — DATABASE_URL will be auto-injected${_clr_reset}"

# ── 5. Set environment variables ──────────────────────────────────────────
echo ""
echo -e "${_clr_bold}[5/6] Setting environment variables...${_clr_reset}"

# NEXTAUTH_SECRET
_nextauth_secret=$(openssl rand -base64 32)
railway variables set NEXTAUTH_SECRET="$_nextauth_secret"
echo -e "${_clr_green}  ✓ NEXTAUTH_SECRET set (auto-generated)${_clr_reset}"

# Get the public domain Railway assigned
_railway_domain=$(railway domain 2>/dev/null || echo "")
if [ -z "$_railway_domain" ]; then
  echo -e "${_clr_yellow}  Generating Railway domain...${_clr_reset}"
  railway domain
  _railway_domain=$(railway domain 2>/dev/null || echo "")
fi

if [ -n "$_railway_domain" ]; then
  _app_url="https://$_railway_domain"
else
  echo -e "${_clr_yellow}  Could not auto-detect domain. Enter your Railway app URL:${_clr_reset}"
  read -p "  https://" _domain_input
  _app_url="https://$_domain_input"
fi

railway variables set NEXTAUTH_URL="$_app_url"
railway variables set NEXT_PUBLIC_APP_URL="$_app_url"
echo -e "${_clr_green}  ✓ NEXTAUTH_URL and NEXT_PUBLIC_APP_URL set to: ${_app_url}${_clr_reset}"

# Anthropic API key
echo ""
echo -e "${_clr_yellow}  Enter your Anthropic API key (from console.anthropic.com):${_clr_reset}"
echo -e "  (leave blank to skip — AI features will not work until set)"
read -p "  ANTHROPIC_API_KEY: " _anthropic_key
if [ -n "$_anthropic_key" ]; then
  railway variables set ANTHROPIC_API_KEY="$_anthropic_key"
  echo -e "${_clr_green}  ✓ ANTHROPIC_API_KEY set${_clr_reset}"
else
  echo -e "${_clr_yellow}  ⚠ Skipped — set it later in Railway dashboard → Variables${_clr_reset}"
fi

# ── 6. Deploy ─────────────────────────────────────────────────────────────
echo ""
echo -e "${_clr_bold}[6/6] Deploying to Railway...${_clr_reset}"
echo -e "  This will build and deploy your app. It takes ~2–3 minutes."
echo ""
railway up --detach

echo ""
echo -e "${_clr_green}${_clr_bold}"
echo "╔══════════════════════════════════════════════╗"
echo "║   Deployment triggered successfully!          ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${_clr_reset}"
echo -e "  ${_clr_bold}App URL:${_clr_reset}     ${_app_url}"
echo -e "  ${_clr_bold}Dashboard:${_clr_reset}   https://railway.app/dashboard"
echo ""
echo -e "  ${_clr_bold}Build logs:${_clr_reset}  railway logs"
echo -e "  ${_clr_bold}Open app:${_clr_reset}    railway open"
echo ""
echo -e "  ${_clr_yellow}Demo login:${_clr_reset}  admin@demoagency.com / password123"
echo -e "  ${_clr_yellow}Note:${_clr_reset} Run \`railway run npx ts-node prisma/seed.ts\` to seed demo data"
echo ""

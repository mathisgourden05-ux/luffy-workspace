#!/bin/bash
# setup.sh — À lancer une fois sur chaque nouvelle machine pour tout installer
# Usage : bash setup.sh

set -e
echo "=== Setup Luffy Workspace ==="

# 1. Homebrew (Mac uniquement)
if ! command -v brew &>/dev/null; then
  echo ">> Installation de Homebrew..."
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # Apple Silicon
  if [ -f /opt/homebrew/bin/brew ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  fi
else
  echo ">> Homebrew déjà installé"
fi

# 2. Outils système
echo ">> Installation pandoc + LibreOffice..."
brew install pandoc
brew install --cask libreoffice

# 3. Dépendances npm
echo ">> Installation dépendances npm..."
npm install

# 4. Dépendances Python
echo ">> Installation dépendances Python..."
pip3 install openpyxl python-pptx python-docx

# 5. SSH GitHub (si pas encore configuré)
if [ ! -f ~/.ssh/id_ed25519 ]; then
  echo ">> Génération clé SSH GitHub..."
  ssh-keygen -t ed25519 -C "mathisgourden05@gmail.com" -f ~/.ssh/id_ed25519 -N ""
  ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null
  echo ""
  echo "=== ACTION REQUISE ==="
  echo "Ajoute cette clé SSH sur github.com/settings/ssh/new :"
  echo ""
  cat ~/.ssh/id_ed25519.pub
  echo ""
  echo "Puis relance : git remote set-url origin git@github.com:mathisgourden05-ux/luffy-workspace.git"
else
  echo ">> Clé SSH déjà présente"
fi

echo ""
echo "=== Setup terminé ✓ ==="

@echo off
cd /d "%~dp0"
echo QuizClasse - mode demo sur http://localhost:4848  (fermer cette fenetre pour arreter)
start "" http://localhost:4848
npx -y http-server -p 4848 -c-1 .

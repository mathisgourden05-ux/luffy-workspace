# Lance l'appli Luffy : démarre le serveur local s'il ne tourne pas, puis ouvre la fenêtre.
$app = Split-Path -Parent $MyInvocation.MyCommand.Path
$up = Get-NetTCPConnection -LocalPort 4747 -State Listen -ErrorAction SilentlyContinue
if (-not $up) {
  Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "server.js" -WorkingDirectory $app -WindowStyle Hidden -RedirectStandardError "$app\serveur-err.log"
  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 250
    if (Get-NetTCPConnection -LocalPort 4747 -State Listen -ErrorAction SilentlyContinue) { break }
  }
}
Start-Process "msedge.exe" -ArgumentList '--app=http://localhost:4747', '--window-size=1400,900'

$ErrorActionPreference = "Stop"

$InstallDir = if ($env:INSTALL_DIR) { $env:INSTALL_DIR } else { Join-Path $env:USERPROFILE "ai-usage-card" }

Write-Host "Signing in Codex as $env:USERNAME."
Write-Host "Complete the browser-based ChatGPT OAuth flow when prompted."
codex login

Write-Host "Signing in Gemini as $env:USERNAME."
Write-Host "Choose Sign in with Google when Gemini starts, then complete the OAuth flow."
gemini

Write-Host "Sign-in complete. Test publishing with:"
Write-Host "node `"$InstallDir\examples\collectors\run-ai-usage-collector.mjs`" --provider codex"
Write-Host "node `"$InstallDir\examples\collectors\run-ai-usage-collector.mjs`" --provider gemini"

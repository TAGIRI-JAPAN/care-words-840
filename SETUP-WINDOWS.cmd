@echo off
setlocal
set "CARE_WORDS_DEST=%~dp0"
echo Care Words 840 - checking image ZIP files...
powershell.exe -NoProfile -Command "$ErrorActionPreference='Stop'; try { $dest=$env:CARE_WORDS_DEST; $trimmedDest=$dest.TrimEnd([IO.Path]::DirectorySeparatorChar); $parentPath=Split-Path -Parent $trimmedDest; $meta=Get-Content -LiteralPath (Join-Path $dest 'DOWNLOAD-PARTS.json') -Raw -Encoding UTF8 | ConvertFrom-Json; $sources=@(); foreach($item in $meta.archives) { $p=Join-Path $dest $item.name; if(-not (Test-Path -LiteralPath $p -PathType Leaf)) { $p=Join-Path $parentPath $item.name }; if(-not (Test-Path -LiteralPath $p -PathType Leaf)) { throw ('Missing ZIP: '+$item.name) }; if((Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash.ToLower() -ne $item.sha256) { throw ('Incomplete or changed ZIP: '+$item.name) }; $sources+=$p }; foreach($p in $sources) { Write-Host ('Extracting '+[IO.Path]::GetFileName($p)); Expand-Archive -LiteralPath $p -DestinationPath $dest -Force }; $manifest=Get-Content -LiteralPath (Join-Path $dest 'checksums.json') -Raw -Encoding UTF8 | ConvertFrom-Json; foreach($entry in $manifest.files.PSObject.Properties) { $p=Join-Path $dest $entry.Name; if(-not (Test-Path -LiteralPath $p -PathType Leaf)) { throw ('Missing file: '+$entry.Name) }; if((Get-Item -LiteralPath $p).Length -ne $entry.Value.bytes) { throw ('Wrong file size: '+$entry.Name) }; if((Get-FileHash -LiteralPath $p -Algorithm SHA256).Hash.ToLower() -ne $entry.Value.sha256) { throw ('Changed file: '+$entry.Name) } }; Write-Host 'READY: all 840 cards and website files verified.'; Write-Host 'Upload this folder contents with GitHub Desktop. See START-HERE.txt.'; exit 0 } catch { Write-Host $_.Exception.Message -ForegroundColor Red; exit 1 }"
if errorlevel 1 goto failed
echo.
echo READY. Read DOWNLOAD-HELP.txt and START-HERE.txt.
pause
exit /b 0
:failed
echo.
echo Setup could not complete. Keep all six image ZIPs together.
echo See DOWNLOAD-HELP.txt for manual extraction.
pause
exit /b 1

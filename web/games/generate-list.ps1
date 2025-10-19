# PowerShell script để generate list.json
# Chạy: powershell -ExecutionPolicy Bypass -File generate-list.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Auto Generate list.json" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Hàm tạo tên đẹp từ filename
function Get-GameName {
    param([string]$filename)
    
    $name = $filename -replace '\.jar$', '' -replace '\.JAR$', ''
    $name = $name -replace '[_-]', ' '
    
    # Capitalize từng từ
    $words = $name -split ' ' | ForEach-Object {
        if ($_.Length -gt 0) {
            $_.Substring(0,1).ToUpper() + $_.Substring(1).ToLower()
        }
    }
    
    return ($words -join ' ').Trim()
}

Write-Host "🔍 Đang quét thư mục games/..." -ForegroundColor Yellow

# Lấy tất cả file .jar
$jarFiles = Get-ChildItem -Path $scriptPath -Filter "*.jar" | Sort-Object Name

if ($jarFiles.Count -eq 0) {
    Write-Host "❌ Không tìm thấy file JAR nào!" -ForegroundColor Red
    pause
    exit
}

$gamesList = @()

foreach ($jarFile in $jarFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($jarFile.Name)
    $jadFile = "$baseName.jad"
    $hasJad = Test-Path (Join-Path $scriptPath $jadFile)
    
    $game = @{
        filename = $jarFile.Name
        name = Get-GameName $jarFile.Name
        jadFile = if ($hasJad) { $jadFile } else { $null }
        icon = $null
        settings = @{
            phone = "Nokia"
            width = "240"
            height = "320"
            sound = "on"
        }
    }
    
    $gamesList += $game
}

# Sort theo tên
$gamesList = $gamesList | Sort-Object { $_.name }

# Convert sang JSON
$jsonOutput = $gamesList | ConvertTo-Json -Depth 10

# Ghi file
$outputPath = Join-Path $scriptPath "list.json"
[System.IO.File]::WriteAllText($outputPath, $jsonOutput, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "✅ Đã tạo list.json với $($gamesList.Count) games:" -ForegroundColor Green
Write-Host ""

$index = 1
foreach ($game in $gamesList) {
    $jadStatus = if ($game.jadFile) { "✓" } else { "✗" }
    $gameName = $game.name.PadRight(30)
    Write-Host "$("{0,2}" -f $index). [$jadStatus] $gameName ($($game.filename))" -ForegroundColor White
    $index++
}

Write-Host ""
Write-Host "📝 File đã được lưu: $outputPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Bạn có thể chỉnh sửa tên game và settings trong list.json" -ForegroundColor Yellow
Write-Host ""

pause

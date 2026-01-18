$content = Get-Content 'src/api/typescript-renderer.ts' -Raw

# すべてのrender関数を抽出（const renderXXX = の形式）
$allFunctions = [regex]::Matches($content, 'const (render[A-Za-z0-9_]+)\s*=') | 
    ForEach-Object { $_.Groups[1].Value } | 
    Sort-Object -Unique

# 各関数についてinitProcessedFieldsの有無を確認
$results = @()
foreach ($func in $allFunctions) {
    # 関数の開始位置を探す
    $funcStart = $content.IndexOf("const $func =")
    if ($funcStart -eq -1) { continue }
    
    # その関数の終わりまで（次のconst renderまで、または最大3000文字）を検索範囲とする
    $nextFuncMatch = [regex]::Match($content.Substring($funcStart + 10), 'const render[A-Za-z0-9_]+\s*=')
    if ($nextFuncMatch.Success) {
        $searchLength = [Math]::Min($nextFuncMatch.Index + 10, 3000)
    } else {
        $searchLength = [Math]::Min(3000, $content.Length - $funcStart)
    }
    
    $searchRange = $content.Substring($funcStart, $searchLength)
    $hasMigrated = $searchRange -match 'initProcessedFields'
    
    $results += [PSCustomObject]@{
        Function = $func
        Migrated = $hasMigrated
    }
}

$migrated = $results | Where-Object { $_.Migrated }
$notMigrated = $results | Where-Object { -not $_.Migrated }

Write-Host "=== render function migration status ==="
Write-Host ""
Write-Host "Total: $($results.Count)"
Write-Host "Migrated: $($migrated.Count)"
Write-Host "Not migrated: $($notMigrated.Count)"
Write-Host ""

if ($migrated.Count -gt 0) {
    Write-Host "--- Migrated functions ($($migrated.Count)) ---"
    $migrated | ForEach-Object { Write-Host "  [OK] $($_.Function)" }
    Write-Host ""
}

if ($notMigrated.Count -gt 0) {
    Write-Host "--- Not migrated functions ($($notMigrated.Count)) ---"
    $notMigrated | ForEach-Object { Write-Host "  [TODO] $($_.Function)" }
}

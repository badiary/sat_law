# 全XMLファイルのバッチテストを実行するスクリプト
# エラーが発生するまで連続して実行

$ErrorActionPreference = "Stop"
$testCount = 0
$successCount = 0

Write-Host "バッチテスト開始..." -ForegroundColor Green
Write-Host "エラーが発生するまで連続実行します。Ctrl+Cで中断できます。" -ForegroundColor Yellow
Write-Host ""

while ($true) {
    $testCount++
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host " テスト実行 #$testCount " -NoNewline -ForegroundColor White
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -NoNewline -ForegroundColor Cyan
    Write-Host "=" -ForegroundColor Cyan

    try {
        # batch-test.tsを実行
        $output = & npx tsx batch-test.ts 2>&1
        $exitCode = $LASTEXITCODE

        # 出力を表示
        Write-Host $output

        if ($exitCode -eq 0) {
            # 成功
            if ($output -match "すべてのファイルのテストが完了") {
                Write-Host ""
                Write-Host "🎉 全テスト完了！" -ForegroundColor Green
                Write-Host "総テスト数: $testCount" -ForegroundColor Green
                break
            }
            $successCount++

            # 進捗を表示
            if ($output -match "進捗: (\d+)/(\d+)") {
                $current = $Matches[1]
                $total = $Matches[2]
                $percent = [math]::Round(($current / $total) * 100, 2)
                Write-Host ""
                Write-Host "進捗: $percent% ($current/$total)" -ForegroundColor Cyan
            }

            # 短い待機
            Start-Sleep -Milliseconds 100
        } else {
            # エラー発生
            Write-Host ""
            Write-Host "❌ エラーが発生しました！テストを停止します。" -ForegroundColor Red
            Write-Host "成功したテスト: $successCount" -ForegroundColor Yellow
            Write-Host "test-progress.csvでエラー詳細を確認してください。" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "❌ 予期しないエラー: $_" -ForegroundColor Red
        exit 1
    }
}

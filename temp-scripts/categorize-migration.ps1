$notMigrated = @(
"renderAmendProvisionSentence",
"renderAppdx",
"renderAppdxFormat",
"renderAppdxNote",
"renderAppdxStyle",
"renderAppdxTable",
"renderArticleRange",
"renderColumn",
"renderDivision",
"renderFig",
"renderItemSentence",
"renderLaw",
"renderNewProvision",
"renderParagraphSentence",
"renderRelatedArticleNum",
"renderRemarks",
"renderSentence",
"renderSubitem1Sentence",
"renderSubitem2Sentence",
"renderSubitem3Sentence",
"renderSubitem4Sentence",
"renderSubitem5Sentence",
"renderSubitem6Sentence",
"renderSubitem7Sentence",
"renderSubitem8Sentence",
"renderSupplProvision",
"renderTableColumn",
"renderTableHeaderColumn",
"renderTableHeaderRow",
"renderTOC",
"renderTOCAppdxTableLabel",
"renderTOCArticle",
"renderTOCChapter",
"renderTOCDivision",
"renderTOCPart",
"renderTOCSection",
"renderTOCSubsection",
"renderTOCSupplProvision"
)

# カテゴリ分け
$sentenceFunctions = $notMigrated | Where-Object { $_ -match "Sentence$" }
$tocFunctions = $notMigrated | Where-Object { $_ -match "^renderTOC" }
$appdxFunctions = $notMigrated | Where-Object { $_ -match "Appdx" -and $_ -notmatch "^renderTOC" }
$tableFunctions = $notMigrated | Where-Object { $_ -match "Table" -and $_ -notmatch "Appdx" }
$otherFunctions = $notMigrated | Where-Object { 
    $_ -notmatch "Sentence$" -and 
    $_ -notmatch "^renderTOC" -and 
    $_ -notmatch "Appdx" -and 
    $_ -notmatch "Table"
}

Write-Host "=== Categorized Not Migrated Functions ===" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Sentence rendering functions ($($sentenceFunctions.Count)):" -ForegroundColor Cyan
$sentenceFunctions | ForEach-Object { Write-Host "   - $_" }
Write-Host ""

Write-Host "2. TOC (Table of Contents) functions ($($tocFunctions.Count)):" -ForegroundColor Cyan
$tocFunctions | ForEach-Object { Write-Host "   - $_" }
Write-Host ""

Write-Host "3. Appendix functions ($($appdxFunctions.Count)):" -ForegroundColor Cyan
$appdxFunctions | ForEach-Object { Write-Host "   - $_" }
Write-Host ""

Write-Host "4. Table functions ($($tableFunctions.Count)):" -ForegroundColor Cyan
$tableFunctions | ForEach-Object { Write-Host "   - $_" }
Write-Host ""

Write-Host "5. Other functions ($($otherFunctions.Count)):" -ForegroundColor Cyan
$otherFunctions | ForEach-Object { Write-Host "   - $_" }
Write-Host ""

Write-Host "Total not migrated: $($notMigrated.Count)" -ForegroundColor Yellow

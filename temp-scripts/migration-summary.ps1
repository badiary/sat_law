Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  typescript-renderer.ts Migration Status" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Progress: 46/84 functions (54.8%)" -ForegroundColor Green
Write-Host ""

Write-Host "--- Priority 1: Core rendering functions (9) ---" -ForegroundColor Red
@(
"renderLaw",
"renderDivision", 
"renderNewProvision",
"renderSupplProvision",
"renderArticleRange",
"renderColumn",
"renderFig",
"renderRemarks",
"renderRelatedArticleNum"
) | ForEach-Object { Write-Host "  [ ] $_" -ForegroundColor Red }
Write-Host ""

Write-Host "--- Priority 2: Sentence rendering functions (12) ---" -ForegroundColor Yellow
@(
"renderSentence",
"renderParagraphSentence",
"renderItemSentence",
"renderAmendProvisionSentence",
"renderSubitem1Sentence",
"renderSubitem2Sentence",
"renderSubitem3Sentence",
"renderSubitem4Sentence",
"renderSubitem5Sentence",
"renderSubitem6Sentence",
"renderSubitem7Sentence",
"renderSubitem8Sentence"
) | ForEach-Object { Write-Host "  [ ] $_" -ForegroundColor Yellow }
Write-Host ""

Write-Host "--- Priority 3: TOC functions (9) ---" -ForegroundColor Magenta
@(
"renderTOC",
"renderTOCPart",
"renderTOCChapter",
"renderTOCSection",
"renderTOCSubsection",
"renderTOCArticle",
"renderTOCDivision",
"renderTOCSupplProvision",
"renderTOCAppdxTableLabel"
) | ForEach-Object { Write-Host "  [ ] $_" -ForegroundColor Magenta }
Write-Host ""

Write-Host "--- Priority 4: Appendix functions (5) ---" -ForegroundColor DarkYellow
@(
"renderAppdx",
"renderAppdxTable",
"renderAppdxStyle",
"renderAppdxFormat",
"renderAppdxNote"
) | ForEach-Object { Write-Host "  [ ] $_" -ForegroundColor DarkYellow }
Write-Host ""

Write-Host "--- Priority 5: Table component functions (3) ---" -ForegroundColor DarkCyan
@(
"renderTableHeaderRow",
"renderTableHeaderColumn",
"renderTableColumn"
) | ForEach-Object { Write-Host "  [ ] $_" -ForegroundColor DarkCyan }
Write-Host ""

Write-Host "Total remaining: 38 functions" -ForegroundColor White

$allFunctions = @(
"renderAmendProvision",
"renderAmendProvisionSentence",
"renderAppdx",
"renderAppdxFig",
"renderAppdxFormat",
"renderAppdxNote",
"renderAppdxStyle",
"renderAppdxTable",
"renderArticle",
"renderArticleRange",
"renderChapter",
"renderColumn",
"renderDivision",
"renderEnactStatement",
"renderFig",
"renderFigStruct",
"renderFormatStruct",
"renderItem",
"renderItemSentence",
"renderLaw",
"renderLawBody",
"renderLawTypeList",
"renderList",
"renderListSentence",
"renderMainProvision",
"renderNewProvision",
"renderNoteStruct",
"renderParagraph",
"renderParagraphSentence",
"renderPart",
"renderPreamble",
"renderRelatedArticleNum",
"renderRemarks",
"renderSection",
"renderSentence",
"renderStyleStruct",
"renderSubitem1",
"renderSubitem10",
"renderSubitem10Sentence",
"renderSubitem1Sentence",
"renderSubitem2",
"renderSubitem2Sentence",
"renderSubitem3",
"renderSubitem3Sentence",
"renderSubitem4",
"renderSubitem4Sentence",
"renderSubitem5",
"renderSubitem5Sentence",
"renderSubitem6",
"renderSubitem6Sentence",
"renderSubitem7",
"renderSubitem7Sentence",
"renderSubitem8",
"renderSubitem8Sentence",
"renderSubitem9",
"renderSubitem9Sentence",
"renderSublist1",
"renderSublist1Sentence",
"renderSublist2",
"renderSublist2Sentence",
"renderSublist3",
"renderSublist3Sentence",
"renderSublistSentence",
"renderSubsection",
"renderSupplProvision",
"renderSupplProvisionAppdx",
"renderSupplProvisionAppdxStyle",
"renderSupplProvisionAppdxTable",
"renderTable",
"renderTableColumn",
"renderTableHeaderColumn",
"renderTableHeaderRow",
"renderTableRow",
"renderTableStruct",
"renderTextNode",
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

$content = Get-Content 'src/api/typescript-renderer.ts' -Raw

$migrated = @()
$notMigrated = @()

foreach ($func in $allFunctions) {
    $pattern = "const $func = [\s\S]{0,2000}?initProcessedFields"
    if ($content -match $pattern) {
        $migrated += $func
    } else {
        $notMigrated += $func
    }
}

Write-Host "=== render function migration status ==="
Write-Host ""
Write-Host "Total: $($allFunctions.Count)"
Write-Host "Migrated: $($migrated.Count)"
Write-Host "Not migrated: $($notMigrated.Count)"
Write-Host ""

if ($migrated.Count -gt 0) {
    Write-Host "--- Migrated functions ($($migrated.Count)) ---"
    $migrated | ForEach-Object { Write-Host "  [OK] $_" }
    Write-Host ""
}

if ($notMigrated.Count -gt 0) {
    Write-Host "--- Not migrated functions ($($notMigrated.Count)) ---"
    $notMigrated | ForEach-Object { Write-Host "  [TODO] $_" }
}

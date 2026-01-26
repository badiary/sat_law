/**
 * 不正XMLテストケース生成器
 *
 * XMLスキーマに違反するXMLを生成し、未処理フィールド検出機構が正しく動作することを確認する
 */

export interface InvalidXMLTestCase {
  elementName: string;          // 'Article'
  renderFunctionName: string;   // 'renderArticle'
  patternName: string;          // 'InvalidElement'
  xmlContent: string;           // 完全なXML文字列
  expectedWarnings: string[];   // 期待される警告メッセージ
}

/**
 * Article要素の不正XMLテストケースを生成
 */
export function generateInvalidArticleXML(): InvalidXMLTestCase[] {
  return [
    // パターン1: 完全に無効な要素
    {
      elementName: 'Article',
      renderFunctionName: 'renderArticle',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
        <InvalidElement>これは不正な要素です</InvalidElement>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Article', 'InvalidElement']
    },

    // パターン2: 他要素では有効だが、Articleでは無効（TableStruct）
    {
      elementName: 'Article',
      renderFunctionName: 'renderArticle',
      patternName: 'TableStructInArticle',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
        <TableStruct>
          <Table>
            <TableRow>
              <TableColumn>
                <Sentence>テスト</Sentence>
              </TableColumn>
            </TableRow>
          </Table>
        </TableStruct>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Article', 'TableStruct']
    },

    // パターン3: 階層違反（ChapterをArticleの子に）
    {
      elementName: 'Article',
      renderFunctionName: 'renderArticle',
      patternName: 'ChapterInArticle',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
        <Chapter Num="1">
          <ChapterTitle>第一章</ChapterTitle>
          <Article Num="2">
            <ArticleTitle>第二条</ArticleTitle>
            <Paragraph Num="1">
              <ParagraphNum/>
              <ParagraphSentence><Sentence>テスト。</Sentence></ParagraphSentence>
            </Paragraph>
          </Article>
        </Chapter>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Article', 'Chapter']
    },
  ];
}

/**
 * Paragraph要素の不正XMLテストケースを生成
 */
export function generateInvalidParagraphXML(): InvalidXMLTestCase[] {
  return [
    // パターン1: 完全に無効な要素
    {
      elementName: 'Paragraph',
      renderFunctionName: 'renderParagraph',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
          <InvalidParagraphElement>不正な要素</InvalidParagraphElement>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Paragraph', 'InvalidParagraphElement']
    },

    // パターン2: 階層違反（ArticleをParagraphの子に）
    {
      elementName: 'Paragraph',
      renderFunctionName: 'renderParagraph',
      patternName: 'ArticleInParagraph',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
          <Article Num="2">
            <ArticleTitle>第二条</ArticleTitle>
            <Paragraph Num="1">
              <ParagraphNum/>
              <ParagraphSentence><Sentence>入れ子の条。</Sentence></ParagraphSentence>
            </Paragraph>
          </Article>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Paragraph', 'Article']
    },

    // パターン3: 不明なタグ
    {
      elementName: 'Paragraph',
      renderFunctionName: 'renderParagraph',
      patternName: 'UnknownTag',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
          <UnknownTag>未知のタグ</UnknownTag>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Paragraph', 'UnknownTag']
    },
  ];
}

/**
 * Item要素の不正XMLテストケースを生成
 */
export function generateInvalidItemXML(): InvalidXMLTestCase[] {
  return [
    // パターン1: 完全に無効な要素
    {
      elementName: 'Item',
      renderFunctionName: 'renderItem',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の各号に掲げる場合。</Sentence></ParagraphSentence>
          <Item Num="1">
            <ItemTitle>一</ItemTitle>
            <ItemSentence><Sentence>第一号。</Sentence></ItemSentence>
            <InvalidItemElement>不正な要素</InvalidItemElement>
          </Item>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Item', 'InvalidItemElement']
    },

    // パターン2: 階層違反（ChapterをItemの子に）
    {
      elementName: 'Item',
      renderFunctionName: 'renderItem',
      patternName: 'ChapterInItem',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の各号に掲げる場合。</Sentence></ParagraphSentence>
          <Item Num="1">
            <ItemTitle>一</ItemTitle>
            <ItemSentence><Sentence>第一号。</Sentence></ItemSentence>
            <Chapter Num="1">
              <ChapterTitle>第一章</ChapterTitle>
            </Chapter>
          </Item>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Item', 'Chapter']
    },

    // パターン3: TOCタグ（LawBody直下のみ許可）
    {
      elementName: 'Item',
      renderFunctionName: 'renderItem',
      patternName: 'TOCInItem',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の各号に掲げる場合。</Sentence></ParagraphSentence>
          <Item Num="1">
            <ItemTitle>一</ItemTitle>
            <ItemSentence><Sentence>第一号。</Sentence></ItemSentence>
            <TOC>
              <TOCLabel>目次</TOCLabel>
            </TOC>
          </Item>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Item', 'TOC']
    },
  ];
}

/**
 * MainProvision要素の不正XMLテストケースを生成
 */
export function generateInvalidMainProvisionXML(): InvalidXMLTestCase[] {
  return [
    // パターン1: 完全に無効な要素
    {
      elementName: 'MainProvision',
      renderFunctionName: 'renderMainProvision',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
      <InvalidMainProvisionElement>不正な要素</InvalidMainProvisionElement>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] MainProvision', 'InvalidMainProvisionElement']
    },

    // パターン2: 階層違反（LawBodyをMainProvisionの子に）
    {
      elementName: 'MainProvision',
      renderFunctionName: 'renderMainProvision',
      patternName: 'LawBodyInMainProvision',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
      <LawBody>
        <LawTitle>入れ子の法令本体</LawTitle>
      </LawBody>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] MainProvision', 'LawBody']
    },

    // パターン3: TOCタグ（LawBody直下のみ許可）
    {
      elementName: 'MainProvision',
      renderFunctionName: 'renderMainProvision',
      patternName: 'TOCInMainProvision',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
      <TOC>
        <TOCLabel>目次</TOCLabel>
      </TOC>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] MainProvision', 'TOC']
    },
  ];
}

/**
 * LawBody要素の不正XMLテストケースを生成
 */
export function generateInvalidLawBodyXML(): InvalidXMLTestCase[] {
  return [
    // パターン1: 完全に無効な要素
    {
      elementName: 'LawBody',
      renderFunctionName: 'renderLawBody',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <InvalidLawBodyElement>不正な要素</InvalidLawBodyElement>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] LawBody', 'InvalidLawBodyElement']
    },

    // パターン2: 階層違反（ArticleをLawBody直下に）
    {
      elementName: 'LawBody',
      renderFunctionName: 'renderLawBody',
      patternName: 'ArticleInLawBody',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <Article Num="2">
      <ArticleTitle>第二条</ArticleTitle>
      <Paragraph Num="1">
        <ParagraphNum/>
        <ParagraphSentence><Sentence>LawBody直下の条。</Sentence></ParagraphSentence>
      </Paragraph>
    </Article>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] LawBody', 'Article']
    },

    // パターン3: 不明なタグ
    {
      elementName: 'LawBody',
      renderFunctionName: 'renderLawBody',
      patternName: 'UnknownTag',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <UnknownLawBodyTag>未知のタグ</UnknownLawBodyTag>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] LawBody', 'UnknownLawBodyTag']
    },
  ];
}

/**
 * Chapter要素の不正XMLテストケースを生成
 */
export function generateInvalidChapterXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Chapter',
      renderFunctionName: 'renderChapter',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Chapter Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <Article Num="1">
          <ArticleTitle>第一条</ArticleTitle>
          <Paragraph Num="1">
            <ParagraphNum/>
            <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
          </Paragraph>
        </Article>
        <InvalidChapterElement>不正な要素</InvalidChapterElement>
      </Chapter>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Chapter', 'InvalidChapterElement']
    },
    {
      elementName: 'Chapter',
      renderFunctionName: 'renderChapter',
      patternName: 'LawBodyInChapter',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Chapter Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <Article Num="1">
          <ArticleTitle>第一条</ArticleTitle>
          <Paragraph Num="1">
            <ParagraphNum/>
            <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
          </Paragraph>
        </Article>
        <LawBody><LawTitle>不正な入れ子</LawTitle></LawBody>
      </Chapter>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Chapter', 'LawBody']
    },
  ];
}

/**
 * Section要素の不正XMLテストケースを生成
 */
export function generateInvalidSectionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Section',
      renderFunctionName: 'renderSection',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Chapter Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <Section Num="1">
          <SectionTitle>第一節　通則</SectionTitle>
          <Article Num="1">
            <ArticleTitle>第一条</ArticleTitle>
            <Paragraph Num="1">
              <ParagraphNum/>
              <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
            </Paragraph>
          </Article>
          <InvalidSectionElement>不正な要素</InvalidSectionElement>
        </Section>
      </Chapter>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Section', 'InvalidSectionElement']
    },
  ];
}

/**
 * Part要素の不正XMLテストケースを生成
 */
export function generateInvalidPartXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Part',
      renderFunctionName: 'renderPart',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Part Num="1">
        <PartTitle>第一編　総則</PartTitle>
        <Chapter Num="1">
          <ChapterTitle>第一章　総則</ChapterTitle>
          <Article Num="1">
            <ArticleTitle>第一条</ArticleTitle>
            <Paragraph Num="1">
              <ParagraphNum/>
              <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
            </Paragraph>
          </Article>
        </Chapter>
        <InvalidPartElement>不正な要素</InvalidPartElement>
      </Part>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Part', 'InvalidPartElement']
    },
  ];
}

/**
 * Subitem1要素の不正XMLテストケースを生成
 */
export function generateInvalidSubitem1XML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Subitem1',
      renderFunctionName: 'renderSubitem1',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の各号に掲げる場合。</Sentence></ParagraphSentence>
          <Item Num="1">
            <ItemTitle>一</ItemTitle>
            <ItemSentence><Sentence>第一号の場合は、次に掲げるもの。</Sentence></ItemSentence>
            <Subitem1 Num="1">
              <Subitem1Title>イ</Subitem1Title>
              <Subitem1Sentence><Sentence>細目一。</Sentence></Subitem1Sentence>
              <InvalidSubitem1Element>不正な要素</InvalidSubitem1Element>
            </Subitem1>
          </Item>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Subitem1', 'InvalidSubitem1Element']
    },
  ];
}

/**
 * SupplProvision要素の不正XMLテストケースを生成
 */
export function generateInvalidSupplProvisionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'SupplProvision',
      renderFunctionName: 'renderSupplProvision',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <SupplProvision>
      <SupplProvisionLabel>附　則</SupplProvisionLabel>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>附則第一条。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
      <InvalidSupplProvisionElement>不正な要素</InvalidSupplProvisionElement>
    </SupplProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] SupplProvision', 'InvalidSupplProvisionElement']
    },
  ];
}

/**
 * TableStruct要素の不正XMLテストケースを生成
 */
export function generateInvalidTableStructXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TableStruct',
      renderFunctionName: 'renderTableStruct',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の表のとおり。</Sentence></ParagraphSentence>
          <TableStruct>
            <Table>
              <TableRow>
                <TableColumn>
                  <Sentence>項目</Sentence>
                </TableColumn>
              </TableRow>
            </Table>
            <InvalidTableStructElement>不正な要素</InvalidTableStructElement>
          </TableStruct>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TableStruct', 'InvalidTableStructElement']
    },
  ];
}

/**
 * FigStruct要素の不正XMLテストケースを生成
 */
export function generateInvalidFigStructXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'FigStruct',
      renderFunctionName: 'renderFigStruct',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の図のとおり。</Sentence></ParagraphSentence>
          <FigStruct>
            <Fig src="fig001.pdf"/>
            <InvalidFigStructElement>不正な要素</InvalidFigStructElement>
          </FigStruct>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] FigStruct', 'InvalidFigStructElement']
    },
  ];
}

/**
 * StyleStruct要素の不正XMLテストケースを生成
 */
export function generateInvalidStyleStructXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'StyleStruct',
      renderFunctionName: 'renderStyleStruct',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の様式のとおり。</Sentence></ParagraphSentence>
          <StyleStruct>
            <StyleStructTitle>様式第一</StyleStructTitle>
            <Style>
              <Sentence>様式の内容。</Sentence>
            </Style>
            <InvalidStyleStructElement>不正な要素</InvalidStyleStructElement>
          </StyleStruct>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] StyleStruct', 'InvalidStyleStructElement']
    },
  ];
}

/**
 * AppdxTable要素の不正XMLテストケースを生成
 */
export function generateInvalidAppdxTableXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'AppdxTable',
      renderFunctionName: 'renderAppdxTable',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <AppdxTable Num="1">
      <AppdxTableTitle>別表第一</AppdxTableTitle>
      <TableStruct>
        <Table>
          <TableRow>
            <TableColumn>
              <Sentence>項目</Sentence>
            </TableColumn>
          </TableRow>
        </Table>
      </TableStruct>
      <InvalidAppdxTableElement>不正な要素</InvalidAppdxTableElement>
    </AppdxTable>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] AppdxTable', 'InvalidAppdxTableElement']
    },
  ];
}

/**
 * Subsection要素の不正XMLテストケースを生成
 */
export function generateInvalidSubsectionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Subsection',
      renderFunctionName: 'renderSubsection',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Chapter Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <Section Num="1">
          <SectionTitle>第一節　通則</SectionTitle>
          <Subsection Num="1">
            <SubsectionTitle>第一款　基本</SubsectionTitle>
            <Article Num="1">
              <ArticleTitle>第一条</ArticleTitle>
              <Paragraph Num="1">
                <ParagraphNum/>
                <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
              </Paragraph>
            </Article>
            <InvalidSubsectionElement>不正な要素</InvalidSubsectionElement>
          </Subsection>
        </Section>
      </Chapter>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Subsection', 'InvalidSubsectionElement']
    },
  ];
}

/**
 * Division要素の不正XMLテストケースを生成
 */
export function generateInvalidDivisionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Division',
      renderFunctionName: 'renderDivision',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Chapter Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <Section Num="1">
          <SectionTitle>第一節　通則</SectionTitle>
          <Subsection Num="1">
            <SubsectionTitle>第一款　基本</SubsectionTitle>
            <Division Num="1">
              <DivisionTitle>第一目　原則</DivisionTitle>
              <Article Num="1">
                <ArticleTitle>第一条</ArticleTitle>
                <Paragraph Num="1">
                  <ParagraphNum/>
                  <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
                </Paragraph>
              </Article>
              <InvalidDivisionElement>不正な要素</InvalidDivisionElement>
            </Division>
          </Subsection>
        </Section>
      </Chapter>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Division', 'InvalidDivisionElement']
    },
  ];
}

/**
 * Subitem2要素の不正XMLテストケースを生成
 */
export function generateInvalidSubitem2XML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Subitem2',
      renderFunctionName: 'renderSubitem2',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の各号に掲げる場合。</Sentence></ParagraphSentence>
          <Item Num="1">
            <ItemTitle>一</ItemTitle>
            <ItemSentence><Sentence>第一号の場合は、次に掲げるもの。</Sentence></ItemSentence>
            <Subitem1 Num="1">
              <Subitem1Title>イ</Subitem1Title>
              <Subitem1Sentence><Sentence>細目一の場合は、次に掲げるもの。</Sentence></Subitem1Sentence>
              <Subitem2 Num="1">
                <Subitem2Title>(1)</Subitem2Title>
                <Subitem2Sentence><Sentence>細目二。</Sentence></Subitem2Sentence>
                <InvalidSubitem2Element>不正な要素</InvalidSubitem2Element>
              </Subitem2>
            </Subitem1>
          </Item>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Subitem2', 'InvalidSubitem2Element']
    },
  ];
}

/**
 * FormatStruct要素の不正XMLテストケースを生成
 */
export function generateInvalidFormatStructXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'FormatStruct',
      renderFunctionName: 'renderFormatStruct',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の書式のとおり。</Sentence></ParagraphSentence>
          <FormatStruct>
            <FormatStructTitle>書式第一</FormatStructTitle>
            <Format>
              <Sentence>書式の内容。</Sentence>
            </Format>
            <InvalidFormatStructElement>不正な要素</InvalidFormatStructElement>
          </FormatStruct>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] FormatStruct', 'InvalidFormatStructElement']
    },
  ];
}

/**
 * List要素の不正XMLテストケースを生成
 */
export function generateInvalidListXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'List',
      renderFunctionName: 'renderList',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次のリストのとおり。</Sentence></ParagraphSentence>
          <List>
            <ListSentence><Sentence>リストの項目。</Sentence></ListSentence>
            <InvalidListElement>不正な要素</InvalidListElement>
          </List>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] List', 'InvalidListElement']
    },
  ];
}

/**
 * TOC要素の不正XMLテストケースを生成
 */
export function generateInvalidTOCXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TOC',
      renderFunctionName: 'renderTOC',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <TOC>
      <TOCLabel>目次</TOCLabel>
      <TOCChapter Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <ArticleRange>（第一条―第五条）</ArticleRange>
      </TOCChapter>
      <InvalidTOCElement>不正な要素</InvalidTOCElement>
    </TOC>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TOC', 'InvalidTOCElement']
    },
  ];
}

/**
 * TOCChapter要素の不正XMLテストケースを生成
 */
export function generateInvalidTOCChapterXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TOCChapter',
      renderFunctionName: 'renderTOCChapter',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <TOC>
      <TOCLabel>目次</TOCLabel>
      <TOCChapter Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <ArticleRange>（第一条―第五条）</ArticleRange>
        <InvalidTOCChapterElement>不正な要素</InvalidTOCChapterElement>
      </TOCChapter>
    </TOC>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TOCChapter', 'InvalidTOCChapterElement']
    },
  ];
}

/**
 * TOCSection要素の不正XMLテストケースを生成
 */
export function generateInvalidTOCSectionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TOCSection',
      renderFunctionName: 'renderTOCSection',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <TOC>
      <TOCLabel>目次</TOCLabel>
      <TOCChapter Num="1">
        <ChapterTitle>第一章　総則</ChapterTitle>
        <TOCSection Num="1">
          <SectionTitle>第一節　通則</SectionTitle>
          <ArticleRange>（第一条―第三条）</ArticleRange>
          <InvalidTOCSectionElement>不正な要素</InvalidTOCSectionElement>
        </TOCSection>
      </TOCChapter>
    </TOC>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TOCSection', 'InvalidTOCSectionElement']
    },
  ];
}

/**
 * TOCPart要素の不正XMLテストケースを生成
 */
export function generateInvalidTOCPartXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TOCPart',
      renderFunctionName: 'renderTOCPart',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <TOC>
      <TOCLabel>目次</TOCLabel>
      <TOCPart Num="1">
        <PartTitle>第一編　総則</PartTitle>
        <ArticleRange>（第一条―第十条）</ArticleRange>
        <InvalidTOCPartElement>不正な要素</InvalidTOCPartElement>
      </TOCPart>
    </TOC>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TOCPart', 'InvalidTOCPartElement']
    },
  ];
}

/**
 * AmendProvision要素の不正XMLテストケースを生成
 */
export function generateInvalidAmendProvisionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'AmendProvision',
      renderFunctionName: 'renderAmendProvision',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次のように改正する。</Sentence></ParagraphSentence>
          <AmendProvision>
            <AmendProvisionSentence><Sentence>第一条を次のように改める。</Sentence></AmendProvisionSentence>
            <InvalidAmendProvisionElement>不正な要素</InvalidAmendProvisionElement>
          </AmendProvision>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] AmendProvision', 'InvalidAmendProvisionElement']
    },
  ];
}

/**
 * Class要素の不正XMLテストケースを生成
 */
export function generateInvalidClassXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Class',
      renderFunctionName: 'renderClass',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の各号に掲げる場合。</Sentence></ParagraphSentence>
          <Item Num="1">
            <ItemTitle>一</ItemTitle>
            <ItemSentence><Sentence>次に掲げるもの。</Sentence></ItemSentence>
            <Class Num="1">
              <ClassTitle>イ</ClassTitle>
              <ClassSentence><Sentence>類の内容。</Sentence></ClassSentence>
              <InvalidClassElement>不正な要素</InvalidClassElement>
            </Class>
          </Item>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Class', 'InvalidClassElement']
    },
  ];
}

/**
 * Remarks要素の不正XMLテストケースを生成
 */
export function generateInvalidRemarksXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Remarks',
      renderFunctionName: 'renderRemarks',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の表のとおり。</Sentence></ParagraphSentence>
          <TableStruct>
            <Table>
              <TableRow>
                <TableColumn>
                  <Sentence>項目</Sentence>
                </TableColumn>
              </TableRow>
            </Table>
            <Remarks>
              <RemarksLabel>備考</RemarksLabel>
              <Sentence>備考の内容。</Sentence>
              <InvalidRemarksElement>不正な要素</InvalidRemarksElement>
            </Remarks>
          </TableStruct>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Remarks', 'InvalidRemarksElement']
    },
  ];
}

/**
 * NoteStruct要素の不正XMLテストケースを生成
 */
export function generateInvalidNoteStructXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'NoteStruct',
      renderFunctionName: 'renderNoteStruct',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の表のとおり。</Sentence></ParagraphSentence>
          <TableStruct>
            <Table>
              <TableRow>
                <TableColumn>
                  <Sentence>項目</Sentence>
                  <NoteStruct>
                    <NoteStructTitle>注</NoteStructTitle>
                    <Note>注の内容</Note>
                    <InvalidNoteStructElement>不正な要素</InvalidNoteStructElement>
                  </NoteStruct>
                </TableColumn>
              </TableRow>
            </Table>
          </TableStruct>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] NoteStruct', 'InvalidNoteStructElement']
    },
  ];
}

/**
 * Preamble要素の不正XMLテストケースを生成
 */
export function generateInvalidPreambleXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Preamble',
      renderFunctionName: 'renderPreamble',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <Preamble>
      <Paragraph Num="1">
        <ParagraphNum/>
        <ParagraphSentence><Sentence>前文の内容。</Sentence></ParagraphSentence>
      </Paragraph>
      <InvalidPreambleElement>不正な要素</InvalidPreambleElement>
    </Preamble>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Preamble', 'InvalidPreambleElement']
    },
  ];
}

/**
 * Appdx要素の不正XMLテストケースを生成
 */
export function generateInvalidAppdxXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Appdx',
      renderFunctionName: 'renderAppdx',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <Appdx>
      <ArithFormulaNum>算式第一</ArithFormulaNum>
      <ArithFormula>x + y = z</ArithFormula>
      <InvalidAppdxElement>不正な要素</InvalidAppdxElement>
    </Appdx>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Appdx', 'InvalidAppdxElement']
    },
  ];
}

/**
 * List要素の不正XMLテストケースを生成（再実装）
 */
export function generateInvalidListXML2(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'List',
      renderFunctionName: 'renderList',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の各号に掲げる場合。</Sentence></ParagraphSentence>
          <Item Num="1">
            <ItemTitle>一</ItemTitle>
            <ItemSentence><Sentence>第一号。</Sentence></ItemSentence>
            <List>
              <ListSentence><Sentence>リスト項目。</Sentence></ListSentence>
              <InvalidListElement>不正な要素</InvalidListElement>
            </List>
          </Item>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] List', 'InvalidListElement']
    },
  ];
}

/**
 * FormatStruct要素の不正XMLテストケースを生成（再実装）
 */
export function generateInvalidFormatStructXML2(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'FormatStruct',
      renderFunctionName: 'renderFormatStruct',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の各号に掲げる場合。</Sentence></ParagraphSentence>
          <Item Num="1">
            <ItemTitle>一</ItemTitle>
            <ItemSentence><Sentence>第一号。</Sentence></ItemSentence>
            <FormatStruct>
              <FormatStructTitle>書式第一</FormatStructTitle>
              <Format><Sentence>書式内容。</Sentence></Format>
              <InvalidFormatStructElement>不正な要素</InvalidFormatStructElement>
            </FormatStruct>
          </Item>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] FormatStruct', 'InvalidFormatStructElement']
    },
  ];
}

/**
 * AppdxFig要素の不正XMLテストケースを生成
 */
export function generateInvalidAppdxFigXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'AppdxFig',
      renderFunctionName: 'renderAppdxFig',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <AppdxFig Num="1">
      <AppdxFigTitle>別図第一</AppdxFigTitle>
      <FigStruct>
        <Fig src="fig001.pdf"/>
      </FigStruct>
      <InvalidAppdxFigElement>不正な要素</InvalidAppdxFigElement>
    </AppdxFig>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] AppdxFig', 'InvalidAppdxFigElement']
    },
  ];
}

/**
 * AppdxStyle要素の不正XMLテストケースを生成
 */
export function generateInvalidAppdxStyleXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'AppdxStyle',
      renderFunctionName: 'renderAppdxStyle',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <AppdxStyle Num="1">
      <AppdxStyleTitle>別記様式第一</AppdxStyleTitle>
      <StyleStruct>
        <StyleStructTitle>様式第一</StyleStructTitle>
        <Style><Sentence>様式内容。</Sentence></Style>
      </StyleStruct>
      <InvalidAppdxStyleElement>不正な要素</InvalidAppdxStyleElement>
    </AppdxStyle>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] AppdxStyle', 'InvalidAppdxStyleElement']
    },
  ];
}

/**
 * AppdxFormat要素の不正XMLテストケースを生成
 */
export function generateInvalidAppdxFormatXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'AppdxFormat',
      renderFunctionName: 'renderAppdxFormat',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <AppdxFormat Num="1">
      <AppdxFormatTitle>別記書式第一</AppdxFormatTitle>
      <FormatStruct>
        <FormatStructTitle>書式第一</FormatStructTitle>
        <Format><Sentence>書式内容。</Sentence></Format>
      </FormatStruct>
      <InvalidAppdxFormatElement>不正な要素</InvalidAppdxFormatElement>
    </AppdxFormat>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] AppdxFormat', 'InvalidAppdxFormatElement']
    },
  ];
}

/**
 * AppdxNote要素の不正XMLテストケースを生成
 */
export function generateInvalidAppdxNoteXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'AppdxNote',
      renderFunctionName: 'renderAppdxNote',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <AppdxNote Num="1">
      <AppdxNoteTitle>別記第一</AppdxNoteTitle>
      <NoteStruct>
        <Note>注の内容</Note>
      </NoteStruct>
      <InvalidAppdxNoteElement>不正な要素</InvalidAppdxNoteElement>
    </AppdxNote>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] AppdxNote', 'InvalidAppdxNoteElement']
    },
  ];
}

/**
 * EnactStatement要素の不正XMLテストケースを生成
 */
export function generateInvalidEnactStatementXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'EnactStatement',
      renderFunctionName: 'renderEnactStatement',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <EnactStatement>
      <Sentence>公布の日から施行する。</Sentence>
      <InvalidEnactStatementElement>不正な要素</InvalidEnactStatementElement>
    </EnactStatement>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] EnactStatement', 'InvalidEnactStatementElement']
    },
  ];
}

/**
 * Subitem3要素の不正XMLテストケースを生成
 */
export function generateInvalidSubitem3XML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Subitem3',
      renderFunctionName: 'renderSubitem3',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の各号に掲げる場合。</Sentence></ParagraphSentence>
          <Item Num="1">
            <ItemTitle>一</ItemTitle>
            <ItemSentence><Sentence>第一号。</Sentence></ItemSentence>
            <Subitem1 Num="1">
              <Subitem1Title>イ</Subitem1Title>
              <Subitem1Sentence><Sentence>細目1。</Sentence></Subitem1Sentence>
              <Subitem2 Num="1">
                <Subitem2Title>(1)</Subitem2Title>
                <Subitem2Sentence><Sentence>細目2。</Sentence></Subitem2Sentence>
                <Subitem3 Num="1">
                  <Subitem3Title>ａ</Subitem3Title>
                  <Subitem3Sentence><Sentence>細目3。</Sentence></Subitem3Sentence>
                  <InvalidSubitem3Element>不正な要素</InvalidSubitem3Element>
                </Subitem3>
              </Subitem2>
            </Subitem1>
          </Item>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Subitem3', 'InvalidSubitem3Element']
    },
  ];
}

/**
 * Subitem4～10要素の不正XMLテストケースを生成
 * 注: 実際の法令XMLでSubitem4以降が使用されることはほぼないため、
 * ここでは簡略化したテストケースのみ提供
 */
export function generateInvalidSubitem4to10XML(): InvalidXMLTestCase[] {
  // Subitem4～10は実際の法令では使用頻度が極めて低いため、
  // テストケースは省略（必要に応じて個別に追加可能）
  return [];
}

/**
 * TOCArticle要素の不正XMLテストケースを生成
 */
export function generateInvalidTOCArticleXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TOCArticle',
      renderFunctionName: 'renderTOCArticle',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <TOC>
      <TOCLabel>目次</TOCLabel>
      <TOCArticle Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <ArticleCaption>総則</ArticleCaption>
        <InvalidTOCArticleElement>不正な要素</InvalidTOCArticleElement>
      </TOCArticle>
    </TOC>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TOCArticle', 'InvalidTOCArticleElement']
    },
  ];
}

/**
 * TOCDivision要素の不正XMLテストケースを生成
 */
export function generateInvalidTOCDivisionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TOCDivision',
      renderFunctionName: 'renderTOCDivision',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <TOC>
      <TOCLabel>目次</TOCLabel>
      <TOCPart Num="1">
        <PartTitle>第一編</PartTitle>
        <TOCChapter Num="1">
          <ChapterTitle>第一章</ChapterTitle>
          <TOCSection Num="1">
            <SectionTitle>第一節</SectionTitle>
            <TOCSubsection Num="1">
              <SubsectionTitle>第一款</SubsectionTitle>
              <TOCDivision Num="1">
                <DivisionTitle>第一目</DivisionTitle>
                <ArticleRange>（第一条）</ArticleRange>
                <InvalidTOCDivisionElement>不正な要素</InvalidTOCDivisionElement>
              </TOCDivision>
            </TOCSubsection>
          </TOCSection>
        </TOCChapter>
      </TOCPart>
    </TOC>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TOCDivision', 'InvalidTOCDivisionElement']
    },
  ];
}

/**
 * TOCSubsection要素の不正XMLテストケースを生成
 */
export function generateInvalidTOCSubsectionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TOCSubsection',
      renderFunctionName: 'renderTOCSubsection',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <TOC>
      <TOCLabel>目次</TOCLabel>
      <TOCChapter Num="1">
        <ChapterTitle>第一章</ChapterTitle>
        <TOCSection Num="1">
          <SectionTitle>第一節</SectionTitle>
          <TOCSubsection Num="1">
            <SubsectionTitle>第一款</SubsectionTitle>
            <ArticleRange>（第一条―第三条）</ArticleRange>
            <InvalidTOCSubsectionElement>不正な要素</InvalidTOCSubsectionElement>
          </TOCSubsection>
        </TOCSection>
      </TOCChapter>
    </TOC>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TOCSubsection', 'InvalidTOCSubsectionElement']
    },
  ];
}

/**
 * TOCSupplProvision要素の不正XMLテストケースを生成
 */
export function generateInvalidTOCSupplProvisionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TOCSupplProvision',
      renderFunctionName: 'renderTOCSupplProvision',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <TOC>
      <TOCLabel>目次</TOCLabel>
      <TOCSupplProvision>
        <SupplProvisionLabel>附則</SupplProvisionLabel>
        <InvalidTOCSupplProvisionElement>不正な要素</InvalidTOCSupplProvisionElement>
      </TOCSupplProvision>
    </TOC>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <SupplProvision>
      <SupplProvisionLabel>附則</SupplProvisionLabel>
      <Paragraph Num="1">
        <ParagraphNum/>
        <ParagraphSentence><Sentence>この法律は、公布の日から施行する。</Sentence></ParagraphSentence>
      </Paragraph>
    </SupplProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TOCSupplProvision', 'InvalidTOCSupplProvisionElement']
    },
  ];
}

/**
 * NewProvision要素の不正XMLテストケースを生成
 */
export function generateInvalidNewProvisionXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'NewProvision',
      renderFunctionName: 'renderNewProvision',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次のように改正する。</Sentence></ParagraphSentence>
          <AmendProvision>
            <AmendProvisionSentence><Sentence>第二条を次のように改める。</Sentence></AmendProvisionSentence>
            <NewProvision>
              <Article Num="2">
                <ArticleTitle>第二条</ArticleTitle>
                <Paragraph Num="1">
                  <ParagraphNum/>
                  <ParagraphSentence><Sentence>新しい条文。</Sentence></ParagraphSentence>
                </Paragraph>
              </Article>
              <InvalidNewProvisionElement>不正な要素</InvalidNewProvisionElement>
            </NewProvision>
          </AmendProvision>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] NewProvision', 'InvalidNewProvisionElement']
    },
  ];
}

/**
 * Table要素の不正XMLテストケースを生成
 */
export function generateInvalidTableXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'Table',
      renderFunctionName: 'renderTable',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の表のとおり。</Sentence></ParagraphSentence>
          <TableStruct>
            <Table>
              <TableRow>
                <TableColumn><Sentence>項目</Sentence></TableColumn>
              </TableRow>
              <InvalidTableElement>不正な要素</InvalidTableElement>
            </Table>
          </TableStruct>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] Table', 'InvalidTableElement']
    },
  ];
}

/**
 * TableRow要素の不正XMLテストケースを生成
 * 注: TableRowはTableColumnのみを含む構造のため、
 * 他の要素を追加すると構造が壊れる。
 * 実際にはTableRowレベルでの未処理フィールドは発生しにくいため省略
 */
export function generateInvalidTableRowXML(): InvalidXMLTestCase[] {
  return [];
}

/**
 * TableColumn要素の不正XMLテストケースを生成
 */
export function generateInvalidTableColumnXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'TableColumn',
      renderFunctionName: 'renderTableColumn',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>次の表のとおり。</Sentence></ParagraphSentence>
          <TableStruct>
            <Table>
              <TableRow>
                <TableColumn>
                  <Sentence>項目</Sentence>
                  <InvalidTableColumnElement>不正な要素</InvalidTableColumnElement>
                </TableColumn>
              </TableRow>
            </Table>
          </TableStruct>
        </Paragraph>
      </Article>
    </MainProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] TableColumn', 'InvalidTableColumnElement']
    },
  ];
}

/**
 * SupplProvisionAppdxTable要素の不正XMLテストケースを生成
 */
export function generateInvalidSupplProvisionAppdxTableXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'SupplProvisionAppdxTable',
      renderFunctionName: 'renderSupplProvisionAppdxTable',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <SupplProvision>
      <SupplProvisionLabel>附則</SupplProvisionLabel>
      <Paragraph Num="1">
        <ParagraphNum/>
        <ParagraphSentence><Sentence>附則。</Sentence></ParagraphSentence>
      </Paragraph>
      <SupplProvisionAppdxTable Num="1">
        <SupplProvisionAppdxTableTitle>附則別表第一</SupplProvisionAppdxTableTitle>
        <TableStruct>
          <Table>
            <TableRow>
              <TableColumn><Sentence>項目</Sentence></TableColumn>
            </TableRow>
          </Table>
        </TableStruct>
        <InvalidSupplProvisionAppdxTableElement>不正な要素</InvalidSupplProvisionAppdxTableElement>
      </SupplProvisionAppdxTable>
    </SupplProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] SupplProvisionAppdxTable', 'InvalidSupplProvisionAppdxTableElement']
    },
  ];
}

/**
 * SupplProvisionAppdxStyle要素の不正XMLテストケースを生成
 */
export function generateInvalidSupplProvisionAppdxStyleXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'SupplProvisionAppdxStyle',
      renderFunctionName: 'renderSupplProvisionAppdxStyle',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <SupplProvision>
      <SupplProvisionLabel>附則</SupplProvisionLabel>
      <Paragraph Num="1">
        <ParagraphNum/>
        <ParagraphSentence><Sentence>附則。</Sentence></ParagraphSentence>
      </Paragraph>
      <SupplProvisionAppdxStyle Num="1">
        <SupplProvisionAppdxStyleTitle>附則別記様式第一</SupplProvisionAppdxStyleTitle>
        <StyleStruct>
          <StyleStructTitle>様式第一</StyleStructTitle>
          <Style><Sentence>様式内容。</Sentence></Style>
        </StyleStruct>
        <InvalidSupplProvisionAppdxStyleElement>不正な要素</InvalidSupplProvisionAppdxStyleElement>
      </SupplProvisionAppdxStyle>
    </SupplProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] SupplProvisionAppdxStyle', 'InvalidSupplProvisionAppdxStyleElement']
    },
  ];
}

/**
 * SupplProvisionAppdx要素の不正XMLテストケースを生成
 */
export function generateInvalidSupplProvisionAppdxXML(): InvalidXMLTestCase[] {
  return [
    {
      elementName: 'SupplProvisionAppdx',
      renderFunctionName: 'renderSupplProvisionAppdx',
      patternName: 'InvalidElement',
      xmlContent: `<?xml version="1.0" encoding="UTF-8"?>
<Law Era="Heisei" Year="25" Num="36" LawType="Act" Lang="ja">
  <LawNum>平成二十五年法律第三十六号</LawNum>
  <LawBody>
    <LawTitle>テスト法</LawTitle>
    <MainProvision>
      <Article Num="1">
        <ArticleTitle>第一条</ArticleTitle>
        <Paragraph Num="1">
          <ParagraphNum/>
          <ParagraphSentence><Sentence>テスト条文。</Sentence></ParagraphSentence>
        </Paragraph>
      </Article>
    </MainProvision>
    <SupplProvision>
      <SupplProvisionLabel>附則</SupplProvisionLabel>
      <Paragraph Num="1">
        <ParagraphNum/>
        <ParagraphSentence><Sentence>附則。</Sentence></ParagraphSentence>
      </Paragraph>
      <SupplProvisionAppdx>
        <ArithFormulaNum>附則算式第一</ArithFormulaNum>
        <ArithFormula>x + y = z</ArithFormula>
        <InvalidSupplProvisionAppdxElement>不正な要素</InvalidSupplProvisionAppdxElement>
      </SupplProvisionAppdx>
    </SupplProvision>
  </LawBody>
</Law>`,
      expectedWarnings: ['[未処理フィールド検出] SupplProvisionAppdx', 'InvalidSupplProvisionAppdxElement']
    },
  ];
}

/**
 * 全ての不正XMLテストケースを取得
 */
export function getAllInvalidXMLTestCases(): InvalidXMLTestCase[] {
  return [
    ...generateInvalidArticleXML(),
    ...generateInvalidParagraphXML(),
    ...generateInvalidItemXML(),
    ...generateInvalidMainProvisionXML(),
    ...generateInvalidLawBodyXML(),
    ...generateInvalidChapterXML(),
    ...generateInvalidSectionXML(),
    ...generateInvalidPartXML(),
    ...generateInvalidSubitem1XML(),
    ...generateInvalidSubitem3XML(),
    ...generateInvalidSubitem4to10XML(),
    ...generateInvalidSupplProvisionXML(),
    ...generateInvalidTableStructXML(),
    ...generateInvalidFigStructXML(),
    ...generateInvalidStyleStructXML(),
    ...generateInvalidAppdxTableXML(),
    ...generateInvalidSubsectionXML(),
    ...generateInvalidDivisionXML(),
    ...generateInvalidTOCXML(),
    ...generateInvalidTOCChapterXML(),
    ...generateInvalidTOCSectionXML(),
    ...generateInvalidTOCPartXML(),
    ...generateInvalidTOCArticleXML(),
    ...generateInvalidTOCDivisionXML(),
    ...generateInvalidTOCSubsectionXML(),
    ...generateInvalidTOCSupplProvisionXML(),
    ...generateInvalidAmendProvisionXML(),
    ...generateInvalidNewProvisionXML(),
    ...generateInvalidClassXML(),
    ...generateInvalidRemarksXML(),
    ...generateInvalidNoteStructXML(),
    ...generateInvalidPreambleXML(),
    ...generateInvalidAppdxXML(),
    ...generateInvalidListXML2(),
    ...generateInvalidFormatStructXML2(),
    ...generateInvalidAppdxFigXML(),
    ...generateInvalidAppdxStyleXML(),
    ...generateInvalidAppdxFormatXML(),
    ...generateInvalidAppdxNoteXML(),
    ...generateInvalidEnactStatementXML(),
    ...generateInvalidTableXML(),
    ...generateInvalidTableRowXML(),
    ...generateInvalidTableColumnXML(),
    ...generateInvalidSupplProvisionAppdxTableXML(),
    ...generateInvalidSupplProvisionAppdxStyleXML(),
    ...generateInvalidSupplProvisionAppdxXML(),
  ];
}

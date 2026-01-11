/**
 * 法令パンくずナビゲーション機能
 * 日本の法令構造（編・章・節・款・目・条）に対応したパンくずリスト機能を提供
 */
class BreadcrumbNavigation {
  constructor() {
    // 条文IDと階層情報のマッピング
    this.hierarchyMap = new Map();

    // 階層要素と同じ階層の兄弟要素のマッピング（ポップアップ用）
    this.siblingMap = new Map();

    // 現在表示中の条文ID
    this.currentArticleId = null;

    // IntersectionObserver
    this.observer = null;

    // パンくずナビゲーションのコンテナ
    this.breadcrumbContainer = null;

    // 法令タイトル
    this.lawTitle = null;

    // ポップアップ関連
    this.currentPopup = null;

    // イベントハンドラをバインド
    this.closeHierarchyPopupBound = this.closeHierarchyPopup.bind(this);

    this.init();
  }

  /**
   * 初期化処理
   */
  init() {
    this.createBreadcrumbUI();
    this.parseDocumentStructure();
    this.setupIntersectionObserver();
    this.attachEventListeners();
  }

  /**
   * パンくずナビゲーションのUI構造を初期化
   */
  createBreadcrumbUI() {
    // HTMLに定義済みのnav要素を取得
    this.breadcrumbContainer = document.getElementById('breadcrumb-navigation');
  }

  /**
   * 文書構造を解析して階層情報を抽出（初期化時に1回だけ実行）
   */
  parseDocumentStructure() {
    const content = document.getElementById('content');
    if (!content) return;

    // 法令タイトルを取得
    this.lawTitle = document.getElementById('doc_title')?.value ||
                   document.querySelector('title')?.textContent ||
                   '法令';

    // 本則と附則をそれぞれ解析
    const mainProvision = content.querySelector('section.MainProvision');
    if (mainProvision) {
      this.parseProvisionSection(mainProvision, '本則');
    }

    const supplProvisions = content.querySelectorAll('section.SupplProvision');
    supplProvisions.forEach((supplProvision, index) => {
      // 附則ラベルを取得
      const labelElement = supplProvision.querySelector('._div_SupplProvisionLabel');
      const provisionType = labelElement ? labelElement.textContent.trim() :
                           (supplProvisions.length > 1 ? `附則 (${index + 1})` : '附則');

      this.parseProvisionSection(supplProvision, provisionType);
    });
  }

  /**
   * 本則または附則セクション内の階層構造を解析
   */
  parseProvisionSection(provisionSection, provisionType) {
    // 本則の場合、section > div > (階層要素) という構造
    // 附則の場合、section > (階層要素) という構造
    let container = provisionSection;

    // 本則の場合のみ、最初の子要素がdivならそれを使う
    if (provisionType === '本則' &&
        provisionSection.children.length > 0 &&
        provisionSection.children[0].tagName === 'DIV') {
      container = provisionSection.children[0];
    }

    // コンテナ内の子要素（編・章・節・款・目・条）を取得
    const children = Array.from(container.children);

    // 階層スタック（現在のコンテキスト）
    const hierarchyStack = {
      provisionType: provisionType,
      provisionElement: provisionSection,
      part: null,
      chapter: null,
      section: null,
      subsection: null,
      division: null
    };

    // 同じ階層の要素をグループ化するための一時マップ
    const hierarchyGroups = {
      Part: [],
      Chapter: [],
      Section: [],
      Subsection: [],
      Division: [],
      Article: []
    };

    // 各階層レベルの親を追跡
    let currentParentMap = new Map();

    // 全ての子要素を走査
    let partCount = 0, chapterCount = 0, sectionCount = 0, subsectionCount = 0, divisionCount = 0, articleCount = 0;

    for (let i = 0; i < children.length; i++) {
      const element = children[i];
      const classList = element.classList;

      // 階層タイプを判定
      let hierarchyType = null;
      if (classList.contains('Part')) hierarchyType = 'Part';
      else if (classList.contains('Chapter')) hierarchyType = 'Chapter';
      else if (classList.contains('Section')) hierarchyType = 'Section';
      else if (classList.contains('Subsection')) hierarchyType = 'Subsection';
      else if (classList.contains('Division')) hierarchyType = 'Division';
      else if (classList.contains('Article')) hierarchyType = 'Article';

      if (!hierarchyType) continue;

      // カウント
      if (hierarchyType === 'Part') partCount++;
      else if (hierarchyType === 'Chapter') chapterCount++;
      else if (hierarchyType === 'Section') sectionCount++;
      else if (hierarchyType === 'Subsection') subsectionCount++;
      else if (hierarchyType === 'Division') divisionCount++;
      else if (hierarchyType === 'Article') articleCount++;

      // テキストと階層情報を解析
      const text = element.textContent.trim();
      const { number, title } = this.parseNumberAndTitle(text);

      // 階層スタックを更新
      if (hierarchyType === 'Part') {
        hierarchyStack.part = { number, title, element };
        hierarchyStack.chapter = hierarchyStack.section = hierarchyStack.subsection = hierarchyStack.division = null;
        currentParentMap.set('Part', element);
        hierarchyGroups.Part.push(element);
      } else if (hierarchyType === 'Chapter') {
        hierarchyStack.chapter = { number, title, element };
        hierarchyStack.section = hierarchyStack.subsection = hierarchyStack.division = null;
        currentParentMap.set('Chapter', element);

        // この章が属する親を記録
        const parent = hierarchyStack.part ? hierarchyStack.part.element : provisionSection;
        this.recordSiblings(element, 'Chapter', parent, children, i);
      } else if (hierarchyType === 'Section') {
        hierarchyStack.section = { number, title, element };
        hierarchyStack.subsection = hierarchyStack.division = null;
        currentParentMap.set('Section', element);

        const parent = hierarchyStack.chapter ? hierarchyStack.chapter.element :
                       hierarchyStack.part ? hierarchyStack.part.element : provisionSection;
        this.recordSiblings(element, 'Section', parent, children, i);
      } else if (hierarchyType === 'Subsection') {
        hierarchyStack.subsection = { number, title, element };
        hierarchyStack.division = null;
        currentParentMap.set('Subsection', element);

        const parent = hierarchyStack.section ? hierarchyStack.section.element :
                       hierarchyStack.chapter ? hierarchyStack.chapter.element :
                       hierarchyStack.part ? hierarchyStack.part.element : provisionSection;
        this.recordSiblings(element, 'Subsection', parent, children, i);
      } else if (hierarchyType === 'Division') {
        hierarchyStack.division = { number, title, element };
        currentParentMap.set('Division', element);

        const parent = hierarchyStack.subsection ? hierarchyStack.subsection.element :
                       hierarchyStack.section ? hierarchyStack.section.element :
                       hierarchyStack.chapter ? hierarchyStack.chapter.element :
                       hierarchyStack.part ? hierarchyStack.part.element : provisionSection;
        this.recordSiblings(element, 'Division', parent, children, i);
      } else if (hierarchyType === 'Article') {
        // 条文の場合、IDを生成して階層情報を記録
        const articleId = this.generateArticleId(element, provisionSection);

        // 条文要素にIDを設定
        if (!element.id) {
          element.id = articleId;
        }

        // 階層情報を作成
        const hierarchy = {
          law: { title: this.lawTitle },
          provisionType: hierarchyStack.provisionType,
          part: hierarchyStack.part,
          chapter: hierarchyStack.chapter,
          section: hierarchyStack.section,
          subsection: hierarchyStack.subsection,
          division: hierarchyStack.division,
          article: { number, title, element }
        };

        // マップに保存
        this.hierarchyMap.set(articleId, hierarchy);

        // 条文の兄弟要素を記録
        const parent = hierarchyStack.division ? hierarchyStack.division.element :
                       hierarchyStack.subsection ? hierarchyStack.subsection.element :
                       hierarchyStack.section ? hierarchyStack.section.element :
                       hierarchyStack.chapter ? hierarchyStack.chapter.element :
                       hierarchyStack.part ? hierarchyStack.part.element : provisionSection;
        this.recordSiblings(element, 'Article', parent, children, i);
      }
    }
  }

  /**
   * 同じ階層の兄弟要素を記録
   */
  recordSiblings(currentElement, hierarchyType, parentElement, allChildren, currentIndex) {
    // 親要素の後ろから、次の親要素（または同レベルの親）の前までを兄弟として収集
    const siblings = [];

    // 親の階層レベルを判定
    const parentTypes = {
      'Article': ['Division', 'Subsection', 'Section', 'Chapter', 'Part'],
      'Division': ['Subsection', 'Section', 'Chapter', 'Part'],
      'Subsection': ['Section', 'Chapter', 'Part'],
      'Section': ['Chapter', 'Part'],
      'Chapter': ['Part'],
      'Part': []
    };

    const upperHierarchies = parentTypes[hierarchyType] || [];

    // 現在の要素より前を逆順で探索して、親要素を見つける
    let parentIndex = -1;
    for (let i = currentIndex - 1; i >= 0; i--) {
      const el = allChildren[i];
      if (el === parentElement) {
        parentIndex = i;
        break;
      }
      // 上位階層を見つけたら、それを親とする
      for (const upperType of upperHierarchies) {
        if (el.classList.contains(upperType)) {
          parentIndex = i;
          break;
        }
      }
      if (parentIndex !== -1) break;
    }

    // 親の次の要素から、次の上位階層または親終了まで走査
    for (let i = parentIndex + 1; i < allChildren.length; i++) {
      const el = allChildren[i];

      // 現在の階層タイプと一致する要素を収集
      if (el.classList.contains(hierarchyType)) {
        siblings.push(el);
      }

      // 上位階層が見つかったら終了
      let foundUpper = false;
      for (const upperType of upperHierarchies) {
        if (el.classList.contains(upperType)) {
          foundUpper = true;
          break;
        }
      }
      if (foundUpper) break;
    }

    // マップに保存
    this.siblingMap.set(currentElement, siblings);
  }

  /**
   * テキストから番号とタイトルを分離
   */
  parseNumberAndTitle(text) {
    // 「第一編 総則」のような形式から番号とタイトルを分離
    const match = text.match(/^(第[一二三四五六七八九十百千万\d]+[編章節款目条])\s*(.*)/);
    if (match) {
      return {
        number: match[1],
        title: match[2]
      };
    }

    return {
      number: '',
      title: text
    };
  }

  /**
   * 条文要素のIDを生成
   */
  generateArticleId(articleElement, provisionSection) {
    // 本則/附則の判定
    let provisionPrefix = 'main';

    if (provisionSection?.classList.contains('SupplProvision')) {
      // 附則の場合、すべての附則セクションの中で何番目かを特定
      const allSupplProvisions = document.querySelectorAll('section.SupplProvision');
      const supplIndex = Array.from(allSupplProvisions).indexOf(provisionSection);
      provisionPrefix = `suppl${supplIndex}`;
    }

    // テキストから条文番号を抽出してIDを生成
    const text = articleElement.textContent.trim();
    const match = text.match(/第?([一二三四五六七八九十百千万\d]+)条/);
    if (match) {
      return `${provisionPrefix}_article${this.convertToArabic(match[1])}`;
    }

    // フォールバック：要素の位置に基づくID
    const articles = provisionSection.querySelectorAll('.Article');
    const index = Array.from(articles).indexOf(articleElement);
    return `${provisionPrefix}_article_${index}`;
  }

  /**
   * 漢数字をアラビア数字に変換
   */
  convertToArabic(kanjiNumber) {
    if (/^\d+$/.test(kanjiNumber)) {
      return kanjiNumber;
    }

    const kanjiMap = {
      '〇': 0, '零': 0,
      '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
      '六': 6, '七': 7, '八': 8, '九': 9,
      '十': 10, '百': 100, '千': 1000, '万': 10000
    };

    let result = 0;
    let temp = 0;
    let current = 0;

    for (let i = 0; i < kanjiNumber.length; i++) {
      const char = kanjiNumber[i];
      const value = kanjiMap[char];

      if (value >= 10) {
        if (current === 0) current = 1;
        if (value === 10000) {
          result += (temp + current) * value;
          temp = 0;
          current = 0;
        } else {
          temp += current * value;
          current = 0;
        }
      } else {
        current = value;
      }
    }

    return result + temp + current;
  }

  /**
   * IntersectionObserverを設定
   */
  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Article要素のIDを直接取得（既に設定済み）
          const articleId = entry.target.id;
          if (articleId) {
            this.updateCurrentArticle(articleId);
          }
        }
      });
    }, options);

    // 全ての条文要素を監視対象に追加
    document.querySelectorAll('section.Article').forEach(article => {
      this.observer.observe(article);
    });
  }

  /**
   * 現在の条文を更新してパンくずを表示
   */
  updateCurrentArticle(articleId) {
    if (this.currentArticleId === articleId) return;
    this.currentArticleId = articleId;

    // 階層情報をマップから取得
    const hierarchy = this.hierarchyMap.get(articleId);
    if (hierarchy) {
      this.renderBreadcrumb(hierarchy);
    }
  }

  /**
   * パンくずをレンダリング
   */
  renderBreadcrumb(hierarchy) {
    const breadcrumbList = document.getElementById('breadcrumb-list');
    if (!breadcrumbList) return;

    breadcrumbList.innerHTML = '';

    let isFirstItem = true;

    // 本則/附則
    if (hierarchy.provisionType) {
      this.addBreadcrumbItem(breadcrumbList, hierarchy.provisionType, null, false);
      isFirstItem = false;
    }

    // 編
    if (hierarchy.part) {
      if (!isFirstItem) this.addBreadcrumbSeparator(breadcrumbList);
      this.addBreadcrumbItem(breadcrumbList,
        `${hierarchy.part.number} ${hierarchy.part.title}`,
        hierarchy.part.element,
        false,
        'Part');
      isFirstItem = false;
    }

    // 章
    if (hierarchy.chapter) {
      if (!isFirstItem) this.addBreadcrumbSeparator(breadcrumbList);
      this.addBreadcrumbItem(breadcrumbList,
        `${hierarchy.chapter.number} ${hierarchy.chapter.title}`,
        hierarchy.chapter.element,
        false,
        'Chapter');
      isFirstItem = false;
    }

    // 節
    if (hierarchy.section) {
      if (!isFirstItem) this.addBreadcrumbSeparator(breadcrumbList);
      this.addBreadcrumbItem(breadcrumbList,
        `${hierarchy.section.number} ${hierarchy.section.title}`,
        hierarchy.section.element,
        false,
        'Section');
      isFirstItem = false;
    }

    // 款
    if (hierarchy.subsection) {
      if (!isFirstItem) this.addBreadcrumbSeparator(breadcrumbList);
      this.addBreadcrumbItem(breadcrumbList,
        `${hierarchy.subsection.number} ${hierarchy.subsection.title}`,
        hierarchy.subsection.element,
        false,
        'Subsection');
      isFirstItem = false;
    }

    // 目
    if (hierarchy.division) {
      if (!isFirstItem) this.addBreadcrumbSeparator(breadcrumbList);
      this.addBreadcrumbItem(breadcrumbList,
        `${hierarchy.division.number} ${hierarchy.division.title}`,
        hierarchy.division.element,
        false,
        'Division');
      isFirstItem = false;
    }

    // 条（現在位置）
    const articleText = this.getArticleText(hierarchy.article.element);
    if (articleText) {
      if (!isFirstItem) this.addBreadcrumbSeparator(breadcrumbList);
      this.addBreadcrumbItem(breadcrumbList,
        articleText,
        hierarchy.article.element,
        false,
        'Article');
    }
  }

  /**
   * 条の表示テキストを取得（ArticleCaptionとArticleTitleのみ）
   */
  getArticleText(articleElement) {
    if (!articleElement) return '';

    // 親要素または自身からArticle要素を探す
    const articleContainer = articleElement.closest('.Article') ||
                            articleElement.parentElement?.closest('.Article') ||
                            articleElement;

    let captionText = '';
    let titleText = '';

    // ArticleCaptionを探す
    const captionElement = articleContainer.querySelector('._div_ArticleCaption');
    if (captionElement) {
      captionText = captionElement.textContent.trim();
    }

    // ArticleTitleを探す
    const titleElement = articleContainer.querySelector('._div_ArticleTitle');
    if (titleElement) {
      const span = titleElement.querySelector("span");
      if (span) {
        titleText = span.textContent.trim();
      }
    }

    // 両方を結合
    if (captionText && titleText) {
      return `${captionText} ${titleText}`;
    } else if (captionText) {
      return captionText;
    } else if (titleText) {
      return titleText;
    }

    return '';
  }

  /**
   * パンくずアイテムを追加
   */
  addBreadcrumbItem(container, text, element, isCurrent = false, hierarchyType = null) {
    const li = document.createElement('li');
    li.className = 'flex-shrink-0';
    li.style.backgroundColor = '#f0f0f0';
    li.style.padding = '0.25rem 0.5rem';
    li.style.borderRadius = '0.25rem';

    if (element && !isCurrent && hierarchyType) {
      // 階層項目（編・章・節・款・目・条）の場合、ポップアップを表示
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'text-Sea-900 hover:underline hover:text-Sea-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-Sea-500 focus:ring-opacity-50 rounded';
      link.textContent = text;
      link.setAttribute('aria-label', `${text}の一覧を表示`);

      link.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.showHierarchyPopup(hierarchyType, element, link);
      };

      li.appendChild(link);
    } else if (element && !isCurrent) {
      // その他のクリック可能なリンク（本則/附則など）
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'text-Sea-900 hover:underline hover:text-Sea-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-Sea-500 focus:ring-opacity-50 rounded';
      link.textContent = text;
      link.setAttribute('aria-label', `${text}へ移動`);

      link.onclick = (e) => {
        e.preventDefault();
        this.scrollToElement(element);
      };

      // キーボードナビゲーション対応
      link.onkeydown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.scrollToElement(element);
        }
      };

      li.appendChild(link);
    } else {
      // 現在位置または法令名（リンクなし）
      const span = document.createElement('span');
      span.className = isCurrent ? 'text-light-Text-Body font-bold' : 'text-light-Text-Body';
      span.textContent = text;

      if (isCurrent) {
        span.setAttribute('aria-current', 'page');
        span.setAttribute('aria-label', `現在位置: ${text}`);
      }

      li.appendChild(span);
    }

    container.appendChild(li);
  }

  /**
   * パンくず区切り文字を追加
   */
  addBreadcrumbSeparator(container) {
    const li = document.createElement('li');
    li.className = 'text-Sumi-600 flex-shrink-0';
    li.textContent = '>';
    container.appendChild(li);
  }

  /**
   * 階層項目のポップアップを表示
   */
  showHierarchyPopup(hierarchyType, currentElement, triggerElement) {
    // 既存のポップアップを閉じる
    this.closeHierarchyPopup();

    // siblingMapから兄弟要素を取得
    const siblings = this.siblingMap.get(currentElement);
    if (!siblings || siblings.length === 0) return;

    // ポップアップを作成
    const popup = document.createElement('div');
    popup.id = 'hierarchy-popup';
    popup.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #E8E8EB;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      min-width: 200px;
    `;

    const list = document.createElement('ul');
    list.style.cssText = `
      list-style: none;
      margin: 0;
      padding: 0.5rem 0;
    `;

    siblings.forEach(element => {
      let displayText;

      if (hierarchyType === 'Article') {
        // 条の場合は ArticleCaption と ArticleTitle を表示
        displayText = this.getArticleText(element);
      } else {
        // その他の階層の場合は number と title を表示
        const text = element.textContent.trim();
        const { number, title } = this.parseNumberAndTitle(text);
        displayText = `${number} ${title}`;
      }

      const listItem = document.createElement('li');
      listItem.style.cssText = `
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: background-color 0.2s;
      `;

      // 現在選択中の項目の背景色を変更
      if (element === currentElement) {
        listItem.style.backgroundColor = '#e3f2fd';
        listItem.style.fontWeight = 'bold';
      }

      listItem.textContent = displayText;

      // ホバー時のスタイル
      listItem.onmouseenter = () => {
        if (element !== currentElement) {
          listItem.style.backgroundColor = '#f5f5f5';
        }
      };
      listItem.onmouseleave = () => {
        if (element !== currentElement) {
          listItem.style.backgroundColor = '';
        }
      };

      // クリックで該当箇所へジャンプ
      listItem.onclick = (e) => {
        e.stopPropagation();
        this.scrollToElement(element);
        this.closeHierarchyPopup();
      };

      list.appendChild(listItem);
    });

    popup.appendChild(list);

    // ポップアップの位置を計算
    const rect = triggerElement.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom + 5}px`;

    document.body.appendChild(popup);
    this.currentPopup = popup;

    // ドキュメント全体にクリックリスナーを追加（ポップアップ外をクリックで閉じる）
    setTimeout(() => {
      document.addEventListener('click', this.closeHierarchyPopupBound);
    }, 0);
  }

  /**
   * 階層ポップアップを閉じる
   */
  closeHierarchyPopup() {
    if (this.currentPopup) {
      this.currentPopup.remove();
      this.currentPopup = null;
      document.removeEventListener('click', this.closeHierarchyPopupBound);
    }
  }

  /**
   * 指定された要素にスクロール
   */
  scrollToElement(element) {
    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  /**
   * イベントリスナーを設定
   */
  attachEventListeners() {
    // リサイズ時の処理
    window.addEventListener('resize', () => {
      // 必要に応じてパンくずの表示を調整
    });

    // 既存の条文ジャンプ機能との連携
    const articleJumpInput = document.getElementById('article_jump');
    if (articleJumpInput) {
      const originalHandler = articleJumpInput.onkeypress;
      articleJumpInput.onkeypress = (e) => {
        if (originalHandler) {
          originalHandler.call(articleJumpInput, e);
        }
        // 条文ジャンプ後にパンくずを更新
        setTimeout(() => {
          const visibleArticle = document.querySelector('section.Article');
          if (visibleArticle && visibleArticle.id) {
            this.updateCurrentArticle(visibleArticle.id);
          }
        }, 100);
      };
    }
  }

  /**
   * パンくずナビゲーションを破棄
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }

    // ポップアップを閉じる
    this.closeHierarchyPopup();

    // パンくずリストの内容をクリア（要素自体は削除しない）
    if (this.breadcrumbContainer) {
      const breadcrumbList = document.getElementById('breadcrumb-list');
      if (breadcrumbList) {
        breadcrumbList.innerHTML = '';
      }
    }
  }
}

// グローバルインスタンス
let breadcrumbNavigation = null;

// 初期化関数
function initializeBreadcrumbNavigation() {
  // パンくず要素が存在することを確認
  const breadcrumbElement = document.getElementById('breadcrumb-navigation');
  if (!breadcrumbElement) {
    console.warn('パンくずナビゲーション要素がまだ存在しません。初期化をスキップします。');
    return;
  }

  // コンテンツに条文要素が存在するかを確認
  const content = document.getElementById('content');
  if (!content || content.querySelectorAll('._div_ArticleTitle').length === 0) {
    console.warn('条文要素がまだ存在しません。パンくず初期化をスキップします。');
    return;
  }

  if (breadcrumbNavigation) {
    breadcrumbNavigation.destroy();
  }
  breadcrumbNavigation = new BreadcrumbNavigation();
}

// グローバルに公開（showLawViewerから呼ばれる）
window.initializeBreadcrumbNavigation = initializeBreadcrumbNavigation;

/**
 * 改正履歴セレクターの初期化と管理
 */

let currentRevisions = [];
let currentLawId = '';
let currentSelectedRevisionId = '';

/**
 * 改正履歴セレクターを初期化
 * @param {Array} revisions - 改正履歴の配列
 * @param {string} lawId - 法令ID
 * @param {string} selectedRevisionId - 現在選択されている改正履歴ID
 */
window.initializeRevisionSelector = function(revisions, lawId, selectedRevisionId) {
  currentRevisions = revisions || [];
  currentLawId = lawId;
  currentSelectedRevisionId = selectedRevisionId;

  const container = document.getElementById('revision-selector-container');
  if (!container) return;

  // 改正履歴がない場合は非表示
  if (currentRevisions.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'block';

  // ボタンのテキストを更新
  updateButtonText();

  // ボタンのクリックイベント
  const button = document.getElementById('revision-selector-button');
  if (button) {
    button.onclick = function() {
      openRevisionModal();
    };
  }
};

/**
 * ボタンのテキストを現在選択されている改正履歴に更新
 */
function updateButtonText() {
  const button = document.getElementById('revision-selector-button');
  if (!button) return;

  // 現在選択されている改正履歴を見つける
  const selectedRevision = currentRevisions.find(
    rev => rev.lawRevisionId === currentSelectedRevisionId
  );

  if (selectedRevision) {
    let displayText = '';

    // 改正日または公布日
    if (selectedRevision.amendmentPromulgateDate) {
      const date = new Date(selectedRevision.amendmentPromulgateDate);
      displayText += `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} `;
    }

    // 改正法令名（短縮版）
    if (selectedRevision.amendmentLawTitle) {
      let lawTitle = selectedRevision.amendmentLawTitle;
      lawTitle = lawTitle.replace(/の一部を改正する法律$/, '');
      lawTitle = lawTitle.replace(/を改正する法律$/, '');
      lawTitle = lawTitle.replace(/による改正$/, '');

      if (lawTitle.length > 40) {
        lawTitle = lawTitle.substring(0, 40) + '...';
      }
      displayText += lawTitle;
    } else if (selectedRevision.lawTitle) {
      displayText += selectedRevision.lawTitle;
    } else {
      displayText += '新規制定';
    }

    button.textContent = displayText;
  } else {
    button.textContent = '改正履歴を選択';
  }
}

/**
 * 改正履歴選択モーダルを開く
 */
function openRevisionModal() {
  // モーダルを作成
  const modal = document.createElement('div');
  modal.id = 'revision-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;

  // モーダルコンテンツ
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 800px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  `;

  // タイトル
  const title = document.createElement('h2');
  title.textContent = '改正履歴を選択';
  title.style.cssText = `
    margin: 0 0 20px 0;
    font-size: 20px;
    font-weight: bold;
    color: #333;
  `;
  modalContent.appendChild(title);

  // 改正履歴を新しい順にソート
  const sortedRevisions = [...currentRevisions].sort((a, b) => {
    return (b.revisionIndex || 0) - (a.revisionIndex || 0);
  });

  // 改正履歴リスト
  const listContainer = document.createElement('div');
  listContainer.style.cssText = `
    margin-bottom: 20px;
  `;

  sortedRevisions.forEach((revision) => {
    const item = document.createElement('div');
    const isSelected = revision.lawRevisionId === currentSelectedRevisionId;

    item.style.cssText = `
      padding: 16px;
      margin-bottom: 8px;
      border: 2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'};
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      background-color: ${isSelected ? '#eff6ff' : 'white'};
    `;

    item.onmouseover = function() {
      if (!isSelected) {
        this.style.backgroundColor = '#f9fafb';
        this.style.borderColor = '#d1d5db';
      }
    };

    item.onmouseout = function() {
      if (!isSelected) {
        this.style.backgroundColor = 'white';
        this.style.borderColor = '#e5e7eb';
      }
    };

    item.onclick = function() {
      selectRevision(revision.lawRevisionId);
    };

    // 選択中マーク
    if (isSelected) {
      const selectedMark = document.createElement('div');
      selectedMark.textContent = '✓ 表示中';
      selectedMark.style.cssText = `
        display: inline-block;
        background-color: #3b82f6;
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 8px;
      `;
      item.appendChild(selectedMark);
    }

    // 改正日または公布日
    if (revision.amendmentPromulgateDate) {
      const date = new Date(revision.amendmentPromulgateDate);
      const dateText = document.createElement('div');
      dateText.textContent = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
      dateText.style.cssText = `
        font-size: 14px;
        color: #6b7280;
        margin-bottom: 4px;
      `;
      item.appendChild(dateText);
    }

    // 改正法令名
    const titleText = document.createElement('div');
    if (revision.amendmentLawTitle) {
      titleText.textContent = revision.amendmentLawTitle;
    } else if (revision.lawTitle) {
      titleText.textContent = revision.lawTitle;
    } else {
      titleText.textContent = '新規制定';
    }
    titleText.style.cssText = `
      font-size: 16px;
      font-weight: 500;
      color: #111827;
      line-height: 1.5;
    `;
    item.appendChild(titleText);

    // 施行日
    if (revision.amendmentEnforcementDate) {
      const date = new Date(revision.amendmentEnforcementDate);
      const enforcementText = document.createElement('div');
      enforcementText.textContent = `施行日: ${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
      enforcementText.style.cssText = `
        font-size: 13px;
        color: #9ca3af;
        margin-top: 4px;
      `;
      item.appendChild(enforcementText);
    }

    listContainer.appendChild(item);
  });

  modalContent.appendChild(listContainer);

  // 閉じるボタン
  const closeButton = document.createElement('button');
  closeButton.textContent = '閉じる';
  closeButton.style.cssText = `
    padding: 10px 20px;
    background-color: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  `;
  closeButton.onmouseover = function() {
    this.style.backgroundColor = '#4b5563';
  };
  closeButton.onmouseout = function() {
    this.style.backgroundColor = '#6b7280';
  };
  closeButton.onclick = function() {
    closeRevisionModal();
  };
  modalContent.appendChild(closeButton);

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  // モーダルの背景クリックで閉じる
  modal.onclick = function(e) {
    if (e.target === modal) {
      closeRevisionModal();
    }
  };
}

/**
 * 改正履歴選択モーダルを閉じる
 */
function closeRevisionModal() {
  const modal = document.getElementById('revision-modal');
  if (modal) {
    modal.remove();
  }
}

/**
 * 改正履歴を選択
 * @param {string} revisionId - 選択された改正履歴ID
 */
function selectRevision(revisionId) {
  if (revisionId && revisionId !== currentSelectedRevisionId) {
    // URLパラメータを更新してページをリロード
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('lawid', currentLawId);
    urlParams.set('lawRevisionId', revisionId);
    window.location.search = urlParams.toString();
  }
}

/**
 * 改正履歴セレクターをクリア
 */
window.clearRevisionSelector = function() {
  const container = document.getElementById('revision-selector-container');
  if (container) {
    container.style.display = 'none';
  }
};

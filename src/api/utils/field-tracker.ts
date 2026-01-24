/**
 * XMLフィールド削除・未処理チェックユーティリティ
 *
 * XMLレンダリング時に、処理済みフィールドを削除し、
 * 未処理フィールドが残っていないかチェックする機能を提供します。
 */

/**
 * オブジェクトから特定のフィールドを削除
 *
 * @param obj - 対象オブジェクト
 * @param fieldName - 削除するフィールド名
 */
export function deleteField(obj: any, fieldName: string): void {
  if (obj && typeof obj === 'object' && fieldName in obj) {
    delete obj[fieldName];
  }
}

/**
 * 配列の全要素から特定のフィールドを削除
 *
 * @param arr - 対象配列
 * @param fieldName - 削除するフィールド名
 */
export function deleteFieldFromArray(arr: any[], fieldName: string): void {
  if (!Array.isArray(arr)) {
    return;
  }

  arr.forEach((item) => {
    if (item && typeof item === 'object' && fieldName in item) {
      delete item[fieldName];
    }
  });
}

/**
 * オブジェクトの未処理フィールドをチェックして警告ログを出力
 *
 * `:@`（XML属性）は除外してチェックします。
 * 未処理フィールドが存在する場合、console.warnで警告を出力します。
 *
 * @param obj - チェック対象のオブジェクト
 * @param contextInfo - コンテキスト情報（どのrender関数から呼ばれたか）
 * @param treeElement - 要素のツリー情報
 */
export function checkUnprocessedFields(
  obj: any,
  contextInfo: string,
  treeElement: string[]
): void {
  if (!obj || typeof obj !== 'object') {
    return;
  }

  // `:@`（XML属性）を除外してフィールドを取得
  const unprocessedFields = Object.keys(obj).filter(key => key !== ':@');

  if (unprocessedFields.length > 0) {
    const treePath = treeElement.join('>');
    const fieldList = unprocessedFields.join(', ');
    console.warn(`[未処理フィールド検出] ${contextInfo} (${treePath}): { ${fieldList} }`);
  }
}

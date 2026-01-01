/**
 * チェックボックス項目の型
 * @param id チェックボックスのid
 * @param name チェックボックスのname
 * @param label チェックボックスのラベル
 * @param checked チェックボックスのチェック状態
 * @param disabled チェックボックスの無効状態
 */
export type CheckboxItemType<T> = {
  id: T;
  name: string;
  label: string;
  checked: boolean;
  disabled: boolean;
};

/**
 * ラジオ項目の型
 */
export type RadioItemType = {
  id: string;
  label: string;
  disabled: boolean;
  required?: boolean;
};

/**
 * ドロップダウン項目の型
 */
export type DropdownMenuType = {
  label: string;
  value: number;
};

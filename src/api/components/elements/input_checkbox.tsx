"use client";
import { CheckboxItemType } from "@api/types/common";
import React from "react";
import CheckboxIcon from "../icons/checkbox-icon";
import { CategoryCd, LawType } from "@api/lib/typescript-fetch";

/**
 * InputCheckboxPropsは、InputCheckboxコンポーネントのpropsの型を定義します。
 * @template T - LawTypeまたはCategoryCd
 * @property {CheckboxItemType<T>} item - チェックボックスのアイテム
 * @property {boolean} checked - チェックボックスがチェックされているかどうか
 * @property {(id: string, checked: boolean) => void} onChange - チェックボックスの変更時に呼び出される関数
 */
type InputCheckboxProps<T> = {
  item: CheckboxItemType<T>;
  checked: boolean;
  onChange: (id: string, checked: boolean) => void;
};

/**
 * InputCheckboxコンポーネントは、チェックボックスを提供します。
 * @template T - LawTypeまたはCategoryCd
 * @param {Object} props - Reactコンポーネントのプロパティ
 * @param {T} props.item - チェックボックスのアイテム
 * @param {boolean} props.checked - チェックボックスがチェックされているかどうか
 * @param {(id: string, checked: boolean) => void} props.onChange - チェックボックスの変更時に呼び出される関数
 * @returns {JSX.Element} - InputCheckboxコンポーネント
 */
const InputCheckbox = <T extends LawType | CategoryCd>({
  item,
  checked,
  onChange,
}: InputCheckboxProps<T>) => {
  const handleChangeChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(String(item.id), e.currentTarget.checked);
  };

  return (
    <div className="h-11 flex items-center">
      <input
        type="checkbox"
        id={String(item.id)}
        name={item.name}
        value={String(item.id)}
        checked={checked}
        onChange={(e) => handleChangeChecked(e)}
        aria-labelledby={`${item.id}-label`}
        className="hidden"
      />
      <label
        id={`${item.id}-label`}
        className="flex gap-2 items-center"
        htmlFor={String(item.id)}
      >
        <CheckboxIcon checked={checked} />
        <span>{item.label}</span>
      </label>
    </div>
  );
};

export default InputCheckbox;

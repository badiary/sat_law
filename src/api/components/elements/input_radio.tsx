"use client";
import { RadioItemType } from "@api/types/common";
import RadioButtonIcon from "../icons/radio-button-icon";

/**
 * ラジオボタンのプロパティを定義する型
 * @typedef {Object} InputProps
 * @property {RadioItemType} item - ラジオボタンの項目
 * @property {string} name - ラジオボタンの name 属性
 * @property {string} val - ラジオボタンの value 属性
 */
type InputProps = {
  item: RadioItemType;
  name: string;
  val: string;
  selectedValue?: string;
  onClick?: (data: React.MouseEvent<HTMLButtonElement>) => void;
};

/**
 * ラジオボタン コンポーネント
 * @param {InputProps} props - ラジオボタンのプロパティ
 * @returns {JSX.Element} ラジオボタン
 */
export const InputRadio = ({
  item,
  val,
  name,
  selectedValue,
  onClick = () => {},
}: InputProps) => {
  return (
    <div className="h-10 w-28 flex items-center">
      <input
        type="radio"
        id={item.id}
        value={val}
        name={name}
        checked={selectedValue === val}
        aria-labelledby={`${item.id}-label`}
        required={item.required}
        className="hidden"
        onChange={() => {}}
      />
      <label id={`${item.id}-label`} htmlFor={item.id}>
        <button
          type="button"
          className="flex gap-2 items-center"
          onClick={onClick}
          value={val}
          title={item.label}
        >
          <RadioButtonIcon checked={selectedValue === val} />
          <span className="w-max">{item.label}</span>
        </button>
      </label>
    </div>
  );
};

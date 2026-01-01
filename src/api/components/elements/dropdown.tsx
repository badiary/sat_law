"use client";
import React, { useEffect, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type DropdownProps = {
  id: string;
  options: Option[];
  onChange: (value: string) => void;
  value?: string;
  disabled?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
};

/**
 * セレクトボックス コンポーネント
 * @param {DropdownProps} props セレクトボックスのプロパティ
 * @param {Option[]} props.options セレクトボックスの選択肢
 * @param {function} props.onChange セレクトボックスの選択時のコールバック関数
 * @param {string} props.defaultValue セレクトボックスの初期値
 * @param {boolean} props.disabled セレクトボックスの無効化
 * @returns {JSX.Element} セレクトボックス
 */
const Dropdown = ({
  id,
  options,
  onChange,
  value,
  disabled = false,
  onBlur = () => {},
  onFocus = () => {},
}: DropdownProps) => {
  const [selectedValue, setSelectedValue] = useState(value || options[0].value);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedValue(value);
    onChange(value);
  };

  useEffect(() => {
    setSelectedValue(value || options[0].value);
  }, [value, options]);

  return (
    <div className="selectBoxWrapper">
      <div>
        <select
          id={`${id}SelectBox`}
          className="selectBox"
          value={selectedValue}
          onChange={handleChange}
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Dropdown;

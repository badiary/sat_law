"use client";
/**
 * ボタンコンポーネントのProps
 * @param {"button" | "submit" | "reset"} type - ボタンの種類
 * @param {string} label - ボタンのラベル(aria-label用)
 * @param {React.ReactNode} children - ボタンの中身
 * @param {()=> void} onClick - ボタンクリック時の処理
 * @param {string} className - ボタンのクラス名
 */
type ButtonProps = {
  type: "button" | "submit" | "reset";
  label: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

/**
 * ボタンコンポーネント
 * @param {ButtonProps} props
 * @returns {React.ReactNode}
 */
const Button = (props: ButtonProps) => {
  const { type, label, title, children, className, onClick } = props;

  // childrenがundefinedの場合はlabelをchildrenとして使用する
  const buttonChildren = children ?? label;

  return (
    <button
      type={type}
      className={`button ${className}`}
      onClick={onClick}
      aria-label={label}
      title={title}
    >
      {buttonChildren}
    </button>
  );
};

export default Button;

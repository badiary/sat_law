export type IconProps = {
  disabled?: boolean;
  checked?: boolean;
  icons: {
    default: React.FC<React.SVGProps<SVGElement>>;
    active?: React.FC<React.SVGProps<SVGElement>>;
  };
  className?: string;
  activeClass?: string;
  width?: number | string;
  height?: number | string;
};

const Icon = (props: IconProps) => {
  const {
    disabled,
    checked,
    icons,
    className,
    activeClass,
    width = 24,
    height = 24,
  } = props;
  const defaultStyle = className;

  if (typeof checked !== "undefined") {
    if (checked && icons.active) {
      const ActiveIcon = icons.active;
      return (
        <ActiveIcon className={activeClass} width={width} height={height} />
      );
    }
    const DefaultIcon = icons.default;
    return (
      <DefaultIcon className={defaultStyle} width={width} height={height} />
    );
  }

  if (typeof disabled !== "undefined") {
    const disabledStyle = disabled
      ? "fill-light-Icon-Disabled"
      : "fill-light-Icon-Label";
    const DefaultIcon = icons.default;
    return (
      <DefaultIcon className={disabledStyle} width={width} height={height} />
    );
  }

  const DefaultIcon = icons.default;
  return <DefaultIcon className={defaultStyle} width={width} height={height} />;
};

export default Icon;

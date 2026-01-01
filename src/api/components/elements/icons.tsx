// import Image from "next/image";

/**
 * アイコン種別
 */
type IconType =
  | "download"
  | "expandMore"
  | "expandLess"
  | "help"
  | "info"
  | "keyboardDoubleArrowLeft"
  | "keyboardDoubleArrowRight"
  | "navigateBefore"
  | "navigateNext"
  | "pdf"
  | "timeline"
  | "close";

/**
 * アイコンコンポーネントのProps
 * @param {IconProps} props
 */
type IconProps = {
  name: IconType;
};

const iconMap: Record<IconProps["name"], string> = {
  download: "/download_FILL0_wght400_GRAD0_opsz24.svg",
  expandMore: "/expand_more_FILL0_wght400_GRAD0_opsz48.svg",
  expandLess: "/expand_less_FILL0_wght400_GRAD0_opsz48.svg",
  help: "/help_FILL0_wght400_GRAD0_opsz48.svg",
  info: "/info_FILL0_wght400_GRAD0_opsz24.svg",
  keyboardDoubleArrowLeft:
    "/keyboard_double_arrow_left_FILL0_wght400_GRAD0_opsz24.svg",
  keyboardDoubleArrowRight:
    "/keyboard_double_arrow_right_FILL0_wght400_GRAD0_opsz24.svg",
  navigateBefore: "/navigate_before_FILL0_wght400_GRAD0_opsz24.svg",
  navigateNext: "/navigate_next_FILL0_wght400_GRAD0_opsz24.svg",
  pdf: "/picture_as_pdf_FILL0_wght400_GRAD0_opsz24.svg",
  timeline: "/timeline_FILL0_wght400_GRAD0_opsz24.svg",
  close: "/close_FILL0_wght400_GRAD0_opsz24.svg",
};

/**
 * アイコンコンポーネント
 * @param {IconProps} props
 * @returns {JSX.Element} アイコンコンポーネント
 */
const Icon = (props: IconProps) => {
  const { name } = props;
  return (
    <></>
    // <Image src={iconMap[name]} alt={`${name}アイコン`} width={24} height={24} />
  );
};

export default Icon;

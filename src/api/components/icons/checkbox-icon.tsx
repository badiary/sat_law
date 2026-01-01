import CheckboxFill from "./check_box_FILL1_wght400_GRAD0_opsz24.svg";
import CheckboxBlank from "./check_box_outline_blank_FILL1_wght400_GRAD0_opsz24.svg";
import Icon, { IconProps } from "./icon";

const CheckboxIcon = (props: Omit<IconProps, "icons">) => (
  <Icon
    icons={{
      default: CheckboxBlank,
      active: CheckboxFill,
    }}
    activeClass="fill-light-Icon-Active"
    {...props}
  />
);

export default CheckboxIcon;

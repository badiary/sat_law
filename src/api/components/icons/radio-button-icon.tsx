import Icon, { IconProps } from "./icon";
import RadioButtonChecked from "./radio_button_checked_FILL0_wght400_GRAD0_opsz24.svg";
import RadioButtonUnChecked from "./radio_button_unchecked_FILL0_wght400_GRAD0_opsz24.svg";

const RadioButtonIcon = (props: Omit<IconProps, "icons">) => (
  <Icon
    icons={{
      default: RadioButtonUnChecked,
      active: RadioButtonChecked,
    }}
    activeClass="fill-light-Icon-Active"
    {...props}
  />
);

export default RadioButtonIcon;

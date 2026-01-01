import Calendar from "./calendar_today_FILL0_wght400_GRAD0_opsz24.svg";
import Icon, { IconProps } from "./icon";

const CalendarIcon = (props: Omit<IconProps, "icons">) => (
  <Icon
    icons={{ default: Calendar }}
    className="fill-light-Icon-Label"
    {...props}
  />
);

export default CalendarIcon;

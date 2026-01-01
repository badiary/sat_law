import ImageFill from "./image_FILL0_wght400_GRAD0_opsz24.svg";
import Icon, { IconProps } from "./icon";

const ImageIcon = (props: Omit<IconProps, "icons">) => (
  <Icon
    icons={{ default: ImageFill }}
    className="fill-light-Icon-Label"
    {...props}
  />
);

export default ImageIcon;

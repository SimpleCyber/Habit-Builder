declare module "lucide-react" {
  import { FC, SVGProps } from "react";

  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  export type Icon = FC<IconProps>;

  export const History: Icon;
  export const X: Icon;
  export const EyeOff: Icon;
  export const Share2: Icon;
  export const Settings: Icon;
  export const Plus: Icon;
  export const Check: Icon;
  export const Calendar: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const MoreHorizontal: Icon;
  export const MoreVertical: Icon;
  export const Inbox: Icon;
  export const NewspaperIcon: Icon;
  export const Loader: Icon;
  export const Flame: Icon;
  // Fallback for any other icon
}

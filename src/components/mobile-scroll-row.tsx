import { cn } from "@/lib/utils";

interface MobileScrollRowProps {
  as?: "div" | "nav";
  className?: string;
  children: React.ReactNode;
}

export function MobileScrollRow({ as: Component = "div", className, children }: MobileScrollRowProps) {
  return <Component className={cn("flex overflow-x-auto", className)}>{children}</Component>;
}

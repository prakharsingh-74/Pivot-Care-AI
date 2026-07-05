import { cn } from "@workspace/ui/lib/utils";
import { useAtomValue } from "jotai";
import { widgetSettingsAtom } from "@/modules/widget/atoms/widget-atoms";

export const WidgetHeader = ({
    children,
    className,
}:{
    children: React.ReactNode;
    className?: string;
}) => {
    const widgetSettings = useAtomValue(widgetSettingsAtom);
    const primaryColor = widgetSettings?.primaryColor;

    return (
        <header
          className={cn(
            "bg-gradient-to-b from-primary to-[#0b63f3] p-4 text-primary-foreground transition-colors duration-300",
            className,
          )}
          style={primaryColor ? { backgroundColor: primaryColor, backgroundImage: "none" } : undefined}
        >
            {children}
        </header>
    )
}
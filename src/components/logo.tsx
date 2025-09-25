import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  isCollapsed?: boolean;
};

export default function Logo({ className, isCollapsed = false }: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-bold",
        className
      )}
    >
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <Car className="h-6 w-6" />
      </div>
      {!isCollapsed && (
        <span className="text-xl font-headline whitespace-nowrap">Chauffeur Pro</span>
      )}
    </div>
  );
}

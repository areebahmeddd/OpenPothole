import { Loader2Icon } from "lucide-react";
import type React from "react";

import { cn } from "@/lib/utils";

// Export directly so imports like `import { Spinner } from "@/components/ui/spinner"` work.
export function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

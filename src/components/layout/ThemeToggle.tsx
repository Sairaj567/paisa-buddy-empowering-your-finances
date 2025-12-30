import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const handleToggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleToggle}
      className="relative rounded-full"
    >
      <Sun className={`h-5 w-5 transition-transform ${isDark ? "scale-0 rotate-90" : "scale-100"}`} />
      <Moon className={`h-5 w-5 absolute transition-transform ${isDark ? "scale-100" : "scale-0 -rotate-90"}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;

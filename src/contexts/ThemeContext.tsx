
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system" | "custom";

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
}

export interface BrandingOptions {
  companyName: string;
  logoUrl: string;
  favicon: string;
  accentColor: string;
}

export interface CustomTheme {
  name: string;
  colors: ThemeColors;
  isDark: boolean;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customTheme: CustomTheme | null;
  setCustomTheme: (theme: CustomTheme) => void;
  branding: BrandingOptions;
  setBranding: (options: BrandingOptions) => void;
  availableThemes: CustomTheme[];
  addCustomTheme: (theme: CustomTheme) => void;
  deleteCustomTheme: (themeName: string) => void;
  resetToDefaultTheme: () => void;
}

// Default themes
const defaultLightTheme: CustomTheme = {
  name: "Default Light",
  isDark: false,
  colors: {
    primary: "#0ea5e9",
    secondary: "#f1f5f9",
    accent: "#22c55e",
    background: "#ffffff",
    foreground: "#0f172a",
    muted: "#f1f5f9",
    mutedForeground: "#64748b",
    border: "#e2e8f0"
  }
};

const defaultDarkTheme: CustomTheme = {
  name: "Default Dark",
  isDark: true,
  colors: {
    primary: "#0ea5e9",
    secondary: "#1e293b",
    accent: "#22c55e",
    background: "#0f172a",
    foreground: "#f8fafc",
    muted: "#1e293b",
    mutedForeground: "#94a3b8",
    border: "#334155"
  }
};

const defaultBranding: BrandingOptions = {
  companyName: "CLX",
  logoUrl: "/logo.svg",
  favicon: "/favicon.ico",
  accentColor: "#0ea5e9"
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || defaultTheme
  );

  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(() => {
    const savedTheme = localStorage.getItem("customTheme");
    return savedTheme ? JSON.parse(savedTheme) : null;
  });

  const [branding, setBrandingState] = useState<BrandingOptions>(() => {
    const savedBranding = localStorage.getItem("branding");
    return savedBranding ? JSON.parse(savedBranding) : defaultBranding;
  });

  const [availableThemes, setAvailableThemes] = useState<CustomTheme[]>(() => {
    const savedThemes = localStorage.getItem("availableThemes");
    return savedThemes ? JSON.parse(savedThemes) : [defaultLightTheme, defaultDarkTheme];
  });

  const setCustomTheme = (newTheme: CustomTheme) => {
    setCustomThemeState(newTheme);
    localStorage.setItem("customTheme", JSON.stringify(newTheme));
    if (theme !== "custom") {
      setTheme("custom");
    } else {
      // Force a re-render by applying CSS variables
      applyThemeProperties(newTheme);
    }
  };

  const setBranding = (options: BrandingOptions) => {
    setBrandingState(options);
    localStorage.setItem("branding", JSON.stringify(options));
    applyBrandingProperties(options);
  };

  const addCustomTheme = (newTheme: CustomTheme) => {
    setAvailableThemes(prev => {
      // Replace if theme with same name exists, otherwise add
      const exists = prev.findIndex(t => t.name === newTheme.name);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = newTheme;
        return updated;
      }
      return [...prev, newTheme];
    });
  };

  const deleteCustomTheme = (themeName: string) => {
    setAvailableThemes(prev => prev.filter(t => t.name !== themeName));

    // If the deleted theme was the active custom theme, reset to default
    if (customTheme?.name === themeName) {
      resetToDefaultTheme();
    }
  };

  const resetToDefaultTheme = () => {
    setCustomThemeState(null);
    localStorage.removeItem("customTheme");
    setTheme("system");
  };

  // Apply theme CSS variables to document root
  const applyThemeProperties = (themeToApply: CustomTheme) => {
    const root = document.documentElement;
    const colors = themeToApply.colors;

    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-foreground", themeToApply.isDark ? "#ffffff" : "#ffffff");
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--secondary-foreground", themeToApply.isDark ? "#ffffff" : "#0f172a");
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-foreground", themeToApply.isDark ? "#ffffff" : "#ffffff");
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--foreground", colors.foreground);
    root.style.setProperty("--muted", colors.muted);
    root.style.setProperty("--muted-foreground", colors.mutedForeground);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--input", colors.border);
    root.style.setProperty("--card", colors.background);
    root.style.setProperty("--card-foreground", colors.foreground);
  };

  // Apply branding properties
  const applyBrandingProperties = (options: BrandingOptions) => {
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = options.favicon;
    }

    // Set accent color as CSS variable
    document.documentElement.style.setProperty("--brand-color", options.accentColor);

    // Update page title
    document.title = options.companyName + " | Project Management App";
  };

  useEffect(() => {
    // Save available themes when they change
    localStorage.setItem("availableThemes", JSON.stringify(availableThemes));
  }, [availableThemes]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "custom");

    if (theme === "custom" && customTheme) {
      root.classList.add("custom");
      applyThemeProperties(customTheme);
      return;
    }

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme, customTheme]);

  // Apply branding on initial load
  useEffect(() => {
    applyBrandingProperties(branding);
  }, [branding]);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      customTheme,
      setCustomTheme,
      branding,
      setBranding,
      availableThemes,
      addCustomTheme,
      deleteCustomTheme,
      resetToDefaultTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

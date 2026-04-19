import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useBudgets } from "@/hooks/useBudgets";
import { useBudgetAlerts } from "@/hooks/useBudgetAlerts";
import type { UserSettings } from "@/types";

const GlobalBudgetAlerts = () => {
  const { user } = useAuth();
  const { budgets } = useBudgets();

  const settingsKey = user ? `pb-settings-${user.email}` : "pb-settings-guest";
  const savedSettings = useMemo(() => {
    const raw = localStorage.getItem(settingsKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Partial<UserSettings>;
    } catch {
      return null;
    }
  }, [settingsKey]);

  useBudgetAlerts(budgets, {
    enabled: savedSettings?.budgetAlerts ?? true,
    discordEnabled: savedSettings?.discordOverspendingAlerts ?? false,
    discordWebhookUrl: savedSettings?.discordWebhookUrl ?? "",
    userEmail: user?.email,
  });

  return null;
};

export default GlobalBudgetAlerts;
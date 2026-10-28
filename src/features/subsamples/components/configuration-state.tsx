"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { SettingsValues } from "@/features/settings/settings-model";
import type { Subsample } from "@/types/subsample";
export type ConfigKey = "redirects" | "server-to-server";
type Values = Record<string, string>;
type State = { inherited: boolean; values: Values };
type ConfigurationState = { securityRulesDefined: boolean; setSecurityRulesDefined: (defined: boolean) => void; sections: Record<ConfigKey, State>; defaults: Record<ConfigKey, Values>; toggle: (key: ConfigKey, inherited: boolean) => void; edit: (key: ConfigKey, field: string, value: string) => void };
const Context = createContext<ConfigurationState | null>(null);
export function ConfigurationStateProvider({ children, preferences, subsample }: { children: ReactNode; preferences: Pick<SettingsValues, "redirects" | "server-to-server">; subsample: Subsample }) {
  const defaults: Record<ConfigKey, Values> = { redirects: preferences.redirects, "server-to-server": { ...preferences["server-to-server"].endpoints, pixel: "" } };
  const [securityRulesDefined, setSecurityRulesDefined] = useState(false);
  const [sections, setSections] = useState<Record<ConfigKey, State>>(() => Object.fromEntries((["redirects", "server-to-server"] as const).map(key => {
    const setting = subsample.settingsOverrides?.[key === "server-to-server" ? "serverToServer" : key];
    return [key, { inherited: setting?.mode !== "override", values: { ...defaults[key], ...(setting?.mode === "override" ? Object.fromEntries(Object.entries(setting.value).filter((entry): entry is [string, string] => typeof entry[1] === "string")) : {}) } }];
  })) as Record<ConfigKey, State>);
  return <Context.Provider value={{ securityRulesDefined, setSecurityRulesDefined, sections, defaults, toggle: (key, inherited) => setSections(current => ({ ...current, [key]: { inherited, values: current[key].values } })), edit: (key, field, value) => setSections(current => current[key].inherited ? current : ({ ...current, [key]: { ...current[key], values: { ...current[key].values, [field]: value } } })) }}>{children}</Context.Provider>;
}
export function useConfigurationState() { const state = useContext(Context); if (!state) throw new Error("Configuration state requires the workspace provider."); return state; }

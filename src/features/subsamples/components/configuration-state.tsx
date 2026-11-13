"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { SettingsValues } from "@/features/settings/settings-model";
import { emptyRedirects, emptyEndpoints, type LinkConfigurationRequest } from "@/features/settings/integration-model";
import type { Subsample } from "@/types/subsample";

export type ConfigKey = "redirects" | "server-to-server";
export type ConfigurationValues = Record<string, string>;
export type ConfigurationSectionState = { inherited: boolean; values: ConfigurationValues };
type ConfigurationState = {
  securityRulesDefined: boolean;
  setSecurityRulesDefined: (defined: boolean) => void;
  sections: Record<ConfigKey, ConfigurationSectionState>;
  defaults: Record<ConfigKey, ConfigurationValues>;
  commit: (input: LinkConfigurationRequest) => void;
};
const Context = createContext<ConfigurationState | null>(null);

export function ConfigurationStateProvider({ children, preferences, subsample }: { children: ReactNode; preferences: Pick<SettingsValues, "redirects" | "server-to-server">; subsample: Subsample }) {
  const defaults = {
    redirects: { ...emptyRedirects(), ...preferences.redirects },
    "server-to-server": { ...emptyEndpoints(), ...preferences["server-to-server"].endpoints, method: "POST", pixel: "" },
  };
  const [securityRulesDefined, setSecurityRulesDefined] = useState(false);
  const [sections, setSections] = useState<Record<ConfigKey, ConfigurationSectionState>>(() => {
    const redirects = subsample.settingsOverrides?.redirects;
    const s2s = subsample.settingsOverrides?.serverToServer;
    return {
      redirects: { inherited: redirects?.mode !== "override", values: redirects?.mode === "override" ? { ...emptyRedirects(), ...redirects.value } : { ...defaults.redirects } },
      "server-to-server": { inherited: s2s?.mode !== "override", values: s2s?.mode === "override" ? { ...s2s.value } : { ...defaults["server-to-server"] } },
    };
  });
  const commit = (input: LinkConfigurationRequest) => {
    const { section, setting } = input;
    setSections(current => ({ ...current, [section]: {
      inherited: setting.mode === "inherit",
      values: setting.mode === "override" ? { ...setting.value } : { ...defaults[section] },
    } }));
  };
  return <Context.Provider value={{ securityRulesDefined, setSecurityRulesDefined, sections, defaults, commit }}>{children}</Context.Provider>;
}

export function useConfigurationState() {
  const state = useContext(Context);
  if (!state) throw new Error("Configuration state requires the workspace provider.");
  return state;
}

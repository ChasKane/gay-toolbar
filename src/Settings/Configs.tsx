import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useSettings, usePlugin } from "../StateManagement";
import { loadConfigsFromMarkdown, MarkdownConfig } from "../StateManagement";
import {
  formatConfigDisplayDate,
  formatConfigDisplayTime,
  prepareLoadedSavedConfig,
} from "../utils";
import DEFAULT_SETTINGS from "./DEFAULT_SETTINGS";
import SettingsHeader from "./SettingsHeader";

type ConfigsProps = {
  onBack: () => void;
};

/** Keeps a configs-screen crash from unmounting the whole toolbar. */
class ConfigsErrorBoundary extends Component<
  { onBack: () => void; children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Saved configs screen crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <SettingsHeader title="Saved Configs" onBack={this.props.onBack} />
          <div className="gay-settings-view-content">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
                flexDirection: "column",
                gap: "1rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem" }}>⚠️</div>
              <div style={{ fontWeight: "bold", color: "#d73a49" }}>
                Something went wrong loading saved configs.
              </div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                Your toolbar is still running — go back and try again, or report
                it at{" "}
                <a
                  href="https://github.com/ChasKane/gay-toolbar/issues/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007acc", textDecoration: "underline" }}
                >
                  GitHub Issues
                </a>
                .
              </div>
              <button className="mod-cta" onClick={this.props.onBack}>
                Back to settings
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Configs: React.FC<ConfigsProps> = ({ onBack }) => {
  const [addingConfig, setAddingConfig] = useState(false);
  const [configs, setConfigs] = useState<MarkdownConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { addConfig, deleteConfig, setSettings } = useSettings();
  const plugin = usePlugin();

  useEffect(() => {
    if (plugin) {
      setLoadingConfigs(true);
      setLoadError(null);
      const loadConfigs = async () => {
        try {
          const currentSettings = useSettings.getState();
          const loadedConfigs = await loadConfigsFromMarkdown(
            plugin,
            currentSettings.savedConfigsFilePath
          );
          setConfigs(loadedConfigs);
        } catch (error) {
          console.error("Error loading configs:", error);
          setConfigs([]);
          setLoadError(
            "Failed to load saved configs. Try restarting Obsidian."
          );
        } finally {
          setLoadingConfigs(false);
        }
      };
      void loadConfigs();
    }
  }, [plugin]);

  const handleSaveCurrent = async () => {
    flushSync(() => setAddingConfig(true));
    try {
      await addConfig();
      if (plugin) {
        const currentSettings = useSettings.getState();
        const loadedConfigs = await loadConfigsFromMarkdown(
          plugin,
          currentSettings.savedConfigsFilePath
        );
        setConfigs(loadedConfigs);
      }
    } catch (e) {
      console.error("Error taking screenshot:", e);
    } finally {
      setAddingConfig(false);
    }
  };

  const handleLoadConfig = (data: string) => {
    try {
      const parsedData = JSON.parse(data) as Record<string, unknown>;
      const current = useSettings.getState();
      setSettings(
        prepareLoadedSavedConfig(parsedData, current, DEFAULT_SETTINGS)
      );
    } catch (error) {
      console.error("Error parsing settings data:", error);
    }
  };

  return (
    <ConfigsErrorBoundary onBack={onBack}>
      <div>
        <SettingsHeader
          title="Saved Configs"
          onBack={onBack}
          ctaButton={
            <button
              disabled={addingConfig}
              className="mod-cta save-current-config-button"
              onClick={() => void handleSaveCurrent()}
            >
              {addingConfig ? "⏳" : "Save current"}
            </button>
          }
        />
        <div className="gay-settings-view-content">
          {loadingConfigs ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  border: "2px solid #ccc",
                  borderTop: "2px solid #007acc",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span>Loading saved configs...</span>
            </div>
          ) : loadError ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
                flexDirection: "column",
                gap: "1rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem" }}>⚠️</div>
              <div style={{ fontWeight: "bold", color: "#d73a49" }}>
                {loadError}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                If you think there should be configs here, try restarting
                Obsidian.
                <br />
                If the problem persists, please report it at{" "}
                <a
                  href="https://github.com/ChasKane/gay-toolbar/issues/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007acc", textDecoration: "underline" }}
                >
                  GitHub Issues
                </a>
                .
              </div>
            </div>
          ) : (configs || []).length === 0 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
                flexDirection: "column",
                gap: "1rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "2rem" }}>📁</div>
              <div style={{ fontWeight: "bold" }}>No saved configs yet</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>
                Click "Save current" to create your first saved configuration.
              </div>
            </div>
          ) : (
            (configs || []).map(({ id, date, screenshot, data, dateLabel }) => {
              const dateDisplay = formatConfigDisplayDate(date, dateLabel);
              const timeDisplay = formatConfigDisplayTime(date, dateLabel);
              return (
              <div key={id} className="gay-config-panel">
                <span>
                  <button
                    onClick={() => {
                      void (async () => {
                        await deleteConfig(id);
                        if (plugin) {
                          const currentSettings = useSettings.getState();
                          const loadedConfigs = await loadConfigsFromMarkdown(
                            plugin,
                            currentSettings.savedConfigsFilePath
                          );
                          setConfigs(loadedConfigs);
                        }
                      })();
                    }}
                  >
                    🗑️
                  </button>
                  <div>
                    {dateDisplay}
                    {timeDisplay ? (
                      <>
                        <br />
                        {timeDisplay}
                      </>
                    ) : null}
                  </div>
                  <button onClick={() => handleLoadConfig(data)}>Load</button>
                </span>
                <img src={screenshot} alt="" />
              </div>
              );
            })
          )}
        </div>
      </div>
    </ConfigsErrorBoundary>
  );
};

export default Configs;

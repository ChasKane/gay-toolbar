import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useSettings, usePlugin } from "../StateManagement";
import { loadConfigsFromMarkdown, MarkdownConfig } from "../StateManagement";
import SettingsHeader from "./SettingsHeader";

type ConfigsProps = {
  onBack: () => void;
};

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

  return (
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
            If you think there should be configs here, try restarting Obsidian.
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
        (configs || []).map(({ id, date, screenshot, data }) => (
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
                {new Intl.DateTimeFormat().format(new Date(date))}
                <br />
                {new Intl.DateTimeFormat(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                }).format(new Date(date))}
              </div>
              <button
                onClick={() => {
                  try {
                    const parsedData = JSON.parse(data);
                    const { configs: _c, ...settingsToLoad } = parsedData;
                    const current = useSettings.getState();
                    setSettings({
                      ...settingsToLoad,
                      customCommands: current.customCommands ?? [],
                      presetColors: current.presetColors ?? [],
                      savedConfigsFilePath: current.savedConfigsFilePath,
                    });
                  } catch (error) {
                    console.error("Error parsing settings data:", error);
                  }
                }}
              >
                Load
              </button>
            </span>
            <img src={screenshot} alt="" />
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default Configs;

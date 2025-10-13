import React, { Fragment, useEffect, useRef, useState } from "react";
import ReactDOM, { flushSync } from "react-dom";
import { useEditor, useSettings, usePlugin } from "../StateManagement";
import { isObjectBindingPattern } from "typescript";
import { loadConfigsFromMarkdown, MarkdownConfig } from "../StateManagement";

const ConfigsModal = () => {
  const modalOverlayRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [addingConfig, setAddingConfig] = useState(false);
  const [configs, setConfigs] = useState<MarkdownConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { addConfig, deleteConfig, setSettings } = useSettings();
  const plugin = usePlugin();

  // Load configs from markdown file when modal opens
  useEffect(() => {
    if (isOpen && plugin) {
      setLoadingConfigs(true);
      setLoadError(null);
      const loadConfigs = async () => {
        try {
          // Always use the current settings path (in case user changed it)
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
      loadConfigs();
    } else if (!isOpen) {
      // Clear configs from memory when modal closes
      setConfigs([]);
      setLoadingConfigs(false);
      setLoadError(null);
    }
  }, [isOpen, plugin]);

  return isOpen ? (
    ReactDOM.createPortal(
      <dialog
        className="gay-modal-overlay"
        open={isOpen}
        ref={modalOverlayRef}
        onClick={(e) => {
          modalOverlayRef.current === e.target && setIsOpen(false);
        }}
      >
        <div className="gay-modal">
          <div className="gay-config-header">
            <h2>Saved Configs</h2>
            <button
              disabled={addingConfig}
              className="mod-cta"
              onClick={async () => {
                flushSync(() => setAddingConfig(true));
                try {
                  await addConfig();
                  // Reload configs after adding
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
              }}
            >
              {addingConfig ? "⏳" : "Save current"}
            </button>
          </div>
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
            (configs || []).map(({ id, date, screenshot, data }) => (
              <div key={id} className="gay-config-panel">
                <span>
                  <button
                    onClick={async () => {
                      await deleteConfig(id);
                      // Reload configs after deleting
                      if (plugin) {
                        const currentSettings = useSettings.getState();
                        const loadedConfigs = await loadConfigsFromMarkdown(
                          plugin,
                          currentSettings.savedConfigsFilePath
                        );
                        setConfigs(loadedConfigs);
                      }
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
                        // Remove configs field if it exists (now stored in markdown file)
                        const { configs, ...settingsToLoad } = parsedData;
                        console.log("Loading settings:", settingsToLoad);
                        setSettings(settingsToLoad);
                        console.log("Settings loaded successfully");
                      } catch (error) {
                        console.error("Error parsing settings data:", error);
                      }
                    }}
                  >
                    Load
                  </button>
                </span>
                <img src={screenshot} />
              </div>
            ))
          )}
        </div>
      </dialog>,
      document.body
    )
  ) : (
    <>
      <label style={{ paddingRight: "8px" }}>Saved Configs</label>
      <button onClick={() => setIsOpen(true)}>View</button>
    </>
  );
};

export default ConfigsModal;

import React, { useEffect, useRef, useState } from "react";
import { usePlugin, useSettings } from "../StateManagement";
import { Notice, setIcon } from "obsidian";
import { CustomCommand } from "../types";
import SettingsHeader from "./SettingsHeader";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

type CommandEditorProps = {
  onBack: () => void;
};

type ConsoleEntry = { type: "log" | "warn" | "error"; args: unknown[] };

const CommandEditor: React.FC<CommandEditorProps> = ({
  onBack,
}) => {
  const [commandName, setCommandName] = useState("");
  const [commandId, setCommandId] = useState("");
  const [commandContent, setCommandContent] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleEntry[]>([]);
  const [highlightedHtml, setHighlightedHtml] = useState("");
  const plugin = usePlugin();
  const { customCommands, setSettings } = useSettings();
  const codePreRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const html = Prism.highlight(
        commandContent || " ",
        Prism.languages.javascript,
        "javascript"
      );
      setHighlightedHtml(html);
    } catch {
      setHighlightedHtml(escapeHtml(commandContent || ""));
    }
  }, [commandContent]);

  const clearFields = () => {
    setCommandName("");
    setCommandId("");
    setCommandContent("");
    setTestResult(null);
    setConsoleLogs([]);
  };

  const handleTest = () => {
    if (!plugin) {
      setTestResult("Error: Plugin not available");
      return;
    }
    if (!commandContent.trim()) {
      setTestResult("");
      setConsoleLogs([]);
      return;
    }
    const logs: ConsoleEntry[] = [];
    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    const capture = (type: "log" | "warn" | "error") => (...args: unknown[]) => {
      logs.push({ type, args: [...args] });
      if (type === "log") origLog.apply(console, args);
      else if (type === "warn") origWarn.apply(console, args);
      else origError.apply(console, args);
    };
    console.log = capture("log");
    console.warn = capture("warn");
    console.error = capture("error");
    try {
      const executeCode = new Function(
        "plugin",
        "app",
        "console",
        commandContent
      );
      executeCode(plugin, plugin.app, console);
      setTestResult("✓ Command executed successfully!");
      setConsoleLogs(logs);
    } catch (error) {
      setTestResult(`Error: ${(error as Error).message}`);
      setConsoleLogs(logs);
    } finally {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
    }
  };

  const performSave = () => {
    if (!plugin) return;
    const newCommand: CustomCommand = {
      name: commandName.trim(),
      id: commandId.trim(),
      content: commandContent.trim(),
    };
    const existingIndex = customCommands.findIndex(
      (cmd) => cmd.id === commandId.trim()
    );
    try {
      const executeCode = new Function(
        "plugin",
        "app",
        "console",
        commandContent.trim()
      ) as (plugin: unknown, app: unknown, console: unknown) => void;
      // @ts-ignore
      plugin.app.commands.addCommand({
        id: commandId.trim(),
        name: commandName.trim(),
        callback: () => {
          executeCode(plugin, plugin.app, console);
        },
      });
      const updatedCommands =
        existingIndex >= 0
          ? (() => {
              const next = [...customCommands];
              next[existingIndex] = newCommand;
              return next;
            })()
          : [...customCommands, newCommand];
      setSettings({ customCommands: updatedCommands });
      new Notice(`Command ${commandName.trim()} saved!`);
      clearFields();
    } catch (error) {
      new Notice(`Error adding command: ${(error as Error).message}`);
    }
  };

  const handleSave = () => {
    if (!plugin) {
      setTestResult("Error: Plugin not available");
      return;
    }
    if (!commandName.trim() || !commandId.trim() || !commandContent.trim()) {
      setTestResult("Cannot save. Please fill in all fields.");
      return;
    }
    try {
      new Function("plugin", "app", "console", commandContent);
    } catch (error) {
      setTestResult(`Error: Invalid JavaScript code - ${(error as Error).message}`);
      return;
    }
    const existingIndex = customCommands.findIndex(
      (cmd) => cmd.id === commandId.trim()
    );
    if (existingIndex >= 0) {
      const existingName = customCommands[existingIndex].name;
      const overwrite = confirm(
        `A command with ID "${commandId.trim()}" already exists (${existingName}). Overwrite it?`
      );
      if (!overwrite) return;
    }
    performSave();
  };

  const handleDeleteCommand = (id: string) => {
    setSettings({
      customCommands: customCommands.filter((cmd) => cmd.id !== id),
    });
    new Notice(
      "Command deleted. Restart Obsidian to remove the command from memory."
    );
  };

  const handleRowClick = (cmd: CustomCommand) => {
    setCommandName(cmd.name);
    setCommandId(cmd.id);
    setCommandContent(cmd.content);
    setTestResult(null);
    setConsoleLogs([]);
  };

  return (
    <div>
      <SettingsHeader title="Command editor" onBack={onBack} />
      <div className="gay-settings-view-content">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Command Name
            </label>
            <input
              type="text"
              value={commandName}
              onChange={(e) => setCommandName(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
              placeholder='If you enter "foo", the command name will be "Gay Toolbar: foo"'
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Command ID
            </label>
            <input
              type="text"
              value={commandId}
              onChange={(e) => setCommandId(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
              placeholder='If you enter "foo", the command id will be "gay-toolbar:foo"'
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
              }}
            >
              Command Content
            </label>
            <label
              style={{
                fontSize: "x-small",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Enter JavaScript code (not TypeScript). You can access{" "}
              <code>plugin</code>, <code>app</code>, and <code>console</code>.
              Shift+Enter to test. Use <code>console.log()</code> and run Test to
              see output below; for full DevTools use Help → Developer tools.
            </label>
            <div className="gay-command-editor-wrap" style={{ position: "relative", minHeight: "200px" }}>
              <pre
                ref={codePreRef}
                className="gay-command-editor-pre"
                aria-hidden
                style={{
                  margin: 0,
                  padding: "0.5rem",
                  minHeight: "200px",
                  overflow: "auto",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  fontFamily: "var(--font-monospace), monospace",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  whiteSpace: "pre",
                  wordWrap: "normal",
                  pointerEvents: "none",
                  border: "1px solid var(--background-modifier-border)",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              >
                <code
                  className="language-javascript"
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                />
              </pre>
              <textarea
                ref={textareaRef}
                value={commandContent}
                onChange={(e) => setCommandContent(e.target.value)}
                onScroll={() => {
                  if (codePreRef.current && textareaRef.current) {
                    codePreRef.current.scrollTop = textareaRef.current.scrollTop;
                    codePreRef.current.scrollLeft = textareaRef.current.scrollLeft;
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.shiftKey) handleTest();
                }}
                className="gay-command-editor-textarea"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                  margin: 0,
                  padding: "0.5rem",
                  minHeight: "200px",
                  resize: "none",
                  fontFamily: "var(--font-monospace), monospace",
                  fontSize: "13px",
                  lineHeight: 1.5,
                  background: "transparent",
                  color: "transparent",
                  caretColor: "var(--text-normal)",
                  border: "1px solid var(--background-modifier-border)",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
                placeholder="new Notice('you can write javascript!')"
                spellCheck={false}
              />
            </div>
          </div>
          {testResult !== null && testResult !== "" && (
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "4px",
                backgroundColor: testResult.startsWith("Error") ? "#fee" : "#efe",
                color: testResult.startsWith("Error") ? "#c33" : "#3c3",
                fontSize: "0.9rem",
              }}
            >
              {testResult}
            </div>
          )}
          {consoleLogs.length > 0 && (
            <div
              className="gay-command-console"
              style={{
                padding: "0.75rem",
                borderRadius: "4px",
                backgroundColor: "var(--background-secondary)",
                border: "1px solid var(--background-modifier-border)",
                fontSize: "0.85rem",
                fontFamily: "var(--font-monospace), monospace",
                maxHeight: "160px",
                overflowY: "auto",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Console output</div>
              {consoleLogs.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    color:
                      entry.type === "error"
                        ? "var(--text-error)"
                        : entry.type === "warn"
                          ? "var(--color-orange)"
                          : "var(--text-muted)",
                    marginBottom: "0.2rem",
                  }}
                >
                  <span style={{ opacity: 0.8 }}>[{entry.type}] </span>
                  {entry.args.map((arg, j) =>
                    typeof arg === "string"
                      ? arg
                      : JSON.stringify(arg)
                  ).join(" ")}
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button onClick={clearFields}>Clear</button>
            <button onClick={handleTest}>Test</button>
            <button onClick={handleSave} className="mod-cta">
              Save
            </button>
          </div>

          {customCommands.length > 0 && (
            <div
              style={{
                marginTop: "2rem",
                paddingTop: "1rem",
                borderTop: "1px solid #ccc",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>Saved Commands</h3>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#666",
                  marginBottom: "1rem",
                }}
              >
                Click a row to load it into the form above.
              </div>
              <table
                style={{
                  width: "100%",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #ccc" }}>
                    <th style={{ textAlign: "left", padding: "0.5rem", fontWeight: "bold" }}>
                      Name
                    </th>
                    <th style={{ textAlign: "left", padding: "0.5rem", fontWeight: "bold" }}>
                      ID
                    </th>
                    <th style={{ textAlign: "left", padding: "0.5rem", fontWeight: "bold" }}>
                      Content Preview
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "0.5rem",
                        fontWeight: "bold",
                        width: "80px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customCommands.map((cmd) => (
                    <CommandRow
                      key={cmd.id}
                      cmd={cmd}
                      onLoad={handleRowClick}
                      onDelete={handleDeleteCommand}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommandRow: React.FC<{
  cmd: CustomCommand;
  onLoad: (cmd: CustomCommand) => void;
  onDelete: (id: string) => void;
}> = ({ cmd, onLoad, onDelete }) => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (deleteButtonRef.current) setIcon(deleteButtonRef.current, "trash-2");
  }, []);

  return (
    <tr
      onClick={() => onLoad(cmd)}
      style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
    >
      <td style={{ padding: "0.5rem", fontSize: "x-small" }}>{cmd.name}</td>
      <td style={{ padding: "0.5rem" }}>
        <code style={{ fontSize: "x-small" }}>{cmd.id}</code>
      </td>
      <td style={{ padding: "0.5rem", width: "35%", maxWidth: 0 }}>
        <code
          style={{
            fontSize: "x-small",
            color: "#666",
            display: "block",
            width: "100%",
            minWidth: "0px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={cmd.content}
        >
          {cmd.content.substring(0, 50)}
          {cmd.content.length > 50 ? "..." : ""}
        </code>
      </td>
      <td
        style={{
          padding: "0.5rem",
          textAlign: "center",
          verticalAlign: "middle",
          width: "2.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }} onClick={(e) => e.stopPropagation()}>
          <button
            ref={deleteButtonRef}
            className="mod-warning"
            style={{
              width: "2rem",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
              fontSize: "1.1rem",
              padding: 0,
            }}
            onClick={() => onDelete(cmd.id)}
            aria-label="Delete command"
          />
        </div>
      </td>
    </tr>
  );
};

export default CommandEditor;

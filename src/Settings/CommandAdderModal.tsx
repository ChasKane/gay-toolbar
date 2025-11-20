import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { usePlugin, useSettings } from "../StateManagement";
import { Notice, setIcon } from "obsidian";
import { CustomCommand } from "../types";

const CommandAdderModal = () => {
  const modalOverlayRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [commandName, setCommandName] = useState("");
  const [commandId, setCommandId] = useState("");
  const [commandContent, setCommandContent] = useState("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const plugin = usePlugin();
  const { customCommands, setSettings } = useSettings();

  const clearFields = () => {
    setCommandName("");
    setCommandId("");
    setCommandContent("");
    setTestResult(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    clearFields();
  };

  const handleTest = () => {
    if (!plugin) {
      setTestResult("Error: Plugin not available");
      return;
    }

    if (!commandContent.trim()) {
      setTestResult("");
      return;
    }

    try {
      const executeCode = new Function(
        "plugin",
        "app",
        "console",
        commandContent
      );
      executeCode(plugin, plugin.app, console);
      setTestResult("✓ Command executed successfully!");
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
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
      setTestResult(`Error: Invalid JavaScript code - ${error.message}`);
      return;
    }

    // Check if command ID already exists
    const existingIndex = customCommands.findIndex(
      (cmd) => cmd.id === commandId
    );

    const newCommand: CustomCommand = {
      name: commandName.trim(),
      id: commandId.trim(),
      content: commandContent.trim(),
    };

    try {
      const executeCode = new Function(
        "plugin",
        "app",
        "console",
        commandContent.trim()
      ) as (plugin: any, app: any, console: any) => void;

      console.log("Adding command", commandId.trim(), commandName.trim());
      // @ts-ignore | app.commands exists; not sure why it's not in the API...
      plugin.app.commands.addCommand({
        id: commandId.trim(),
        name: commandName.trim(),
        callback: () => {
          executeCode(plugin, plugin.app, console);
        },
      });
      let updatedCommands: CustomCommand[];
      if (existingIndex >= 0) {
        // Update existing command
        updatedCommands = [...customCommands];
        updatedCommands[existingIndex] = newCommand;
      } else {
        // Add new command
        updatedCommands = [...customCommands, newCommand];
      }

      setSettings({ customCommands: updatedCommands });
      new Notice(`Command ${commandName.trim()} saved!`);
      clearFields();
    } catch (error) {
      new Notice(`Error adding command: ${error.message}`);
    }
  };

  const handleDeleteCommand = (commandId: string) => {
    const updatedCommands = customCommands.filter(
      (cmd) => cmd.id !== commandId
    );
    setSettings({ customCommands: updatedCommands });
    new Notice(
      "Command deleted. Restart Obsidian to remove the command from memory."
    );
  };

  const handleRowClick = (cmd: CustomCommand) => {
    setCommandName(cmd.name);
    setCommandId(cmd.id);
    setCommandContent(cmd.content);
    setTestResult(null);
  };

  return isOpen ? (
    ReactDOM.createPortal(
      <dialog
        className="gay-modal-overlay"
        open={isOpen}
        ref={modalOverlayRef}
        onClick={(e) => {
          if (modalOverlayRef.current === e.target) {
            handleCancel();
          }
        }}
      >
        <div className="gay-modal">
          <div className="gay-config-header">
            <h2>Command editor</h2>
          </div>
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
                Enter JavaScript code to execute when the command is run. You
                can access the `plugin`, `app`, and `console` objects.
                Shift+Enter to test the command.
              </label>
              <textarea
                value={commandContent}
                onChange={(e) => setCommandContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.shiftKey) {
                    handleTest();
                  }
                }}
                style={{
                  width: "100%",
                  minHeight: "200px",
                  padding: "0.5rem",
                  resize: "vertical",
                }}
                placeholder="new Notice('you can write javascript!')"
              />
            </div>
            {testResult && (
              <div
                style={{
                  padding: "0.75rem",
                  borderRadius: "4px",
                  backgroundColor: testResult.startsWith("Error")
                    ? "#fee"
                    : "#efe",
                  color: testResult.startsWith("Error") ? "#c33" : "#3c3",
                  fontSize: "0.9rem",
                }}
              >
                {testResult}
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
              <button onClick={handleCancel}>Cancel</button>
              <button onClick={handleTest}>Test</button>
              <button onClick={handleSave} className="mod-cta">
                Save
              </button>
            </div>

            {customCommands.length > 0 && (
              <>
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
                        <th
                          style={{
                            textAlign: "left",
                            padding: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          Name
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          ID
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
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
              </>
            )}
          </div>
        </div>
      </dialog>,
      document.body
    )
  ) : (
    <>
      <label style={{ paddingRight: "8px" }}>
        Consult with the Great and Wise command adder
      </label>
      <button onClick={() => setIsOpen(true)}>Open</button>
    </>
  );
};

const CommandRow: React.FC<{
  cmd: CustomCommand;
  onLoad: (cmd: CustomCommand) => void;
  onDelete: (id: string) => void;
}> = ({ cmd, onLoad, onDelete }) => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (deleteButtonRef.current) {
      setIcon(deleteButtonRef.current, "trash-2");
    }
  }, []);

  return (
    <tr
      onClick={() => onLoad(cmd)}
      style={{
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <td style={{ padding: "0.5rem", fontSize: "x-small" }}>{cmd.name}</td>
      <td style={{ padding: "0.5rem" }}>
        <code style={{ fontSize: "x-small" }}>{cmd.id}</code>
      </td>
      <td
        style={{
          padding: "0.5rem",
          width: "35%",
          maxWidth: 0,
        }}
      >
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
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

export default CommandAdderModal;

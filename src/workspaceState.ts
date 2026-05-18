export type CommandLike = {
  id?: string;
  name?: string;
};

export const TAB_OVERVIEW_COMMAND_ID = "app:show-tab-switcher";

export const isTabOverviewCommand = (command?: CommandLike | null) => {
  const id = command?.id ?? "";
  const name = command?.name ?? "";

  return (
    id === TAB_OVERVIEW_COMMAND_ID ||
    /tab[-:]?overview/i.test(id) ||
    /show[-:]?tabs?/i.test(id) ||
    /show\s+tab\s+overview/i.test(name) ||
    /tab\s+overview/i.test(name)
  );
};

export const getCommand = (plugin: any, commandId?: string | null) => {
  if (!commandId) return null;
  return plugin?.app?.commands?.commands?.[commandId] ?? { id: commandId };
};

const isMainWorkspaceLeaf = (app: any, leaf: any) => {
  let parent = leaf?.parent;
  while (parent) {
    if (parent === app?.workspace?.rootSplit) return true;
    parent = parent.parent;
  }
  return false;
};

export const getMainTabCount = (app: any) => {
  let count = 0;

  app?.workspace?.iterateAllLeaves?.((leaf: any) => {
    if (isMainWorkspaceLeaf(app, leaf)) count += 1;
  });

  return count;
};

export const renderTabCountOnIcon = (
  container: HTMLElement | null,
  tabCount: number
) => {
  if (!container) return;

  container
    .querySelectorAll(".gay-tab-count-icon-label, [data-gay-tab-count]")
    .forEach((el) => el.remove());

  const svg = container.querySelector("svg");
  if (!svg) {
    container.createSpan({
      cls: "gay-tab-count-icon-label",
      text: String(tabCount),
    });
    return;
  }

  const viewBox = svg.viewBox.baseVal;
  const width = viewBox?.width || 24;
  const height = viewBox?.height || 24;
  const x = (viewBox?.x || 0) + width / 2;
  const y = (viewBox?.y || 0) + height / 2;

  const doc = svg.ownerDocument;
  const text = doc.createElementNS("http://www.w3.org/2000/svg", "text");
  text.dataset.gayTabCount = "true";
  text.textContent = String(tabCount);
  text.setAttribute("x", String(x));
  text.setAttribute("y", String(y));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "central");
  text.setAttribute("fill", "currentColor");
  text.setAttribute("font-size", String(height * 0.42));
  text.setAttribute("font-weight", "700");
  text.setAttribute("pointer-events", "none");

  svg.appendChild(text);
};

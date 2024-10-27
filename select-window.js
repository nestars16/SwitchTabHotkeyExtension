document.addEventListener("DOMContentLoaded", async () => {
  const currentWindow = await chrome.windows.getCurrent();

  const windows = (await chrome.windows.getAll()).filter(
    (window) => window.id !== currentWindow.id,
  );

  const windowOptionContainer = document.getElementById("window-list");

  if (windows.length === 0) {
    const emptyText = document.createElement("p");
    emptyText.textContent = "There is only one window open, use Alt+W instead!";
    windowOptionContainer.appendChild(emptyText);
    return;
  }

  const windowItems = document.createElement("div");
  windowItems.classList.add("window-list-container");
  const tableRow = await Promise.all(
    windows.map(async (windowObj) => {
      const tableRow = await createRowFromWindowObject(windowObj);
      return tableRow;
    }),
  );
  for (const row of tableRow) {
    windowItems.appendChild(row);
  }
  windowOptionContainer.appendChild(windowItems);
});

async function createRowFromWindowObject(windowObj) {
  const { id } = windowObj;
  const newWindowTabs = await chrome.tabs.query({ windowId: id });
  const newWindowTabName = String(newWindowTabs[0].title);

  if (!newWindowTabName) {
    newWindowTabName = String(id);
  }
  const row = document.createElement("div");
  row.classList.add("window-list-item");
  const buttonContainer = document.createElement("div");
  const button = document.createElement("button");
  button.onclick = () => {
    notifyServiceWorker(id);
  };
  buttonContainer.appendChild(button);
  row.appendChild(buttonContainer);
  const p = document.createElement("span");
  p.textContent = newWindowTabName;
  row.appendChild(p);
  return row;
}

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function notifyServiceWorker(windowId) {
  const currentTab = await getCurrentTab();
  if (!currentTab) {
    return;
  }
  const message = {
    type: "existing",
    windowId: windowId,
    tabId: currentTab.id,
  };

  console.log(`Sending message ${message}`);
  chrome.runtime.sendMessage(message);
}

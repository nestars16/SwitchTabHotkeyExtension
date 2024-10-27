async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function moveTabOutToNewWindow(tab) {
  try {
    await chrome.windows.create({
      focused: true,
      tabId: tab.id,
      type: "normal",
    });
  } catch (error) {
    console.error(`Failed to create window ${error}`);
  }
}

chrome.runtime.onMessage.addListener(
  async (message, _sender, _sendResponse) => {
    const { windowId, tabId } = message;

    try {
      await chrome.tabs.move(tabId, {
        index: -1,
        windowId: windowId,
      });
    } catch (error) {
      console.error(`Failed to move to window ${error}`);
    }
  },
);

chrome.commands.onCommand.addListener(async (command) => {
  const currentTab = await getCurrentTab();
  if (!currentTab) {
    return;
  }
  switch (command) {
    case "move_tab_out_new":
      await moveTabOutToNewWindow(currentTab);
      break;
  }
});

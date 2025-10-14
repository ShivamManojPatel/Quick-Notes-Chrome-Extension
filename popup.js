document.addEventListener("DOMContentLoaded", () => {
  const note = document.getElementById("note");
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");

  // Load saved note
  chrome.storage.local.get("quickNote", (data) => {
    if (data.quickNote) note.value = data.quickNote;
  });

  saveBtn.addEventListener("click", async () => {
    const content = note.value.trim();
    if (!content) {
      alert("Please write something before saving!");
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentUrl = tab?.url || "Unknown URL";
      const fileContent = `Website: ${currentUrl}\n\n${content}`;

      await chrome.storage.local.set({ quickNote: content });

      const timestamp = new Date().toISOString().replace(/T/, "-").replace(/:/g, "-").replace(/\..+/, "");
      const filename = `quick-note-${timestamp}.txt`;

      const blob = new Blob([fileContent], { type: "text/plain" });
      const fileUrl = URL.createObjectURL(blob);

      chrome.downloads.download({ url: fileUrl, filename, saveAs: true }, () => {
        URL.revokeObjectURL(fileUrl);
        alert("Note saved successfully!");
      });

    } catch (err) {
      console.error(err);
      alert("Error saving note. Check console for details.");
    }
  });

  clearBtn.addEventListener("click", async () => {
    note.value = "";
    await chrome.storage.local.remove("quickNote");
    alert("Note cleared!");
  });
});
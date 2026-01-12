import { saveRecording } from "~lib/indexeddb";

console.log("昭景启动成功");

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SAVE_RECORDING") {
    console.log("收到录制数据，准备保存到 IndexedDB");

    saveRecording(message.data)
      .then(() => {
        console.log("录制数据已成功保存到 IndexedDB");
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("保存录制数据失败:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // 保持消息通道开放以支持异步响应
  }
});

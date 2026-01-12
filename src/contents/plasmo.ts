import type { PlasmoCSConfig } from "plasmo";
import type { Action } from "~common";
import { type eventWithTime } from "@rrweb/types";
import { record } from "rrweb";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
};

let flag = false;
// 录制事件列表
const records: eventWithTime[] = [];
// 录制停止函数
let stopFn: (() => void) | null = null;

const startRecord = () => {
  // 开始录制
  stopFn = record({
    emit(event) {
      records.push(event);
    },
  });
};

// 停止录制
const stopRecord = async () => {
  // 停止录制
  if (stopFn) {
    stopFn();
    stopFn = null;

    // 发送数据到 background 保存
    if (records.length > 0) {
      const recordingData = {
        timestamp: Date.now(),
        url: window.location.href,
        records: [...records],
        duration:
          records.length > 0
            ? records[records.length - 1].timestamp - records[0].timestamp
            : 0,
      };

      chrome.runtime.sendMessage({
        action: "SAVE_RECORDING",
        data: recordingData,
      });
    }

    records.length = 0;
  }
};

// 录制状态切换
const toggleRecord = async () => {
  flag = !flag;
  if (flag) {
    startRecord();
  } else {
    await stopRecord();
  }
};

chrome.runtime.onMessage.addListener(
  (message: { action: Action }, sender, sendResponse) => {
    switch (message.action) {
      case "GET":
        sendResponse(flag);
        break;
      case "SET":
        toggleRecord().then(() => {
          sendResponse(flag);
        });
        return true; // 异步响应
        break;
      default:
        break;
    }
  }
);

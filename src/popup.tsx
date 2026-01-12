import { Button } from "~components/ui/button";
import "./style.css";
import { useEffect, useState, type FC } from "react";
import type { Action } from "~common";
import { Card } from "~components/ui/card";

const IndexPopup: FC = () => {
  const [flag, setFlag] = useState(false);
  const [curTab, setCurTab] = useState<chrome.tabs.Tab | undefined>();

  const init = async () => {
    const tab =( await chrome.tabs.query({
      active: true,
      currentWindow: true,
    }))[0];
    if (tab) {
      setCurTab(tab);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (curTab?.id) {
      toggle("GET");
    }
  }, [curTab]);

  const toggle = (action: Action) => {
    if (!curTab?.id) {
      console.warn("未找到当前标签页");
      return;
    }

    chrome.tabs
      .sendMessage(curTab.id, {
        action,
      })
      .then((res) => {
        setFlag(res);
        console.log(res);
      });
  };

  return (
    <Card className="w-60 rounded-lg shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          昭景
        </h2>

        <Button
          onClick={() => toggle("SET")}
          className={`w-full py-3 font-semibold transition-all duration-300 ${
            flag
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          {flag ? "停止录制" : "开始录制"}
        </Button>

        <Button
          onClick={() => chrome.runtime.openOptionsPage()}
          variant="outline"
          className="w-full mt-3 py-3"
        >
          查看录制记录
        </Button>
      </div>
    </Card>
  );
};

export default IndexPopup;

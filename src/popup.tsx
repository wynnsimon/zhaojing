import { Button } from "~components/ui/button";
import "@/style/style.css";
import { useEffect, useState, type FC } from "react";
import type { Action } from "~common";
import { Card } from "~components/ui/card";
import { Speaker, SquareArrowOutUpRight } from "lucide-react";
import { ButtonGroup } from "~components/ui/button-group";

const IndexPopup: FC = () => {
  const [flag, setFlag] = useState(false);
  const [curTab, setCurTab] = useState<chrome.tabs.Tab | undefined>();

  const init = async () => {
    const tab = (
      await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
    )[0];
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
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            ZhaoJing
          </p>
          <h4 className="text-xl font-semibold tracking-tight text-slate-900">
            昭景-Web录制与回放
          </h4>
        </div>

        <ButtonGroup  orientation="vertical" className="mt-4 flex w-full">
          <Button
            onClick={() => toggle("SET")}
            className={`${
              flag
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            <Speaker />{flag ? "停止录制" : "开始录制"}
          </Button>

          <Button
            onClick={() => chrome.runtime.openOptionsPage()}
            variant="outline"
          >
            <SquareArrowOutUpRight />
            查看记录
          </Button>
        </ButtonGroup>
      </div>
    </Card>
  );
};

export default IndexPopup;

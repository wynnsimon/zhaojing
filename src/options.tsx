import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~components/ui/card";
import { RRWebPlayer } from "~components/RRWebPlayer";
import {
  getAllRecordings,
  deleteRecording,
  type Recording,
} from "~lib/indexeddb";
import "@/style/style.css";
import "@/style/options.css";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~components/ui/resizable";
import RecordList from "~components/RecordList";
import { Toaster } from "~components/ui/sonner";
import { formatDate } from "~lib/utils";

function IndexOptions() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const loadRecordings = async () => {
    setLoading(true);
    try {
      const data = await getAllRecordings();
      console.log("获取到的录制记录:", data);
      setRecordings(data.reverse()); // 最新的在前面
    } catch (error) {
      console.error("加载录制记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecordings();
  }, []);

  const handleDelete = async (record: Recording) => {
    try {
      await deleteRecording(record.id);
      if (selectedRecording?.id === record.id) {
        setSelectedRecording(null);
      }
      await loadRecordings();
    } catch (error) {
      console.error("删除失败:", error);
      throw error;
    }
  };

  const handleDownload = async (record: Recording) => {
    const name = `record_${record.id}_${new Date(record.timestamp)
      .toISOString()
      .replace(/[:.]/g, "-")}.json`;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            id: record.id,
            timestamp: record.timestamp,
            url: record.url,
            duration: record.duration,
            records: record.records,
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <ResizablePanelGroup className="border rounded-lg w-full h-full">
        <ResizablePanel defaultSize={20} className="flex flex-col h-full">
          <div className="flex items-center justify-between min-h-[3.25rem] px-4 border-b bg-slate-50">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Records
              </p>
              <h4 className="text-xl font-semibold tracking-tight text-slate-900">
                录制列表
              </h4>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-2">
            <RecordList
              records={recordings}
              className="h-full w-full"
              onSelect={setSelectedRecording}
              onDelete={handleDelete}
              onDownload={handleDownload}
              selectedId={selectedRecording?.id ?? null}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Replay
                </p>
                {selectedRecording
                  ? `播放：${formatDate(selectedRecording.timestamp)}`
                  : "录制回放"}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)]">
              <RRWebPlayer events={selectedRecording?.records || []} />
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster />
    </>
  );
}

export default IndexOptions;

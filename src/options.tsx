import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~components/ui/card";
import { RRWebPlayer } from "~components/RRWebPlayer";
import {
  getAllRecordings,
  deleteRecording,
  type Recording,
  saveRecording,
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
import { Input } from "~components/ui/input";
import { Label } from "~components/ui/label";
import { toast } from "sonner";

function IndexOptions() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );
  const loadRecordings = async () => {
    try {
      const data = await getAllRecordings();
      console.log("获取到的录制记录:", data);
      setRecordings(data.reverse()); // 最新的在前面
    } catch (error) {
      console.error("加载录制记录失败:", error);
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
    const name = `record_${record.url}_${new Date(record.timestamp)
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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // 验证必要字段
      if (!jsonData.timestamp || !jsonData.url || !jsonData.records) {
        console.error("上传的文件格式不正确");
        return;
      }

      // 创建新记录（不包含ID，由数据库生成）
      const newRecord = {
        timestamp: jsonData.timestamp,
        url: jsonData.url,
        duration: jsonData.duration,
        records: jsonData.records,
      };

      // 保存到IndexedDB
      await saveRecording(newRecord);

      // 重新加载录制列表
      await loadRecordings();

      // 不需要手动设置selectedRecording，loadRecordings后recordings已更新
      // 如果想选中新记录，可以基于时间戳等信息查找最新记录
      // 这里简化处理：不清除选择，让用户自行选择

      toast.success(`${file.name}上传成功`);
    } catch (error) {
      console.error("上传失败:", error);
      toast.error(`${file.name}上传失败`);
    } finally {
    }
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
          <div className="m-4">
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label htmlFor="json">上传记录文件</Label>
              <Input
                id="json"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
              />
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

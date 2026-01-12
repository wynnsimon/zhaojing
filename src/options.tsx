import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~components/ui/card";
import { Button } from "~components/ui/button";
import { RRWebPlayer } from "~components/RRWebPlayer";
import {
  getAllRecordings,
  deleteRecording,
  type Recording,
} from "~lib/indexeddb";
import "./style.css";

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

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这条录制记录吗？")) return;

    try {
      await deleteRecording(id);
      if (selectedRecording?.id === id) {
        setSelectedRecording(null);
      }
      await loadRecordings();
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  const formatDuration = (duration: number) => {
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧列表 */}
      <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">录制记录</h1>

          {loading ? (
            <div className="text-center text-gray-500 py-8">加载中...</div>
          ) : recordings.length === 0 ? (
            <div className="text-center text-gray-500 py-8">暂无录制记录</div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording) => (
                <Card
                  key={recording.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRecording?.id === recording.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedRecording(recording)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {formatDate(recording.timestamp)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-gray-600 truncate">
                      {recording.url}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        时长：{formatDuration(recording.duration)}
                      </span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(recording.id!);
                        }}
                      >
                        删除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧播放器 */}
      <div className="flex-1 p-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>
              {selectedRecording
                ? `播放：${formatDate(selectedRecording.timestamp)}`
                : "录制回放"}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)]">
            <RRWebPlayer
              events={selectedRecording?.records || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default IndexOptions;

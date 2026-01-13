import type { FC, MouseEvent } from "react";
import { useState } from "react";
import { ScrollArea } from "~components/ui/scroll-area";
import { Separator } from "~components/ui/separator";
import { Button } from "~components/ui/button";
import { ButtonGroup } from "~components/ui/button-group";
import { FileDown, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { toast } from "sonner";
import type { Recording } from "~lib/indexeddb";
import { formatDate, formatDuration } from "@/lib/utils";

const RecordItem: FC<{
  record: Recording;
  onSelect: (record: Recording) => void;
  onDelete: (record: Recording) => void | Promise<void>;
  onDownload: (record: Recording) => void | Promise<void>;
  active?: boolean;
}> = ({ record, onSelect, onDelete, onDownload, active }) => {
  const handleDownload = (event: MouseEvent) => {
    event.stopPropagation();
    Promise.resolve(onDownload(record))
      .then(() => toast.success("开始下载"))
      .catch(() => toast.error("下载失败"));
    return false;
  };

  const handleDelete = (event: MouseEvent) => {
    event.stopPropagation();
    Promise.resolve(onDelete(record)).catch(() => toast.error("删除失败"));
    return false;
  };

  const handleClick = () => {
    onSelect(record);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3 flex flex-row justify-between items-center hover:bg-gray-50 ${
        active ? "bg-blue-50" : ""
      }`}
    >
      <div className="space-y-1">
        <div className="text-sm leading-none font-medium">
          {formatDate(record.timestamp)}
        </div>
        <div className="text-muted-foreground text-sm truncate max-w-[16rem]">
          {record.url}
        </div>
        <div className="text-muted-foreground text-xs">
          时长：{formatDuration(record.duration)}
        </div>
      </div>
      <ButtonGroup orientation="vertical" aria-label="Media controls">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
              onClick={handleDownload}
            >
              <FileDown className="text-blue-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>下载</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="text-red-600" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除</p>
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>
    </div>
  );
};

const RecordList: FC<{
  records: Recording[];
  className?: string;
  onSelect: (record: Recording) => void;
  onDelete: (record: Recording) => void | Promise<void>;
  onDownload: (record: Recording) => void | Promise<void>;
  selectedId?: number | null;
}> = ({ records, className, onSelect, onDelete, onDownload, selectedId }) => {
  const [pendingDelete, setPendingDelete] = useState<Recording | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRequestDelete = (record: Recording) => {
    setPendingDelete(record);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDeleteDialogOpen(open);
    if (!open && pendingDelete && !isDeleting) {
      setPendingDelete(null);
      toast.info("取消删除");
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(pendingDelete);
      toast.success("删除成功");
      setPendingDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    handleDialogOpenChange(false);
  };

  return (
    <TooltipProvider>
      <ScrollArea className={`rounded-md border ${className}`}>
        {records.length === 0 ? (
          <div className="text-sm text-slate-400 p-4">暂无录制记录</div>
        ) : (
          records.map((record) => (
            <div key={record.id}>
              <RecordItem
                record={record}
                onSelect={onSelect}
                onDelete={handleRequestDelete}
                onDownload={onDownload}
                active={selectedId === record.id}
              />
              <Separator />
            </div>
          ))
        )}
      </ScrollArea>

      <Dialog open={isDeleteDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确认删除选中的录制记录？删除后无法恢复。
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            {pendingDelete ? (
              <div className="space-y-1">
                <div>时间：{formatDate(pendingDelete.timestamp)}</div>
                <div className="truncate">页面：{pendingDelete.url}</div>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default RecordList;

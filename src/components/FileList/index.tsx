import { UploadTypeConstant } from "@/uploader/constants"
import type { UploadConfig } from "@/uploader/types"
import { ReloadOutlined } from "@ant-design/icons"
import { Button, Empty, Spin } from "antd"

import { PreviewList } from "../PreviewList"
import { FileListProvider, useFileListStore } from "./store"

interface FileListProps {
  config: UploadConfig
}

function FileListContent() {
  const { files, loading, fetchFiles, deleteFile } = useFileListStore()

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-end">
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchFiles}
          loading={loading}>
          刷新列表
        </Button>
      </div>

      {loading && files.length === 0 ? (
        <div className="text-center p-[50px]">
          <Spin size="large" tip="加载中..." />
        </div>
      ) : files.length === 0 ? (
        <Empty description="暂无文件" />
      ) : (
        <PreviewList data={files} size="150px" onDelete={deleteFile} />
      )}
    </div>
  )
}

export function FileList({ config }: FileListProps) {
  if (config.type !== UploadTypeConstant.AWS) {
    return (
      <Empty
        description="目前仅支持 S3 存储的文件管理"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  return (
    <FileListProvider config={config}>
      <FileListContent />
    </FileListProvider>
  )
}

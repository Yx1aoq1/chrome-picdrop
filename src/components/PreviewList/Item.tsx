import {
  CopyOutlined,
  DeleteOutlined,
  FileTextOutlined,
  InfoCircleOutlined
} from "@ant-design/icons"
import { Button, Image, Tooltip, Typography } from "antd"
import { useState } from "react"

export interface UploadItem {
  url: string
}

export interface PreviewItemProps {
  file: UploadItem
  onCopy?: (file: UploadItem) => void
  onDelete?: (file: UploadItem) => void
}

export function PreviewItem(props: PreviewItemProps) {
  const { file, onCopy, onDelete } = props
  const [isError, setIsError] = useState(false)
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(file.url || "")
  const fileName = file.url.split("/").pop()

  const mask = () => {
    return (
      <div className="overlay absolute inset-0 bg-black/50 text-white flex items-center justify-center gap-3 transition-opacity duration-200 opacity-0 group-hover:opacity-100">
        {onCopy && (
          <CopyOutlined
            onClick={(e) => {
              e.stopPropagation()
              onCopy(file)
            }}
          />
        )}
        {onDelete && (
          <DeleteOutlined
            onClick={(e) => {
              e.stopPropagation()
              onDelete(file)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="group relative aspect-square overflow-hidden rounded border border-[#f0f0f0] flex items-center justify-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {isImage && !isError ? (
        <Image
          src={file.url}
          alt={fileName}
          width="100%"
          height="100%"
          className="object-cover"
          preview={{
            mask: mask()
          }}
          onError={() => setIsError(true)}
        />
      ) : (
        <div className="text-center">
          {isError ? (
            <InfoCircleOutlined className="text-[25px] text-[#F5222D] mb-2" />
          ) : (
            <FileTextOutlined className="text-[48px] text-[#1890ff] mb-2" />
          )}
          <Typography.Text
            ellipsis={{ tooltip: file.url }}
            className="block max-w-[120px] text-xs">
            {fileName}
          </Typography.Text>
          {mask()}
        </div>
      )}
    </div>
  )
}

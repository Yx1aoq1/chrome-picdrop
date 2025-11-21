import {
  CopyOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from "@ant-design/icons"
import { Image, message, Space } from "antd"
import { useState } from "react"

import { PreviewItem, type UploadItem } from "./Item"

export interface PreviewListProps {
  data: UploadItem[]
  size?: string
  onDelete?: (file: UploadItem) => void
}

export function PreviewList({
  data,
  size = "75px",
  onDelete
}: PreviewListProps) {
  const [current, setCurrent] = useState(0)

  const onCopy = (file: UploadItem) => {
    navigator.clipboard.writeText(file.url)
    message.success("链接已复制到剪贴板")
  }

  return (
    <Image.PreviewGroup
      preview={{
        toolbarRender: (
          _,
          {
            transform: { scale },
            actions: {
              onActive,
              onFlipY,
              onFlipX,
              onRotateLeft,
              onRotateRight,
              onZoomOut,
              onZoomIn,
              onReset
            }
          }
        ) => (
          <Space size={12} className="toolbar-wrapper">
            <CopyOutlined onClick={() => onCopy(data[current])} />
            <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
            <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
          </Space>
        ),
        onChange: (index) => {
          setCurrent(index)
        }
      }}>
      <div
        className="grid gap-4 p-1"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${size}, 1fr))`
        }}>
        {data.map((item, index) => (
          <PreviewItem
            key={index}
            file={item}
            onCopy={onCopy}
            onDelete={onDelete}
          />
        ))}
      </div>
    </Image.PreviewGroup>
  )
}

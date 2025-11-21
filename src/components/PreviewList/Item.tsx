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
      <div
        className="overlay"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          transition: "opacity 0.2s",
          opacity: 0
        }}>
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
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        overflow: "hidden",
        borderRadius: "4px",
        border: "1px solid #f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)"
        e.currentTarget.style.transform = "translateY(-2px)"
        const overlay = e.currentTarget.querySelector(".overlay")
        if (overlay) (overlay as HTMLElement).style.opacity = "1"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.transform = "none"
        const overlay = e.currentTarget.querySelector(".overlay")
        if (overlay) (overlay as HTMLElement).style.opacity = "0"
      }}>
      {isImage && !isError ? (
        <Image
          src={file.url}
          alt={fileName}
          width="100%"
          height="100%"
          style={{ objectFit: "cover" }}
          preview={{
            mask: mask()
          }}
          onError={() => setIsError(true)}
        />
      ) : (
        <div style={{ textAlign: "center" }}>
          {isError ? (
            <InfoCircleOutlined
              style={{
                fontSize: 25,
                color: "#F5222D",
                marginBottom: 8
              }}
            />
          ) : (
            <FileTextOutlined
              style={{
                fontSize: 48,
                color: "#1890ff",
                marginBottom: 8
              }}
            />
          )}
          <Typography.Text
            ellipsis={{ tooltip: file.url }}
            style={{
              display: "block",
              maxWidth: 120,
              fontSize: 12
            }}>
            {fileName}
          </Typography.Text>
          {mask()}
        </div>
      )}
    </div>
  )
}

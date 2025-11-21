import type { S3Config, UploadConfig } from "@/uploader/types"
import { ReloadOutlined } from "@ant-design/icons"
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client
} from "@aws-sdk/client-s3"
import { Button, Empty, message, Modal, Spin } from "antd"
import { useEffect, useState } from "react"

import { PreviewList } from "./PreviewList"

interface FileItem {
  key: string
  lastModified: Date
  size: number
  url: string
  isImage: boolean
}

interface FileListProps {
  config: UploadConfig
}

export function FileList({ config }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)

  // 初始化 S3 客户端
  const getS3Client = () => {
    const s3Config = config as S3Config
    return new S3Client({
      region: s3Config.region,
      endpoint: s3Config.endpoint,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey
      }
    })
  }

  // 获取文件列表
  const fetchFiles = async () => {
    if (config.type !== "aws") return

    setLoading(true)
    try {
      const client = getS3Client()
      const s3Config = config as S3Config
      // 如果设置了path，则只列出该目录下的文件
      const prefix = s3Config.path
        ? s3Config.path.endsWith("/")
          ? s3Config.path
          : `${s3Config.path}/`
        : ""

      const command = new ListObjectsV2Command({
        Bucket: s3Config.bucket,
        Prefix: prefix
      })

      const response = await client.send(command)

      // 构建文件URL的基础部分
      // 默认使用虚拟主机风格 (virtual-hosted-style)
      let baseUrl = ""
      const endpoint = s3Config.endpoint || ""
      // 简单的 URL 构建逻辑
      if (endpoint.includes("://")) {
        const protocol = endpoint.split("://")[0]
        const domain = endpoint.split("://")[1]
        // 检查是否是 AWS 或者 常见的 S3 兼容服务
        if (
          domain.includes("amazonaws.com") ||
          domain.includes("myqcloud.com")
        ) {
          baseUrl = `${protocol}://${s3Config.bucket}.${domain}`
        } else {
          // 其他情况可能是 path-style，或者是 ip
          baseUrl = `${endpoint}/${s3Config.bucket}`
        }
      } else {
        // 默认为 https
        baseUrl = `https://${s3Config.bucket}.${endpoint}`
      }

      const fileList: FileItem[] = (response.Contents || [])
        .filter((item) => item.Key && !item.Key.endsWith("/")) // 过滤掉文件夹本身
        .map((item) => {
          const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(
            item.Key || ""
          )

          // 对于 S3，Key 是完整的路径
          // 构建预览 URL
          // 注意：如果 bucket 是私有的，这里直接访问可能会 403。
          // 理想情况下应该生成预签名 URL，但这里先尝试直接访问。
          const url = `${baseUrl}/${item.Key}`

          return {
            key: item.Key!,
            lastModified: item.LastModified!,
            size: item.Size!,
            url,
            isImage
          }
        })
        .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())

      setFiles(fileList)
    } catch (error) {
      console.error("Fetch files error:", error)
      message.error("获取文件列表失败，请检查配置！")
    } finally {
      setLoading(false)
    }
  }

  // 删除文件
  const handleDelete = (file: FileItem) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个文件吗？此操作不可恢复。",
      okText: "确认",
      cancelText: "取消",
      okType: "danger",
      onOk: async () => {
        try {
          const client = getS3Client()
          const s3Config = config as S3Config
          await client.send(
            new DeleteObjectCommand({
              Bucket: s3Config.bucket,
              Key: file.key
            })
          )
          message.success("删除成功")
          setFiles((prev) => prev.filter((item) => item.key !== file.key))
        } catch (error) {
          console.error("Delete file error:", error)
          message.error("删除失败")
        }
      }
    })
  }

  // 复制链接
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url)
    message.success("链接已复制到剪贴板")
  }

  useEffect(() => {
    if (config && config.type === "aws") {
      fetchFiles()
    } else {
      setFiles([])
    }
  }, [config])

  if (config.type !== "aws") {
    return (
      <Empty
        description="目前仅支持 S3 存储的文件管理"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end"
        }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchFiles}
          loading={loading}>
          刷新列表
        </Button>
      </div>

      {loading && files.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" tip="加载中..." />
        </div>
      ) : files.length === 0 ? (
        <Empty description="暂无文件" />
      ) : (
        <PreviewList data={files} size="150px" onDelete={handleDelete} />
      )}
    </div>
  )
}

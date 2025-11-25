import type { UploadConfig } from "@/uploader/types"
import { message, Modal } from "antd"
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import { FileListContext } from "./context"
import { createFileService } from "./services"
import type { FileItem } from "./types"

interface FileListProviderProps {
  config: UploadConfig
  children: React.ReactNode
}

export function FileListProvider({ config, children }: FileListProviderProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 使用 ref 保存 config，避免在 fetchFiles 中闭包引用旧的 config
  // 但这里我们希望 config 变了就重新生成 service，所以直接依赖 config 即可
  const service = useMemo(() => createFileService(config), [config])

  const fetchFiles = useCallback(async () => {
    if (!service) {
      setFiles([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const list = await service.list()
      setFiles(list)
    } catch (err) {
      console.error("Fetch files error:", err)
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      message.error("获取文件列表失败，请检查配置！")
    } finally {
      setLoading(false)
    }
  }, [service])

  const deleteFile = useCallback(
    async (file: FileItem) => {
      if (!service) return

      Modal.confirm({
        title: "确认删除",
        content: "确定要删除这个文件吗？此操作不可恢复。",
        okText: "确认",
        cancelText: "取消",
        okType: "danger",
        onOk: async () => {
          try {
            await service.delete(file.key)
            message.success("删除成功")
            setFiles((prev) => prev.filter((item) => item.key !== file.key))
          } catch (err) {
            console.error("Delete file error:", err)
            message.error("删除失败")
          }
        }
      })
    },
    [service]
  )

  // 自动加载
  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const value = {
    files,
    loading,
    error,
    fetchFiles,
    deleteFile
  }

  return (
    <FileListContext.Provider value={value}>
      {children}
    </FileListContext.Provider>
  )
}

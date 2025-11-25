import type { UploadConfig } from "@/uploader/types"

export interface FileItem {
  key: string
  lastModified: Date
  size: number
  url: string
  isImage: boolean
}

export interface FileListState {
  files: FileItem[]
  loading: boolean
  error: Error | null
}

export interface FileListContextType extends FileListState {
  fetchFiles: () => Promise<void>
  deleteFile: (file: FileItem) => Promise<void>
}

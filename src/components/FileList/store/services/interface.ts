import type { FileItem } from "../types"

export interface IFileService {
  list(): Promise<FileItem[]>
  delete(key: string): Promise<void>
}

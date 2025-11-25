import { createContext } from "react"

import type { FileListContextType } from "./types"

export const FileListContext = createContext<FileListContextType | undefined>(
  undefined
)

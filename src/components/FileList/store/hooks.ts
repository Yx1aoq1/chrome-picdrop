import { useContext } from "react"

import { FileListContext } from "./context"

export const useFileListStore = () => {
  const context = useContext(FileListContext)
  if (context === undefined) {
    throw new Error("useFileListStore must be used within a FileListProvider")
  }
  return context
}

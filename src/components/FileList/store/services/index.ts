import { UploadTypeConstant } from "@/uploader/constants"
import type { S3Config, UploadConfig } from "@/uploader/types"

import type { IFileService } from "./interface"
import { S3FileService } from "./s3"

export function createFileService(config: UploadConfig): IFileService | null {
  if (config.type === UploadTypeConstant.AWS) {
    return new S3FileService(config as S3Config)
  }
  // Future: Add other providers here
  return null
}

export * from "./interface"
export * from "./s3"

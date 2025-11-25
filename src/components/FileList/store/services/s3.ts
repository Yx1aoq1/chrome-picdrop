import type { S3Config } from "@/uploader/types"
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client
} from "@aws-sdk/client-s3"

import type { FileItem } from "../types"
import type { IFileService } from "./interface"

export class S3FileService implements IFileService {
  private client: S3Client
  private config: S3Config

  constructor(config: S3Config) {
    this.config = config
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    })
  }

  private getBaseUrl(): string {
    const { endpoint = "", bucket } = this.config
    if (endpoint.includes("://")) {
      const [protocol, domain] = endpoint.split("://")
      if (domain.includes("amazonaws.com") || domain.includes("myqcloud.com")) {
        return `${protocol}://${bucket}.${domain}`
      } else {
        return `${endpoint}/${bucket}`
      }
    }
    return `https://${bucket}.${endpoint}`
  }

  async list(): Promise<FileItem[]> {
    const prefix = this.config.path
      ? this.config.path.endsWith("/")
        ? this.config.path
        : `${this.config.path}/`
      : ""

    const command = new ListObjectsV2Command({
      Bucket: this.config.bucket,
      Prefix: prefix
    })

    const response = await this.client.send(command)
    const baseUrl = this.getBaseUrl()

    return (response.Contents || [])
      .filter((item) => item.Key && !item.Key.endsWith("/"))
      .map((item) => {
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(
          item.Key || ""
        )
        // 注意：简单拼接，未处理 bucket 为 private 的情况
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
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: key
      })
    )
  }
}

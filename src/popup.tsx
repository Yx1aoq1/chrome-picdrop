import {
  CopyOutlined,
  InboxOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from "@ant-design/icons"

import "./style.css"

import type { UploadProps } from "antd"
import {
  Alert,
  Button,
  Checkbox,
  Image,
  Input,
  message,
  Space,
  Tabs,
  Upload
} from "antd"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import { PreviewList } from "./components"
import { createUploader, type UploadConfig } from "./uploader"

const { Dragger } = Upload

function IndexPopup() {
  const [md, setMd] = useStorage("copyMd")
  const [imgList, setImgList] = useStorage("fileList", [])
  const [configs, setConfigs] = useStorage<UploadConfig[]>("picdropConfigs", [])

  const props: UploadProps = {
    name: "file",
    multiple: true,
    async customRequest({ file, data, onProgress, onSuccess, onError }) {
      const uploader = createUploader({
        config: configs[0],
        onProgress: (progress) => {
          onProgress({
            percent: Math.round((progress.loaded / progress.total) * 100)
          })
        },
        onSuccess: (result) => {
          onSuccess(result)
          const fileName = result.url.split("/").pop()
          navigator.clipboard.writeText(
            md ? `![${fileName}](${result.url})` : result.url
          )
          setImgList((prev) => [
            {
              url: result.url,
              createTime: Date.now()
            },
            ...prev
          ])
        },
        onError: (error) => {
          onError(error)
        }
      })

      uploader.upload(file as File)
    }
  }

  return (
    <div className="w-[350px] px-2 pb-2">
      <Tabs animated={false} defaultActiveKey="1" type="line">
        <Tabs.TabPane tab="上传" key="1">
          {configs.length > 0 ? (
            <div>
              <div className="text-xs text-[#999] mb-3 text-center">
                上传配置有问题？
                <a
                  target="_blank"
                  href="/options.html"
                  className="text-[#999] underline ml-1">
                  去修改
                </a>
              </div>
              <div className="flex gap-2 mb-2 items-center">
                <Input placeholder="^/⌘ + v 剪贴板上传" />
                <Checkbox onChange={(e) => setMd(e.target.checked)}>
                  markdown
                </Checkbox>
              </div>

              <Dragger className="mb-2" {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此处</p>
                <p className="ant-upload-hint">支持多文件上传</p>
              </Dragger>
            </div>
          ) : (
            <div className="mb-2">
              <Alert
                showIcon
                message="请先填写配置"
                description={
                  <a target="_blank" href="/options.html">
                    去设置
                  </a>
                }
                type="success"
              />
            </div>
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          className="h-[250px] overflow-auto"
          tab="历史记录"
          key="2">
          <PreviewList data={imgList} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

export default IndexPopup

import { PlusOutlined } from "@ant-design/icons"
import { Button, List, Space, Typography } from "antd"
import { useState } from "react"

import { DraggableConfigItem, type ConfigItem } from "./DraggableConfigItem"

const { Title } = Typography

export interface ConfigListProps {
  title: string
  configs: ConfigItem[]
  selectedIdx: number
  onAddNew: () => void
  onSelectConfig: (idx: number) => void
  onDeleteConfig: (idx: number, e: React.MouseEvent) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export function ConfigList({
  title,
  configs,
  selectedIdx,
  onAddNew,
  onSelectConfig,
  onDeleteConfig,
  onReorder
}: ConfigListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex && onReorder) {
      onReorder(draggedIndex, targetIndex)
    }
    setDraggedIndex(null)
  }

  return (
    <>
      <div className="px-5 py-4 sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <Space direction="vertical" className="w-full gap-3">
          <div className="flex items-center justify-between">
            <Title level={5} className="!mb-0 text-gray-800">
              {title}
            </Title>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {configs.length}
            </span>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddNew}
            className="w-full shadow-none hover:shadow-md transition-all h-9">
            新增配置
          </Button>
        </Space>
      </div>

      <div className="py-2 px-2">
        <List
          dataSource={configs}
          renderItem={(config, idx) => (
            <DraggableConfigItem
              key={`${config.name}-${idx}`}
              config={config}
              index={idx}
              isSelected={selectedIdx === idx}
              onSelect={() => onSelectConfig(idx)}
              onDelete={(e) => onDeleteConfig(idx, e)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          )}
        />
      </div>
    </>
  )
}

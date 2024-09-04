import React, { useState, useRef, useEffect } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import {
  Input, Tag, Tooltip, InputRef,
} from 'antd'

type TagListProps = {
  initialTags: string[];
  config: {
    editable?: boolean;
    addTag?: (tag: string) => Promise<void>;
    removeTag?: (tag: string) => Promise<void>;
  };
};

const TagList: React.FC<TagListProps> = ({ initialTags, config }) => {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus()
    }
  }, [inputVisible])

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag)
    if (config.removeTag) {
      config.removeTag(removedTag)
    }
    setTags(newTags)
  }

  const showInput = () => {
    setInputVisible(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputConfirm = () => {
    if (inputValue.trim() && !tags.includes(inputValue)) {
      const newTags = [...tags, inputValue.trim()]
      if (config.addTag) {
        config.addTag(inputValue.trim())
      }
      setTags(newTags)
    }
    setInputVisible(false)
    setInputValue('')
  }


  return (
    <>
      {tags.map(tag => (
        <Tooltip title={tag} key={tag}>
          <Tag closable={config.editable} onClose={() => handleClose(tag)}>{tag}</Tag>
        </Tooltip>
      ))}
      {config.editable && inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={{
            width: 78, height: 22, marginRight: 8, verticalAlign: 'top',
          }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <>
          {config.editable && (
            <Tag
              style={{ height: 22, borderStyle: 'dashed', cursor: 'pointer' }}
              icon={<PlusOutlined />}
              onClick={showInput}
            >
              New Tag
            </Tag>
          )}
        </>
      )}

    </>
  )
}

export default TagList

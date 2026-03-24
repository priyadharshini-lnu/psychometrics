import React, {
  useContext, useState, useEffect, useRef,
} from 'react'
import { InputNumber, Form, GetRef } from 'antd'
import { EditableContext } from './constants'

type InputNumberRef = GetRef<typeof InputNumber>

const { I18n } = window

interface EditableCellProps {
  editable: boolean
  children: React.ReactNode
  dataIndex: string
  record: Item
  handleSave(field: string, record: Item): Promise<unknown>
  editNextColumn(rowKey: string, field: string, direction: string): void
}

interface Item {
  key: string
  name: string
  mean: number
  standardDeviation: number
}

export const EditableCell: React.FC<EditableCellProps> = ({
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  editNextColumn,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<InputNumberRef>(null)
  const form = useContext(EditableContext)

  useEffect(() => {
    if (editing) {
      if (inputRef && inputRef.current) {
        inputRef.current.focus()
      }
    }
  }, [editing])

  const toggleEdit = () => {
    setEditing(!editing)
    form.setFieldsValue({ [dataIndex]: record[dataIndex] })
  }

  const save = async (target: Element, editNext?: string) => {
    const field = target.id
    try {
      const values = await form.validateFields()
      toggleEdit()
      await handleSave(field, { ...record, ...values })
      if (editNext) editNextColumn(record.key, field, editNext)
    } catch (errInfo) {
      console.error('Save failed: ', errInfo)
    }
  }

  const onEnter = async (e: React.KeyboardEvent) => {
    save(e.currentTarget)
  }

  const onTab = async (e: React.KeyboardEvent) => {
    save(e.currentTarget, e.shiftKey ? 'prev' : 'next')
  }

  const onEsc = async () => {
    toggleEdit()
  }

  const onBlur = async (e: React.FocusEvent) => {
    save(e.currentTarget)
  }

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    const key = e.keyCode
    const keyMap = {
      9: onTab,
      27: onEsc,
      13: onEnter,
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!keyMap.hasOwnProperty(key)) return

    e.preventDefault()
    keyMap[key](e)
  }

  let childNode = children

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
      >
        <InputNumber ref={inputRef} onKeyDown={handleKeyPress} onBlur={onBlur} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children && children[1] === null ? I18n.t('norms.percentile.values.empty') : children}
      </div>
    )
  }

  return <td {...restProps} data-name={dataIndex}>{childNode}</td>
}

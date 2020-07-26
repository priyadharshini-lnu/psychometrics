import React, {
  useContext, useState, useEffect, useRef,
} from 'react'
import { InputNumber, Form } from 'antd'
import { EditableContext } from './constants'

const { I18n } = window

interface EditableCellProps {
  title: React.ReactNode
  editable: boolean
  children: React.ReactNode
  dataIndex: string
  record: Item
  handleSave(field: string, record: Item): void
}

interface Item {
  key: string
  name: string
  mean: number
  standardDeviation: number
}


export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<InputNumber>(null)
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

  const save = async (e: React.FocusEvent) => {
    const field = e.target.id
    try {
      const values = await form.validateFields()
      toggleEdit()
      handleSave(field, { ...record, ...values })
    } catch (errInfo) {
      // eslint-disable-next-line no-console
      console.error('Save failed: ', errInfo)
    }
  }

  let childNode = children

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: I18n.t('norms.percentile.values.required', { title }),
          },
        ]}
      >
        <InputNumber ref={inputRef} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children && children[1] === null ? I18n.t('norms.percentile.values.empty') : children}
      </div>
    )
  }

  return <td {...restProps}>{childNode}</td>
}

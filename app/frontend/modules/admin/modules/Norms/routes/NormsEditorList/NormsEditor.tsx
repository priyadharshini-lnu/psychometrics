import { useParams } from 'react-router-dom'
import {
  useEffect, useState,
} from 'react'
import {
  Table,
  Form, InputNumber, message, Alert,
} from 'antd'
import cs from 'classnames'
import styles from './NormsEditor.less'
import { useNormsTableConfig } from './useNormsTableConfig'
import { useResources } from '~/hooks/useResources/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource/ResourceContext'
import {
  NormEditor, NormEditorTR,
  EditableCellProps,
  Norm,
} from '~/modules/admin/modules/client/core/norms'
import { camelizeKeys } from '~/utils/object'
import { NormFactorLevel } from '../../constants'
import connect, { PropsFromRedux } from '~/modules/admin/modules/NormEditor/connect'

const { I18n } = window
const NUMERIC_INPUT_PATTERN = /^\d*\.?\d*$/

const isValidNumericValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value === 'string') return NUMERIC_INPUT_PATTERN.test(value)
  return false
}

const isNavigationKey = (key: string): boolean => [
  'Backspace',
  'Delete',
  'Tab',
  'Enter',
  'Escape',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
].includes(key)

const showNumericOnlyError = () => {
  message.open({
    key: 'norm-editor-numeric-error',
    type: 'error',
    content: I18n.t('admin.norm_editor_numeric_value_error'),
    duration: 2,
  })
}

const preventInvalidTyping = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.ctrlKey || event.metaKey || event.altKey || isNavigationKey(event.key)) {
    return
  }

  const target = event.currentTarget
  const nextValue = target.value.slice(0, target.selectionStart ?? 0)
    + event.key
    + target.value.slice(target.selectionEnd ?? target.value.length)

  if (!NUMERIC_INPUT_PATTERN.test(nextValue)) {
    event.preventDefault()
    showNumericOnlyError()
  }
}

const preventInvalidPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
  const pastedText = event.clipboardData.getData('text').trim()
  if (!NUMERIC_INPUT_PATTERN.test(pastedText)) {
    event.preventDefault()
    showNumericOnlyError()
  }
}

const EditableCell = ({
  editing,
  editable,
  dataIndex,
  record,
  save,
  ...restProps
}:EditableCellProps) => {
  if (!editable) {
    return <td {...restProps}>{record[dataIndex]}</td>
  }

  return (
    <td
      {...restProps}
      onClick={() => {
        if (!editing) save.startEdit(record, dataIndex)
      }}

    >
      {editing ? (
        <Form.Item
          rules={[{
            validator: (_, value) => (
              isValidNumericValue(value)
                ? Promise.resolve()
                : Promise.reject(new Error(I18n.t('admin.norm_editor_numeric_value_error')))
            ),
          }]}
          name={`${record.key}-${dataIndex}`}
          style={{ margin: 0 }}
        >
          <InputNumber
            autoFocus
            style={{ width: '100%' }}
            controls={false}
            onKeyDown={preventInvalidTyping}
            onPaste={preventInvalidPaste}
            decimalSeparator="."
            onPressEnter={() => save.commit(record, dataIndex)}
            onBlur={() => save.commit(record, dataIndex)}
          />
        </Form.Item>
      ) : (
        <div
          tabIndex={0}
          role="gridcell"
          className={cs(styles.editableCellValueWrap)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              save.startEdit(record, dataIndex)
            }
          }}
        >
          {record[dataIndex] === '' ? (
            <span className={styles.emptyCell}>
              {I18n.t('admin.empty')}
            </span>
          ) : record[dataIndex]}
        </div>
      )}
    </td>
  )
}

const getFieldNameAndLevel = (dataIndex:string) => {
  if (dataIndex === 'mean') {
    return { fieldName: 'mean' }
  }

  if (dataIndex === 'standardDeviation') {
    return { fieldName: 'standard_deviation' }
  }

  if (dataIndex.includes('From')) {
    const level = dataIndex.split('From')[0]
    return { level: NormFactorLevel[level], fieldName: 'score_from' }
  }
  const level = dataIndex.split('To')[0]
  return { level: NormFactorLevel[level], fieldName: 'score_to' }
}

const NormsEditorComponent = ({ saveNorm }: PropsFromRedux) => {
  const [form] = Form.useForm()
  const [editorData, setEditorData] = useState<NormEditor>([])
  const [data, setData] = useState<Record<string, string | number>[]>([])
  const [currentNorm, setCurrentNorm] = useState<Norm | null>(null)
  const [editingCell, setEditingCell] = useState<{ key: string; dataIndex: string } | null>(null)
  const { resource } = useResourceContext()
  const resourceFactorNorms = useResources('factors_norms')
  const {
    collectionAction,
  } = resourceFactorNorms
  const {
    columns: tableColumns,
    data: tableData,
  } = useNormsTableConfig(currentNorm?.normType, editorData)

  const columns = tableColumns.map((col) => {
    if (!('children' in col) || !col.children) {
      return {
        ...col,
        onCell: (record, rowIndex) => ({
          record,
          dataIndex: col.dataIndex,
          editable: col.editable,
          rowIndex,
          editing: editingCell?.key === record.key && editingCell?.dataIndex === col.dataIndex,
          save: {
            startEdit,
            commit,
          },
        }),
      }
    }

    return {
      ...col,
      children: col.children.map(childCol => ({
        ...childCol,
        onCell: (record, rowIndex) => ({
          record,
          dataIndex: childCol.dataIndex,
          editable: childCol.editable,
          rowIndex,
          editing: editingCell?.key === record.key && editingCell?.dataIndex === childCol.dataIndex,
          save: {
            startEdit,
            commit,
          },
        }),
      })),
    }
  })

  const [isLoading, setIsLoading] = useState(false)

  const { normId } = useParams()

  const startEdit = (record, dataIndex) => {
    form.setFieldValue(`${record.key}-${dataIndex}`, record[dataIndex])
    setEditingCell({ key: record.key, dataIndex })
  }

  const commit = async (record, dataIndex) => {
    const fieldName = `${record.key}-${dataIndex}`

    try {
      await form.validateFields([fieldName])
    } catch (_error) {
      message.error(I18n.t('admin.norm_editor_numeric_value_error'))
      return
    }

    const newValue = form.getFieldValue(fieldName)

    if (currentNorm?.normType === 'percentile') {
      const cellData = {
        factorId: record.key,
        fieldName: getFieldNameAndLevel(dataIndex).fieldName,
        fieldValue: newValue ? newValue.toString() : null,
        normId: Number(normId),
      }

      saveNorm(cellData).then(() => {
        const newData = data.map((item) => {
          if (item.key === record.key) {
            return {
              ...item,
              [dataIndex]: newValue ?? '',
            }
          }
          return item
        })
        setData(newData)
        setEditingCell((prev) => {
          if (prev?.key === record.key && prev?.dataIndex === dataIndex) {
            return null
          }
          return prev
        })
      }).catch((errors) => {
        form.setFieldValue(fieldName, record[dataIndex])
        message.error(`${errors['/fieldValue']?.title || I18n.t('admin.validation_error')}`)
      })
    } else {
      collectionAction({
        method: 'patch',
        action: 'update_cell',
        body: {
          normId: Number(normId),
          factorId: Number(record.key),
          ...getFieldNameAndLevel(dataIndex),
          fieldValue: (newValue ?? '').toString(),
        },
      }).then(() => {
        const newData = data.map((item) => {
          if (item.key === record.key) {
            return {
              ...item,
              [dataIndex]: newValue ?? '',
            }
          }
          return item
        })
        setData(newData)
        setEditingCell((prev) => {
          if (prev?.key === record.key && prev?.dataIndex === dataIndex) {
            return null
          }
          return prev
        })
      }).catch((e) => {
        form.setFieldValue(fieldName, record[dataIndex])
        message.error(`${e['/fieldValue']?.title || I18n.t('admin.validation_error')}`)
      })
    }
  }

  const fetchNormsEditorData = (normId: string) => {
    resource.memberAction({
      action: 'editor',
      method: 'post',
      id: normId,
      responseType: NormEditorTR,
    }).then((response: unknown) => {
      setEditorData(camelizeKeys(response as NormEditor) as NormEditor)
      setIsLoading(false)
    })
  }

  useEffect(() => {
    setData(tableData as Record<string, string | number>[])
  }, [tableData])

  useEffect(() => {
    if (normId) {
      resource.fetchSingle({ id: normId }).then((response) => {
        setCurrentNorm(response as Norm)
        setIsLoading(true)
        fetchNormsEditorData(normId as string)
      })
    }
  }, [normId])


  return (
    <>
      <Alert title={I18n.t('admin.cell_save_msg')} type="info" showIcon />
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          rowClassName={() => styles.editableRow}
          bordered
          dataSource={data}
          columns={columns}
          pagination={false}
          loading={isLoading}
          virtual
          scroll={{ x: 500, y: 2000 }}
        />
      </Form>
    </>


  )
}

export default connect(NormsEditorComponent)

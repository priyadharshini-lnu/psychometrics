import { useParams } from 'react-router-dom'
import {
  useEffect, useState,
} from 'react'
import {
  Table,
  Form, InputNumber, message, Alert,
} from 'antd'
import cs from 'classnames'
import keyBy from 'lodash/keyBy'
import styles from './NormsEditor.less'
import { useResources } from '~/hooks/useResources/useResources'
import { useResourceContext } from '~/modules/admin/components/Resource/ResourceContext'
import {
  NormEditor, NormEditorTR,
  ColumnTypes, EditableCellProps, IRowData,
} from '~/modules/admin/modules/client/core/norms'
import { camelizeKeys } from '~/utils/object'
import { NormFactorLevel } from '../../constants'

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
  if (dataIndex.includes('From')) {
    const level = dataIndex.split('From')[0]
    return { level: NormFactorLevel[level], fieldName: 'score_from' }
  }
  const level = dataIndex.split('To')[0]
  return { level: NormFactorLevel[level], fieldName: 'score_to' }
}

const formatNumberWithPrecision = (value: number) => value.toLocaleString('en-US', {
  minimumFractionDigits: 1, maximumFractionDigits: 10,
})

const formatScoreValue = (value?: string | number): string => (
  value ? formatNumberWithPrecision(parseFloat(String(value))) : ''
)

type NormScoreFields = Omit<IRowData, 'factor' | 'key' | 'factorsNormId'>

const LEVEL_FIELD_MAP: [string, keyof NormScoreFields, keyof NormScoreFields][] = [
  ['verylow', 'veryLowFrom', 'veryLowTo'],
  ['low', 'lowFrom', 'lowTo'],
  ['average', 'averageFrom', 'averageTo'],
  ['high', 'highFrom', 'highTo'],
  ['veryhigh', 'veryHighFrom', 'veryHighTo'],
]

const buildNormScores = (factorsNormsProps: NormEditor[number]['factorsNormsProps']): NormScoreFields => {
  const propsByLevel = keyBy(factorsNormsProps ?? [], prop => (prop.level ?? '').toLowerCase().replace(/\s/g, ''))

  return LEVEL_FIELD_MAP.reduce<NormScoreFields>((scores, [levelKey, fromField, toField]) => {
    const prop = propsByLevel[levelKey]
    scores[fromField] = formatScoreValue(prop?.scoreFrom)
    scores[toField] = formatScoreValue(prop?.scoreTo)
    return scores
  }, {
    veryLowFrom: '',
    veryLowTo: '',
    lowFrom: '',
    lowTo: '',
    averageFrom: '',
    averageTo: '',
    highFrom: '',
    highTo: '',
    veryHighFrom: '',
    veryHighTo: '',
  })
}


const NormsEditor = () => {
  const [form] = Form.useForm()
  const [data, setData] = useState<IRowData[]>([])
  const [editingCell, setEditingCell] = useState<{ key: string; dataIndex: keyof IRowData } | null>(null)
  const { resource } = useResourceContext()
  const resourceFactorNorms = useResources('factors_norms')

  const {
    collectionAction,
  } = resourceFactorNorms

  const defaultColumns = [{
    title: I18n.t('admin.factors'),
    key: 'factor',
    fixed: 'start',
    width: 200,
    dataIndex: 'factor',
    editable: false,
  },
  {
    title: I18n.t('admin.very_low'),
    children: [
      {
        key: 'veryLowFrom',
        dataIndex: 'veryLowFrom',
        title: I18n.t('admin.from'),
        width: 100,
        editable: true,
      },
      {
        key: 'veryLowTo',
        dataIndex: 'veryLowTo',
        title: I18n.t('admin.to'),
        width: 100,
        editable: true,
      }],
  },

  {
    title: I18n.t('admin.low'),
    children: [
      {
        key: 'lowFrom',
        title: I18n.t('admin.from'),
        width: 100,
        dataIndex: 'lowFrom',
        editable: true,
      },
      {
        key: 'lowTo', title: I18n.t('admin.to'), width: 100, dataIndex: 'lowTo', editable: true,
      }],
  },

  {
    title: I18n.t('admin.average'),
    children: [
      {
        key: 'averageFrom',
        title: I18n.t('admin.from'),
        width: 100,
        dataIndex: 'averageFrom',
        editable: true,
      },
      {
        key: 'averageTo',
        title: I18n.t('admin.to'),
        width: 100,
        dataIndex: 'averageTo',
        editable: true,
      }],
  },

  {
    title: I18n.t('admin.high'),
    children: [
      {
        key: 'highFrom',
        title: I18n.t('admin.from'),
        width: 100,
        dataIndex: 'highFrom',
        editable: true,
      },
      {
        key: 'highTo',
        title: I18n.t('admin.to'),
        width: 100,
        dataIndex: 'highTo',
        editable: true,
      }],
  },

  {
    title: I18n.t('admin.very_high'),
    children: [
      {
        key: 'veryHighFrom', title: I18n.t('admin.from'), width: 100, dataIndex: 'veryHighFrom', editable: true,
      },
      {
        key: 'veryHighTo', title: I18n.t('admin.to'), width: 100, dataIndex: 'veryHighTo', editable: true,
      }],
  }]

  const columns = defaultColumns.map((col) => {
    if (!col.children) {
      return {
        ...col,
        onCell: (record, rowIndex) => ({
          record,
          dataIndex: col.dataIndex,
          editable: col.editable,
          rowIndex,
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
            startEdit, commit,
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

  const fetchNormsEditorData = (normId: string) => {
    resource.memberAction({
      action: 'editor',
      method: 'post',
      id: normId,
      responseType: NormEditorTR,
    }).then((response: unknown) => {
      const editorData = response as NormEditor
      setData(camelizeKeys(editorData).map(item => ({
        factor: item.name,
        ...buildNormScores(item.factorsNormsProps),
        key: item.id.toString(),
        factorsNormId: item.factorsNormId ?? '',
      })))
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (normId) {
      setIsLoading(true)
      fetchNormsEditorData(normId as string)
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
          columns={columns as ColumnTypes}
          pagination={false}
          loading={isLoading}
          virtual
          scroll={{ x: 500, y: 2000 }}
        />
      </Form>
    </>


  )
}

export default NormsEditor

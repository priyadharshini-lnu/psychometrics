import React, {
  useState, useEffect, useRef, RefObject,
} from 'react'
import _ from 'lodash'
import {
  Alert, Button, Input, InputRef, Space, Empty, Typography,
  Badge, Table, Select,
} from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import {
  ImportOutlined, PlusOutlined, SaveOutlined, DeleteOutlined,
} from '~/glint/icons/AccessibleIconsAntDesign'
import { setIn } from '~/utils/immutable'
import { DATA_SHEET_COLUMN_TYPES } from '~/components/DataSheetModal/constants'
import styles from './DataSheets.less'
import { saveDataSheet, uploadDataSheet } from '~/modules/reports/core/builder/actions'
import { RootState } from '~/modules/reports/core/rootReducers'

const { I18n } = window

interface Column {
  name: string
  type: string
}

const DataSheets: React.FC = () => {
  const dispatch = useDispatch()
  const { columns: initialColumns, id, threesixty } = useSelector((state: RootState) => ({
    columns: state.report.builder.data_sheet_columns,
    id: state.report.builder.id,
    threesixty: state.report.builder.category === 'threesixty',
  }))

  const [file, setFile] = useState<File | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [focusNewRow, setFocusNewRow] = useState(false)
  const [newRowIndex, setNewRowIndex] = useState(-1)

  const inputRefs = useRef<Map<number, RefObject<InputRef>>>(new Map())

  useEffect(() => {
    setColumns(initialColumns)
  }, [initialColumns])

  useEffect(() => {
    if (focusNewRow && newRowIndex >= 0) {
      const inputRef = inputRefs.current.get(newRowIndex)
      if (inputRef?.current) {
        inputRef.current.focus()
        setFocusNewRow(false)
        setNewRowIndex(-1)
      }
    }
  }, [focusNewRow, newRowIndex])

  const onChangeFile = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = target
    if (files) {
      setFile(files[0])
    }
  }

  const sendFile = () => {
    if (!file) return
    const data = new FormData()
    data.append('file', file, file.name)
    dispatch(uploadDataSheet(id, data) as unknown as Promise<{response}>).then(({ response }) => {
      updateColumns(response)
    })
  }

  const save = () => {
    dispatch(saveDataSheet(_.cloneDeep(columns)))
  }

  const addColumn = () => {
    setColumns([...columns, { type: DATA_SHEET_COLUMN_TYPES[0], name: '' }])
    setFocusNewRow(true)
    setNewRowIndex(columns.length)
  }

  const removeColumn = (column: Column) => {
    setColumns(columns.filter(col => col.name !== column.name))
  }

  const updateColumns = (newColumns: Column[]) => {
    setColumns(newColumns)
  }

  const updateColumn = (index: number, fieldName: string, value) => {
    setColumns(setIn(columns, [index, fieldName], value))
  }

  return (
    <div>
      {threesixty ? (
        <Alert
          type="warning"
          message={I18n.t('administration.datasheet.threesixty_warning')}
          showIcon
          style={{ marginBottom: '16px' }}
        />
      ) : (
        <div className={styles.fileContainer}>
          <div className={styles.uploadArea}>
            <Input
              type="file"
              onChange={onChangeFile}
            />
            {file && (
              <Alert
                message={`Selected file: ${file.name}`}
                type="info"
                showIcon
                style={{ marginTop: '8px' }}
              />
            )}
          </div>
          <Space size="middle">
            <Button type="primary" icon={<ImportOutlined />} onClick={sendFile} disabled={!file}>
              Import
            </Button>
          </Space>
        </div>
      )}

      <div className={styles.columnHeader}>
        <Typography.Title level={4}>Data Sheet Columns</Typography.Title>
        <Space>

          <Badge count={columns.length} showZero style={{ backgroundColor: columns.length ? '#1890ff' : '#d9d9d9' }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={addColumn} disabled={threesixty}>
            Add Field
          </Button>
        </Space>
      </div>

      <div className={styles.columnContainer}>
        {columns.length > 0 ? (
          <Table
            dataSource={columns.map((column, index) => ({ ...column, key: index }))}
            pagination={false}
            bordered
            rowKey="key"
            columns={[
              {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (text, record, index) => {
                  if (!inputRefs.current.has(index)) {
                    inputRefs.current.set(index, React.createRef<InputRef>())
                  }

                  return (
                    <Input
                      ref={inputRefs.current.get(index)}
                      value={text}
                      onChange={e => updateColumn(index, 'name', e.target.value)}
                      disabled={threesixty}
                    />
                  )
                },
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (text, record, index) => (
                  <Select
                    value={record.type}
                    onChange={value => updateColumn(index, 'type', value)}
                    style={{ width: '100%' }}
                    disabled={threesixty}
                  >
                    {DATA_SHEET_COLUMN_TYPES.map(type => (
                      <Select.Option key={type} value={type}>
                        {type}
                      </Select.Option>
                    ))}
                  </Select>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <Button
                    danger
                    onClick={() => removeColumn(record)}
                    disabled={threesixty}
                    icon={<DeleteOutlined />}
                  >
                    Remove
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <Empty description="No columns defined" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </div>

      <div className={styles.actionButtons}>
        <Button type="primary" icon={<SaveOutlined />} onClick={save} size="large">
          Save Changes
        </Button>
      </div>
    </div>
  )
}


export { DataSheets }

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { Table, message } from 'antd'
import NormFields from '../interfaces/NormFields'
import { EditableRow } from './EditableRow'
import { EditableCell } from './EditableCell'

const { I18n } = window

interface EditableTableProps {
  factors: Factor[]
  onSave(data: NormFields): Promise<unknown>
}

interface Factor {
  key: string
  name: string
  mean: number | null
  standard_deviation: number | null
}

const EditableTable: React.FC<EditableTableProps> = ({
  factors,
  onSave,
}) => {
  const [columns] = useState([
    {
      title: I18n.t('norms.percentile.columns.name'),
      dataIndex: 'name',
      width: '25%',
    },
    {
      title: I18n.t('norms.percentile.columns.mean'),
      dataIndex: 'mean',
      editable: true,
    },
    {
      title: I18n.t('norms.percentile.columns.standard_deviation'),
      dataIndex: 'standard_deviation',
      editable: true,
    },
  ])
  const [dataSource, setDataSource] = useState([...factors])

  useEffect(() => {
    setDataSource(factors)
  }, [factors])

  const handleSave = (field: string, row: Factor) => {
    const newData = [...dataSource]
    const index = newData.findIndex(item => row.key === item.key)
    const item = newData[index]
    newData.splice(index, 1, { ...item, ...row })

    if (item[field] === row[field]) return

    const data = {
      factorId: row.key,
      fieldName: field,
      fieldValue: row[field],
    }

    onSave(data).then(() => {
      setDataSource(newData)
      message.info(I18n.t('norms.percentile.messages.success', { factorName: row.name }))
    }).catch((errors) => {
      message.error(I18n.t('norms.percentile.messages.failure', { error: errors[0] }))
    })
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  }
  const mappedColumns = columns.map((col) => {
    if (!col.editable) {
      return col
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    }
  })

  return (
    <div>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={mappedColumns}
        pagination={false}
      />
    </div>
  )
}

export default EditableTable

import React, { FC } from 'react'
import {
  Row, Col, Checkbox, Typography, Alert, Space,
} from 'antd'
import _ from 'lodash'
import Module from '~/modules/reports/core/interfaces/Module'
import DefaultTableColumns from '~/modules/reports/consts/DefaultTableColumns'
import I18nStore from '~/modules/reports/store/I18nStore'

type ModelProps = Pick<Module['props'], 'tableColumns' | 'sourceType'| 'type'>

const allowedTablesForColumnEditing = {
  HighestLowest: 'Highest/Lowest',
  ThreeSixtyReportSummary: '360 Report Summary',
  Competencies: 'Competencies',
  GapAssessment: 'Gap Assessment',
}

type Props = {
  model: {props: ModelProps} & Pick<Module, 'update'>
}

export const TableColumnList:FC<Props> = ({ model }) => {
  const tableType = model.props?.type || ''
  const sourceType = model.props?.sourceType
  const tableColumnsDataPath = sourceType ? `tableColumns.${sourceType}` : 'tableColumns'
  const defaultTableColumnnsData = DefaultTableColumns[model.props.type]?.defaultTableColumns(I18nStore)
  const defaultTableColumns = sourceType ? _.get(defaultTableColumnnsData, sourceType)
    : defaultTableColumnnsData
  const tableColumnDataOfCurrentSource = _.get(model.props, tableColumnsDataPath)
    || defaultTableColumns || {}

  const handleColumnChage = (updatedColumnData) => {
    const changedColumnData = sourceType ? { [sourceType]: { ...tableColumnDataOfCurrentSource, ...updatedColumnData } }
      : { ...tableColumnDataOfCurrentSource, ...updatedColumnData }
    model.props.tableColumns = {
      ...model.props.tableColumns,
      ...changedColumnData,
    }
    model.update()
  }

  if (!allowedTablesForColumnEditing[tableType]) {
    return (
      <Space direction="vertical" style={{ background: 'white', maxWidth: '400px' }}>
        <Alert
        // eslint-disable-next-line max-len
          message="Editing table columns is not supported for this Table type. This option is currently available only for below Table types."
          type="info"
        />
        <ul className="ps-6">
          {_.map(allowedTablesForColumnEditing, (tableType, key) => <li key={key}>{tableType}</li>)}
        </ul>
      </Space>
    )
  }

  return (
    <div style={{ background: 'white', maxWidth: '400px' }}>
      <Row>
        {_.map(tableColumnDataOfCurrentSource, (column, key) => (
          <React.Fragment key={key}>
            <Col span={16}>
              <Typography.Text
                editable={{
                  onChange: value => handleColumnChage({ [key]: { ...column, label: value } }),
                }}
              >
                {column.label}
              </Typography.Text>
            </Col>
            {column.allowHide && (
              <Col span={8}>
                <Checkbox
                  onChange={e => handleColumnChage({ [key]: { ...column, hide: e.target.checked } })}
                  checked={!!column.hide}
                >
                  Hide
                </Checkbox>
              </Col>
            )}
          </React.Fragment>
        ))}
      </Row>
    </div>
  )
}

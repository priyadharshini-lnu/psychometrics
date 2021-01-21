import React, { FC } from 'react'
import {
  Button, Col, Descriptions, Row, Skeleton, Typography,
} from 'antd'

import ReactMarkdown from 'react-markdown'
import {
  DrawerDataRecord,
  DrawerModes,
  ToggleDrawer,
} from 'modules/admin/modules/DatasheetManagement/interfaces'

import { InnerHTML } from 'components/InnerHTML'

import { toReadableString } from 'modules/admin/modules/DatasheetManagement/utils'

const { I18n } = window

interface HeaderSectionProps {
  title: string
  isFetching: boolean
  toggleDrawer: ToggleDrawer
  allowEdit: boolean
  currentDatasheetId: string
}

export const HeaderSection: FC<HeaderSectionProps> = ({
  title,
  isFetching,
  toggleDrawer,
  allowEdit,
  currentDatasheetId,
}) => (
  <Row justify="space-between" align="middle" className="mb-2">
    <Col>
      <Typography.Title level={4}>{title}</Typography.Title>
    </Col>
    {allowEdit && (
      <Col>
        <Button
          type="primary"
          disabled={isFetching}
          onClick={() => toggleDrawer(DrawerModes.Edit, currentDatasheetId)}
        >
          {I18n.t('administration.datasheets.drawers.view.edit_button')}
        </Button>
      </Col>
    )}
  </Row>
)

interface DisplayRecordValue {
  record: DrawerDataRecord
}

const DisplayRecordValue: FC<DisplayRecordValue> = ({ record }) => {
  if (record.type === 'markdown') {
    return <ReactMarkdown>{record.value}</ReactMarkdown>
  }

  if (record.type === 'html') {
    return <InnerHTML as="span" value={record.value} shouldSanitize />
  }

  return <>{record.value}</>
}

interface DetailsSectionProps {
  isFetching: boolean
  dataRecord: DrawerDataRecord[]
}

export const DetailsSection: FC<DetailsSectionProps> = ({
  isFetching,
  dataRecord,
}) => (
  <Row>
    <Skeleton loading={isFetching} active>
      {dataRecord.length !== 0 && (
        <Descriptions
          layout="horizontal"
          className="mb-6 w-100"
          bordered
          column={1}
        >
          {dataRecord.map(record => (
            <Descriptions.Item
              label={toReadableString(record.name)}
              key={record.name}
              className="va-t"
            >
              <DisplayRecordValue record={record} />
            </Descriptions.Item>
          ))}
        </Descriptions>
      )}
    </Skeleton>
  </Row>
)

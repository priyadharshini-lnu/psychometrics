import { FC } from 'react'
import {
  Button, Col, Descriptions, Row, Skeleton, Typography, Empty,
} from 'antd'
import ReactMarkdown from 'react-markdown'

import {
  DrawerDataRecord,
  DrawerModes,
  ToggleDrawer,
} from '~/modules/admin/modules/SheetManagement/interfaces'

import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window

interface HeaderSectionProps {
  title: string
  isFetching: boolean
  toggleDrawer: ToggleDrawer
  allowEdit: boolean
  currentSheetRowId: string
}

export const HeaderSection: FC<HeaderSectionProps> = ({
  title,
  isFetching,
  toggleDrawer,
  allowEdit,
  currentSheetRowId,
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
          onClick={() => toggleDrawer(DrawerModes.Edit, currentSheetRowId)}
        >
          {I18n.t('shared.edit')}
        </Button>
      </Col>
    )}
  </Row>
)

interface DisplayRecordValue {
  record: DrawerDataRecord
}

const DisplayRecordValue: FC<DisplayRecordValue> = ({ record }) => {
  if (record.column_type === 'markdown') {
    return <ReactMarkdown>{`${record.value}`}</ReactMarkdown>
  }

  if (record.column_type === 'html') {
    return <SafeHTML as="span" html={`${record.value}`} />
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
              label={record.name}
              key={record.name}
              className="va-t"
            >
              <DisplayRecordValue record={record} />
            </Descriptions.Item>
          ))}
        </Descriptions>
      )}
      {dataRecord.length === 0 && <Empty />}
    </Skeleton>
  </Row>
)

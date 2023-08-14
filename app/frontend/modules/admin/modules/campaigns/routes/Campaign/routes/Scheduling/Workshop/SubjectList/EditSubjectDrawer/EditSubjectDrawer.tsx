import { useEffect, useState, FC } from 'react'
import _ from 'lodash'
import { Moment } from 'moment'
import {
  Drawer, Table, Space, Row, Col, Typography, Form, Select,
  Button, Divider, Skeleton, TimePicker,
} from 'antd'
import {
  PlusOutlined,
} from '@ant-design/icons'
import { connect, ConnectedProps } from 'react-redux'

import { openModal } from '~/modules/admin/core/ui/modals'
import { FullWidthSkeleton, ResourceAvatar } from '~/glint'
import Modals from '~/modules/admin/components/Modals/'
import { AssessorFormModal } from './AssessorFormModal'
import settings from '~/modules/admin/modules/campaigns/settings'
import { AssessorFormList } from './AssessorFormList'
import { UserAssessmentList } from './UserAssessmentList'

import styles from './EditSubjectDrawer.less'

const connector = connect(null, {
  openModal,
})

type PropsFromRedux = ConnectedProps<typeof connector>
type OwnProps = {
  open: boolean,
  // subjectId: string,
  onClose: ()=> void
}
type Props = PropsFromRedux & OwnProps

const { Column } = Table
const { I18n } = window

export const STATUSES = [
  { label: I18n.t('common.status.on_time'), value: 'on_time' },
  { label: I18n.t('common.status.no_show'), value: 'no_show' },
  { label: I18n.t('common.status.late'), value: 'late' },
  { label: I18n.t('common.status.dropped_out'), value: 'dropped_out' },
]
export const PROGRESS_STATUSES = {
  not_started: { label: I18n.t('common.status.not_started'), color: 'default' },
  in_progress: { label: I18n.t('common.status.in_progress'), color: 'warning' },
  completed: { label: I18n.t('common.status.completed'), color: 'success' },
}
const { timeFormat } = settings

const { Text, Title } = Typography

// Sample data
const subjectDetails = {
  name: 'John Doe',
  email: 'john.doe@mail.com',
  photoUrl: '',
  language: 'Arabic',
  preworks: '2/4',
  workshopActivities: '2/5',
  attendanceStatus: 'on_time',
  lateDuration: null,
  assessments: [
    {
      id: 1256,
      name: 'Wave Focus Style',
      status: 'not_started',
      schedule: {
        active: true,
        time: '09:00 AM',
      },
    },
    {
      id: 1783,
      name: 'Swift Analysis Aptitude',
      status: 'in_progress',
      schedule: {
        active: false,
        time: '10:00 AM',
      },
    },
    {
      id: 7638,
      name: 'VLC - Strategy Scenario',
      status: 'completed',
      schedule: {
        active: true,
        time: '07:00 PM',
      },
    },
  ],
  assessorAssessments: [
    {
      id: 126,
      name: 'Wave Focus Style',
      status: 'not_started',
      schedule: '09:00 AM',
      assessor: {
        id: 1,
        name: 'John Doe',
        photoUrl: '',
      },
      meetingLinkType: 'custom',
      meetingLinkUrl: 'https://meet.google.com/fxj-focw-ffq',
      activities: 'MS-Office essentials',
    },
    {
      id: 17833,
      name: 'Swift Analysis Aptitude',
      status: 'in_progress',
      schedule: '10:00 AM',
      assessor: {
        id: 3,
        name: 'Kent Clarke',
        photoUrl: '',
      },
      assessorPhototUrl: '',
      meetingLinkType: 'custom',
      meetingLinkUrl: 'https://meet.google.com/fxj-focw-ffq',
      activities: 'MS-Office essentials',
    },
    {
      id: 47638,
      name: 'VLC - Strategy Scenario',
      status: 'completed',
      schedule: '07:00 PM',
      assessor: {
        id: 2,
        name: 'Ruby Rene',
        photoUrl: '',
      },
      meetingLinkType: 'none',
      meetingLinkUrl: 'https://meet.google.com/fxj-focw-ffq',
      activities: 'MS-Office essentials',
    },
  ],
}

/*= ================ Component ============================================================= */

export const EditSubjectDrawerComponent: FC<Props> = ({
  open, onClose, openModal,
  // subjectId,
}) => {
  // use subjectId to fetch subjectDetails when API is available
  const [subjectData, setSubjectData] = useState(subjectDetails)
  const [loading, setLoading] = useState(true)
  const [, setFields] = useState({})
  const [statusFormInstance] = Form.useForm()

  const handleTimeAcive = (active: boolean, assessmentId: number) => {
    const updatedAssessments = subjectData.assessments
      .map(assessment => (
        assessment.id === assessmentId ? { ...assessment, schedule: { ...assessment.schedule, active } } : assessment
      ))
    setSubjectData({ ...subjectData, assessments: updatedAssessments })
  }

  const handleTimeChange = (value: Moment | null, assessmentId: number) => {
    const timeInTextFormat = value?.format(timeFormat) || ''
    const updatedAssessments = subjectData.assessments
      .map(assessment => (
        assessment.id === assessmentId
          ? { ...assessment, schedule: { ...assessment.schedule, time: timeInTextFormat } } : assessment
      ))
    setSubjectData({ ...subjectData, assessments: updatedAssessments })
  }

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 5000)
  }, [])

  const handleClose = () => {
    onClose()
  }

  const handleAssessorFormSubmit = ({ id, values }) => {
    const { assessorAssessments } = subjectData
    const dataExist = assessorAssessments.some(assessment => assessment.id === id)
    if (dataExist) {
      const updatedAssessorFormData = assessorAssessments.map((assessment) => {
        if (assessment.id === id) {
          return ({ ...assessment, ...values, schedule: values.schedule.format(timeFormat) })
        }
        return assessment
      })
      setSubjectData({ ...subjectData, assessorAssessments: updatedAssessorFormData })
    } else {
      setSubjectData({
        ...subjectData,
        assessorAssessments: [...assessorAssessments,
          { ...values, id, schedule: values.schedule.format(timeFormat) }],
      })
    }
  }

  const handleEditAssessorForm = (data) => {
    openModal('AssessorFormModal', { initialFormData: data })
  }
  const handleDeleteAssessorForm = (id) => {
    setSubjectData({
      ...subjectData,
      assessorAssessments: subjectData.assessorAssessments.filter(assessorForm => assessorForm.id !== id),
    })
  }

  const handleSaveData = () => {
    // code to subjectDetails to backend
  }

  const title = !loading ? (
    <Row className="font-normal fs-14" wrap={false} gutter={[8, 0]}>
      <Col span={12}>
        <Space>
          <ResourceAvatar size="large" url={subjectData.photoUrl} name={subjectData.name} />
          <Space size={0} direction="vertical">
            {subjectData.name}
            <Text type="secondary">{subjectData.email}</Text>
          </Space>
        </Space>
      </Col>
      <Col span={3}>
        <Space size="small" align="end" direction="vertical">
          <Text type="secondary">{I18n.t('administration.scheduling.subjects.language')}</Text>
          <Text className="flex-end">{subjectData.language}</Text>
        </Space>
      </Col>
      <Col span={3}>
        <Space size="small" align="end" direction="vertical">
          <Text type="secondary">{I18n.t('administration.scheduling.subjects.preworks')}</Text>
          <Text className="flex-end">{subjectData.preworks}</Text>
        </Space>
      </Col>
      <Col span={6}>
        <Space size="small" align="end" direction="vertical">
          <Text type="secondary">{I18n.t('administration.scheduling.subjects.activities')}</Text>
          <Text className="flex-end">{subjectData.workshopActivities}</Text>
        </Space>
      </Col>
    </Row>
  ) : <FullWidthSkeleton active rows={1} height="100" />

  const statusForm = !loading ? (
    <Form
      form={statusFormInstance}
      className={styles.form}
      layout="inline"
      initialValues={{
        status: subjectData.attendanceStatus || 'On Time',
        lateDuration: subjectData.lateDuration || null,
      }}
      onFieldsChange={(_, allFields) => {
        setFields(allFields)
      }}
    >
      <Space size="large">
        <Form.Item className="font-normal" label="Status" name="status">
          <Select dropdownStyle={{ minWidth: '120px' }}>
            {STATUSES.map(status => (
              <Select.Option
                key={status.value}
                value={status.value}
              >
                {status.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {statusFormInstance.getFieldValue('status') === 'late' ? (
          <Form.Item label="Late Duration" name="lateDuration">
            <TimePicker format={timeFormat} />
          </Form.Item>
        ) : null}
      </Space>
    </Form>
  ) : <FullWidthSkeleton active rows={1} height="100" />

  const assessmentsTable = !loading ? (
    <UserAssessmentList
      assessments={subjectData.assessments}
      onTimeAcive={handleTimeAcive}
      onTimeChange={handleTimeChange}
    />

  ) : <TableSkeleton rowsCount={3} columnsCount={4} cellHeight="40px" />

  const assessorAssessmentsTable = !loading ? (
    <AssessorFormList
      assessorAssessments={subjectData.assessorAssessments}
      onEditAssessorForm={handleEditAssessorForm}
      onDeleteAssessorForm={handleDeleteAssessorForm}
    />

  ) : <TableSkeleton rowsCount={3} columnsCount={4} cellHeight="40px" />

  const footer = !loading ? <Button type="primary" onClick={handleSaveData}>Save</Button> : <Skeleton.Button active />

  return (
    <>
      <Drawer
        footerStyle={{ textAlign: 'end' }}
        footer={footer}
        width="80%"
        title={title}
        open={open}
        onClose={handleClose}
        destroyOnClose
      >
        {statusForm}
        <Divider />
        <Space size="large" direction="vertical" className="w-100">
          <Title className="mb-0" level={5}>{I18n.t('administration.scheduling.subjects.assessments')}</Title>
          {assessmentsTable}
          <Title className="mb-0" level={5}>{I18n.t('administration.scheduling.subjects.assessor_forms')}</Title>
          {assessorAssessmentsTable}
          {!loading ? (
            <Button onClick={() => openModal('AssessorFormModal')}>
              <PlusOutlined />
              {I18n.t('administration.scheduling.subjects.add_assessor_form')}
            </Button>
          ) : <Skeleton.Button active />}
        </Space>
        <Divider />
      </Drawer>
      <Modals
        modals={{
          AssessorFormModal: props => (
            <AssessorFormModal
              {...props}
              onFormFinish={handleAssessorFormSubmit}
            />
          ),
        }}
      />
    </>
  )
}

type TableSkeletonProps = {
  columnsCount: number,
  rowsCount: number,
  cellHeight: string,
}

const TableSkeleton: FC<TableSkeletonProps> = ({ columnsCount, rowsCount, cellHeight }) => {
  const dataSource = _.range(0, rowsCount).map(number => ({ number }))
  return (
    <Table pagination={false} dataSource={dataSource}>
      {_.range(0, columnsCount).map(number => (
        <Column
          key={number}
          title={<FullWidthSkeleton active rows={1} height={cellHeight} />}
          dataIndex="id"
          render={() => <FullWidthSkeleton active rows={1} height={cellHeight} />}
        />
      ))}
    </Table>
  )
}

export const EditSubjectDrawer = connector(EditSubjectDrawerComponent)

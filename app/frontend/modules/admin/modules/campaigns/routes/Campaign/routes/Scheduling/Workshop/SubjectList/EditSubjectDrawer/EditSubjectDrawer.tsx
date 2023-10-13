import { useEffect, useState, FC } from 'react'
import _ from 'lodash'
import moment, { Moment } from 'moment'
import {
  Drawer, Table, Space, Row, Col, Typography, Form, Select, Alert,
  Button, Divider, Skeleton,
} from 'antd'
import {
  PlusOutlined,

} from '@ant-design/icons'
import * as t from 'io-ts'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import InputDuration from '~/components/InputDuration'

import { openModal } from '~/modules/admin/core/ui/modals'
import { FullWidthSkeleton, ResourceAvatar } from '~/glint'
import Modals from '~/modules/admin/components/Modals/'
import { AssessorFormModal } from './AssessorFormModal'
import { AssessorFormList } from './AssessorFormList'
import { UserAssessmentList } from './UserAssessmentList'
import { useResources } from '~/hooks/useResources'
import {
  EditableWorkshopSubject, SubjectAssessment, AssessorAssessment, AssessorAssessmentTR,
} from '~/modules/admin/modules/campaigns/core/workshopSubject'

import styles from './EditSubjectDrawer.less'

const connector = connect(null, {
  openModal,
})

interface Errors {
  base: [{
    title: {
      assessorForms: string,
    }
  }]
}

type PropsFromRedux = ConnectedProps<typeof connector>
type OwnProps = {
  open: boolean,
  subjectId: string,
  userId: string,
  onClose: ()=> void
}
type Props = PropsFromRedux & OwnProps

const { Column } = Table
const { I18n } = window

export const STATUSES = [
  { label: I18n.t('common.status.not_status'), value: 'no_status' }, // remove use of common.
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

const { Text, Title } = Typography

export const EditSubjectDrawerComponent: FC<Props> = ({
  open, onClose, openModal,
  subjectId,
  userId,
}) => {
  const [, setFields] = useState({})
  const [errors, setErrors] = useState<Errors>()
  const [statusFormInstance] = Form.useForm()

  const { campaignId } = useParams<{ campaignId: string }>()
  const { id } = useParams<{ id: string }>()
  const { fetchSingle, getResource, isLoading } = useResources<EditableWorkshopSubject>(
    'workshop_subjects',
    {
      basePath: `campaigns/${campaignId}/workshops/${id}/`,
      apiConfig: {
        include: ['user', 'workshop'],
        include_resource_meta: ['assessor_assessments', 'assessors'],
      },
    },
  )
  const workshopSubjectDetailsLoading = isLoading(`fetch@${subjectId}`)

  const {
    memberAction,
  } = useResources<EditableWorkshopSubject>(
    'workshop_subjects',
    {
      basePath: `campaigns/${campaignId}/`,
    },
  )

  const workshopSubject = getResource(subjectId)

  const {
    data: assessments, fetch: fetchAssessments,
  } = useResources<SubjectAssessment>(
    'user_assessments',
    {
      basePath: `campaigns/${campaignId}/workshop_subjects/${subjectId}/`,
      apiConfig: {
        filter: {
          subject_id_eq: userId,
          campaign_id_eq: campaignId,
          preworks: 'false',
          workshop_activities: 'true',
        },
      },
    },
  )

  const {
    collectionAction: fetchAssessorAssessments,
  } = useResources<AssessorAssessment>(
    'campaign_assessor_assessments',
    {
      basePath: `campaigns/${campaignId}/workshop_subjects/${subjectId}/`,
      apiConfig: {
        filter: {
          subject_id_eq: subjectId,
        },
      },
    },
  )

  const [assessorAssessments, setAssessorAssessments] = useState<AssessorAssessment[]>([])
  const subjectDetails = {
    ...workshopSubject,
    assessments,
    assessorAssessments,
  }
  const [subjectData, setSubjectData] = useState(subjectDetails)


  useEffect(() => {
    if (workshopSubject) {
      setSubjectData({ ...subjectData, ...workshopSubject })
    }
  }, [workshopSubject])

  useEffect(() => {
    if (assessments) {
      setSubjectData({ ...subjectData, assessments })
    }
  }, [assessments])

  useEffect(() => {
    if (assessorAssessments) {
      setSubjectData({ ...subjectData, assessorAssessments })
    }
  }, [assessorAssessments])

  useEffect(() => {
    if (open && subjectId) {
      fetchSingle({ id: subjectId })
      fetchAssessments()
      fetchAssessorAssessments(
        { action: 'subject_assessor_assessments', method: 'get', responseType: t.array(AssessorAssessmentTR) },
      ).then((data: AssessorAssessment[]) => {
        setAssessorAssessments(data)
      })
    }
  }, [subjectId, open])

  const handleTimeChange = (value: Moment | null, userAssessmentId: string) => {
    const updatedAssessments = subjectData.assessments
      .map(userAssessment => (
        userAssessment.id.toString() === userAssessmentId.toString()
          ? { ...userAssessment, scheduleTime: value?.format() } : userAssessment
      ))
    setSubjectData({ ...subjectData, assessments: updatedAssessments })
  }

  const handleClose = () => {
    setErrors(undefined)
    onClose()
  }

  const handleAssessorFormSubmit = ({ id, values }) => {
    const { assessorAssessments } = subjectData
    const dataExist = assessorAssessments.some(assessment => assessment.id === id)
    if (dataExist) {
      const updatedAssessorFormData = assessorAssessments.map((assessment) => {
        if (assessment.id === id) {
          return ({
            ...assessment,
            ...values,
            scheduleTime: values.scheduleTime.format(),
          })
        }
        return assessment
      })
      setSubjectData({ ...subjectData, assessorAssessments: updatedAssessorFormData })
    } else {
      setSubjectData({
        ...subjectData,
        assessorAssessments: [...assessorAssessments,
          { ...values, id, scheduleTime: values.scheduleTime.format() }],
      })
    }
  }

  const handleEditAssessorForm = (data) => {
    openModal('AssessorFormModal', {
      initialFormData: { ...data, scheduleTime: moment(data.scheduleTime || Date.now()) },
      assessors: workshopSubject?.meta.assessors,
      workshop: workshopSubject?.workshop,
      assessments: workshopSubject?.meta.assessorAssessments,
    })
  }
  const handleDeleteAssessorForm = (id) => {
    const { assessorAssessments } = subjectData
    const dataExist = assessorAssessments.some(assessment => assessment.id === id)
    if (dataExist) {
      const updatedAssessorFormData = assessorAssessments.map((assessment) => {
        if (assessment.id === id) {
          return ({
            ...assessment,
            scheduleTime: null,
            assessor: null,
            meetingType: 'none',
            meetingLink: null,
            status: null,
          })
        }
        return assessment
      })
      setSubjectData({ ...subjectData, assessorAssessments: updatedAssessorFormData })
    }
  }

  const updateSubject = () => {
    const statusValues = statusFormInstance.getFieldsValue()
    memberAction({
      id: subjectId,
      action: 'update_subject_details_and_assessments',
      method: 'post',
      body: { ...subjectData, ...statusValues },
    }).catch((e) => {
      setErrors(e)
    }).then((response) => {
      if (response === 'ok') {
        onClose()
      }
    })
  }

  const handleSaveData = () => {
    updateSubject()
  }

  const title = !workshopSubjectDetailsLoading ? (
    <Row className="font-normal fs-14" wrap={false} gutter={[8, 0]}>
      <Col span={12}>
        <Space>
          <ResourceAvatar
            tooltip={subjectData?.user?.fullName || ''}
            url={subjectData?.user?.photoUrl || ''}
            name={subjectData?.user?.fullName || ''}
          />
          <Space size={0} direction="vertical">
            {subjectData?.user?.fullName}
            <Text type="secondary">{subjectData?.user?.email}</Text>
          </Space>
        </Space>
      </Col>
      <Col span={3}>
        <Space size="small" align="end" direction="vertical">
          <Text type="secondary">{I18n.t('administration.scheduling.subjects.language')}</Text>
          <Text className="flex-end">{subjectData?.language}</Text>
        </Space>
      </Col>
      <Col span={3}>
        <Space size="small" align="end" direction="vertical">
          <Text type="secondary">{I18n.t('administration.scheduling.subjects.preworks')}</Text>
          <Text className="flex-end">{subjectData?.preworks}</Text>
        </Space>
      </Col>
      <Col span={6}>
        <Space size="small" align="end" direction="vertical">
          <Text type="secondary">{I18n.t('administration.scheduling.subjects.activities')}</Text>
          <Text className="flex-end">{subjectData?.workshopActivities}</Text>
        </Space>
      </Col>
    </Row>
  ) : <FullWidthSkeleton active rows={1} height="100" />

  const statusForm = !workshopSubjectDetailsLoading ? (
    <Form
      form={statusFormInstance}
      className={styles.form}
      layout="inline"
      onFieldsChange={(_, allFields) => {
        setFields(allFields)
      }}
    >
      <Space size="large">
        <Form.Item
          className="font-normal"
          label="Status"
          name="attendanceStatus"
          initialValue={subjectData.attendanceStatus}
        >
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
        {statusFormInstance.getFieldValue('attendanceStatus') === 'late' ? (
          <Form.Item label="Late Duration" name="lateDuration" initialValue={subjectData.lateDuration || null}>
            <InputDuration
              value=""
              onChange={() => {}}
              placeholder={I18n.t('administration.scheduling.assessment_center_form.duration_placeholder')}
            />
          </Form.Item>
        ) : null}
      </Space>
    </Form>
  ) : <FullWidthSkeleton active rows={1} height="100" />

  const assessmentsTable = !workshopSubjectDetailsLoading ? (
    <UserAssessmentList
      assessments={subjectData.assessments}
      onTimeChange={handleTimeChange}
    />

  ) : <TableSkeleton rowsCount={3} columnsCount={4} cellHeight="40px" />

  const assessorAssessmentsTable = !workshopSubjectDetailsLoading ? (
    <AssessorFormList
      assessorAssessments={subjectData.assessorAssessments}
      onEditAssessorForm={handleEditAssessorForm}
      onDeleteAssessorForm={handleDeleteAssessorForm}
    />

  ) : <TableSkeleton rowsCount={3} columnsCount={4} cellHeight="40px" />

  const footer = !workshopSubjectDetailsLoading
    ? <Button type="primary" onClick={handleSaveData}>Save</Button> : <Skeleton.Button active />

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
          {errors && errors.base && errors.base.length > 0 && (
            <Alert
              message={errors.base.map(
                error => error?.title[0].assessor_forms,
              )}
              type="error"
            />
          )}
          {assessorAssessmentsTable}
          {!workshopSubjectDetailsLoading ? (
            <Button onClick={() => openModal(
              'AssessorFormModal',
              {
                assessors: workshopSubject?.meta.assessors,
                assessments: workshopSubject?.meta.assessorAssessments,
                workshop: workshopSubject?.workshop,
              },
            )}
            >
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

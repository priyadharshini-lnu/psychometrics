import {
  useEffect, useState, FC,
  useMemo,
} from 'react'
import {
  Drawer, Space, Row, Col, Typography, Form, Select, Alert,
  Button, Divider,
} from 'antd'
import * as t from 'io-ts'
import { connect, ConnectedProps } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Dayjs } from 'dayjs'
import {
  PlusOutlined,

} from '~/glint/icons/AccessibleIconsAntDesign'
import { mergeDateAndTime } from '~/utils/time'
import dayjs from '~/utils/dayjs'
import InputDuration from '~/components/InputDuration'

import { openModal } from '~/modules/admin/core/ui/modals'
import { FullWidthSkeleton, ResourceAvatar, TableSkeleton } from '~/glint'
import Modals from '~/modules/admin/components/Modals/'
import { AssignAssessorFormModal } from './AssignAssessorFormModal'
import { AssessorAssessmentList } from './AssessorAssessmentList'
import { UserAssessmentList } from './UserAssessmentList'
import {
  AssessorUserAssessment,
  AssessorUserAssessmentTR,
  CampaignAssessorAssessment,
  CampaignAssessorAssessmentTR,
  SubjectUserAssessment,
} from '~/modules/admin/modules/campaigns/core/workshopSubject'

import styles from './EditSubjectDrawer.less'
import { ASSESSMENT_SOURCE, STATUSES } from './Constants'
import { useWorkshopSubjectResources } from './useWorkshopSubjectResources'
import { combineAssessments } from './Helpers'

const MODALS = {
  AssessorFormModal: AssignAssessorFormModal,
}

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
  workshopStartTime: string,
  campaignAssessmentGroupId: string,
  onClose: ()=> void
}
type Props = PropsFromRedux & OwnProps

const { I18n } = window

const { Text, Title } = Typography

export const EditSubjectDrawerComponent: FC<Props> = ({
  open, onClose, openModal,
  subjectId,
  workshopStartTime,
  userId,
  campaignAssessmentGroupId,
}) => {
  const [, setFields] = useState({})
  const [errors, setErrors] = useState<Errors>()
  const [statusFormInstance] = Form.useForm()
  const { campaignId, id } = useParams() as { campaignId: string, id: string }

  const [assessments, setAssessments] = useState<SubjectUserAssessment[]>([])
  const [assessmentsMap, setAssessmentsMap] = useState<Map<string, SubjectUserAssessment> | null>(null)
  // Assessor Assessments for which Assessor has been assigned
  const [assessorUserAssessments, setAssessorUserAssessments] = useState<AssessorUserAssessment[]>([])
  const [campaignAssessorAssessments, setCampaignAssessorAssessments] = useState<CampaignAssessorAssessment[]>([])
  const [campaignAssessorAssessmentsMap, setCampaignAssessorAssessmentsMap] = useState<Map<number,
  CampaignAssessorAssessment> | null>(null)
  const [combinedAssessorAssessments, setCombinedAssessorAssessments] = useState<AssessorUserAssessment[]>([])

  const {
    fetchSubject,
    workshopSubjectDetailsLoading,
    workshopSubject,
    subjecUserAssessments,
    fetchAssessments,
    fetchAssessorAssessments,
    updateSubject,
  } = useWorkshopSubjectResources(campaignId, id, subjectId, userId, campaignAssessmentGroupId)

  const assessorAssessmentsMap = useMemo(() => {
    const assignedAssessmentIds = new Map()
    const unassignedAssessmentIds = new Map()
    combinedAssessorAssessments.forEach((assessment) => {
      if (assessment.assessor) {
        assignedAssessmentIds.set(`${assessment.assessmentId}_${assessment.assessor?.userId}`, assessment)
      } else {
        unassignedAssessmentIds.set(assessment.assessmentId, assessment)
      }
    })
    return {
      assignedAssessmentIds,
      unassignedAssessmentIds,
    }
  }, [combinedAssessorAssessments])

  useEffect(() => {
    const assessments = combineAssessments(assessorUserAssessments, campaignAssessorAssessments)
    setCombinedAssessorAssessments(assessments)
  }, [assessorUserAssessments, campaignAssessorAssessments])

  useEffect(() => {
    setAssessments(subjecUserAssessments)
    const map = new Map()
    subjecUserAssessments.forEach((am) => {
      map.set(am.assessment.id, am)
    })
    setAssessmentsMap(map)
  }, [subjecUserAssessments])

  useEffect(() => {
    if (open && subjectId) {
      fetchSubject({ id: subjectId })
      fetchAssessments()
      fetchAssessorAssessments({
        action: 'subject_assessor_assessments',
        method: 'get',
        responseType: {
          assessor_assessments: t.array(AssessorUserAssessmentTR),
          campaign_assessor_assessments: t.array(CampaignAssessorAssessmentTR),
        },
      }).then((
        data: {
          assessorUserAssessments: AssessorUserAssessment[],
          campaignAssessorAssessments: CampaignAssessorAssessment[]
        },
      ) => {
        setAssessorUserAssessments(data.assessorUserAssessments)
        setCampaignAssessorAssessments(data.campaignAssessorAssessments)
        const map = new Map()
        data.campaignAssessorAssessments.forEach((am) => {
          map.set(am.assessmentId, am)
        })
        setCampaignAssessorAssessmentsMap(map)
      })
    }
  }, [subjectId, open])

  const handleTimeChange = (value: Dayjs | null, userAssessmentId: string) => {
    const scheduleTime = value ? mergeDateAndTime(dayjs(workshopStartTime), value) : null
    const updatedAssessments = assessments
      .map(userAssessment => (
        userAssessment.id.toString() === userAssessmentId.toString()
          ? { ...userAssessment, scheduleTime: scheduleTime?.format() } : userAssessment
      ))
    setAssessments(updatedAssessments)
  }

  const handleClose = () => {
    setErrors(undefined)
    onClose()
  }

  const handleAssessorFormSubmit = (
    newAssessment:AssessorUserAssessment,
    type: 'update' | 'create',
    prevAssessment?: AssessorUserAssessment,
  ) => {
    const comboExist = assessorAssessmentsMap.assignedAssessmentIds.get(
      `${newAssessment.assessmentId}_${newAssessment.assessor?.userId}`,
    )
    const allowUpdate = newAssessment.assessmentId === prevAssessment?.assessmentId
    && newAssessment?.assessor?.userId === prevAssessment.assessor?.userId
    if (comboExist && !allowUpdate) {
      return
    }
    if (type === 'create') {
      setCombinedAssessorAssessments([newAssessment, ...combinedAssessorAssessments])
    }

    if (type === 'update') {
      const updatedAssessorFormData = combinedAssessorAssessments.map((
        assessment: AssessorUserAssessment,
      ) => {
        if (assessment.assessmentId === prevAssessment?.assessmentId
          && assessment?.assessor?.userId === prevAssessment.assessor?.userId) {
          return (
            newAssessment
          )
        }
        return assessment
      })
      setCombinedAssessorAssessments(updatedAssessorFormData)
    }
  }

  const handleOpenAssignAssessorFormModal = (data?: AssessorUserAssessment) => {
    openModal('AssessorFormModal', {
      assessment: data,
      assessors: workshopSubject?.meta.assessors,
      workshop: workshopSubject?.workshop,
      campaignAssessorAssessments,
      combinedAssessorAssessments,
      linkedAssessments: assessmentsMap,
      onFormFinish: handleAssessorFormSubmit,
    })
  }

  const handleDeleteAssessorForm = (deleteAssessment: AssessorUserAssessment) => {
    const comboExist = assessorAssessmentsMap.assignedAssessmentIds.get(
      `${deleteAssessment.assessmentId}_${deleteAssessment.assessor?.userId}`,
    )

    if (comboExist) {
      const isUnasigenedAssessment = assessorAssessmentsMap.unassignedAssessmentIds.get(deleteAssessment.assessmentId)
      let updatedAssessorFormData: AssessorUserAssessment[]
      if (isUnasigenedAssessment) {
        updatedAssessorFormData = combinedAssessorAssessments.filter(assessment => !(
          assessment.assessmentId === deleteAssessment.assessmentId
          && assessment.assessor?.userId === deleteAssessment.assessor?.userId))
      } else {
        updatedAssessorFormData = combinedAssessorAssessments.map((assessment) => {
          if (assessment.assessmentId === deleteAssessment.assessmentId
             && assessment.assessor?.userId === deleteAssessment.assessor?.userId) {
            const campaignAssessment = campaignAssessorAssessmentsMap?.get(deleteAssessment.assessmentId)
            const updatedAssessment = ({
              id: campaignAssessment?.id || '',
              scheduleTime: null,
              name: campaignAssessment?.name || '',
              status: campaignAssessment?.status || '',
              meetingLink: campaignAssessment?.meetingLink || '',
              meetingType: campaignAssessment?.meetingType || '',
              linkedActivityId: campaignAssessment?.linkedActivityId || '',
              linkedActivityName: campaignAssessment?.linkedActivityName || '',
              assessmentId: deleteAssessment.assessmentId,
              assessor: null,
              source: ASSESSMENT_SOURCE.CAMPAIGN_ASSESSOR_ASSESSMENTS,
            })
            return updatedAssessment
          }
          return assessment
        })
      }
      setCombinedAssessorAssessments(updatedAssessorFormData)
    }
  }

  const handleSaveData = () => {
    const statusValues = statusFormInstance.getFieldsValue()
    const assessorAssessments = combinedAssessorAssessments
      .filter(am => am.assessor)
      .map((assessment) => {
        if (assessment.source === ASSESSMENT_SOURCE.CAMPAIGN_ASSESSOR_ASSESSMENTS) {
          const newAssessment: {id?: string, campaignAssessorAssessmentId?: string } &
             Omit<AssessorUserAssessment, 'id'> = {
               ...assessment,
               campaignAssessorAssessmentId: assessment.id,
             }
          delete newAssessment.id
          return newAssessment
        }
        return assessment
      })
    updateSubject({
      id: subjectId,
      action: 'update_subject_details_and_assessments',
      method: 'post',
      body: {
        ...workshopSubject,
        ...statusValues,
        assessments,
        assessorAssessments,
      },
    }).catch((e) => {
      setErrors(e)
    }).then((response) => {
      if (response === 'ok') {
        onClose()
      }
    })
  }

  const skeleton = (
    <>
      <FullWidthSkeleton active rows={1} height="100" />
      <Divider />
      <TableSkeleton rowsCount={3} columnsCount={4} cellHeight="40px" />
      <Divider />
      <TableSkeleton rowsCount={3} columnsCount={4} cellHeight="40px" />
    </>
  )

  const title = !workshopSubjectDetailsLoading ? (
    <Row className="font-normal fs-14" wrap={false} gutter={[8, 0]}>
      <Col span={12}>
        <Space>
          <ResourceAvatar
            tooltip={workshopSubject?.user?.fullName || ''}
            url={workshopSubject?.user?.photoUrl || ''}
            name={workshopSubject?.user?.fullName || ''}
          />
          <Space size={0} orientation="vertical">
            {workshopSubject?.user?.fullName}
            <Text type="secondary">{workshopSubject?.user?.email}</Text>
          </Space>
        </Space>
      </Col>
      <Col span={3}>
        <Space size="small" align="end" orientation="vertical">
          <Text type="secondary">{I18n.t('admin.scheduling_subjects_language')}</Text>
          <Text className="flex-end">
            {workshopSubject?.language || I18n.t('admin.scheduling_subjects_language_not_selected')}
          </Text>
        </Space>
      </Col>
      <Col span={3}>
        <Space size="small" align="end" orientation="vertical">
          <Text type="secondary">{I18n.t('admin.scheduling_subjects_preworks')}</Text>
          <Text className="flex-end">{workshopSubject?.preworks}</Text>
        </Space>
      </Col>
      <Col span={6}>
        <Space size="small" align="end" orientation="vertical">
          <Text type="secondary">{I18n.t('admin.scheduling_subjects_activities')}</Text>
          <Text className="flex-end">{workshopSubject?.workshopActivities}</Text>
        </Space>
      </Col>
    </Row>
  ) : <FullWidthSkeleton active rows={1} height="100" />

  const statusForm = (
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
          initialValue={workshopSubject?.attendanceStatus}
        >
          <Select styles={{ popup: { root: { minWidth: '120px' } } }}>
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
          <Form.Item label="Late Duration" name="lateDuration" initialValue={workshopSubject?.lateDuration || null}>
            <InputDuration
              value=""
              onChange={() => {}}
              placeholder={I18n.t('admin.duration_placeholder')}
            />
          </Form.Item>
        ) : null}
      </Space>
    </Form>
  )

  const footer = workshopSubjectDetailsLoading ? (
    <FullWidthSkeleton active rows={1} height="50" />
  ) : (
    <Button type="primary" onClick={handleSaveData}>
      {I18n.t('shared.save')}
    </Button>
  )

  return (
    <>
      <Drawer
        footer={footer}
        width="80%"
        title={title}
        open={open}
        onClose={handleClose}
        destroyOnHidden
        focusable={{ trap: false }}
        styles={{
          footer: { textAlign: 'end' },
        }}
      >
        {workshopSubjectDetailsLoading ? skeleton : (
          <>
            {statusForm}
            <Space size="large" orientation="vertical" rootClassName="w-100">
              <Title
                rootClassName="mb-0"
                level={5}
              >
                {I18n.t('admin.scheduling_subjects_assessments')}
              </Title>
              <UserAssessmentList
                assessments={assessments}
                onTimeChange={handleTimeChange}
              />
              <Title
                rootClassName="mb-0"
                level={5}
              >
                {I18n.t('admin.scheduling_subjects_assessor_forms')}
              </Title>
              {errors?.base && errors.base.length > 0 && (
                <Alert
                  message={errors.base.map(
                    error => error?.title[0].assessor_forms,
                  )}
                  type="error"
                />
              )}
              <AssessorAssessmentList
                assessments={combinedAssessorAssessments}
                onEdit={handleOpenAssignAssessorFormModal}
                onDelete={handleDeleteAssessorForm}
              />
              <Button onClick={() => handleOpenAssignAssessorFormModal()}>
                <PlusOutlined />
                {I18n.t('admin.scheduling_subjects_add_assessor_form')}
              </Button>
            </Space>
          </>
        )}
      </Drawer>
      <Modals modals={MODALS} />
    </>
  )
}


export const EditSubjectDrawer = connector(EditSubjectDrawerComponent)

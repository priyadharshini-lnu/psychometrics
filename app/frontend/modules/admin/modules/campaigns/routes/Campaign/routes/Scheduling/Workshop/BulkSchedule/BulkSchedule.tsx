import React, { useEffect, useState } from 'react'
import {
  Drawer, Table, Avatar, Checkbox, Space, Radio, TimePicker, Button, Col, Row,
} from 'antd'
import { useParams } from 'react-router-dom'

import dayjs from '~/utils/dayjs'
import { ResourceAvatar } from '~/glint'
import { CampaignAssessment, CampaignAssessmentTR } from '~/modules/admin/modules/campaigns/core/campaignAssessment'
import {
  WorkshopSubject,
} from '~/modules/admin/modules/campaigns/core/workshopSubject'
import { useResources } from '~/hooks/useResources'
import settings from '~/modules/admin/modules/campaigns/settings'
import { mergeDateAndTime } from '~/utils/time'

const { I18n } = window
interface Props {
  open: boolean
  subjects: WorkshopSubject[]
  onClose: () => void
  onSave: (data) => void
  workshopStartTime: string,
  campaignAssessmentGroupId: string | null,
}

interface PayloadData {
  assessmentId: string,
  assessmentName: string,
  action: 'no_change' | 'schedule' | 'unschedule',
  time: string | null,
}

export const BulkSchedule: React.FC<Props> = ({
  open,
  subjects,
  onClose,
  onSave,
  workshopStartTime,
  campaignAssessmentGroupId,
}) => {
  const {
    id, campaignId,
  } = useParams() as { id: string, campaignId: string }

  const { fetch } = useResources<CampaignAssessment>('campaign_assessments', {
    basePath: `campaigns/${campaignId}/workshops/${id}`,
    responseType: CampaignAssessmentTR,
    apiConfig: {
      filter: { workshop_activity_eq: 'true', campaign_id_eq: campaignId },
      include: ['assessment'],
      fields: {
        assessments: ['name'],
      },
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    const filter = {
      workshop_activity_eq: 'true',
      campaign_id_eq: campaignId,
      ...(campaignAssessmentGroupId ? { campaign_assessment_group_id_eq: campaignAssessmentGroupId } : {}),
    }

    fetch({
      apiConfig: {
        filter,
      },
    }).then((response) => {
      setData(response.data.map(({ assessment }) => ({
        assessmentId: assessment.id,
        assessmentName: assessment.name,
        action: 'no_change',
        time: null,
      })))
    })
  }, [open, campaignId, campaignAssessmentGroupId])

  const [overrideExists, setOverrideExists] = useState(false)
  const [data, setData] = useState<PayloadData[]>([])

  const save = () => {
    const payload = {
      subjectIds: subjects.map(s => s.id),
      assessments: data,
      overrideExisting: overrideExists,
    }
    onSave(payload)
  }

  const changeAction = (assessment, value) => {
    let { time } = assessment
    if (value === 'schedule' && !time) {
      time = mergeDateAndTime(dayjs(workshopStartTime), dayjs())
    }
    setData(data.map(d => (d.assessmentId === assessment.assessmentId ? { ...d, action: value, time } : d)))
  }
  const changeTime = (assessment, time) => {
    time = mergeDateAndTime(dayjs(workshopStartTime), time)
    setData(data.map(d => (d.assessmentId === assessment.assessmentId ? { ...d, time: time.toDate() } : d)))
  }

  return (
    <Drawer width="60%" title={I18n.t('admin.scheduling_subjects_form_title')} open={open} onClose={onClose}>
      <Avatar.Group
        size="large"
        max={{
          style: { color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer' },
        }}
      >
        {subjects.map(subject => <ResourceAvatar name={subject?.user?.fullName || ''} />)}
      </Avatar.Group>
      <div>
        {data.length}
        {' '}
        {I18n.t('admin.scheduling_subjects_assessments')}
      </div>
      <Table dataSource={data}>
        <Table.Column title="ID" dataIndex="assessmentId" />
        <Table.Column
          title="Assessment Name"
          width="40%"
          render={assessment => <div>{assessment.assessmentName}</div>}
        />
        <Table.Column
          title="Schedule Time"
          render={assessment => (
            <Space>
              <Radio.Group
                value={assessment.action}
                defaultValue="no_change"
                onChange={e => changeAction(assessment, e.target.value)}
              >
                <Radio value="no_change">{I18n.t('admin.scheduling_subjects_no_change')}</Radio>
                <Radio value="schedule">{I18n.t('admin.scheduling_subjects_schedule')}</Radio>
                <Radio value="unschedule">{I18n.t('admin.scheduling_subjects_unschedule')}</Radio>
              </Radio.Group>
              { assessment.action === 'schedule' && (
                <TimePicker
                  format={settings.timeFormat}
                  onChange={value => changeTime(assessment, value)}
                  defaultValue={dayjs()}
                />
              )}
            </Space>
          )}
        />
      </Table>
      <Space>
        <Checkbox checked={overrideExists} onChange={() => setOverrideExists(!overrideExists)}>
          {I18n.t('admin.scheduling_subjects_override_existing')}
        </Checkbox>
      </Space>
      <Row justify="end">
        <Col><Button type="primary" onClick={save}>{I18n.t('common.actions.save')}</Button></Col>
      </Row>
    </Drawer>
  )
}

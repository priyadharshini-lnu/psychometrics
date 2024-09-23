import { FC, useEffect, useState } from 'react'
import {
  Drawer, Row, Descriptions, Button, List,
} from 'antd'
import { useParams } from 'react-router-dom'
import { EditOutlined } from '@ant-design/icons'
import Assessment from '~/modules/admin/modules/campaigns/interfaces/Assessment'
import { MettlScheduleRecord } from '~/modules/admin/modules/client/core/mettlScheduleRecords'
import { useResources } from '~/hooks/useResources'
import { UpdateMettlScheduleForm } from './UpdateMettlScheduleForm'
import MettlScheduleDetails from '../../../../../MettlScheduleDetails/MettlScheduleDetails'

const { I18n } = window

interface Props {
  close: () => void
  assessment: Assessment | undefined
  campaignId: string
  updateMettlSchedule: (
    campaignId: number, assessmentId: number, body: {assessment: {id: string}}
  ) => Promise<{ response: unknown; }>
}

export const DetailsDrawer: FC<Props> = ({
  close,
  assessment,
  campaignId,
  updateMettlSchedule,
}) => {
  if (!assessment) {
    return null
  }

  const { permissions } = assessment
  const [mettlScheduleRecord, setMettlScheduleRecord] = useState<MettlScheduleRecord>()
  const [isFormVisible, setIsFormVisible] = useState(false)

  const { projectId } = useParams<{ projectId: string }>()
  const {
    memberAction,
  } = useResources<MettlScheduleRecord>(
    'mettl_schedule_records',
    {
      basePath: `projects/${projectId}`,
      trackUrl: true,
    },
  )

  const getMettlScheduleRecord = () => {
    if (assessment.mettlScheduleRecordId) {
      memberAction({
        id: assessment.mettlScheduleRecordId,
        method: 'get',
        action: '',
      }).then((response: MettlScheduleRecord) => {
        setMettlScheduleRecord(response)
      })
    }
  }

  useEffect(() => {
    getMettlScheduleRecord()
  }, [assessment.mettlScheduleRecordId])


  return (
    <Drawer
      title={I18n.t('campaign_assessment.drawer.title')}
      placement="right"
      closable
      onClose={close}
      open
      width="40%"
    >
      <Row>
        <Descriptions
          layout="horizontal"
          rootClassName="mb-6 w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            label={I18n.t('campaign_assessment.column.id')}
            key="id"
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
          >
            {assessment.campaignAssessmentId}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('common.column.name')}
            key="name"
            className="va-t"
          >
            {assessment.name}
          </Descriptions.Item>
          <Descriptions.Item
            label={I18n.t('campaign_assessment.column.dimension_id')}
            key="dimension_id"
            className="va-t"
          >
            {assessment.dimensionId}
          </Descriptions.Item>

          <Descriptions.Item
            label={I18n.t('campaign_assessment.column.norm_id')}
            key="norm_id"
            className="va-t"
          >
            {assessment.normId}
          </Descriptions.Item>

          { mettlScheduleRecord && (
            <>
              <Descriptions.Item
                label={I18n.t('campaign_assessment.drawer.mettl_schedule_name')}
                key="schedule_name"
                className="va-t"
              >
                { !isFormVisible && (
                <List size="small">
                  <List.Item>
                    {mettlScheduleRecord.scheduleName}
                    {permissions.updateMettlSchedule && (
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => setIsFormVisible(!isFormVisible)}
                    />
                    )}
                  </List.Item>

                </List>
                ) }

                {isFormVisible && (
                  <List size="small">
                    <List.Item>
                      <UpdateMettlScheduleForm
                        campaignId={parseInt(campaignId, 10)}
                        assessment={assessment}
                        close={() => setIsFormVisible(false)}
                        loading={false}
                        setMettlScheduleRecord={setMettlScheduleRecord}
                        updateMettlSchedule={updateMettlSchedule}
                        mettlScheduleRecord={mettlScheduleRecord}
                      />
                    </List.Item>
                  </List>
                )}

                <MettlScheduleDetails mettlScheduleRecord={mettlScheduleRecord} />
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Row>
    </Drawer>
  )
}

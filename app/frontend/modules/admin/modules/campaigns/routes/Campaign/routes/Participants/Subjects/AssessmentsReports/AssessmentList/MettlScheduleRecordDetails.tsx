import { FC, useEffect, useState } from 'react'
import { Descriptions, Button, List } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import UserAssessment from '~/modules/admin/modules/campaigns/interfaces/UserAssessment'
import { MettlScheduleRecord } from '~/modules/admin/modules/client/core/mettlScheduleRecords'
import { useResources } from '~/hooks/useResources'
import { UpdateMettlScheduleForm } from './UpdateMettlScheduleForm'
import { I18nInterface } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import MettlScheduleDetails
  from '~/modules/admin/modules/campaigns/routes/Campaign/MettlScheduleDetails/MettlScheduleDetails'

interface Props {
  I18n: I18nInterface
  assessment: UserAssessment
  campaignId: string
  projectId: string | undefined
  updateMettlSchedule: (
    campaignId: number, assessmentId: number, body: { assessment: { id: string } }
  ) => Promise<{ response: unknown }>
  loadingUpdateMettlSchedule: boolean
}

export const MettlScheduleRecordDetails: FC<Props> = ({
  assessment,
  campaignId,
  projectId,
  I18n,
  updateMettlSchedule,
  loadingUpdateMettlSchedule,
}) => {
  if (!assessment || assessment.category !== 'mettl') {
    return null
  }

  const [mettlScheduleRecord, setMettlScheduleRecord] = useState<MettlScheduleRecord>()
  const [isFormVisible, setIsFormVisible] = useState(false)
  const { permissions } = assessment

  const { memberAction } = useResources<MettlScheduleRecord>(
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
    <>
      {mettlScheduleRecord ? (
        <Descriptions
          layout="horizontal"
          rootClassName="mb-6 w-100"
          bordered
          column={1}
        >
          <Descriptions.Item
            className="va-t w-30"
            labelStyle={{ width: '40%' }}
            contentStyle={{ width: '60%' }}
            label={I18n.t('campaign_assessment.drawer.mettl_schedule_name')}
            key="schedule_name"
          >
            {!isFormVisible ? (
              <List size="small">
                <List.Item>
                  {mettlScheduleRecord.scheduleName}
                  {permissions.updateMettlSchedule && (
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => setIsFormVisible(true)}
                    />
                  )}
                </List.Item>
              </List>
            ) : (
              <List size="small">
                <List.Item>
                  <UpdateMettlScheduleForm
                    campaignId={parseInt(campaignId, 10)}
                    assessment={assessment}
                    close={() => setIsFormVisible(false)}
                    setMettlScheduleRecord={setMettlScheduleRecord}
                    mettlScheduleRecord={mettlScheduleRecord}
                    updateMettlSchedule={updateMettlSchedule}
                    loading={loadingUpdateMettlSchedule}
                  />
                </List.Item>
              </List>
            )}
            <MettlScheduleDetails mettlScheduleRecord={mettlScheduleRecord} />
          </Descriptions.Item>
        </Descriptions>
      ) : null}
    </>
  )
}

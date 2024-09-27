import { List, Switch, Divider } from 'antd'
import { MettlScheduleRecord } from '~/modules/admin/modules/client/core/mettlScheduleRecords'

const { I18n } = window

interface Props {
    mettlScheduleRecord: MettlScheduleRecord
}

const MettlScheduleDetails: React.FC<Props> = ({
  mettlScheduleRecord,
}) => (
  <List size="small">
    <Divider>{I18n.t('administration.projects.mettl_schedule_records.settings')}</Divider>
    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('administration.projects.mettl_schedule_records.secure_browser_enabled')}
      </label>
      <Switch checked={mettlScheduleRecord.secureBrowserEnabled} disabled />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('administration.projects.mettl_schedule_records.visual_proctoring_enabled')}
      </label>
      <Switch checked={mettlScheduleRecord.visualProctoringSettings?.enabled} disabled />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('administration.projects.mettl_schedule_records.candidate_authorization')}
      </label>
      <Switch
        checked={mettlScheduleRecord.visualProctoringSettings?.candidateAuthorization}
        disabled
      />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('administration.projects.mettl_schedule_records.candidate_screen_capture')}
      </label>
      <Switch
        checked={mettlScheduleRecord.visualProctoringSettings?.candidateScreenCapture}
        disabled
      />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('administration.projects.mettl_schedule_records.web_proctoring_enabled')}
      </label>
      <Switch checked={mettlScheduleRecord.webProctoringSettings?.enabled} disabled />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('administration.projects.mettl_schedule_records.show_remaining_counts')}
      </label>
      <Switch checked={mettlScheduleRecord.webProctoringSettings?.showRemainingCounts} disabled />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('administration.projects.mettl_schedule_records.count')}
      </label>
      {mettlScheduleRecord.webProctoringSettings?.showRemainingCounts
        ? mettlScheduleRecord.webProctoringSettings?.count : ''}
    </List.Item>
  </List>
)

export default MettlScheduleDetails

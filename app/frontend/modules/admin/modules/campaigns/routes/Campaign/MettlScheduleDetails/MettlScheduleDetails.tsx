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
    <Divider>{I18n.t('admin.projects_mettl_schedule_records_settings')}</Divider>
    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('admin.projects_mettl_schedule_records_secure_browser_enabled')}
      </label>
      <Switch checked={mettlScheduleRecord.secureBrowserEnabled} disabled />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('admin.projects_mettl_schedule_records_visual_proctoring_enabled')}
      </label>
      <Switch checked={mettlScheduleRecord.visualProctoringSettings?.enabled} disabled />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('admin.projects_mettl_schedule_records_candidate_authorization')}
      </label>
      <Switch
        checked={mettlScheduleRecord.visualProctoringSettings?.candidateAuthorization}
        disabled
      />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('admin.projects_mettl_schedule_records_candidate_screen_capture')}
      </label>
      <Switch
        checked={mettlScheduleRecord.visualProctoringSettings?.candidateScreenCapture}
        disabled
      />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('admin.projects_mettl_schedule_records_web_proctoring_enabled')}
      </label>
      <Switch checked={mettlScheduleRecord.webProctoringSettings?.enabled} disabled />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('admin.projects_mettl_schedule_records_show_remaining_counts')}
      </label>
      <Switch checked={mettlScheduleRecord.webProctoringSettings?.showRemainingCounts} disabled />
    </List.Item>

    <List.Item>
      <label style={{ fontWeight: 'normal' }}>
        {I18n.t('admin.projects_mettl_schedule_records_count')}
      </label>
      {mettlScheduleRecord.webProctoringSettings?.showRemainingCounts
        ? mettlScheduleRecord.webProctoringSettings?.count : ''}
    </List.Item>
  </List>
)

export default MettlScheduleDetails

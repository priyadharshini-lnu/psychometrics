import { CloudDownloadOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import ErrorAlertBox from '~/components/ErrorAlertBox'

export default function FileImport ({
  setFile,
  errors,
  campaignId,
}) {
  return (
    <div>
      <div>
        Each row must have a first name, last name and an email. Any other fields are optional.
        <br />
        If no password are provided then user would be sent a mail with a invite link where they can set a password.
        <br />
        Duplicate entries will be updated with any changes or additional fields.
        <br />
        {I18n.t('admin.campaign_users_import_uat_hint')}
      </div>
      <div className="mtm" style={{ fontSize: '16px' }}>
        <a
          href={`/administration/threesixty_campaigns/${campaignId}/subjects/download_example_import_file`}
          target="blank"
        >
          <CloudDownloadOutlined />
          <span className="mls">Download Example csv</span>
        </a>
      </div>
      <div className="mtl">
        <input type="file" accept="text/csv" onChange={e => setFile(e.target.files[0])} />
      </div>
      <ErrorAlertBox errors={errors} />
    </div>
  )
}

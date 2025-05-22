import { Button, Space } from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import styles from './IdpReportPreview.less'
import IdpReport from '~/modules/idpReport/EmbededIDP'

const { I18n } = window

export const IdpReportPreview = () => {
  const { campaignId, id } = useParams()
  const [search] = useSearchParams()
  const lang = search.get('lang') || 'en'

  return (
    <div style={{ padding: 20 }}>
      <Space>
        <LangDropdownWithChangeUrl locales={['en', 'ar']} currentLocale={lang} />
        <Button
          href={`/administration/new_campaigns/${campaignId}/user_idp_reports/${id}/download?lang=${lang}`}
          type="primary"
        >
          {I18n.t('common.actions.download')}
        </Button>
      </Space>
      <div className={styles.initial}>
        <IdpReport />
      </div>
    </div>
  )
}

export default IdpReportPreview

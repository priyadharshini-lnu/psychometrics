import { Button, Space } from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import IdpReport from '~/modules/idpReport'
import styles from './IdpReportPreview.less'

export const DOWNLOAD = 'campaigns/userReports/DOWNLOAD'

export const download = (campaignId: string, id: string, params = {}) => ({
  type: DOWNLOAD,
  request: {
    url: `/administration/new_campaigns/${campaignId}/user_idp_reports/${id}/download`,
    loader: true,
    body: params,
  },
})

export const IdpReportPreview = () => {
  const { campaignId, id } = useParams()
  const [search] = useSearchParams()
  const lang = search.get('lang') || 'en'
  const dispatch = useDispatch()

  const onDownload = () => {
    if (campaignId && id) {
      dispatch(download(campaignId, id, { lang }))
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>User idp plan report preview</h3>
      <Space>
        <Button onClick={onDownload} type="primary">Download</Button>
        <LangDropdownWithChangeUrl locales={['en', 'ar']} currentLocale={lang} />
      </Space>
      <div className={styles.initial}>
        <IdpReport />
      </div>
    </div>
  )
}

export default IdpReportPreview

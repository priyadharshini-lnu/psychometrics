import {
  Button, Space, Dropdown, message,
} from 'antd'
import { useParams, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { DownloadOutlined, DownOutlined } from '~/glint/icons/AccessibleIconsAntDesign'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import styles from './IdpReportPreview.less'
import IdpReport from '~/modules/idpReport/EmbededIDP'
import { downloadIdpReport } from '~/modules/admin/modules/campaigns/core/idp'

const { I18n } = window

export const IdpReportPreview = () => {
  const { campaignId, id } = useParams<{campaignId: string, id:string}>()
  const [search] = useSearchParams()
  const lang = search.get('report_lang') || 'en'
  const dispatch = useDispatch()

  const isSuperAdmin = useSelector<RootState>(state => state.currentUser.role === 'Users::SuperAdmin')

  const menu = {
    items: [{
      label: I18n.t('idp.without_reflection_questions'),
      key: 'without_rq',
      icon: <DownloadOutlined />,
    }],
    onClick: ({ key }) => {
      if (campaignId && id) {
        dispatch(downloadIdpReport(campaignId, id, key === 'with_rq', lang)).then(() => {
          message.success(I18n.t('threesixty.report_generation_in_progress'))
        })
      }
    },
  }

  if (isSuperAdmin) {
    menu.items.unshift({
      label: I18n.t('idp.with_reflection_questions'),
      key: 'with_rq',
      icon: <DownloadOutlined />,
    })
  }

  return (
    <div style={{ padding: 20 }}>
      <Space>
        <LangDropdownWithChangeUrl locales={['en', 'ar']} currentLocale={lang} paramName="report_lang" />
        <Dropdown menu={menu} trigger={['click']}>
          <Button>
            <Space>
              {I18n.t('common.actions.download')}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>

      </Space>
      <div className={styles.initial}>
        <IdpReport />
      </div>
    </div>
  )
}

export default IdpReportPreview

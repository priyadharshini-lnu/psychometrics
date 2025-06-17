import { Button, Space, Dropdown } from 'antd'
import { DownloadOutlined, DownOutlined } from '@ant-design/icons'
import { useParams, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from 'modules/admin/core/rootReducers'
import { LangDropdownWithChangeUrl } from '~/components/LangDropdown'
import styles from './IdpReportPreview.less'
import IdpReport from '~/modules/idpReport/EmbededIDP'

const { I18n } = window

export const IdpReportPreview = () => {
  const { campaignId, id } = useParams()
  const [search] = useSearchParams()
  const lang = search.get('lang') || 'en'

  const isSuperAdmin = useSelector<RootState>(state => state.currentUser.role === 'Users::SuperAdmin')

  const menu = {
    items: [{
      label: I18n.t('idp.without_reflection_questions'),
      key: 'without_rq',
      icon: <DownloadOutlined />,
    }],
    onClick: ({ key }) => {
      let url = `/administration/new_campaigns/${campaignId}/user_idp_reports/${id}/download?lang=${lang}`
      if (key === 'with_rq') {
        url += '&include_reflective_questions=true'
      }
      if (key === 'without_rq') {
        url += '&include_reflective_questions=false'
      }
      location.href = url
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
        <LangDropdownWithChangeUrl locales={['en', 'ar']} currentLocale={lang} />
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

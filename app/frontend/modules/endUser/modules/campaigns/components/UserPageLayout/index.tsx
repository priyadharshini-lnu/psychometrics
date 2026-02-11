import { FC, ReactNode } from 'react'
import { Layout, Button } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useMedia } from 'use-media'
import { RootState } from '~/modules/endUser/core/rootReducers'

import { UserPageSider } from '../UserPageSider'
import { Profile } from '../Profile'
import { Footer } from '../Footer'

import styles from './styles.less'

const { I18n } = window

const connector = connect(
  (state: RootState) => ({
    loaded: state.campaigns.campaign.loaded,
    campaign: state.campaigns.campaign,
    updateProfileRequired: state.currentUser.updateProfileRequired,
  }),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>
type ComponentProps = {
  children: ReactNode
}
type Props = ComponentProps & PropsFromRedux

const UserPageLayoutComponent: FC<Props> = ({ campaign, updateProfileRequired, children }) => {
  const location = useLocation()
  const isShortScreen = useMedia({ maxHeight: 600 })
  const isAssessmentPage = location.pathname.includes('agile_user_assessments')
    || location.pathname.includes('/user_assessments/')
  const hideFooter = isAssessmentPage && isShortScreen

  return (
    <Layout className={styles.container}>
      <Button
        className={styles.skipToContent}
        type="link"
        href="#user-page-main-content"
      >
        {I18n.t('frontend.skip_to_content')}
      </Button>
      <UserPageSider
        updateProfileRequired={updateProfileRequired}
        showInsights={campaign.userReportsAvailable}
        siderFooter={collapsed => <Profile collapsed={collapsed} />}
      />
      <Layout id="user-page-main-content" className={styles.pageLayout}>
        {children}
        {!hideFooter ? <Footer /> : null}
      </Layout>
    </Layout>
  )
}

export const UserPageLayout = connector(UserPageLayoutComponent)

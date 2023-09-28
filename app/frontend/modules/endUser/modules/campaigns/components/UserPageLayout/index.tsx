import { FC } from 'react'
import { Layout } from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from '~/modules/endUser/core/rootReducers'

import { UserPageSider } from '../UserPageSider'
import { Profile } from '../Profile'
import { Footer } from '../Footer'

import styles from './styles.less'

const connector = connect(
  (state: RootState) => ({
    loaded: state.campaigns.campaign.loaded,
    campaign: state.campaigns.campaign,
    updateProfileRequired: state.currentUser.updateProfileRequired,
  }),
  {},
)

type PropsFromRedux = ConnectedProps<typeof connector>

const UserPageLayoutComponent: FC<PropsFromRedux> = ({ campaign, updateProfileRequired, children }) => (
  <Layout className={styles.container}>
    <UserPageSider
      updateProfileRequired={updateProfileRequired}
      showInsights={campaign.userReportsAvailable}
      siderFooter={collapsed => <Profile collapsed={collapsed} />}
    />
    <Layout className={styles.pageLayout}>
      {children}
      <Footer />
    </Layout>
  </Layout>
)

export const UserPageLayout = connector(UserPageLayoutComponent)

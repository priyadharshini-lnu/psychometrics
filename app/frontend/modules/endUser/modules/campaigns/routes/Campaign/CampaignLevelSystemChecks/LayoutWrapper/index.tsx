import { Flex, Layout } from 'antd'
import { LangDropdownWithChangeLocale } from '~/components/LangDropdown'
import styles from './LayoutWrapper.less'

export const LayoutWrapper = ({ children }) => (
  <Layout className={styles.main}>
    <Layout.Header className={styles.header}>
      <Flex justify="flex-end" align="center" style={{ width: '100%' }}>
        <LangDropdownWithChangeLocale />
      </Flex>
    </Layout.Header>
    <Layout className={styles.content}>
      <Layout.Content className={styles.pageContent}>
        {children}
      </Layout.Content>
    </Layout>
  </Layout>
)

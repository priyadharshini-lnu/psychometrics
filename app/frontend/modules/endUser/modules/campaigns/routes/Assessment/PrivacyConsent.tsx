import { FC, useEffect, useState } from 'react'
import {
  Button, Typography, Layout, Col, Checkbox, Space,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/endUser/core/rootReducers'
import cs from 'classnames'
import ReactMarkdown from 'react-markdown'
import {
  getlighthousePrivacyUrl, getCustomPrivacyConsentText, getprivacyPolicyVersion,
} from '~/modules/endUser/core/config'
import styles from './UserAssessment.less'
import { fetchPolicy, acceptPolicy } from '~/modules/endUser/modules/campaigns/core/project'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window
const { Paragraph } = Typography
const { Content, Header } = Layout

const connector = connect(
  (state: RootState) => ({
    lighthousePrivacyUrl: getlighthousePrivacyUrl(state),
    privacyPolicyVersion: getprivacyPolicyVersion(state),
    customPrivacyConsentText: getCustomPrivacyConsentText(state),
    policy: state.project.policy,
  }),
  {
    acceptPolicy,
    fetchPolicy,
  },
)

type Props = ConnectedProps<typeof connector> & {
  onAccept: () => void
}

export const PrivacyConsentComponent: FC<Props> = ({
  privacyPolicyVersion, acceptPolicy, fetchPolicy, policy, onAccept, customPrivacyConsentText,
}) => {
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    !customPrivacyConsentText && fetchPolicy(privacyPolicyVersion)
  }, [])

  const accept = () => {
    acceptPolicy(privacyPolicyVersion).then(() => {
      onAccept()
    })
  }

  return (
    <>
      <Header className={`${styles.header} ps-0 pe-0`}>
        <Col offset={4} span={16} className="ta-c">
          <Typography.Title className={`${styles.consentTitle} mt-2 mb-2`} level={1}>
            {I18n.t('threesixty.accept_privacy_modal.title')}
          </Typography.Title>
        </Col>
        <Col span={4} className="ta-e" />
      </Header>
      <Content className={styles.container}>
        <div className={cs(styles.pageContent)}>
          {policy?.content || customPrivacyConsentText
            ? (
              <div className={styles.policyContent}>
                <Paragraph>
                  {customPrivacyConsentText
                    ? <SafeHTML html={customPrivacyConsentText} config="adminRichText" />
                    : <ReactMarkdown>{policy.content}</ReactMarkdown>
                  }
                </Paragraph>
              </div>
            )
            : <PageContentSkeleton />
          }
          <div className={styles.footerButtons}>
            <Space direction="vertical">
              <Checkbox onChange={e => setAccepted(e.target.checked)}>
                {I18n.t('threesixty.accept_privacy_modal.checkbox')}
              </Checkbox>
              <div>
                <Button type="primary" disabled={!accepted} onClick={accept}>
                  {I18n.t('threesixty.accept_privacy_modal.accept')}
                </Button>
              </div>
            </Space>
          </div>
        </div>
      </Content>
    </>
  )
}


export const PrivacyConsent = connector(PrivacyConsentComponent)

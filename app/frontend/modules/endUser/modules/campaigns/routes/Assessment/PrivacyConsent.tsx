import { FC, useEffect, useState } from 'react'
import {
  Button, Typography, Layout, Col, Checkbox, Space,
  Flex,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import { RootState } from 'modules/endUser/core/rootReducers'
import cs from 'classnames'
import ReactMarkdown from 'react-markdown'
import {
  getlighthousePrivacyUrl, getCustomPrivacyConsentText, getprivacyPolicyVersion,
} from '~/modules/endUser/core/config'
import {
  getPrivacyText,
  privacyPageLink,
  enablePrivacyLink,
  fetchPolicy, acceptPolicy,
} from '~/modules/endUser/modules/campaigns/core/project'
import styles from './UserAssessment.less'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import { SafeHTML } from '~/components/SafeHTML'

const { I18n } = window
const { Paragraph } = Typography
const { Content, Header } = Layout
const globalLink = `/privacy-statement/${I18n.currentLocale()}`

const connector = connect(
  (state: RootState) => ({
    lighthousePrivacyUrl: getlighthousePrivacyUrl(state),
    privacyPolicyVersion: getprivacyPolicyVersion(state),
    customPrivacyConsentText: getCustomPrivacyConsentText(state),
    policy: state.project.policy,
    privacyText: getPrivacyText(state),
    privacyLink: privacyPageLink(state),
    enablePrivacyLink: enablePrivacyLink(state),
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
  privacyPolicyVersion, acceptPolicy, fetchPolicy, policy, onAccept, customPrivacyConsentText, privacyText, privacyLink,
  enablePrivacyLink,
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

  function processPolicyContent (
    content: string,
    globalLink: string,
    clientLink?: boolean,
  ) {
    let processed = content.replace(
      '[GLOBAL_PRIVACY_LINK]',
      `[${I18n.t('threesixty.accept_privacy_modal.privacy_notice')}](${globalLink})`,
    )

    if (enablePrivacyLink) {
      processed = processed.replace(
        '[CLIENT_PRIVACY_LINK]',
        `[${privacyText}](${clientLink})`,
      )
    } else {
      processed = processed.replace(
        /^.*\[CLIENT_PRIVACY_LINK\].*\n?/gm,
        '',
      )
    }
    return processed
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
        <div className={cs(styles.privacyPageContent)}>
          {policy?.content || customPrivacyConsentText
            ? (
              <div className={styles.policyContent}>
                <Paragraph>
                  {customPrivacyConsentText
                    ? <SafeHTML html={customPrivacyConsentText} config="adminRichText" />
                    : (
                      <ReactMarkdown>
                        {processPolicyContent(policy.content, globalLink, privacyLink)}
                      </ReactMarkdown>
                    )
                  }
                </Paragraph>
              </div>
            )
            : <PageContentSkeleton />
          }
          <div className={styles.privacyPageFooterButtons}>
            <Space direction="vertical">
              <Flex gap={8}>
                <Checkbox
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                />
                <span className={styles.checkboxText}>
                  {enablePrivacyLink
                    ? I18n.t('threesixty.accept_privacy_modal.checkbox_with_client_link')
                    : I18n.t('threesixty.accept_privacy_modal.checkbox')}
                </span>
              </Flex>
              <div className={styles.buttonContainer}>
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

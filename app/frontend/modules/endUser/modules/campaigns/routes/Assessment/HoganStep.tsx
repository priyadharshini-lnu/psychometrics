import {
  FC, useEffect, useState, useRef,
} from 'react'
import {
  Layout, Col, Input, message, Typography, Space, Button,
} from 'antd'
import { connect, ConnectedProps } from 'react-redux'
import cs from 'classnames'
import {
  PageHeader as GlintPageHeader,
} from '~/glint'
import styles from './UserAssessment.less'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import { HoganData, loginHogan } from '~/modules/endUser/modules/campaigns/core/campaigns'
import RedirectIcon from './RedirectIcon'

const { I18n } = window
const { Content } = Layout

const connector = connect(
  () => ({
  }),
  {
    loginHogan,
  },
)

type Props = ConnectedProps<typeof connector> & {
  userAssessmentUrl: string,
  onCancel: () => void,
}

export const HoganStepComponent: FC<Props> = ({
  userAssessmentUrl, loginHogan, onCancel,
}) => {
  const [hoganData, setHoganData] = useState<HoganData| null>(null)
  const [timedOut, setTimedOut] = useState(false)
  useEffect(() => {
    loginHogan(userAssessmentUrl).then((data) => {
      setHoganData(data.response)
    }).catch(() => {
      message.error(I18n.t('frontend.hogan.cannot_start'))
    })
    setTimeout(() => {
      setTimedOut(true)
    }, 5000)
  }, [])

  const formRef = useRef<HTMLFormElement>(null)

  const process = () => {
    const form = formRef.current
    if (!form) { return }
    if (hoganData && form !== null) {
      form.submit()
    }
  }

  return (
    <>
      <GlintPageHeader>
        <Col offset={4} span={16} className="ta-c">
          <Typography.Title level={3}>
            {I18n.t('assessments.categories.redirecting')}
          </Typography.Title>
        </Col>
        <Col span={4} className="ta-e" />
      </GlintPageHeader>
      <Content className={cs(styles.pageContent, styles.external)}>
        {hoganData ? (
          <>
            <form action={hoganData.url} method="post" ref={formRef} style={{ display: 'none' }}>
              <Input type="hidden" name="UserID" value={hoganData.userId} />
              <Input type="hidden" name="Password" value={hoganData.password} />
              <Input type="hidden" name="UniqueID" value={hoganData.uniqueId} />
              <Input type="hidden" name="FirstName" value={hoganData.firstName} />
              <Input type="hidden" name="LastName" value={hoganData.lastName} />
              <Input type="hidden" name="LanguageID" value={hoganData.languageId} />
              <Input type="hidden" name="DirectAssessmentID" value={hoganData.directAssessmentId} />
              <Input type="hidden" name="DisplayInformedConsent" value={hoganData.displayInformedConsent} />
              <Input type="hidden" name="ReturnURL" value={hoganData.returnUrl} />
            </form>
            <div className={styles.icon}>
              <RedirectIcon />
            </div>
            <div>
              {I18n.t('user_assessments.redirect')}
            </div>
            <div className={styles.redirectFooter}>
              <Space>
                <Button onClick={onCancel} danger>
                  {I18n.t('campaign.time_left.cancel')}
                </Button>
                <Button disabled={!timedOut} type="primary" onClick={() => process()}>
                  {I18n.t('campaign.time_left.continue')}
                </Button>
              </Space>
            </div>
          </>
        )
          : <PageContentSkeleton /> }
      </Content>
    </>
  )
}


export const HoganStep = connector(HoganStepComponent)

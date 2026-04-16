import {
  FC, useEffect, useState, useRef,
} from 'react'
import {
  Layout, Col, Input, message, Typography, Space, Button,
} from 'antd'
import cs from 'classnames'
import {
  PageHeader as GlintPageHeader,
} from '~/glint'
import styles from './UserAssessment.less'
import { PageContentSkeleton } from '~/modules/endUser/modules/campaigns/components/PageContentSkeleton'
import RedirectIcon from './RedirectIcon'
import useAsyncRequestResponse from '~/hooks/useAsyncRequestResponse'
import {
  AsyncExternalAssessmentTR,
  AsyncExternalAssessment,
  HoganData,
} from '~/modules/admin/modules/client/core/externalAssessments'

const { I18n } = window
const { Content } = Layout

type Props = {
  userAssessmentId: string
  userAssessmentUrl: string,
  onCancel: () => void,
}

export const HoganStep: FC<Props> = ({
  userAssessmentId, userAssessmentUrl, onCancel,
}) => {
  const [hoganData, setHoganData] = useState<HoganData| null>(null)
  const [loading, setLoading] = useState(false)
  const {
    makeAsyncRequest,
  } = useAsyncRequestResponse<AsyncExternalAssessment>({
    url: userAssessmentUrl,
    data: { id: userAssessmentId },
    responseType: AsyncExternalAssessmentTR,
  })

  useEffect(() => {
    makeAsyncRequest().then((response) => {
      setHoganData(response.responseData)
    }).catch(() => {
      message.error(I18n.t('frontend.hogan.cannot_start'))
    })
  }, [])


  const formRef = useRef<HTMLFormElement>(null)

  const process = () => {
    const form = formRef.current
    if (!form) { return }
    if (hoganData && form !== null) {
      setLoading(true)
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
              <Input
                type="hidden"
                name="DirectAssessmentID"
                value={hoganData.directAssessmentId === null ? undefined : hoganData.directAssessmentId}
              />
              <Input type="hidden" name="DisplayInformedConsent" value={hoganData.displayInformedConsent} />
              <Input type="hidden" name="ReturnURL" value={hoganData.returnUrl} />
            </form>
            <div className={styles.icon}>
              <RedirectIcon />
            </div>
            <div>
              {I18n.t('enduser.redirect_to_external_assessment')}
            </div>
            <div className={styles.redirectFooter}>
              <Space>
                <Button onClick={onCancel} danger>
                  {I18n.t('campaign.time_left.cancel')}
                </Button>
                <Button loading={loading} disabled={loading} type="primary" onClick={() => process()}>
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

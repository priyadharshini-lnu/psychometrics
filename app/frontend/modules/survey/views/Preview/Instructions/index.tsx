import { FC, useRef, useState } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { Button } from 'antd'
import cs from 'classnames'
import { getI18n } from '~/modules/survey/core/preview/FlowProcessor/selectors'
import { useAudioPlayer } from '~/modules/survey/hooks/useAudioPlayer'
import { useImageZoom } from '~/modules/survey/hooks/useImageZoom'
import { RootState } from '~/modules/survey/core/rootReducers'
import { isRtl } from '~/utils/locales'
import { SafeHTML } from '~/components/SafeHTML'
import { isConnected } from '~/core/connection'
import { secondsLeftFromNow } from '~/utils/time'
import styles from './Instructions.less'
import { TimingModal } from './TimingModal'

const { I18n: { uiLocale } } = window
interface Params {
  userAssessmentId: string
}
type Props = ConnectedProps<typeof connector> & RouteComponentProps<Params>

const Instructions: FC<Props> = ({
  isDisconnected, timerDuration, I18n, campaignUser,
  match: { params: { userAssessmentId } }, location, assessmentName, initialized,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  useImageZoom(containerRef)
  const [showTimingConfirmation, setShowTimingConfirmation] = useState(false)

  if (!initialized) { return null }

  const contentRef = useRef(null)
  useAudioPlayer(contentRef)

  const remainingCampaignTime = secondsLeftFromNow(campaignUser.expiry_date)
  const remainingTime = remainingCampaignTime && remainingCampaignTime < timerDuration
    ? secondsLeftFromNow(campaignUser.expiry_date)
    : timerDuration

  const innerHTML = I18n.tInstructions()
    || I18n.t('assessments.instructions.default', { time: Math.floor(remainingTime / 60) })

  const handleCancel = () => {
    history.back()
  }

  const rtl = isRtl(uiLocale)
  const beginLink = `/user_assessments/${userAssessmentId}/begin${location.search}`

  const goToAssessment = () => {
    window.location.href = beginLink
  }

  const maybeShowModal = () => {
    if (remainingCampaignTime && remainingCampaignTime < timerDuration) {
      return setShowTimingConfirmation(true)
    }
    goToAssessment()
  }

  return (
    <div
      ref={containerRef}
      className={cs(styles.container)}
    >
      <div
        className={styles.box}
      >
        <SafeHTML
          className={`${styles.content} highlight-container`}
          html={innerHTML}
          ref={contentRef}
          config="adminRichText"
        />
        <div className={cs(styles.footer, rtl ? 'rtl' : 'ltr')}>
          <Button
            size="large"
            type="default"
            disabled={isDisconnected}
            onClick={handleCancel}
            className="mrs"
          >
            <span className="mrs mls fa fa-chevron-left rtl-flip" />
            { I18n.t('assessments.instructions.cancel') }
          </Button>
          <Button
            onClick={maybeShowModal}
            size="large"
            type="primary"
            disabled={isDisconnected}
            className={styles.next}
          >
            {I18n.t('assessments.instructions.begin_assessment')}
            <span className="mls mrs fa fa-chevron-right rtl-flip" />
          </Button>
        </div>
      </div>
      <TimingModal
        show={showTimingConfirmation}
        assessmentName={assessmentName}
        campaignExpiryDate={campaignUser.expiry_date}
        totalAssessmentTime={timerDuration}
        ok={() => goToAssessment()}
        onCancel={() => setShowTimingConfirmation(false)}
      />
    </div>
  )
}

const connector = connect((state: RootState) => ({
  initialized: state.preview.initialized,
  instructions: state.preview.instructions,
  isDisconnected: !isConnected(state),
  assessmentName: state.preview.name,
  timerDuration: state.preview.timerDuration,
  isTimedCampaign: state.preview.isTimedCampaign,
  campaignUser: state.preview.campaignUser,
  I18n: getI18n(state.preview),
}),
{})

export default connector(withRouter(Instructions))

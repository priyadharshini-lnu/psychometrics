import { FC, useRef, useState } from 'react'
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

const { I18n } = window
type Props = ConnectedProps<typeof connector>

type OwnPros = {
  onBegin?: () => void
}

export const InstructionsComponent: FC<Props & OwnPros> = ({
  isDisconnected, timerDuration, translatedInstructions, campaignExpiryDate, assessmentName, initialized, onBegin,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  useImageZoom(containerRef)
  const [showTimingConfirmation, setShowTimingConfirmation] = useState(false)

  if (!initialized) { return null }

  const contentRef = useRef(null)
  useAudioPlayer(contentRef)

  const remainingCampaignTime = secondsLeftFromNow(campaignExpiryDate)
  const remainingTime = remainingCampaignTime && remainingCampaignTime < timerDuration
    ? secondsLeftFromNow(campaignExpiryDate)
    : timerDuration

  const innerHTML = translatedInstructions
    || I18n.t('assessments.instructions.default', { time: Math.floor(remainingTime / 60) })

  const handleCancel = () => {
    history.back()
  }

  const rtl = isRtl(I18n.uiLocale)

  const goToAssessment = () => {
    onBegin && onBegin()
  }

  const maybeShowModal = () => {
    if (remainingCampaignTime && remainingCampaignTime < timerDuration) {
      return setShowTimingConfirmation(true)
    }
    onBegin && onBegin()
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
        campaignExpiryDate={campaignExpiryDate}
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
  campaignExpiryDate: state.preview.campaignUser?.expiry_date,
  translatedInstructions: getI18n(state.preview).tInstructions(),
}),
{})

export const Instructions = connector(InstructionsComponent)

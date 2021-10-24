import React, { FC, useRef } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { connect, ConnectedProps } from 'react-redux'
import { Button } from 'antd'
import { isRtl } from 'utils/locales'
import { getI18n } from 'modules/survey/core/preview/FlowProcessor/selectors'
import cs from 'classnames'
import { useAudioPlayer } from 'modules/survey/hooks/useAudioPlayer'
import { useImageZoom } from 'modules/survey/hooks/useImageZoom'
import { RootState } from 'modules/survey/core/rootReducers'
import { SafeHTML } from 'components/SafeHTML'
import { isConnected } from 'core/connection'
import styles from './Instructions.scss'

const { I18n: { uiLocale } } = window
interface Params {
  userAssessmentId: string
}
type Props = ConnectedProps<typeof connector> & RouteComponentProps<Params>

const Instructions: FC<Props> = ({
  isDisconnected, timerDuration, I18n,
  match: { params: { userAssessmentId } }, location,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  useImageZoom(containerRef)


  const contentRef = useRef(null)
  useAudioPlayer(contentRef)

  const innerHTML = I18n.tInstructions()
    || I18n.t('assessments.instructions.default', { time: Math.round(timerDuration / 60) })

  const handleCancel = () => {
    history.back()
  }

  const rtl = isRtl(uiLocale)
  const beginLink = `/user_assessments/${userAssessmentId}/begin${location.search}`

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
          <a href={beginLink}>
            <Button
              size="large"
              type="primary"
              disabled={isDisconnected}
              className={styles.next}
            >
              {I18n.t('assessments.instructions.begin_assessment')}
              <span className="mls mrs fa fa-chevron-right rtl-flip" />
            </Button>
          </a>
        </div>
      </div>

    </div>
  )
}

const connector = connect((state: RootState) => ({
  instructions: state.preview.instructions,
  isDisconnected: !isConnected(state),
  timerDuration: state.preview.timerDuration,
  I18n: getI18n(state.preview),
}),
{})

export default connector(withRouter(Instructions))

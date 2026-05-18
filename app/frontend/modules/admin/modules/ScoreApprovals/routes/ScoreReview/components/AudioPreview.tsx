import { Flex } from 'antd'
import type { RefObject } from 'react'
import 'video.js/dist/video-js.css'
import styles from '../ScoreReview.less'
import AudioRecorder from '~/modules/survey/components/AudioRecorder'
import type { RecorderHandle } from '~/modules/survey/components/AudioRecorder/AudioRecorder'
import type { MediaResponse } from '~/modules/survey/core/preview/FlowProcessor/interfaces'
import type { PreviewModel } from '~/modules/survey/interfaces/questions/AudioResponse'

interface AudioPreviewProps {
  mediaResponse: MediaResponse | null | undefined
  playerRef?: RefObject<RecorderHandle>
}

export const AudioPreview = ({ mediaResponse, playerRef = undefined }: AudioPreviewProps) => (
  !mediaResponse ? null : (
    <Flex className={styles.video}>
      <AudioRecorder
        ref={playerRef}
        mediaUrl={mediaResponse.url}
        model={mediaResponse as unknown as PreviewModel}
        fakeUpload
        readOnly
        mediaResponse={mediaResponse}
        onSuccessUpload={() => {}}
        onRecordingDiscard={() => {}}
        markQuestionInProgress={() => {}}
        removeQuestionInProgress={() => {}}
      />
    </Flex>
  )
)

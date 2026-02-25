import { Flex } from 'antd'
import 'video.js/dist/video-js.css'
import styles from '../ScoreReview.less'
import AudioRecorder from '~/modules/survey/components/AudioRecorder'

export const AudioPreview = ({ mediaResponse }) => (
  <Flex className={styles.video}>
    <AudioRecorder
      mediaUrl={mediaResponse.url}
      model={mediaResponse}
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

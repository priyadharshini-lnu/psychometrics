import { Flex } from 'antd'
import 'video.js/dist/video-js.css'
import VideoPlayer from '~/modules/survey/components/modules/VideoResponse/VideoPlayer'
import styles from '../ScoreReview.less'

export const VideoPreview = ({ mediaResponse }) => (
  <Flex gap={16}>
    <Flex flex={1} className={styles.video}>
      <VideoPlayer mediaResponse={mediaResponse} />
    </Flex>
    <Flex flex={1} className={styles.rawResult}>
      {mediaResponse?.transcriptionText}
    </Flex>
  </Flex>
)
